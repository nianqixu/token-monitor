'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createCipheriv, createHmac, pbkdf2Sync, randomBytes } = require('node:crypto');

const {
  TRAE_CLIENT,
  TRAE_SOURCES,
  applyTraeCollectionHistory,
  applyTraeCollectionUsage,
  buildTraeHistoryGraph,
  buildTraePeriodsNormalized,
  collectTraeSnapshot,
  decryptTraeDb,
  localDayKeyOf,
  localMonthKeyOf,
  mergeTraeRows,
  normalizeTraeHistoryRow,
  normalizeTraeTurnRow,
  readTraeRows,
  traeDataPaths,
  traeSourceSignature,
  verifyTraeKey
} = require('../../src/shared/traeUsage');
const { normalizePeriod } = require('../../src/shared/usage');

let sqlite = null;
try { sqlite = require('node:sqlite'); } catch (_) { sqlite = null; }

const PAGE = 4096;

function xorSalt(salt) {
  const out = Buffer.from(salt);
  for (let i = 0; i < out.length; i += 1) out[i] ^= 0x3a;
  return out;
}

function macKeyFor(key, salt) {
  return pbkdf2Sync(key, xorSalt(salt), 2, 32, 'sha512');
}

// Mirrors the page-1 HMAC layout the decrypt pipeline verifies: HMAC-SHA512
// over page[16..4032) plus the little-endian page number, stored at [4032..4096).
function pageHmac(macKey, page, pgno) {
  const hmac = createHmac('sha512', macKey);
  hmac.update(page.subarray(16, 4032));
  const pageLe = Buffer.alloc(4);
  pageLe.writeUInt32LE(pgno, 0);
  hmac.update(pageLe);
  return hmac.digest();
}

// Builds a SQLCipher-shaped encrypted page out of a plaintext page. Only the
// [0..4016) range carries content; the trailing 80 bytes are the reserve area.
function encryptPage(plainPage, pgno, key, salt) {
  const iv = randomBytes(16);
  const body = pgno === 1 ? plainPage.subarray(16, 4016) : plainPage.subarray(0, 4016);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  cipher.setAutoPadding(false);
  const ciphertext = Buffer.concat([cipher.update(body), cipher.final()]);
  const page = Buffer.alloc(PAGE);
  if (pgno === 1) salt.copy(page, 0);
  ciphertext.copy(page, pgno === 1 ? 16 : 0);
  iv.copy(page, 4016);
  pageHmac(macKeyFor(key, salt), page, pgno).copy(page, 4032);
  return page;
}

function writeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tm-trae-'));
}

test('verifyTraeKey accepts the matching key and rejects wrong keys', () => {
  const key = randomBytes(32);
  const salt = randomBytes(16);
  const plain = Buffer.alloc(PAGE, 0xab);
  const encrypted = encryptPage(plain, 1, key, salt);
  assert.equal(verifyTraeKey(key, encrypted), true);
  assert.equal(verifyTraeKey(key.toString('hex'), encrypted), true);
  assert.equal(verifyTraeKey(randomBytes(32), encrypted), false);
  assert.equal(verifyTraeKey(key, encrypted.subarray(0, 100)), false);
  assert.equal(verifyTraeKey('not-hex', encrypted), false);
});

test('decryptTraeDb round-trips every page body and rejects a mismatched key', () => {
  const dir = writeTempDir();
  try {
    const key = randomBytes(32);
    const salt = randomBytes(16);
    const plain = Buffer.concat([Buffer.alloc(PAGE, 1), Buffer.alloc(PAGE, 2), Buffer.alloc(PAGE, 3)]);
    const dbPath = path.join(dir, 'database.db');
    const encrypted = Buffer.concat([
      encryptPage(plain.subarray(0, PAGE), 1, key, salt),
      encryptPage(plain.subarray(PAGE, 2 * PAGE), 2, key, salt),
      encryptPage(plain.subarray(2 * PAGE, 3 * PAGE), 3, key, salt)
    ]);
    fs.writeFileSync(dbPath, encrypted);

    const outPath = path.join(dir, 'decrypted.db');
    decryptTraeDb({ dbPath, encKey: key.toString('hex'), outputPath: outPath });
    const decrypted = fs.readFileSync(outPath);
    assert.equal(decrypted.length, encrypted.length);
    // Page 1 swaps the 16-byte salt prefix for the standard SQLite header, so
    // its comparable body starts at offset 16; later pages match from 0.
    assert.ok(decrypted.subarray(0, 16).equals(Buffer.from('SQLite format 3\x00', 'binary')));
    assert.ok(decrypted.subarray(16, 4016).equals(plain.subarray(16, 4016)), 'page 1 body must round-trip');
    for (let pgno = 1; pgno < 3; pgno += 1) {
      const offset = pgno * PAGE;
      assert.ok(decrypted.subarray(offset, offset + 4016).equals(plain.subarray(offset, offset + 4016)),
        `page ${pgno + 1} body must round-trip`);
      assert.ok(decrypted.subarray(offset + 4016, offset + PAGE).equals(Buffer.alloc(80)),
        'reserve area must be zeroed');
    }

    assert.throws(() => decryptTraeDb({
      dbPath,
      encKey: randomBytes(32).toString('hex'),
      outputPath: path.join(dir, 'nope.db')
    }), (error) => error.code === 'TRAE_KEY_INVALID');
    assert.equal(fs.existsSync(path.join(dir, 'nope.db')), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('normalizeTraeTurnRow maps the context envelope and clamps cache components', () => {
  const row = normalizeTraeTurnRow({
    rowid: 7,
    session_id: 's1',
    created_at: 1750000000,
    context: JSON.stringify({
      token_usage: {
        prompt_tokens: 15012,
        completion_tokens: 312,
        cache_read_input_tokens: 12000,
        cache_creation_input_tokens: 500
      },
      persist_user_message_context: { model_info: { config_name: 'kimi-k2.5' } }
    }),
    project_label: 'demo'
  });
  assert.deepEqual(row, {
    sessionId: 'trae:cn:s1',
    messageId: 'trae:cn:s1:7',
    model: 'kimi-k2.5',
    projectLabel: 'demo',
    input: 2512,
    output: 312,
    cacheRead: 12000,
    cacheWrite: 500,
    createdAt: 1750000000000,
    messages: 1
  });

  // Cache read larger than the prompt clamps to the prompt; malformed JSON and
  // zero-usage rows drop out entirely.
  const clamped = normalizeTraeTurnRow({
    rowid: 8,
    session_id: 's2',
    created_at: null,
    context: JSON.stringify({ token_usage: { prompt_tokens: 100, completion_tokens: 5, cache_read_input_tokens: 999 } })
  });
  assert.equal(clamped.cacheRead, 100);
  assert.equal(clamped.cacheWrite, 0);
  assert.equal(clamped.input, 0);
  assert.equal(clamped.createdAt, 0);
  assert.equal(clamped.model, 'trae');
  assert.equal(normalizeTraeTurnRow({ context: 'not json' }), null);
  assert.equal(normalizeTraeTurnRow({ context: JSON.stringify({ token_usage: { prompt_tokens: 0, completion_tokens: 0 } }) }), null);
});

test('normalizeTraeHistoryRow maps a sub-agent history_v2 call to the usage-row shape', () => {
  const row = normalizeTraeHistoryRow({
    rowid: 42,
    session_id: 's1',
    created_at: 1750000000,
    token_usage: 1000,
    messages: JSON.stringify({
      raw_messages: [
        { role: 'tool', extra_info: { input_token: 300 } },
        { role: 'assistant', extra_info: { model: 'glm-5.2', model_name: 'glm-5.2__dev', input_token: 400 } }
      ],
      mode: 'agent'
    }),
    project_label: 'demo'
  });
  assert.deepEqual(row, {
    sessionId: 'trae:cn:s1',
    // The hv2 discriminator keeps a history_v2 id from colliding with a
    // chat_turn rowid sharing the same session in the mergeTraeRows map.
    messageId: 'trae:cn:s1:hv2:42',
    model: 'glm-5.2',
    projectLabel: 'demo',
    // Sub-agent input is unclassified, never input: history_v2 has no cache
    // fields, and an unknown split must not render as cache miss.
    input: 0,
    output: 300,
    unclassified: 700,
    cacheRead: 0,
    cacheWrite: 0,
    createdAt: 1750000000000,
    messages: 1
  });

  // input_token beyond the total clamps; a missing model falls back to 'trae';
  // zero-total and malformed rows drop out entirely.
  const clamped = normalizeTraeHistoryRow({
    rowid: 43,
    session_id: 's2',
    created_at: null,
    token_usage: 100,
    messages: JSON.stringify({ raw_messages: [{ role: 'assistant', extra_info: { input_token: 500 } }] })
  });
  assert.equal(clamped.unclassified, 100);
  assert.equal(clamped.output, 0);
  assert.equal(clamped.model, 'trae');
  assert.equal(normalizeTraeHistoryRow({ token_usage: 5, messages: 'not json' }), null);
  assert.equal(normalizeTraeHistoryRow({ token_usage: 0, messages: '{"raw_messages":[]}' }), null);
});

test('sub-agent tokens land in unclassified and stay out of the cache split', () => {
  const mainTurn = {
    sessionId: 'trae:cn:s1', messageId: 'm1', model: 'kimi-k2.5', projectLabel: 'demo',
    input: 100, output: 10, cacheRead: 50, cacheWrite: 5, createdAt: Date.now() - 1000, messages: 1
  };
  const subCall = normalizeTraeHistoryRow({
    rowid: 42,
    session_id: 's1',
    created_at: Math.floor((Date.now() - 1000) / 1000),
    token_usage: 1000,
    messages: JSON.stringify({
      raw_messages: [{ role: 'assistant', extra_info: { model: 'kimi-k2.5', input_token: 700 } }]
    })
  });
  const periods = buildTraePeriodsNormalized({ rows: [mainTurn, subCall] });
  const today = periods.today;
  // Total keeps counting the sub-agent call...
  assert.equal(today.totalTokens, 100 + 10 + 50 + 5 + 1000);
  assert.equal(today.models['kimi-k2.5'], 100 + 10 + 50 + 5 + 1000);
  // ...but its input side is unclassified, not cache miss, and the main
  // agent's cache split passes through untouched.
  assert.equal(today.unclassifiedTokens, 700);
  assert.equal(today.clientUnclassifiedTokens[TRAE_CLIENT], 700);
  assert.equal(today.modelUnclassifiedTokens['kimi-k2.5'], 700);
  assert.equal(today.cacheReadTokens, 50);
  assert.equal(today.cacheWriteTokens, 5);
  assert.equal(today.outputTokens, 10 + 300);
  // Closure: after components + unclassified, what remains is the main
  // agent's non-cache input — a genuine cache miss, not sub-agent noise.
  assert.equal(today.cacheReadTokens + today.cacheWriteTokens + today.outputTokens + today.unclassifiedTokens, 1065);
  assert.equal(today.totalTokens - 1065, 100);

  const graph = buildTraeHistoryGraph({ rows: [mainTurn, subCall] });
  const entry = graph.contributions[0].clients.find((client) => client.modelId === 'kimi-k2.5');
  assert.equal(entry.tokens.unclassified, 700);
  assert.equal(entry.unclassifiedTokens, 700);
  assert.equal(entry.tokens.input, 100);
  assert.equal(entry.tokens.cacheRead, 50);
});

test('traeDataPaths resolves the Trae CN database location and env override', () => {
  const windows = traeDataPaths({
    platform: 'win32',
    homeDir: '/home/u',
    env: { APPDATA: 'C:/Users/u/AppData/Roaming' }
  });
  assert.deepEqual(windows.dbPaths, [
    path.join('C:/Users/u/AppData/Roaming', 'Trae CN', 'ModularData', 'ai-agent', 'database.db')
  ]);
  const overridden = traeDataPaths({
    platform: 'win32',
    homeDir: '/home/u',
    env: { APPDATA: 'C:/x', TOKEN_MONITOR_TRAE_CN_DB_PATH: 'D:/tr.db' }
  });
  assert.deepEqual(overridden.dbPaths, [path.resolve('D:/tr.db')]);
  assert.deepEqual(traeDataPaths({ platform: 'linux', homeDir: '/home/u', env: {} }).dbPaths, []);
});

function buildSummary() {
  return {
    today: normalizePeriod({}),
    month: normalizePeriod({}),
    allTime: normalizePeriod({})
  };
}

const SAMPLE_ROWS = [
  { sessionId: 'trae:cn:s1', messageId: 'm1', model: 'kimi-k2.5', projectLabel: 'demo', input: 100, output: 10, cacheRead: 50, cacheWrite: 5, createdAt: Date.now() - 1000, messages: 1 },
  { sessionId: 'trae:cn:s1', messageId: 'm2', model: 'glm-5.1', projectLabel: 'demo', input: 200, output: 20, cacheRead: 0, cacheWrite: 0, createdAt: Date.now() - 2000, messages: 1 },
  { sessionId: 'trae:cn:s2', messageId: 'm3', model: 'kimi-k2.5', projectLabel: '', input: 5, output: 1, cacheRead: 0, cacheWrite: 0, createdAt: 0, messages: 1 }
];

test('buildTraePeriodsNormalized buckets rows into today/month/allTime', () => {
  const periods = buildTraePeriodsNormalized({ rows: SAMPLE_ROWS });
  assert.equal(periods.today.clients[TRAE_CLIENT], 385);
  assert.equal(periods.month.clients[TRAE_CLIENT], 385);
  // The undated row counts only for allTime.
  assert.equal(periods.allTime.clients[TRAE_CLIENT], 391);
  // Session keys are `${client}:${sessionId}`.
  assert.ok(periods.today.sessions['trae:trae:cn:s1']);
  assert.equal(periods.today.sessions['trae:trae:cn:s1'].client, TRAE_CLIENT);
  assert.equal(periods.today.models['kimi-k2.5'], 165);
});

test('applyTraeCollectionUsage merges trae into periods and skips stale buckets', () => {
  const now = new Date();
  const periods = buildTraePeriodsNormalized({ rows: SAMPLE_ROWS, now });
  const summary = applyTraeCollectionUsage(buildSummary(), {
    periods,
    capturedAt: now.toISOString()
  }, { now });
  assert.equal(summary.today.clients[TRAE_CLIENT], 385);
  assert.equal(summary.month.clients[TRAE_CLIENT], 385);
  assert.equal(summary.allTime.clients[TRAE_CLIENT], 391);
  assert.ok(summary.allTime.sessions['trae:trae:cn:s2']);
  // The merge must carry the cache split through (mergePeriods), not flush it
  // into unclassified (the archived-client path once did).
  assert.equal(summary.today.clientCacheReads[TRAE_CLIENT], 50);
  assert.equal(summary.today.clientCacheWrites[TRAE_CLIENT], 5);
  assert.equal(summary.today.clientOutputs[TRAE_CLIENT], 30);
  assert.equal(summary.today.modelCacheReads['kimi-k2.5'], 50);
  assert.equal(summary.today.clientUnclassifiedTokens[TRAE_CLIENT] || 0, 0);
  assert.equal(summary.today.capabilities.tokenComponents, true);

  // A snapshot captured "yesterday" must not feed today's or this month's
  // buckets; allTime still applies.
  const stale = applyTraeCollectionUsage(buildSummary(), {
    periods,
    capturedAt: new Date(now.getTime() - 86400000).toISOString()
  }, { now });
  assert.equal(stale.today.clients[TRAE_CLIENT] || 0, 0);
  assert.equal(stale.allTime.clients[TRAE_CLIENT], 391);

  // Previews without a period must keep that period absent.
  const preview = applyTraeCollectionUsage({ today: normalizePeriod({}) }, {
    periods,
    capturedAt: now.toISOString()
  }, { now });
  assert.equal(preview.today.clients[TRAE_CLIENT], 385);
  assert.equal(Object.prototype.hasOwnProperty.call(preview, 'month'), false);
});

test('applyTraeCollectionHistory merges trae contributions into an existing history', () => {
  const graph = buildTraeHistoryGraph({ rows: SAMPLE_ROWS });
  const todayKey = localDayKeyOf(new Date());
  const summary = { history: null };
  applyTraeCollectionHistory(summary, graph, { todayKey });
  const day = summary.history.daily.find((entry) => entry.date === todayKey);
  assert.ok(day, 'today must appear in the merged history');
  assert.ok(day.perClient[TRAE_CLIENT]);
  assert.equal(day.perClient[TRAE_CLIENT].tokens, 385);

  const emptySummary = {};
  applyTraeCollectionHistory(emptySummary, { contributions: [] }, { todayKey });
  assert.equal(emptySummary.history, undefined, 'an empty graph must not create history');
});

(sqlite ? test : test.skip)('readTraeRows parses chat_turn with project attribution', () => {
  const dir = writeTempDir();
  try {
    const dbPath = path.join(dir, 'plain.db');
    const database = new sqlite.DatabaseSync(dbPath);
    database.exec(`
      CREATE TABLE chat_turn (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, created_at INTEGER, context TEXT);
      CREATE TABLE session_project (session_id TEXT, project_id TEXT);
      CREATE TABLE project (project_id TEXT, absolute_path TEXT);
      INSERT INTO project VALUES ('p1', 'C:\\work\\demo-project');
      INSERT INTO session_project VALUES ('s1', 'p1');
      INSERT INTO chat_turn (session_id, created_at, context) VALUES ('s1', 1750000000, '{"token_usage":{"prompt_tokens":100,"completion_tokens":10},"persist_user_message_context":{"model_info":{"config_name":"glm-5.1"}}}');
      INSERT INTO chat_turn (session_id, created_at, context) VALUES ('s2', 1750000100, '{"token_usage":{"prompt_tokens":50,"completion_tokens":2}}');
      INSERT INTO chat_turn (session_id, created_at, context) VALUES ('s1', NULL, 'broken json');
    `);
    database.close();

    const { rows, maxId } = readTraeRows(dbPath);
    assert.equal(rows.length, 2);
    assert.equal(maxId, 3);
    assert.equal(rows[0].sessionId, 'trae:cn:s1');
    assert.equal(rows[0].projectLabel, 'demo-project');
    assert.equal(rows[0].model, 'glm-5.1');
    assert.equal(rows[1].sessionId, 'trae:cn:s2');
    assert.equal(rows[1].projectLabel, '');
    // The overlap rewind keeps UPDATE-backfilled rows in scope: sinceId=3 reads
    // id > (3 - 256) = -253, i.e. everything, and refreshes them by messageId.
    const incremental = readTraeRows(dbPath, { sinceId: 3 });
    assert.equal(incremental.rows.length, 2);
    assert.equal(incremental.maxId, 3);
    const beyond = readTraeRows(dbPath, { sinceId: 300 });
    assert.equal(beyond.rows.length, 0);
    assert.equal(beyond.maxId, 3);
    // No agent_run/history_v2 in this fixture: sub-agent collection degrades to
    // the chat_turn-only pipeline instead of failing the read.
    assert.equal(beyond.historyMaxId, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

(sqlite ? test : test.skip)('readTraeRows merges sub-agent history_v2 rows and excludes soft-deleted ones', () => {
  const dir = writeTempDir();
  try {
    const dbPath = path.join(dir, 'plain.db');
    const database = new sqlite.DatabaseSync(dbPath);
    database.exec(`
      CREATE TABLE chat_turn (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, created_at INTEGER, context TEXT);
      CREATE TABLE agent_run (id INTEGER PRIMARY KEY AUTOINCREMENT, agent_run_id TEXT, parent_run_id TEXT, session_id TEXT);
      CREATE TABLE history_v2 (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, created_at INTEGER, messages TEXT, token_usage INTEGER, agent_run_id TEXT, deleted_at INTEGER);
      INSERT INTO chat_turn (session_id, created_at, context) VALUES ('s1', 1750000000, '{"token_usage":{"prompt_tokens":100,"completion_tokens":10,"cache_read_input_tokens":40},"persist_user_message_context":{"model_info":{"config_name":"glm-5.1"}}}');
      INSERT INTO agent_run (agent_run_id, parent_run_id, session_id) VALUES ('top-run', NULL, 's1');
      INSERT INTO agent_run (agent_run_id, parent_run_id, session_id) VALUES ('sub-run', 'top-run', 's1');
      INSERT INTO agent_run (agent_run_id, parent_run_id, session_id) VALUES ('orphan-run', '', 's1');
      -- sub-agent call: counted
      INSERT INTO history_v2 (session_id, created_at, messages, token_usage, agent_run_id, deleted_at) VALUES ('s1', 1750000050, '{"raw_messages":[{"role":"assistant","extra_info":{"model":"mimo-v2.5","input_token":60}}]}', 100, 'sub-run', 0);
      -- top-run call: NOT counted (top turns come from chat_turn, never double-counted)
      INSERT INTO history_v2 (session_id, created_at, messages, token_usage, agent_run_id, deleted_at) VALUES ('s1', 1750000060, '{"raw_messages":[{"role":"assistant","extra_info":{"model":"mimo-v2.5","input_token":10}}]}', 20, 'top-run', 0);
      -- empty parent_run_id is a top-level run, not a sub-agent
      INSERT INTO history_v2 (session_id, created_at, messages, token_usage, agent_run_id, deleted_at) VALUES ('s1', 1750000070, '{"raw_messages":[{"role":"assistant","extra_info":{"model":"mimo-v2.5","input_token":5}}]}', 9, 'orphan-run', 0);
      -- soft-deleted sub-agent call: excluded from rows but still raises the cursor
      INSERT INTO history_v2 (session_id, created_at, messages, token_usage, agent_run_id, deleted_at) VALUES ('s1', 1750000080, '{"raw_messages":[{"role":"assistant","extra_info":{"model":"mimo-v2.5","input_token":1}}]}', 5, 'sub-run', 1750000999);
    `);
    database.close();

    const { rows, maxId, historyMaxId } = readTraeRows(dbPath, { source: TRAE_SOURCES.trae });
    // 1 chat_turn + 1 sub-agent history_v2 row.
    assert.equal(rows.length, 2);
    assert.equal(maxId, 1);
    // The whole-table MAX(id) includes the soft-deleted row (id 4).
    assert.equal(historyMaxId, 4);
    const turn = rows.find((row) => !row.messageId.includes(':hv2:'));
    const sub = rows.find((row) => row.messageId.includes(':hv2:'));
    assert.equal(turn.cacheRead, 40, 'main-agent cache split survives');
    assert.equal(sub.sessionId, 'trae:cn:s1');
    assert.equal(sub.messageId, 'trae:cn:s1:hv2:1');
    assert.equal(sub.model, 'mimo-v2.5');
    assert.equal(sub.input, 0);
    assert.equal(sub.unclassified, 60);
    assert.equal(sub.output, 40);
    assert.equal(sub.cacheRead, 0);
    // Independent cursors: sinceHistoryId prunes history_v2 only, chat_turn
    // stays. The 256-row overlap rewind still re-reads the whole small table,
    // which is the point — re-read rows refresh in place by messageId.
    const incremental = readTraeRows(dbPath, { source: TRAE_SOURCES.trae, sinceId: 1, sinceHistoryId: 4 });
    assert.equal(incremental.rows.length, 2, 'overlap rewind re-reads both sources');
    assert.equal(incremental.historyMaxId, 4);
    // Past the rewind window the history side drops out entirely.
    const beyond = readTraeRows(dbPath, { source: TRAE_SOURCES.trae, sinceId: 1, sinceHistoryId: 300 });
    assert.equal(beyond.rows.length, 1, 'only the chat_turn row remains');
    assert.equal(beyond.historyMaxId, 4);
    // A source without subUsageTable never touches the sub tables.
    const mainOnly = readTraeRows(dbPath, { source: { ...TRAE_SOURCES.trae, subUsageTable: null } });
    assert.equal(mainOnly.rows.length, 1);
    assert.equal(mainOnly.historyMaxId, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('mergeTraeRows refreshes by messageId without double-counting', () => {
  const existing = [
    { messageId: 'm1', input: 10, output: 1 },
    { messageId: 'm2', input: 20, output: 2 }
  ];
  const incoming = [
    { messageId: 'm2', input: 25, output: 3 },
    { messageId: 'm3', input: 30, output: 4 }
  ];
  const merged = mergeTraeRows(existing, incoming);
  assert.deepEqual(merged.map((row) => row.messageId), ['m1', 'm2', 'm3']);
  assert.equal(merged.find((row) => row.messageId === 'm2').input, 25, 'incoming refreshes the existing row');
});

test('traeSourceSignature covers the main database and its WAL', () => {
  const dir = writeTempDir();
  try {
    const db = path.join(dir, 'database.db');
    const wal = `${db}-wal`;
    fs.writeFileSync(db, 'a');
    fs.writeFileSync(wal, 'b');
    const first = traeSourceSignature(db);
    assert.ok(first.includes('|'));
    // Touching only the WAL (WAL-mode writes land there) must change the
    // signature, or P1 would skip a database that actually grew.
    fs.writeFileSync(wal, 'bc');
    assert.notEqual(traeSourceSignature(db), first);
    fs.unlinkSync(wal);
    assert.notEqual(traeSourceSignature(db), first);
    assert.equal(traeSourceSignature(''), '');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('collectTraeSnapshot decrypts, reads, and removes the decrypted file', () => {
  const dir = writeTempDir();
  try {
    const key = randomBytes(32);
    const salt = randomBytes(16);
    const plain = Buffer.alloc(PAGE, 0x51);
    const dbPath = path.join(dir, 'database.db');
    fs.writeFileSync(dbPath, encryptPage(plain, 1, key, salt));

    let capturedOutputPath = null;
    let seenSinceId;
    const result = collectTraeSnapshot({
      dbPath,
      encKey: key.toString('hex'),
      workDir: dir,
      sinceId: 7,
      decryptDb: ({ encKey, outputPath }) => {
        capturedOutputPath = outputPath;
        decryptTraeDb({ dbPath, encKey, outputPath });
        return { pages: 1, bytes: PAGE };
      },
      readRows: (p, opts) => {
        seenSinceId = opts.sinceId;
        return {
          rows: [{ sessionId: 'trae:cn:s1', messageId: 'm1', model: 'm', input: 1, output: 1, cacheRead: 0, cacheWrite: 0, createdAt: 0, messages: 1 }],
          maxId: 42
        };
      }
    });
    assert.equal(result.rows.length, 1);
    assert.equal(result.maxId, 42);
    assert.equal(seenSinceId, 7, 'collectTraeSnapshot forwards sinceId to the reader');
    assert.equal(fs.existsSync(capturedOutputPath), false,
      'the decrypted database must be removed after the read');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('collectTraeSnapshot forwards sinceHistoryId and returns historyMaxId', () => {
  const dir = writeTempDir();
  try {
    const key = randomBytes(32);
    const salt = randomBytes(16);
    const plain = Buffer.alloc(PAGE, 0x51);
    const dbPath = path.join(dir, 'database.db');
    fs.writeFileSync(dbPath, encryptPage(plain, 1, key, salt));

    const seen = {};
    const result = collectTraeSnapshot({
      dbPath,
      encKey: key.toString('hex'),
      workDir: dir,
      sinceId: 7,
      sinceHistoryId: 99,
      source: TRAE_SOURCES.trae,
      decryptDb: ({ outputPath }) => {
        decryptTraeDb({ dbPath, encKey: key.toString('hex'), outputPath });
        return { pages: 1, bytes: PAGE };
      },
      readRows: (p, opts) => {
        seen.sinceId = opts.sinceId;
        seen.sinceHistoryId = opts.sinceHistoryId;
        seen.source = opts.source;
        return { rows: [], maxId: 42, historyMaxId: 120 };
      }
    });
    assert.equal(seen.sinceId, 7);
    assert.equal(seen.sinceHistoryId, 99, 'the history cursor must reach the reader too');
    assert.equal(seen.source, TRAE_SOURCES.trae);
    assert.equal(result.maxId, 42);
    assert.equal(result.historyMaxId, 120);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('localDayKeyOf/localMonthKeyOf produce local calendar keys', () => {
  const date = new Date(2026, 7, 30, 23, 5);
  assert.equal(localDayKeyOf(date), '2026-08-30');
  assert.equal(localMonthKeyOf(date), '2026-08');
  assert.equal(localDayKeyOf(new Date('nope')), '');
});

test('normalizeTraeTurnRow keys session/message ids off the source descriptor', () => {
  const context = JSON.stringify({
    token_usage: { prompt_tokens: 100, completion_tokens: 10 },
    persist_user_message_context: { model_info: { config_name: 'doubao-seed-2.1' } }
  });
  const traework = normalizeTraeTurnRow({ rowid: 9, session_id: 's1', created_at: 1750000000, context }, 'traework');
  assert.equal(traework.sessionId, 'trae:work:s1');
  assert.equal(traework.messageId, 'trae:work:s1:9');
  assert.equal(traework.model, 'doubao-seed-2.1');
  // The same session_id in the two databases must never collapse into one
  // session, and the trae default keeps its historical prefix.
  const trae = normalizeTraeTurnRow({ rowid: 9, session_id: 's1', created_at: 1750000000, context });
  assert.notEqual(trae.sessionId, traework.sessionId);
  assert.notEqual(trae.messageId, traework.messageId);
  // Descriptor objects are accepted as well as ids.
  assert.equal(normalizeTraeTurnRow({ rowid: 1, session_id: 's', created_at: 1, context }, { sessionPrefix: 'x:y' }).sessionId, 'x:y:s');
});

test('traeDataPaths resolves the TraeWork (TRAE SOLO CN) location and env override', () => {
  const traework = traeDataPaths({
    source: 'traework',
    platform: 'win32',
    homeDir: '/home/u',
    env: { APPDATA: 'C:/Users/u/AppData/Roaming' }
  });
  assert.deepEqual(traework.dbPaths, [
    path.join('C:/Users/u/AppData/Roaming', 'TRAE SOLO CN', 'ModularData', 'ai-agent', 'database.db')
  ]);
  const overridden = traeDataPaths({
    source: 'traework',
    platform: 'win32',
    homeDir: '/home/u',
    env: { APPDATA: 'C:/x', TOKEN_MONITOR_TRAE_WORK_DB_PATH: 'D:/tw.db' }
  });
  assert.deepEqual(overridden.dbPaths, [path.resolve('D:/tw.db')]);
});

test('buildTraePeriodsNormalized and the history graph attribute rows to the requested source client', () => {
  const rows = [
    { sessionId: 'trae:work:s1', messageId: 'w1', model: 'doubao-seed-2.1', projectLabel: '', input: 300, output: 30, cacheRead: 0, cacheWrite: 0, createdAt: Date.now() - 1000, messages: 1 }
  ];
  const periods = buildTraePeriodsNormalized({ rows, client: 'traework' });
  assert.equal(periods.today.clients.traework, 330);
  assert.equal(periods.today.clients.trae, undefined);
  assert.ok(periods.today.sessions['traework:trae:work:s1']);
  assert.equal(periods.today.sessions['traework:trae:work:s1'].client, 'traework');

  const graph = buildTraeHistoryGraph({ rows, client: 'traework' });
  const todayKey = localDayKeyOf(new Date());
  const day = graph.contributions.find((entry) => entry.date === todayKey);
  assert.equal(day.clients[0].client, 'traework');
});

'use strict';

const { collectorAnchorTrust, collectorSnapshotTrust, computePeriodWindows, qoderCnDbPathForClients } = require('./collector');
const { mergePeriods } = require('./usage');
const { filterReasonixSyntheticSessions } = require('./providers/reasonix/sessionGuard');

// The collector persists every full scan to collector-anchor.json so it can
// derive month/allTime from a `--today` scan after a restart. A widget cold
// start reuses that same file for a second purpose: putting real numbers on
// screen immediately instead of zeros for the length of the first full scan
// (today + month + `--since allTimeSince`, run serially to avoid the CPU spike
// from issue #15).
//
// Whether the anchor may be reused at all is collectorAnchorTrust's call, shared
// with startCollector so the two cannot drift: an anchor the collector is about
// to discard would otherwise show the previous configuration's totals for a
// minute and then drop them, which reads as a counting bug rather than a seed
// being replaced. Seeding then adds one rule of its own, below.
// Returns a device record, or null when the anchor cannot be used.
function deviceRecordFromAnchor(saved, options = {}) {
  const trust = collectorAnchorTrust(saved, anchorTrustOptions(options));
  if (!trust) return null;
  // The seed's own rule, and the one place it is stricter than the collector.
  // A capture time the collector cannot trust only costs it a full scan, but
  // here that timestamp becomes the record's updatedAt and the instant the
  // archive projection is evaluated at, so a snapshot of unknown age must not
  // be presented as one taken now.
  if (trust.capturedAtMs === null) return null;
  return anchorDeviceRecord(saved, options, trust);
}

// The cross-day variant: same integrity rules, same record shape, but the
// same-local-day requirement is replaced by collectorSnapshotTrust, so an
// anchor captured on an earlier day can seed the display too. The periods it
// returns belong to that earlier day — the caller must surface the snapshot
// metadata alongside the record so the UI can label them, which is what keeps
// yesterday's `today` from reading as the current day's total. Returns
// { record, snapshot: { dateKey, capturedAt } } or null.
function deviceRecordFromSnapshotAnchor(saved, options = {}) {
  const trust = collectorSnapshotTrust(saved, anchorTrustOptions(options));
  if (!trust) return null;
  // Same reasoning as the same-day path: the capture time drives updatedAt and
  // the archive projection, so an untrustworthy one disqualifies the seed.
  if (trust.capturedAtMs === null) return null;
  const record = anchorDeviceRecord(saved, options, trust);
  if (!record) return null;
  return {
    record,
    snapshot: { dateKey: trust.dateKey, capturedAt: record.updatedAt }
  };
}

function anchorTrustOptions(options) {
  const {
    clients = '',
    allTimeSince = '',
    projectsEnabled = true,
    qoderCnDbPath: qoderCnDbPathOption,
    homeDir,
    now = new Date()
  } = options;
  const qoderCnDbPath = qoderCnDbPathOption === undefined
    ? qoderCnDbPathForClients(clients, { homeDir })
    : qoderCnDbPathOption;
  return { clients, allTimeSince, projectsEnabled, qoderCnDbPath, now };
}

function anchorDeviceRecord(saved, options, trust) {
  const {
    envelope = {},
    clients = '',
    allTimeSince = '',
    projectsEnabled = true,
    wslScanEnabled = true,
    wslSupported = false,
    hostname = '',
    platform = '',
    now = new Date()
  } = options;
  // The anchor keeps host periods and the WSL bundle apart, the way
  // collectUsageOnce does before summing them. The same-day seed has anchor day
  // == current day established by the trust check; the cross-day snapshot keeps
  // host and WSL windows consistent with each other instead — both captured on
  // the snapshot's day — which is the pairing the merge actually needs.
  const wsl = wslScanEnabled !== false ? saved.wslBundle : null;
  const cleanPeriod = (period) => {
    if (!period || typeof period !== 'object' || !Object.prototype.hasOwnProperty.call(period, 'sessions')) return period;
    const sessions = filterReasonixSyntheticSessions(period.sessions);
    return sessions === period.sessions ? period : { ...period, sessions };
  };
  const withWsl = (period, wslPeriod) => cleanPeriod(wslPeriod ? mergePeriods(period, wslPeriod) : period);
  // Mirrors collectUsageOnce: a non-Windows host reports no WSL status at all,
  // a Windows host with scanning off reports it as disabled rather than absent,
  // and otherwise the anchor's own snapshot stands until the first scan. Absent
  // and disabled are different states downstream, so the distinction is kept.
  const wslStatus = !wslSupported
    ? null
    : wslScanEnabled === false
      ? { state: 'disabled', detected: [], withData: [] }
      : (saved.wslStatus || null);
  const at = new Date(trust.capturedAtMs).toISOString();
  return {
    ...envelope,
    hostname,
    platform,
    updatedAt: at,
    receivedAt: at,
    trackedClients: String(clients || '').split(',').filter(Boolean),
    // Both drive UI beyond the totals: projectsEnabled decides whether the
    // all-time project breakdown is flagged incomplete, wslStatus feeds the
    // attribution panel. Leaving them off makes the seed a record that looks
    // subtly unlike the one replacing it.
    projectsEnabled,
    ...(wslStatus ? { wslStatus } : {}),
    // Required, not decorative. Without them aggregateDevices falls back to
    // comparing UTC days, and anywhere ahead of UTC a local day that has not
    // rolled over in UTC yet reads as an expired window: today's tokens get
    // dropped and the card shows the zero this whole path exists to avoid.
    // Windows are computed at `now`, not at the snapshot: isPeriodExpired drops
    // a period whose window has ended, so a cross-day snapshot carrying its own
    // day's windows would be discarded by the very aggregation it feeds. The
    // day mismatch is carried by the snapshot metadata instead, and labeling
    // the UI is what keeps those periods honest.
    periodWindows: computePeriodWindows(now),
    today: withWsl(saved.today, wsl?.today),
    month: withWsl(saved.month, wsl?.month),
    allTime: withWsl(saved.allTime, wsl?.allTime),
    ...(Object.prototype.hasOwnProperty.call(saved, 'nativeSessions') ? { nativeSessions: saved.nativeSessions } : {}),
    ...(Object.prototype.hasOwnProperty.call(saved, 'nativeProjects') ? { nativeProjects: saved.nativeProjects } : {})
  };
}

module.exports = {
  deviceRecordFromAnchor,
  deviceRecordFromSnapshotAnchor
};

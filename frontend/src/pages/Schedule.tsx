import { useEffect, useRef, useState } from "react";
import { useApp } from "../store/store";
import { formatDate, formatTimeRange } from "../utils/time";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Zap,
  Radio,
  Clock,
  AlertTriangle,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  Calendar,
  SkipForward,
} from "lucide-react";
import type { Match, Tournament } from "../types";
import styles from "./Schedule.module.css";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";

interface ScheduledMatch extends Match {
  tournament: Tournament;
}

const statusConfig = {
  completed: {
    label: "Done",
    color: "var(--text-3)",
    bg: "var(--bg-3)",
    border: "var(--border)",
  },
  live: {
    label: "Live",
    color: "var(--red)",
    bg: "rgba(255,71,87,0.10)",
    border: "rgba(255,71,87,0.45)",
  },
  scheduled: {
    label: "Scheduled",
    color: "var(--blue)",
    bg: "rgba(79,172,254,0.10)",
    border: "rgba(79,172,254,0.35)",
  },
  delayed: {
    label: "Delayed",
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "rgba(var(--amber-rgb),0.4)",
  },
  cancelled: {
    label: "Canc",
    color: "var(--text-3)",
    bg: "var(--bg-3)",
    border: "var(--border)",
  },
};

export default function Schedule() {
  const {
    tournaments,
    timePrefs,
    settings,
    delayedMatchTimers,
    startMatch,
    reportDelay,
    setDelayedMatchTimer,
    clearDelayedMatchTimer,
  } = useApp();
  const [view, setView] = useState<"grid" | "list">(
    settings.schedulePrefs.defaultView,
  );
  const [selectedDate, setSelectedDate] = useState("2026-03-15");
  const [reportDelayMatch, setReportDelayMatch] = useState<{
    matchId: string;
    tournamentId: string;
  } | null>(null);
  const [customDelay, setCustomDelay] = useState("");
  const [confirmDelay, setConfirmDelay] = useState<{
    matchId: string;
    tournamentId: string;
    minutes: number;
  } | null>(null);
  const [confirmResume, setConfirmResume] = useState<{
    matchId: string;
    tournamentId: string;
  } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const viewToggleRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dateNavRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const t = tournaments[0];

  const allMatches: ScheduledMatch[] = tournaments.flatMap((tour) =>
    tour.matches
      .filter((m) => m.timeBlockId)
      .map((m) => ({ ...m, tournament: tour })),
  );

  const getName = (tour: Tournament, id: string | null) =>
    id ? (tour.participants.find((p) => p.id === id)?.name ?? "TBD") : "TBD";

  const liveMatches = allMatches.filter((m) => m.status === "live");
  const delayedMatches = allMatches.filter((m) => m.status === "delayed");

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleViewToggleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const nextIndex =
      e.key === "ArrowRight"
        ? (index + 1) % 2
        : (index - 1 + 2) % 2;
    setView(nextIndex === 0 ? "grid" : "list");
    viewToggleRefs.current[nextIndex]?.focus();
  };

  const handleDateNavKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const nextIndex =
      e.key === "ArrowRight"
        ? (index + 1) % 2
        : (index - 1 + 2) % 2;
    dateNavRefs.current[nextIndex]?.focus();
  };

  // Tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (matchId: string) => {
    const timerInfo = delayedMatchTimers[matchId];
    if (!timerInfo) return "00:00";
    const elapsed = Math.floor((now - timerInfo.startAt) / 1000);
    const remaining = Math.max(0, timerInfo.durationSeconds - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // For grid: cell lookup by [locationId][timeBlockId]
  const cellMap: Record<string, Record<string, ScheduledMatch[]>> = {};
  allMatches.forEach((m) => {
    if (!m.locationId || !m.timeBlockId) return;
    if (!cellMap[m.locationId]) cellMap[m.locationId] = {};
    if (!cellMap[m.locationId][m.timeBlockId])
      cellMap[m.locationId][m.timeBlockId] = [];
    cellMap[m.locationId][m.timeBlockId].push(m);
  });

  if (!t)
    return (
      <div className={styles.page}>
        <p style={{ padding: "2rem" }}>No tournaments available.</p>
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Schedule</h1>
          <p className={styles.sub}>Match timeline and resource planning</p>
        </div>
        <div className={styles.viewToggle}>
          <button
            ref={(node) => {
              viewToggleRefs.current[0] = node;
            }}
            className={`${styles.toggleBtn} ${view === "grid" ? styles.toggleActive : ""}`}
            onClick={() => setView("grid")}
            onKeyDown={(e) => handleViewToggleKeyDown(e, 0)}
          >
            <LayoutGrid size={13} />
            <span>Grid</span>
          </button>
          <button
            ref={(node) => {
              viewToggleRefs.current[1] = node;
            }}
            className={`${styles.toggleBtn} ${view === "list" ? styles.toggleActive : ""}`}
            onClick={() => setView("list")}
            onKeyDown={(e) => handleViewToggleKeyDown(e, 1)}
          >
            <List size={13} />
            <span>List</span>
          </button>
        </div>
      </div>

      {(liveMatches.length > 0 || delayedMatches.length > 0) && (
        <div className={styles.alertBar}>
          {liveMatches.length > 0 && (
            <div className={styles.alert} data-type="live">
              <Radio size={14} className="animate-pulse" style={{ animationDuration: "2.2s" }} />
              <strong>{liveMatches.length} live now</strong>
              {liveMatches.map((m) => (
                <span key={m.id} className={styles.alertChip}>
                  {getName(m.tournament, m.participant1Id)} vs{" "}
                  {getName(m.tournament, m.participant2Id)}
                </span>
              ))}
            </div>
          )}
          {delayedMatches.length > 0 && (
            <div className={styles.alert} data-type="delayed">
              <AlertTriangle size={14} />
              <strong>{delayedMatches.length} delayed</strong>
            </div>
          )}
        </div>
      )}

      {allMatches.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No matches scheduled"
          description="Matches will appear once the tournament starts"
        />
      )}

      {allMatches.length > 0 && (
        <>
          <div className={styles.dateNav}>
            <button
              ref={(node) => {
                dateNavRefs.current[0] = node;
              }}
              className={styles.dateBtn}
              onClick={() => shiftDate(-1)}
              onKeyDown={(e) => handleDateNavKeyDown(e, 0)}
            >
              <ChevronLeft size={16} />
            </button>
            <div className={styles.dateDisplay}>
              <span className={styles.dateFull}>
                {formatDate(selectedDate, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {selectedDate === "2026-03-15" && (
                <span className={styles.todayBadge}>Tournament Day</span>
              )}
            </div>
            <button
              ref={(node) => {
                dateNavRefs.current[1] = node;
              }}
              className={styles.dateBtn}
              onClick={() => shiftDate(1)}
              onKeyDown={(e) => handleDateNavKeyDown(e, 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {view === "grid" ? (
            <div className={styles.gridWrapper}>
              <table className={styles.grid}>
                <thead>
                  <tr>
                    <th className={styles.cornerCell}>
                      <span className={styles.cornerLabel}>Location</span>
                    </th>
                    {t.timeBlocks.map((tb) => (
                      <th key={tb.id} className={styles.timeHeader}>
                        <span className={styles.timeHeaderLabel}>
                          {tb.label}
                        </span>
                        <span className={styles.timeHeaderRange}>
                          {formatTimeRange(
                            tb.start,
                            tb.end,
                            tb.date,
                            timePrefs.format,
                            timePrefs.timezone,
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.locations.map((loc) => (
                    <tr
                      key={loc.id}
                      className={!loc.available ? styles.unavailableRow : ""}
                    >
                      <td className={styles.locationCell}>
                        <div className={styles.locationName}>
                          <MapPin size={12} />
                          {loc.name}
                        </div>
                        <div className={styles.locationBuilding}>
                          {loc.building}
                        </div>
                        {!loc.available && (
                          <span className={styles.unavailableTag}>
                            Unavailable
                          </span>
                        )}
                      </td>
                      {t.timeBlocks.map((tb) => {
                        const matches = cellMap[loc.id]?.[tb.id] ?? [];
                        return (
                          <td
                            key={tb.id}
                            className={`${styles.cell} ${!loc.available ? styles.cellUnavailable : ""}`}
                          >
                            {matches.length === 0 ? (
                              <div className={styles.emptyCell}>—</div>
                            ) : (
                              <div className={styles.cellMatches}>
                                {matches.map((m) => {
                                  const st = statusConfig[m.status];
                                  const p1 = getName(
                                    m.tournament,
                                    m.participant1Id,
                                  );
                                  const p2 = getName(
                                    m.tournament,
                                    m.participant2Id,
                                  );
                                  return (
                                    <div
                                      key={m.id}
                                      className={styles.matchChip}
                                      style={{
                                        color: st.color,
                                        background: st.bg,
                                        borderColor: st.border,
                                      }}
                                    >
                                      {m.status === "live" && (
                                        <span className={styles.chipPulse} />
                                      )}
                                      <span className={styles.chipRef}>
                                        Match {m.matchNumber} · Round {m.round}
                                      </span>
                                      <span className={styles.chipPlayers}>
                                        {p1}
                                        <span className={styles.chipVs}>
                                          vs
                                        </span>
                                        {p2}
                                      </span>
                                      <span className={styles.chipStatus}>
                                        {st.label}
                                        {m.status === "delayed" &&
                                          delayedMatchTimers[m.id] !==
                                            undefined && (
                                            <span
                                              style={{
                                                marginLeft: "4px",
                                                fontWeight: "normal",
                                                opacity: 0.9,
                                              }}
                                            >
                                              ({formatCountdown(m.id)})
                                            </span>
                                          )}
                                      </span>
                                      {m.status === "live" && (
                                        <button
                                          className={styles.chipDelay}
                                          onClick={() =>
                                            setReportDelayMatch({
                                              matchId: m.id,
                                              tournamentId: m.tournament.id,
                                            })
                                          }
                                        >
                                          <AlertTriangle size={10} />
                                        </button>
                                      )}
                                      {m.status === "delayed" && (
                                        <div
                                          className={styles.chipDelayedActions}
                                        >
                                          <button
                                            className={styles.chipResume}
                                            onClick={() =>
                                              setConfirmResume({
                                                matchId: m.id,
                                                tournamentId: m.tournament.id,
                                              })
                                            }
                                            title="Resume now"
                                          >
                                            <SkipForward size={9} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.listView}>
              {t.timeBlocks.map((tb) => {
                const blockMatches = allMatches.filter(
                  (m) => m.timeBlockId === tb.id,
                );
                if (blockMatches.length === 0) return null;
                return (
                  <div key={tb.id} className={styles.timeGroup}>
                    <div className={styles.timeGroupHeader}>
                      <Clock size={13} />
                      <span>{tb.label}</span>
                      <span className={styles.timeRange}>
                        {formatTimeRange(
                          tb.start,
                          tb.end,
                          tb.date,
                          timePrefs.format,
                          timePrefs.timezone,
                        )}
                      </span>
                      <span className={styles.timeGroupCount}>
                        {blockMatches.length} match
                        {blockMatches.length > 1 ? "es" : ""}
                      </span>
                    </div>
                    <div className={styles.matchList}>
                      {blockMatches.map((m) => {
                        const loc = t.locations.find(
                          (l) => l.id === m.locationId,
                        );
                        const st = statusConfig[m.status];
                        const p1 = getName(m.tournament, m.participant1Id);
                        const p2 = getName(m.tournament, m.participant2Id);
                        return (
                          <div key={m.id} className={styles.matchRow}>
                            <div
                              className={styles.matchDot}
                              style={{ background: st.color }}
                            />
                            <div className={styles.matchInfo}>
                              <div className={styles.matchPlayers}>
                                <span
                                  className={
                                    m.winnerId === m.participant1Id &&
                                    m.winnerId
                                      ? styles.winnerName
                                      : ""
                                  }
                                >
                                  {p1}
                                </span>
                                <span className={styles.vsText}>vs</span>
                                <span
                                  className={
                                    m.winnerId === m.participant2Id &&
                                    m.winnerId
                                      ? styles.winnerName
                                      : ""
                                  }
                                >
                                  {p2}
                                </span>
                              </div>
                              <div className={styles.matchMeta}>
                                <span className={styles.tournamentTag}>
                                  {m.tournament.name}
                                </span>
                                {loc && (
                                  <span className={styles.locationTag}>
                                    <MapPin size={11} />
                                    {loc.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            {m.status === "completed" && (
                              <div className={styles.scoreDisplay}>
                                <span>{m.score1}</span>
                                <span className={styles.scoreDash}>—</span>
                                <span>{m.score2}</span>
                              </div>
                            )}
                            <div
                              className={`${styles.matchStatusChip} ${m.status === "delayed" ? styles.matchStatusChipDelayed : ""}`}
                              style={{
                                color: st.color,
                                background: st.bg,
                                borderColor: st.border,
                              }}
                            >
                              {m.status === "live" && (
                                <span className={styles.livePulse} />
                              )}
                              {st.label}
                            </div>
                            {m.status === "live" && (
                              <button
                                className={styles.delayBtn}
                                onClick={() =>
                                  setReportDelayMatch({
                                    matchId: m.id,
                                    tournamentId: m.tournament.id,
                                  })
                                }
                              >
                                <AlertTriangle size={12} /> Delay
                              </button>
                            )}
                            {m.status === "delayed" && (
                              <div className={styles.delayedActions}>
                                {delayedMatchTimers[m.id] !== undefined && (
                                  <div className={styles.delayedStatusInline}>
                                    <span className={styles.delayedStatusLabel}>
                                      Delayed
                                    </span>
                                    <span className={styles.delayedStatusTime}>
                                      {formatCountdown(m.id)} remaining
                                    </span>
                                  </div>
                                )}
                                <button
                                  className={styles.resumeBtn}
                                  onClick={() =>
                                    setConfirmResume({
                                      matchId: m.id,
                                      tournamentId: m.tournament.id,
                                    })
                                  }
                                >
                                  <SkipForward size={12} /> Resume now
                                </button>
                              </div>
                            )}
                            {m.status === "scheduled" && (
                              <button
                                className={styles.startBtn}
                                onClick={() =>
                                  startMatch(m.tournament.id, m.id)
                                }
                              >
                                <Zap size={12} /> Start
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {allMatches.filter((m) => !m.timeBlockId).length > 0 && (
                <div className={styles.timeGroup}>
                  <div className={styles.timeGroupHeader}>
                    <Clock size={13} />
                    <span>Unscheduled</span>
                    <span className={styles.timeGroupCount}>
                      {allMatches.filter((m) => !m.timeBlockId).length} match
                      {allMatches.filter((m) => !m.timeBlockId).length > 1
                        ? "es"
                        : ""}
                    </span>
                  </div>
                  <div className={styles.matchList}>
                    {allMatches
                      .filter((m) => !m.timeBlockId)
                      .map((m) => {
                        const p1 = getName(m.tournament, m.participant1Id);
                        const p2 = getName(m.tournament, m.participant2Id);
                        return (
                          <div key={m.id} className={styles.matchRow}>
                            <div
                              className={styles.matchDot}
                              style={{ background: "var(--text-3)" }}
                            />
                            <div className={styles.matchInfo}>
                              <div className={styles.matchPlayers}>
                                <span>{p1}</span>
                                <span className={styles.vsText}>vs</span>
                                <span>{p2}</span>
                              </div>
                              <div className={styles.matchMeta}>
                                <span className={styles.tournamentTag}>
                                  {m.tournament.name}
                                </span>
                              </div>
                            </div>
                            <span className={styles.unscheduledTag}>
                              Needs scheduling
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {reportDelayMatch && (
        <div
          className={styles.modalOverlay}
          onClick={() => setReportDelayMatch(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Report Delay</h2>
            <p className={styles.modalSub}>How long is the expected delay?</p>
            <div className={styles.delayOptions}>
              {[5, 10, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  className={styles.delayOption}
                  onClick={() => {
                    setConfirmDelay({
                      matchId: reportDelayMatch.matchId,
                      tournamentId: reportDelayMatch.tournamentId,
                      minutes: mins,
                    });
                  }}
                >
                  {mins} mins
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 relative group">
              <input
                type="number"
                min="1"
                placeholder="Custom (minutes)"
                className="w-full bg-arena-surface-hover border border-arena-border rounded-lg px-3 py-2 text-sm text-arena-text focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={customDelay}
                onChange={(e) => setCustomDelay(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const val = parseInt(customDelay);
                  if (val > 0) {
                    e.preventDefault();
                    setConfirmDelay({
                      matchId: reportDelayMatch.matchId,
                      tournamentId: reportDelayMatch.tournamentId,
                      minutes: val,
                    });
                  }
                }}
              />
              <div className="absolute right-[88px] inset-y-0.5 flex flex-col justify-between py-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-arena-text-muted hover:text-arena-text transition-colors p-0.5 rounded hover:bg-arena-surface"
                  onClick={(e) => {
                    e.preventDefault();
                    setCustomDelay((v) => String(parseInt(v || "0") + 1));
                  }}
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  className="text-arena-text-muted hover:text-arena-text transition-colors p-0.5 rounded hover:bg-arena-surface"
                  onClick={(e) => {
                    e.preventDefault();
                    setCustomDelay((v) =>
                      String(Math.max(1, parseInt(v || "0") - 1)),
                    );
                  }}
                >
                  <ChevronDown size={12} />
                </button>
              </div>
              <button
                className="px-4 py-2 bg-arena-accent text-arena-bg font-bold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-arena-accent-hover transition-colors"
                disabled={!customDelay || parseInt(customDelay) <= 0}
                onClick={() => {
                  const val = parseInt(customDelay);
                  if (val > 0) {
                    setConfirmDelay({
                      matchId: reportDelayMatch.matchId,
                      tournamentId: reportDelayMatch.tournamentId,
                      minutes: val,
                    });
                  }
                }}
              >
                Apply
              </button>
            </div>
            <p className={styles.autoNote}>
              ArenaOPS will auto-reschedule downstream matches and notify
              participants.
            </p>
            <button
              className={styles.cancelBtn}
              onClick={() => setReportDelayMatch(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelay !== null}
        title={`Delay match by ${confirmDelay?.minutes} mins?`}
        description="Downstream matches will be automatically adjusted and participants notified."
        confirmLabel="Apply Delay"
        confirmVariant="warning"
        onConfirm={() => {
          if (!confirmDelay) return;
          reportDelay(
            confirmDelay.tournamentId,
            confirmDelay.matchId,
            confirmDelay.minutes,
          );
          setDelayedMatchTimer(confirmDelay.matchId, {
            startAt: Date.now(),
            durationSeconds: confirmDelay.minutes * 60,
          });
          setConfirmDelay(null);
          setReportDelayMatch(null);
          setCustomDelay("");
        }}
        onCancel={() => setConfirmDelay(null)}
      />

      <ConfirmDialog
        open={confirmResume !== null}
        title="Resume match?"
        description="The match will go back to live. Are you sure you want to resume now?"
        confirmLabel="Resume now"
        confirmVariant="warning"
        onConfirm={() => {
          if (!confirmResume) return;
          startMatch(confirmResume.tournamentId, confirmResume.matchId);
          clearDelayedMatchTimer(confirmResume.matchId);
          setConfirmResume(null);
        }}
        onCancel={() => setConfirmResume(null)}
      />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  Radio,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  UserX,
  Trophy,
  Play,
  SkipForward,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useApp } from "../store/store";
import { formatTime } from "../utils/time";
import { useToast } from "../components/useToast";
import ConfirmDialog from "../components/ConfirmDialog";
import styles from "./LiveControl.module.css";

const SOURCE_TIMEZONE = "America/New_York";

function getTournamentDateTime(dateStr: string, timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const naiveUtc = new Date(
    `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`,
  );
  const sourceLocal = new Date(
    naiveUtc.toLocaleString("en-US", { timeZone: SOURCE_TIMEZONE }),
  );
  const offsetMs = naiveUtc.getTime() - sourceLocal.getTime();
  return new Date(naiveUtc.getTime() + offsetMs);
}

function MatchScore({
  score = 0,
  onChange,
  large = false,
}: {
  score?: number;
  onChange: (value: number) => void;
  large?: boolean;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0) {
      onChange(val);
    } else if (e.target.value === "") {
      onChange(0);
    }
  };

  return (
    <div
      className={`${styles.scoreControl} ${large ? styles.scoreControlLarge : ""}`}
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className={`${styles.scoreInputTypeable} ${large ? styles.scoreInputTypeableLarge : ""}`}
          style={{ width: `${Math.max(1.5, score.toString().length * 1.5)}ch` }}
          value={score}
          onChange={handleInputChange}
        />
      </div>
      <div className={styles.scoreBtns}>
        <button
          className={styles.scoreBtn}
          onClick={() => onChange(score + 1)}
          aria-label="Increase score"
        >
          <ChevronUp size={14} />
        </button>
        <button
          className={styles.scoreBtn}
          onClick={() => onChange(Math.max(0, score - 1))}
          aria-label="Decrease score"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}

export default function LiveControl() {
  const {
    tournaments,
    timePrefs,
    startMatch,
    completeMatch,
    reportNoShow,
    reportDelay,
    delayedMatchTimers,
    setDelayedMatchTimer,
    clearDelayedMatchTimer,
  } = useApp();
  const toast = useToast();
  const tournament = tournaments[0];
  const [expandedSections, setExpandedSections] = useState({
    upcoming: true,
    completed: true,
  });

  const [scoreModal, setScoreModal] = useState<{ matchId: string } | null>(
    null,
  );
  const [noShowModal, setNoShowModal] = useState<{ matchId: string } | null>(
    null,
  );
  const [delayModal, setDelayModal] = useState<{ matchId: string } | null>(
    null,
  );
  const [customDelay, setCustomDelay] = useState("");
  const [confirmDelay, setConfirmDelay] = useState<{
    matchId: string;
    minutes: number;
  } | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [liveScores, setLiveScores] = useState<
    Record<string, { score1: number; score2: number }>
  >({});
  const [now, setNow] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<Record<string, number>>(
    {},
  );
  const [confirmResume, setConfirmResume] = useState<{
    matchId: string;
  } | null>(null);
  const delayedMatchTimersRef = useRef(delayedMatchTimers);

  useEffect(() => {
    delayedMatchTimersRef.current = delayedMatchTimers;
  }, [delayedMatchTimers]);

  // Tick every second to update elapsed counters from store timers
  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      setElapsedSeconds(() => {
        const next: Record<string, number> = {};
        Object.entries(delayedMatchTimersRef.current).forEach(([id, t]) => {
          next[id] = Math.floor((currentNow - t.startAt) / 1000);
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (matchId: string) => {
    const timer = delayedMatchTimers[matchId];
    if (!timer) return "00:00";
    const remaining = Math.max(
      0,
      timer.durationSeconds - (elapsedSeconds[matchId] ?? 0),
    );
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatTimeRemaining = (timeBlockId?: string) => {
    const slot = getSlot(timeBlockId);
    if (!slot) return null;
    const endAt = getTournamentDateTime(slot.date, slot.end).getTime();
    const remaining = Math.max(0, Math.floor((endAt - now) / 1000));
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getP = (id: string | null) =>
    id ? tournament.participants.find((p) => p.id === id) : null;
  const getName = (id: string | null) => getP(id)?.name ?? "TBD";
  const getLoc = (id?: string) => tournament.locations.find((l) => l.id === id);
  const getSlot = (id?: string) =>
    tournament.timeBlocks.find((t) => t.id === id);
  const formatSlotTime = (slot?: { start: string; date: string }) =>
    slot
      ? formatTime(slot.start, slot.date, timePrefs.format, timePrefs.timezone)
      : null;

  const live = tournament.matches.filter((m) => m.status === "live");
  const upcoming = tournament.matches.filter((m) => m.status === "scheduled");
  const delayed = tournament.matches.filter((m) => m.status === "delayed");
  const done = tournament.matches.filter((m) => m.status === "completed");

  const getLiveScores = (
    matchId: string,
    initialScore1 = 0,
    initialScore2 = 0,
  ) => liveScores[matchId] ?? { score1: initialScore1, score2: initialScore2 };

  const updateLiveScore = (
    matchId: string,
    side: "score1" | "score2",
    value: number,
    initialScore1 = 0,
    initialScore2 = 0,
  ) => {
    setLiveScores((current) => {
      const existing = current[matchId] ?? {
        score1: initialScore1,
        score2: initialScore2,
      };
      return {
        ...current,
        [matchId]: {
          ...existing,
          [side]: value,
        },
      };
    });
  };

  const toggleSection = (section: "upcoming" | "completed") => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const openScoreModal = (matchId: string) => {
    const match = tournament.matches.find((x) => x.id === matchId);
    if (!match) return;
    const currentScores = getLiveScores(
      matchId,
      match.score1 ?? 0,
      match.score2 ?? 0,
    );
    setScoreModal({ matchId });
    setScore1(String(currentScores.score1));
    setScore2(String(currentScores.score2));
  };

  if (!tournament)
    return (
      <div className={styles.page}>
        <p style={{ padding: "2rem" }}>No tournaments available.</p>
      </div>
    );

  const handleComplete = () => {
    if (!scoreModal) return;
    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;
    const m = tournament.matches.find((x) => x.id === scoreModal.matchId)!;
    const winnerId =
      s1 === s2 ? null : s1 > s2 ? m.participant1Id : m.participant2Id;
    if (s1 !== s2 && !winnerId) return;
    completeMatch(tournament.id, scoreModal.matchId, winnerId, s1, s2);
    setLiveScores((current) => ({
      ...current,
      [scoreModal.matchId]: { score1: s1, score2: s2 },
    }));
    toast("Score saved");
    setScoreModal(null);
    setScore1("");
    setScore2("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Live Control</h1>
          <p className={styles.sub}>
            Real-time match management · Updates push to all participants
            instantly
          </p>
        </div>
        <div className={styles.liveStatus}>
          <span className={styles.liveDot} />
          {live.length} live · {upcoming.length} queued
        </div>
      </div>

      {/* Live matches */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ color: "var(--red)" }}>
          <Radio
            size={13}
            className="animate-pulse"
            style={{ animationDuration: "2.2s" }}
          />{" "}
          Live Now
        </h2>
        {live.length === 0 && (
          <div className={styles.empty}>No matches live right now.</div>
        )}
        <div className={styles.matchGrid}>
          {live.map((m) => {
            const loc = getLoc(m.locationId);
            const slot = getSlot(m.timeBlockId);
            const currentScores = getLiveScores(
              m.id,
              m.score1 ?? 0,
              m.score2 ?? 0,
            );
            return (
              <div key={m.id} className={styles.liveCard}>
                <div className={styles.liveHeader}>
                  <span className={styles.matchRef}>
                    Match {m.matchNumber} · Round {m.round}
                  </span>
                </div>
                <div className={styles.matchup}>
                  <div className={styles.player}>
                    <span className={styles.playerName}>
                      {getName(m.participant1Id)}
                    </span>
                    <MatchScore
                      score={currentScores.score1}
                      onChange={(value) =>
                        updateLiveScore(
                          m.id,
                          "score1",
                          value,
                          m.score1 ?? 0,
                          m.score2 ?? 0,
                        )
                      }
                    />
                  </div>
                  <span className={styles.vs}>VS</span>
                  <div className={styles.player}>
                    <span className={styles.playerName}>
                      {getName(m.participant2Id)}
                    </span>
                    <MatchScore
                      score={currentScores.score2}
                      onChange={(value) =>
                        updateLiveScore(
                          m.id,
                          "score2",
                          value,
                          m.score1 ?? 0,
                          m.score2 ?? 0,
                        )
                      }
                    />
                  </div>
                </div>
                <div className={styles.matchMeta}>
                  {loc && (
                    <span>
                      <MapPin size={11} />
                      {loc.name}
                    </span>
                  )}
                  {slot && (
                    <span>
                      <Clock size={11} />
                      {formatSlotTime(slot)}
                    </span>
                  )}
                  {slot && (
                    <span>
                      <Clock size={11} />
                      {formatTimeRemaining(m.timeBlockId)} remaining
                    </span>
                  )}
                </div>
                <div className={styles.matchActions}>
                  <button
                    className={styles.noShowBtn}
                    onClick={() => setNoShowModal({ matchId: m.id })}
                  >
                    <UserX size={13} /> No-show
                  </button>
                  <button
                    className={styles.delayBtn}
                    onClick={() => setDelayModal({ matchId: m.id })}
                  >
                    <Clock size={13} /> Delay
                  </button>
                  <button
                    className={styles.completeBtn}
                    onClick={() => openScoreModal(m.id)}
                  >
                    <CheckCircle2 size={13} /> Complete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Delayed */}
      {delayed.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: "var(--amber)" }}>
            <AlertTriangle size={13} /> Delay
          </h2>
          <div className={styles.matchGrid}>
            {delayed.map((m) => {
              return (
                <div key={m.id} className={styles.delayCard}>
                  <div className={styles.delayTop}>
                    <span className={styles.matchRef}>
                      Match {m.matchNumber} · Round {m.round}
                    </span>
                  </div>
                  <p className={styles.delayPlayers}>
                    {getName(m.participant1Id)} vs {getName(m.participant2Id)}
                  </p>
                  {delayedMatchTimers[m.id] !== undefined && (
                    <div className={styles.delayTimer}>
                      <Clock size={11} />
                      {formatCountdown(m.id)} remaining
                    </div>
                  )}
                  {formatTimeRemaining(m.timeBlockId) && (
                    <div className={styles.delayTimer}>
                      <Clock size={11} />
                      {formatTimeRemaining(m.timeBlockId)} remaining in slot
                    </div>
                  )}
                  <div className={styles.matchActions}>
                    <button
                      className={styles.rescheduleBtn}
                      onClick={() => setConfirmResume({ matchId: m.id })}
                    >
                      <SkipForward size={13} /> Resume now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming queue */}
      <section className={styles.section}>
        <button
          className={styles.sectionDropdown}
          type="button"
          onClick={() => toggleSection("upcoming")}
          aria-expanded={expandedSections.upcoming}
        >
          <span className={styles.sectionDropdownLabel}>
            <Clock size={13} /> Upcoming
          </span>
          <span className={styles.sectionDropdownMeta}>
            <span>{upcoming.length}</span>
            <ChevronDown
              size={16}
              className={`${styles.sectionDropdownChevron} ${expandedSections.upcoming ? styles.sectionDropdownChevronOpen : ""}`}
            />
          </span>
        </button>
        {expandedSections.upcoming && (
          <>
            {upcoming.length === 0 && (
              <div className={styles.empty}>No scheduled matches.</div>
            )}
            <div className={styles.queueList}>
              {upcoming.map((m) => {
                const slot = getSlot(m.timeBlockId);
                const loc = getLoc(m.locationId);
                return (
                  <div key={m.id} className={styles.queueRow}>
                    <div className={styles.queueInfo}>
                      <span className={styles.queueRef}>
                        Match {m.matchNumber} · Round {m.round}
                      </span>
                      <span className={styles.queuePlayers}>
                        {getName(m.participant1Id)} vs{" "}
                        {getName(m.participant2Id)}
                      </span>
                    </div>
                    <div className={styles.queueMeta}>
                      {slot && (
                        <span>
                          <Clock size={11} />
                          {slot.label} · {formatSlotTime(slot)}
                        </span>
                      )}
                      {loc ? (
                        <span>
                          <MapPin size={11} />
                          {loc.name}
                        </span>
                      ) : (
                        <span style={{ color: "var(--amber)" }}>
                          <AlertTriangle size={11} />
                          No room
                        </span>
                      )}
                    </div>
                    <button
                      className={styles.startBtn}
                      onClick={() => startMatch(tournament.id, m.id)}
                    >
                      <Play size={12} /> Start
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Completed */}
      <section className={styles.section}>
        <button
          className={styles.sectionDropdown}
          type="button"
          onClick={() => toggleSection("completed")}
          aria-expanded={expandedSections.completed}
        >
          <span className={styles.sectionDropdownLabel}>
            <Trophy size={13} /> Completed
          </span>
          <span className={styles.sectionDropdownMeta}>
            <span>{done.length}</span>
            <ChevronDown
              size={16}
              className={`${styles.sectionDropdownChevron} ${expandedSections.completed ? styles.sectionDropdownChevronOpen : ""}`}
            />
          </span>
        </button>
        {expandedSections.completed && (
          <div className={styles.doneList}>
            {done.map((m) => {
              const isTie = (m.score1 ?? 0) === (m.score2 ?? 0);
              const w = isTie ? "Tie" : getName(m.winnerId);
              return (
                <div key={m.id} className={styles.doneRow}>
                  <span className={styles.doneRef}>
                    Match {m.matchNumber} · Round {m.round}
                  </span>
                  <div className={styles.donePlayers}>
                    <div className={styles.donePlayerBlock}>
                      <span className={styles.donePlayerName}>
                        {getName(m.participant1Id)}
                      </span>
                      <span
                        className={`${styles.doneScoreBox} ${!isTie && (m.score1 ?? 0) > (m.score2 ?? 0) ? styles.doneScoreBoxWinner : ""}`}
                      >
                        {m.score1 ?? 0}
                      </span>
                    </div>
                    <span className={styles.doneScoreDash}>VS</span>
                    <div className={styles.donePlayerBlock}>
                      <span className={styles.donePlayerName}>
                        {getName(m.participant2Id)}
                      </span>
                      <span
                        className={`${styles.doneScoreBox} ${!isTie && (m.score2 ?? 0) > (m.score1 ?? 0) ? styles.doneScoreBoxWinner : ""}`}
                      >
                        {m.score2 ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className={styles.winnerBadge}>
                    <Trophy size={11} />
                    {isTie ? w : `${w} wins`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Complete match modal */}
      {scoreModal &&
        (() => {
          const m = tournament.matches.find(
            (x) => x.id === scoreModal.matchId,
          )!;
          return (
            <div className={styles.overlay} onClick={() => setScoreModal(null)}>
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className={styles.modalTitle}>Record Result</h2>
                <p className={styles.modalSub}>
                  Enter final scores to complete the match.
                </p>
                <div className={styles.scoreEntry}>
                  <div className={styles.scorePlayer}>
                    <p className={styles.scorePlayerName}>
                      {getName(m.participant1Id)}
                    </p>
                    <MatchScore
                      score={parseInt(score1) || 0}
                      onChange={(value) => setScore1(String(value))}
                      large
                    />
                  </div>
                  <span className={styles.scoreDash}>—</span>
                  <div className={styles.scorePlayer}>
                    <p className={styles.scorePlayerName}>
                      {getName(m.participant2Id)}
                    </p>
                    <MatchScore
                      score={parseInt(score2) || 0}
                      onChange={(value) => setScore2(String(value))}
                      large
                    />
                  </div>
                </div>
                {score1 !== "" &&
                  score2 !== "" &&
                  (() => {
                    const s1 = parseInt(score1),
                      s2 = parseInt(score2);
                    return s1 === 0 && s2 === 0 ? (
                      <p className={styles.winnerPreview}>
                        Result:{" "}
                        <strong style={{ color: "var(--text)" }}>
                          Did they both fall asleep?
                        </strong>
                      </p>
                    ) : s1 === s2 ? (
                      <p className={styles.winnerPreview}>
                        Result:{" "}
                        <strong style={{ color: "var(--text)" }}>Tie</strong>
                      </p>
                    ) : (
                      <p className={styles.winnerPreview}>
                        Winner:{" "}
                        <strong style={{ color: "var(--accent)" }}>
                          {s1 > s2
                            ? getName(m.participant1Id)
                            : getName(m.participant2Id)}
                        </strong>
                      </p>
                    );
                  })()}
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setScoreModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmBtn}
                    onClick={handleComplete}
                    disabled={score1 === "" || score2 === ""}
                  >
                    <CheckCircle2 size={14} /> Confirm Result
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* No-show modal */}
      {noShowModal &&
        (() => {
          const m = tournament.matches.find(
            (x) => x.id === noShowModal.matchId,
          )!;
          return (
            <div
              className={styles.overlay}
              onClick={() => setNoShowModal(null)}
            >
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className={styles.modalTitle}>Report No-Show</h2>
                <p className={styles.modalSub}>
                  Select the player who did not appear.
                </p>
                <div className={styles.noShowOptions}>
                  {[m.participant1Id, m.participant2Id]
                    .filter((pid): pid is string => pid !== null)
                    .map((pid) => (
                      <button
                        key={pid}
                        className={styles.noShowOption}
                        onClick={() => {
                          reportNoShow(tournament.id, m.id, pid);
                          setNoShowModal(null);
                        }}
                      >
                        <UserX size={14} /> {getName(pid)}
                      </button>
                    ))}
                </div>
                <p className={styles.autoNote}>
                  ArenaOPS will auto-reschedule and notify all affected
                  participants.
                </p>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setNoShowModal(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })()}

      {/* Delay modal */}
      {delayModal && (
        <div className={styles.overlay} onClick={() => setDelayModal(null)}>
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
                      matchId: delayModal.matchId,
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
              />
              <div className="absolute right-22 inset-y-0.5 flex flex-col justify-between py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      matchId: delayModal.matchId,
                      minutes: val,
                    });
                  }
                }}
              >
                Apply
              </button>
            </div>
            <p className={styles.autoNote}>
              Downstream matches will be automatically adjusted and participants
              notified.
            </p>
            <button
              className={styles.cancelBtn}
              onClick={() => setDelayModal(null)}
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
            tournament.id,
            confirmDelay.matchId,
            confirmDelay.minutes,
          );
          setDelayedMatchTimer(confirmDelay.matchId, {
            startAt: Date.now(),
            durationSeconds: confirmDelay.minutes * 60,
          });
          setConfirmDelay(null);
          setDelayModal(null);
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
          startMatch(tournament.id, confirmResume.matchId);
          clearDelayedMatchTimer(confirmResume.matchId);
          setElapsedSeconds((prev) => {
            const next = { ...prev };
            delete next[confirmResume.matchId];
            return next;
          });
          setConfirmResume(null);
        }}
        onCancel={() => setConfirmResume(null)}
      />
    </div>
  );
}

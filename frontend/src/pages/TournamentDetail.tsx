import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
  Circle,
  XCircle,
  LayoutGrid,
  List,
  GitBranch,
  Upload,
  Share2,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { useApp } from "../store/store";
import type { Match, Participant } from "../types";
import styles from "./TournamentDetail.module.css";
import { formatDate, formatTimeRange } from "../utils/time";
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

const ShareModal = lazy(() => import("../components/ShareModal"));

// ── Constants ─────────────────────────────────────────────────────────────────
const SLOT_UNIT = 188; // height (px) of one R1 bracket slot
const COL_GAP = 44; // horizontal gap between tree columns
const CONN_MID = 22; // COL_GAP / 2 — where the vertical connector sits

type BracketView = "flow" | "tree" | "list";

const INDIVIDUAL_GAMES = new Set([
  "chess",
  "checkers",
  "go",
  "mahjong",
  "poker",
  "uno",
  "tennis",
  "table tennis",
  "smash bros",
  "street fighter 6",
  "fortnite",
  "tekken 8",
]);

const matchStatusStyles: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  completed: {
    color: "var(--text-3)",
    bg: "var(--bg-3)",
    border: "var(--border)",
    label: "Done",
  },
  live: {
    color: "var(--red)",
    bg: "rgba(255,71,87,0.10)",
    border: "rgba(255,71,87,0.45)",
    label: "Live",
  },
  scheduled: {
    color: "var(--blue)",
    bg: "rgba(79,172,254,0.10)",
    border: "rgba(79,172,254,0.35)",
    label: "Scheduled",
  },
  delayed: {
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "rgba(var(--amber-rgb),0.4)",
    label: "Delayed",
  },
  cancelled: {
    color: "var(--text-3)",
    bg: "var(--bg-3)",
    border: "var(--border)",
    label: "Cancelled",
  },
};

function getRoundLabel(round: number, maxRound: number): string {
  if (round === maxRound) return "Grand Final";
  if (round === maxRound - 1) return "Semifinals";
  if (round === maxRound - 2) return "Quarterfinals";
  return `Round ${round}`;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({
  p,
  logo,
  size = 28,
  label,
}: {
  p: Participant | undefined;
  logo?: string;
  size?: number;
  label?: string;
}) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={label ?? p?.name ?? ""}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  const name = label ?? p?.name ?? "?";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue =
    Math.abs([...name].reduce((acc, c) => acc + c.charCodeAt(0) * 3, 0)) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `hsl(${hue}, 35%, 22%)`,
        border: `1px solid hsl(${hue}, 35%, 34%)`,
        color: `hsl(${hue}, 60%, 65%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.36),
        fontWeight: 700,
      }}
    >
      {p ? initials : "?"}
    </div>
  );
}

function getEntryLabel(
  participant: Participant | undefined,
  teamMode: boolean,
) {
  if (!participant) return "TBD";
  if (!teamMode) return participant.name;
  return participant.team?.trim() || participant.name;
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({
  match,
  participants,
  logos,
  compact = false,
  teamMode = false,
  onEntryClick,
  liveScores,
  onUpdateLiveScore,
  onStartMatch,
  onCompleteMatch,
}: {
  match: Match;
  participants: Participant[];
  logos: Record<string, string>;
  compact?: boolean;
  teamMode?: boolean;
  onEntryClick?: (teamName: string) => void;
  liveScores?: { score1: number; score2: number };
  onUpdateLiveScore?: (
    matchId: string,
    side: "score1" | "score2",
    value: number,
    initialScore1: number,
    initialScore2: number,
  ) => void;
  onStartMatch?: (match: Match) => void;
  onCompleteMatch?: (match: Match) => void;
}) {
  const p1 = participants.find((p) => p.id === match.participant1Id);
  const p2 = participants.find((p) => p.id === match.participant2Id);
  const st = matchStatusStyles[match.status];
  const isLive = match.status === "live";
  const showScore =
    match.status !== "scheduled" && match.status !== "cancelled";
  const p1Label = getEntryLabel(p1, teamMode);
  const p2Label = getEntryLabel(p2, teamMode);
  const currentScores = liveScores ?? {
    score1: match.score1 ?? 0,
    score2: match.score2 ?? 0,
  };
  const renderEntryLabel = (
    label: string,
    participant?: Participant,
  ) =>
    teamMode && participant && label !== "TBD" ? (
      <button
        type="button"
        className={styles.participantNameButton}
        onClick={() => onEntryClick?.(label)}
      >
        {label}
      </button>
    ) : (
      <span className={styles.participantName}>{label}</span>
    );

  return (
    <div
      className={`${styles.matchCard} ${compact ? styles.matchCardCompact : ""} ${isLive ? styles.matchLive : ""}`}
    >
      <div className={styles.matchHeader}>
        <span className={styles.matchNum}>Match {match.matchNumber}</span>
        <span
          className={styles.matchStatus}
          style={{ color: st.color, background: st.bg, borderColor: st.border }}
        >
          {isLive && <span className={styles.liveDot} />}
          {st.label}
        </span>
      </div>
      <div className={styles.matchups}>
        <div
          className={`${styles.matchup} ${match.winnerId === p1?.id ? styles.winner : ""}`}
        >
          <Avatar
            p={p1}
            logo={p1?.id ? logos[p1.id] : undefined}
            size={20}
            label={p1Label}
          />
          {renderEntryLabel(p1Label, p1)}
          {match.status === "live" ? (
            <div className={styles.inlineScoreControl}>
              <button
                type="button"
                className={styles.inlineScoreBtn}
                onClick={() =>
                  onUpdateLiveScore?.(
                    match.id,
                    "score1",
                    Math.max(0, currentScores.score1 - 1),
                    match.score1 ?? 0,
                    match.score2 ?? 0,
                  )
                }
                aria-label={`Decrease ${p1Label} score`}
              >
                -
              </button>
              <span className={styles.score}>{currentScores.score1}</span>
              <button
                type="button"
                className={styles.inlineScoreBtn}
                onClick={() =>
                  onUpdateLiveScore?.(
                    match.id,
                    "score1",
                    currentScores.score1 + 1,
                    match.score1 ?? 0,
                    match.score2 ?? 0,
                  )
                }
                aria-label={`Increase ${p1Label} score`}
              >
                +
              </button>
            </div>
          ) : showScore && (
            <span className={styles.score}>{match.score1 ?? 0}</span>
          )}
        </div>
        <div className={styles.vs}>VS</div>
        <div
          className={`${styles.matchup} ${match.winnerId === p2?.id ? styles.winner : ""}`}
        >
          <Avatar
            p={p2}
            logo={p2?.id ? logos[p2.id] : undefined}
            size={20}
            label={p2Label}
          />
          {renderEntryLabel(p2Label, p2)}
          {match.status === "live" ? (
            <div className={styles.inlineScoreControl}>
              <button
                type="button"
                className={styles.inlineScoreBtn}
                onClick={() =>
                  onUpdateLiveScore?.(
                    match.id,
                    "score2",
                    Math.max(0, currentScores.score2 - 1),
                    match.score1 ?? 0,
                    match.score2 ?? 0,
                  )
                }
                aria-label={`Decrease ${p2Label} score`}
              >
                -
              </button>
              <span className={styles.score}>{currentScores.score2}</span>
              <button
                type="button"
                className={styles.inlineScoreBtn}
                onClick={() =>
                  onUpdateLiveScore?.(
                    match.id,
                    "score2",
                    currentScores.score2 + 1,
                    match.score1 ?? 0,
                    match.score2 ?? 0,
                  )
                }
                aria-label={`Increase ${p2Label} score`}
              >
                +
              </button>
            </div>
          ) : showScore && (
            <span className={styles.score}>{match.score2 ?? 0}</span>
          )}
        </div>
      </div>
      {(match.status === "scheduled" || match.status === "live") && (
        <div className={styles.matchCardActions}>
          {match.status === "scheduled" ? (
            <button
              type="button"
              className={styles.matchActionBtn}
              onClick={() => onStartMatch?.(match)}
            >
              Start Match
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.matchActionBtn} ${styles.matchActionBtnPrimary}`}
              onClick={() => onCompleteMatch?.(match)}
            >
              Mark Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared view props ─────────────────────────────────────────────────────────
type ViewProps = {
  rounds: number[];
  matches: Match[];
  participants: Participant[];
  logos: Record<string, string>;
  teamMode?: boolean;
  onEntryClick?: (teamName: string) => void;
  getLiveScores?: (match: Match) => { score1: number; score2: number };
  onUpdateLiveScore?: (
    matchId: string,
    side: "score1" | "score2",
    value: number,
    initialScore1: number,
    initialScore2: number,
  ) => void;
  onStartMatch?: (match: Match) => void;
  onCompleteMatch?: (match: Match) => void;
};

type TeamGroup = {
  name: string;
  members: Participant[];
};

type ChampionInfo = {
  participant: Participant;
  label: string;
  logo?: string;
};

function getChampionInfo(
  matches: Match[],
  participants: Participant[],
  logos: Record<string, string>,
  teamMode: boolean,
): ChampionInfo | null {
  if (matches.length === 0) return null;
  const finalRound = Math.max(...matches.map((match) => match.round));
  const finalMatch = matches
    .filter((match) => match.round === finalRound)
    .sort((a, b) => a.matchNumber - b.matchNumber)[0];

  if (!finalMatch?.winnerId || finalMatch.status !== "completed") return null;
  const winner = participants.find(
    (participant) => participant.id === finalMatch.winnerId,
  );
  if (!winner) return null;

  return {
    participant: winner,
    label: getEntryLabel(winner, teamMode),
    logo: logos[winner.id],
  };
}

function ChampionCard({ champion }: { champion: ChampionInfo }) {
  return (
    <div className={styles.championCard}>
      <span className={styles.championEyebrow}>Winner</span>
      <div className={styles.championBody}>
        <Avatar
          p={champion.participant}
          logo={champion.logo}
          size={32}
          label={champion.label}
        />
        <div className={styles.championInfo}>
          <span className={styles.championTitle}>Champion</span>
          <span className={styles.championName}>{champion.label}</span>
        </div>
      </div>
    </div>
  );
}

// ── Flow View (horizontal columns) ───────────────────────────────────────────
function FlowView({
  rounds,
  matches,
  participants,
  logos,
  teamMode = false,
  onEntryClick,
  getLiveScores,
  onUpdateLiveScore,
  onStartMatch,
  onCompleteMatch,
}: ViewProps) {
  const maxRound = Math.max(...rounds);
  const champion = getChampionInfo(matches, participants, logos, teamMode);
  return (
    <div className={styles.bracket}>
      {rounds.map((round) => (
        <div key={round} className={styles.round}>
          <p className={styles.roundLabel}>{getRoundLabel(round, maxRound)}</p>
          <div className={styles.roundMatches}>
            {matches
              .filter((m) => m.round === round)
              .sort((a, b) => a.matchNumber - b.matchNumber)
              .map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  participants={participants}
                  logos={logos}
                  teamMode={teamMode}
                  onEntryClick={onEntryClick}
                  liveScores={getLiveScores?.(m)}
                  onUpdateLiveScore={onUpdateLiveScore}
                  onStartMatch={onStartMatch}
                  onCompleteMatch={onCompleteMatch}
                />
              ))}
          </div>
        </div>
      ))}
      {champion && (
        <div className={styles.championColumn}>
          <p className={styles.roundLabel}>Winner</p>
          <ChampionCard champion={champion} />
        </div>
      )}
    </div>
  );
}

// ── Tree View (visual bracket with connectors) ────────────────────────────────
function TreeView({
  rounds,
  matches,
  participants,
  logos,
  teamMode = false,
  onEntryClick,
  getLiveScores,
  onUpdateLiveScore,
  onStartMatch,
  onCompleteMatch,
}: ViewProps) {
  const maxRound = Math.max(...rounds);
  const baseRows = Math.pow(2, maxRound - 1);
  const totalTreeHeight = baseRows * SLOT_UNIT;
  const champion = getChampionInfo(matches, participants, logos, teamMode);

  return (
    <div className={styles.treeBracketScroll}>
      <div className={styles.treeBracket}>
        {rounds.map((round, rIdx) => {
          const roundMatches = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.matchNumber - b.matchNumber);
          const spanRows = Math.pow(2, round - 1);
          const roundSlotHeight = spanRows * SLOT_UNIT;
          const connectorHeight = roundSlotHeight / 2;

          return (
            <div key={round} className={styles.treeRound}>
              <p className={styles.roundLabel} style={{ textAlign: "center" }}>
                {getRoundLabel(round, maxRound)}
              </p>
              <div
                className={styles.treeRoundBody}
                style={{
                  height: totalTreeHeight,
                  gridTemplateRows: `repeat(${baseRows}, ${SLOT_UNIT}px)`,
                }}
              >
                {roundMatches.map((match, idx) => (
                  <div
                    key={match.id}
                    className={styles.treeMatchSlot}
                    style={{
                      gridRow: `${idx * spanRows + 1} / span ${spanRows}`,
                    }}
                  >
                    {/* ← Horizontal left connector (from junction to match) */}
                    {rIdx > 0 && (
                      <div
                        className={styles.treeConnectorLeft}
                        style={{ left: -CONN_MID, width: CONN_MID }}
                      />
                    )}

                    <div className={styles.treeMatchCardWrap}>
                      <MatchCard
                        match={match}
                        participants={participants}
                        logos={logos}
                        compact
                        teamMode={teamMode}
                        onEntryClick={onEntryClick}
                        liveScores={getLiveScores?.(match)}
                        onUpdateLiveScore={onUpdateLiveScore}
                        onStartMatch={onStartMatch}
                        onCompleteMatch={onCompleteMatch}
                      />
                    </div>

                    {/* → Right connectors (horizontal exit + half vertical bracket) */}
                    {round < maxRound && (
                      <div
                        className={styles.treeConnectorRight}
                        style={{ right: -COL_GAP, width: COL_GAP }}
                      >
                        {/* Horizontal exit to midpoint */}
                        <div
                          className={styles.treeConnectorExit}
                          style={{ width: CONN_MID }}
                        />
                        {/* Half-vertical bracket: down for even idx, up for odd */}
                        <div
                          className={styles.treeConnectorVertical}
                          style={{
                            left: CONN_MID,
                            top:
                              idx % 2 === 0
                                ? "50%"
                                : `calc(50% - ${connectorHeight}px)`,
                            height: connectorHeight,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {champion && (
          <div className={styles.treeChampionColumn}>
            <p className={styles.roundLabel} style={{ textAlign: "center" }}>
              Winner
            </p>
            <div
              className={styles.treeChampionSlot}
              style={{ height: totalTreeHeight }}
            >
              <div className={styles.treeChampionConnector} />
              <div className={styles.treeChampionCardWrap}>
                <ChampionCard champion={champion} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── List View (tabular match list) ────────────────────────────────────────────
function ListView({
  rounds,
  matches,
  participants,
  logos,
  teamMode = false,
  onEntryClick,
  getLiveScores,
  onUpdateLiveScore,
  onStartMatch,
  onCompleteMatch,
}: ViewProps) {
  const maxRound = Math.max(...rounds);
  const champion = getChampionInfo(matches, participants, logos, teamMode);
  return (
    <div className={styles.listView}>
      {champion && <ChampionCard champion={champion} />}
      {rounds.map((round) => (
        <div key={round}>
          <p className={styles.listRoundLabel}>
            {getRoundLabel(round, maxRound)}
          </p>
          <div className={styles.listMatches}>
            {matches
              .filter((m) => m.round === round)
              .sort((a, b) => a.matchNumber - b.matchNumber)
              .map((match) => {
                const p1 = participants.find(
                  (p) => p.id === match.participant1Id,
                );
                const p2 = participants.find(
                  (p) => p.id === match.participant2Id,
                );
                const st = matchStatusStyles[match.status];
                const showScore =
                  match.status !== "scheduled" && match.status !== "cancelled";
                const p1Label = getEntryLabel(p1, teamMode);
                const p2Label = getEntryLabel(p2, teamMode);
                const currentScores = getLiveScores?.(match) ?? {
                  score1: match.score1 ?? 0,
                  score2: match.score2 ?? 0,
                };
                const renderListLabel = (
                  label: string,
                  participant?: Participant,
                ) =>
                  teamMode && participant && label !== "TBD" ? (
                    <button
                      type="button"
                      className={styles.listNameButton}
                      onClick={() => onEntryClick?.(label)}
                    >
                      {label}
                    </button>
                  ) : (
                    <span className={styles.listName}>{label}</span>
                  );
                return (
                  <div
                    key={match.id}
                    className={`${styles.listMatchRow} ${match.status === "live" ? styles.listMatchLive : ""}`}
                  >
                    <span className={styles.listMatchNum}>
                      Match {match.matchNumber}
                    </span>

                    <div
                      className={`${styles.listParticipant} ${styles.listParticipantTop} ${match.winnerId === p1?.id ? styles.listWinner : ""}`}
                    >
                      <Avatar
                        p={p1}
                        logo={p1?.id ? logos[p1.id] : undefined}
                        size={24}
                        label={p1Label}
                      />
                      {renderListLabel(p1Label, p1)}
                      {match.status === "live" ? (
                        <div className={styles.inlineScoreControl}>
                          <button
                            type="button"
                            className={styles.inlineScoreBtn}
                            onClick={() =>
                              onUpdateLiveScore?.(
                                match.id,
                                "score1",
                                Math.max(0, currentScores.score1 - 1),
                                match.score1 ?? 0,
                                match.score2 ?? 0,
                              )
                            }
                          >
                            -
                          </button>
                          <span className={styles.listScore}>
                            {currentScores.score1}
                          </span>
                          <button
                            type="button"
                            className={styles.inlineScoreBtn}
                            onClick={() =>
                              onUpdateLiveScore?.(
                                match.id,
                                "score1",
                                currentScores.score1 + 1,
                                match.score1 ?? 0,
                                match.score2 ?? 0,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : showScore && (
                        <span className={styles.listScore}>
                          {match.score1 ?? 0}
                        </span>
                      )}
                    </div>

                    <span className={styles.listVs}>VS</span>

                    <div
                      className={`${styles.listParticipant} ${styles.listParticipantBottom} ${match.winnerId === p2?.id ? styles.listWinner : ""}`}
                    >
                      <Avatar
                        p={p2}
                        logo={p2?.id ? logos[p2.id] : undefined}
                        size={24}
                        label={p2Label}
                      />
                      {renderListLabel(p2Label, p2)}
                      {match.status === "live" ? (
                        <div className={styles.inlineScoreControl}>
                          <button
                            type="button"
                            className={styles.inlineScoreBtn}
                            onClick={() =>
                              onUpdateLiveScore?.(
                                match.id,
                                "score2",
                                Math.max(0, currentScores.score2 - 1),
                                match.score1 ?? 0,
                                match.score2 ?? 0,
                              )
                            }
                          >
                            -
                          </button>
                          <span className={styles.listScore}>
                            {currentScores.score2}
                          </span>
                          <button
                            type="button"
                            className={styles.inlineScoreBtn}
                            onClick={() =>
                              onUpdateLiveScore?.(
                                match.id,
                                "score2",
                                currentScores.score2 + 1,
                                match.score1 ?? 0,
                                match.score2 ?? 0,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : showScore && (
                        <span className={styles.listScore}>
                          {match.score2 ?? 0}
                        </span>
                      )}
                    </div>

                    <span
                      className={styles.listStatus}
                      style={{
                        color: st.color,
                        background: st.bg,
                        borderColor: st.border,
                      }}
                    >
                      {match.status === "live" && (
                        <span className={styles.liveDot} />
                      )}
                      {st.label}
                    </span>
                    {(match.status === "scheduled" || match.status === "live") && (
                      <div className={styles.listRowActions}>
                        {match.status === "scheduled" ? (
                          <button
                            type="button"
                            className={styles.matchActionBtn}
                            onClick={() => onStartMatch?.(match)}
                          >
                            Start Match
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.matchActionBtn} ${styles.matchActionBtnPrimary}`}
                            onClick={() => onCompleteMatch?.(match)}
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Participant Row (with logo upload) ────────────────────────────────────────
function ParticipantRow({
  participant,
  logo,
  onLogoUpload,
  teamMode = false,
  memberIndex,
}: {
  participant: Participant;
  logo?: string;
  onLogoUpload: (file: File) => void;
  teamMode?: boolean;
  memberIndex?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onLogoUpload(file);
    e.target.value = "";
  };

  const icon =
    participant.status === "confirmed" ? (
      <CheckCircle2 size={14} style={{ color: "var(--accent)" }} />
    ) : participant.status === "declined" ? (
      <XCircle size={14} style={{ color: "var(--red)" }} />
    ) : (
      <Circle size={14} style={{ color: "var(--text-3)" }} />
    );
  const entryLabel = getEntryLabel(participant, teamMode);
  const secondaryLabel =
    teamMode && participant.team?.trim() ? participant.name : participant.email;

  return (
    <div className={styles.participantRow}>
      {/* Clickable avatar → opens file picker */}
      <button
        className={styles.avatarBtn}
        onClick={() => fileInputRef.current?.click()}
        title={logo ? "Change logo/photo" : "Add logo or photo"}
        type="button"
      >
        <Avatar p={participant} logo={logo} size={36} label={entryLabel} />
        <div className={styles.avatarOverlay}>
          <Upload size={11} />
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {memberIndex != null ? (
        <span className={styles.seed}>{memberIndex}.</span>
      ) : participant.seed != null ? (
        <span className={styles.seed}>#{participant.seed}</span>
      ) : null}
      {icon}

      <div className={styles.participantInfo}>
        <span className={styles.participantName2}>{entryLabel}</span>
        <span className={styles.participantEmail}>{secondaryLabel}</span>
      </div>

      <span className={styles.availBadge}>
        {participant.availability.length} time block
        {participant.availability.length > 1 ? "s" : ""}
      </span>
    </div>
  );
}

function TeamRow({
  team,
  logos,
  expanded,
  onToggle,
  onLogoUpload,
  headerRef,
}: {
  team: TeamGroup;
  logos: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
  onLogoUpload: (participantId: string, file: File) => void;
  headerRef?: (node: HTMLButtonElement | null) => void;
}) {
  const primaryMember = team.members[0];
  const confirmedMembers = team.members.filter(
    (member) => member.status === "confirmed",
  ).length;

  return (
    <div className={styles.teamCard}>
      <button
        ref={headerRef}
        type="button"
        className={styles.teamHeader}
        onClick={onToggle}
      >
        <div className={styles.teamIdentity}>
          <Avatar
            p={primaryMember}
            logo={primaryMember?.id ? logos[primaryMember.id] : undefined}
            size={36}
            label={team.name}
          />
          <div className={styles.teamInfo}>
            <span className={styles.teamName}>{team.name}</span>
            <span className={styles.teamMeta}>
              {team.members.length} member{team.members.length !== 1 ? "s" : ""}{" "}
              · {confirmedMembers} confirmed
            </span>
          </div>
        </div>
        <div className={styles.teamHeaderRight}>
          <ChevronDown
            size={16}
            className={`${styles.teamChevron} ${expanded ? styles.teamChevronOpen : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className={styles.teamMembers}>
          {team.members.map((member, index) => (
            <ParticipantRow
              key={member.id}
              participant={member}
              logo={member.id ? logos[member.id] : undefined}
              onLogoUpload={(file) => onLogoUpload(member.id, file)}
              teamMode={false}
              memberIndex={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type PendingSelection =
  | { kind: "location"; id: string }
  | { kind: "timeBlock"; id: string };

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tournaments,
    settings,
    deleteTournament,
    startMatch,
    completeMatch,
    updateTournament,
    updateTournamentStatus,
  } = useApp();
  const tournament = tournaments.find((t) => t.id === id);

  const [bracketView, setBracketView] = useState<BracketView>(
    settings.bracketPrefs.defaultView,
  );
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [showShare, setShowShare] = useState(false);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmTournamentStatusChange, setConfirmTournamentStatusChange] =
    useState<"draft" | "registration" | "active" | null>(null);
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(
    null,
  );
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [liveScores, setLiveScores] = useState<
    Record<string, { score1: number; score2: number }>
  >({});
  const [confirmStartMatch, setConfirmStartMatch] = useState<Match | null>(null);
  const [confirmCompleteMatch, setConfirmCompleteMatch] = useState<{
    matchId: string;
    score1: number;
    score2: number;
  } | null>(null);
  const bracketViewRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rosterSectionRef = useRef<HTMLElement | null>(null);
  const teamHeaderRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setBracketView(settings.bracketPrefs.defaultView);
  }, [settings.bracketPrefs.defaultView]);

  const handleLogoUpload = (participantId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogos((prev) => ({
          ...prev,
          [participantId]: e.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!tournament) {
    return (
      <div className={styles.notFound}>
        <p>Tournament not found.</p>
        <button onClick={() => navigate("/dashboard")}>Go back</button>
      </div>
    );
  }

  const participants = tournament.participants ?? [];
  const matches = tournament.matches ?? [];
  const timeBlocks = tournament.timeBlocks ?? [];
  const locations = tournament.locations ?? [];
  const selectedVenueLocation =
    locations.find((location) => location.id === tournament.venueLocationId) ?? null;
  const selectedTimeBlock =
    timeBlocks.find((timeBlock) => timeBlock.id === tournament.selectedTimeBlockId) ??
    null;
  const rounds = [...new Set(matches.map((m) => m.round))].sort(
    (a, b) => a - b,
  );
  const confirmedCount = participants.filter(
    (p) => p.status === "confirmed",
  ).length;
  const liveMatches = matches.filter((m) => m.status === "live");
  const isIndividualGame = INDIVIDUAL_GAMES.has(tournament.game.toLowerCase());
  const rosterLabel = isIndividualGame ? "Participants" : "Teams";
  const countLabel = isIndividualGame ? "players" : "teams";
  const teamGroups: TeamGroup[] = !isIndividualGame
    ? participants.reduce<TeamGroup[]>((groups, participant) => {
        const teamName = getEntryLabel(participant, true);
        const existingGroup = groups.find((group) => group.name === teamName);
        if (existingGroup) {
          existingGroup.members.push(participant);
        } else {
          groups.push({ name: teamName, members: [participant] });
        }
        return groups;
      }, [])
    : [];
  const rosterEntryCount = isIndividualGame ? participants.length : teamGroups.length;
  const canOpenRegistration = rosterEntryCount >= 1;
  const canActivateTournament =
    rosterEntryCount >= 2 &&
    Boolean(tournament.venueLocationId) &&
    Boolean(tournament.selectedTimeBlockId);

  const viewButtons: {
    key: BracketView;
    label: string;
    Icon: React.ElementType;
  }[] = [
    { key: "tree", label: "Tree", Icon: GitBranch },
    { key: "flow", label: "Flow", Icon: LayoutGrid },
    { key: "list", label: "List", Icon: List },
  ];

  const handleBracketViewKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const nextIndex =
      e.key === "ArrowRight"
        ? (index + 1) % viewButtons.length
        : (index - 1 + viewButtons.length) % viewButtons.length;
    const nextView = viewButtons[nextIndex];
    setBracketView(nextView.key);
    bracketViewRefs.current[nextIndex]?.focus();
  };

  const handleTeamEntryClick = (teamName: string) => {
    if (isIndividualGame) return;
    setExpandedTeams((prev) =>
      prev.includes(teamName) ? prev : [...prev, teamName],
    );
    rosterSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.setTimeout(() => {
      teamHeaderRefs.current[teamName]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      teamHeaderRefs.current[teamName]?.focus();
    }, 220);
  };

  const getLiveScores = (match: Match) =>
    liveScores[match.id] ?? {
      score1: match.score1 ?? 0,
      score2: match.score2 ?? 0,
    };

  const updateLiveScore = (
    matchId: string,
    side: "score1" | "score2",
    value: number,
    initialScore1: number,
    initialScore2: number,
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

  const openCompleteConfirm = (match: Match) => {
    const scores = getLiveScores(match);
    setConfirmCompleteMatch({
      matchId: match.id,
      score1: scores.score1,
      score2: scores.score2,
    });
  };

  const handleRequestLocationSelection = (locationId: string) => {
    const location = locations.find((item) => item.id === locationId);
    if (!location?.available) return;
    setPendingSelection({ kind: "location", id: locationId });
  };

  const handleRequestTimeBlockSelection = (timeBlockId: string) => {
    const timeBlock = timeBlocks.find((item) => item.id === timeBlockId);
    if (!timeBlock) return;
    setPendingSelection({ kind: "timeBlock", id: timeBlockId });
  };

  const handleConfirmSelection = () => {
    if (!pendingSelection) return;
    if (pendingSelection.kind === "location") {
      const location = locations.find((item) => item.id === pendingSelection.id);
      if (!location?.available) {
        setPendingSelection(null);
        return;
      }
      updateTournament(tournament.id, { venueLocationId: pendingSelection.id });
      toast(`${location.name} selected`);
    } else {
      const timeBlock = timeBlocks.find((item) => item.id === pendingSelection.id);
      if (!timeBlock) {
        setPendingSelection(null);
        return;
      }
      updateTournament(tournament.id, { selectedTimeBlockId: pendingSelection.id });
      toast(`${timeBlock.label} selected`);
    }
    setPendingSelection(null);
  };

  const handleConfirmStatusChange = () => {
    if (!confirmTournamentStatusChange) return;
    if (confirmTournamentStatusChange === "registration" && !canOpenRegistration) {
      toast(`Add at least one ${isIndividualGame ? "player" : "team"} first`);
      return;
    }
    if (confirmTournamentStatusChange === "active" && !canActivateTournament) {
      toast(
        `Add at least two ${isIndividualGame ? "players" : "teams"}, select a time slot, and select a room before activating`,
      );
      return;
    }
    updateTournamentStatus(tournament.id, confirmTournamentStatusChange);
    toast(
      confirmTournamentStatusChange === "registration"
        ? "Tournament opened for registration"
        : confirmTournamentStatusChange === "draft"
          ? "Tournament moved to draft"
          : "Tournament activated",
    );
    setConfirmTournamentStatusChange(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{tournament.name}</h1>
          <p className={styles.sub}>
            {tournament.game} · {tournament.format.replace(/-/g, " ")} · by{" "}
            {tournament.organizerName}
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerMeta}>
            <div className={styles.metaItem}>
              <Users size={14} />
              {confirmedCount}/{tournament.maxParticipants} {countLabel}
            </div>
            <div className={styles.metaItem}>
              <Clock size={14} />
              {formatDate(tournament.startDate)}
            </div>
            {selectedTimeBlock && (
              <div className={styles.metaItem}>
                <Clock size={14} />
                {selectedTimeBlock.label}
              </div>
            )}
            {selectedVenueLocation && (
              <div className={styles.metaItem}>
                <MapPin size={14} />
                {selectedVenueLocation.name}
              </div>
            )}
            {liveMatches.length > 0 && (
              <div className={styles.metaItem} style={{ color: "var(--red)" }}>
                <Zap size={14} />
                {liveMatches.length} match{liveMatches.length > 1 ? "es" : ""}{" "}
                live
              </div>
            )}
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.shareBtn}
              style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete tournament"
            >
              <Trash2 size={15} /> Delete
            </button>
            {tournament.status === "draft" && (
              <button
                className={styles.shareBtn}
                style={{
                  color: "var(--blue)",
                  borderColor: "rgba(79,172,254,0.32)",
                  background: "var(--blue-dim)",
                }}
                disabled={!canOpenRegistration}
                title={
                  canOpenRegistration
                    ? "Open registration now"
                    : `Add at least one ${isIndividualGame ? "player" : "team"} first`
                }
                onClick={() => setConfirmTournamentStatusChange("registration")}
              >
                <Users size={15} /> Register Now
              </button>
            )}
            {tournament.status === "registration" && (
              <button
                className={styles.shareBtn}
                style={{
                  color: "var(--amber)",
                  borderColor: "rgba(var(--amber-rgb),0.34)",
                  background: "var(--amber-dim)",
                }}
                onClick={() => setConfirmTournamentStatusChange("draft")}
              >
                Move to Draft
              </button>
            )}
            {(tournament.status === "draft" ||
              tournament.status === "registration") && (
              <button
                className={styles.shareBtn}
                disabled={!canActivateTournament}
                title={
                  canActivateTournament
                    ? "Activate tournament now"
                    : `Add at least two ${isIndividualGame ? "players" : "teams"}, choose a time slot, and choose a room first`
                }
                onClick={() => setConfirmTournamentStatusChange("active")}
              >
                <Zap size={15} /> Activate Now
              </button>
            )}
            <button
              className={styles.shareBtn}
              onClick={() => setShowShare(true)}
            >
              <Share2 size={15} /> Share
            </button>
          </div>
        </div>
      </div>

      {showShare && (
        <Suspense fallback={null}>
          <ShareModal
            tournament={tournament}
            onClose={() => setShowShare(false)}
          />
        </Suspense>
      )}

      <div className={styles.content}>
        {/* ── Bracket ── */}
        <section className={styles.section}>
          <div className={styles.bracketHeader}>
            <h2 className={styles.sectionTitle}>Bracket</h2>
            {matches.length > 0 && (
              <div className={styles.viewSwitcher}>
                {viewButtons.map(({ key, label, Icon }, index) => (
                  <button
                    ref={(node) => {
                      bracketViewRefs.current[index] = node;
                    }}
                    key={key}
                    className={`${styles.viewBtn} ${bracketView === key ? styles.viewBtnActive : ""}`}
                    onClick={() => setBracketView(key)}
                    onKeyDown={(e) => handleBracketViewKeyDown(e, index)}
                    role="tab"
                    aria-selected={bracketView === key}
                    tabIndex={bracketView === key ? 0 : -1}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {matches.length === 0 ? (
            <div className={styles.empty}>
              No matches yet — bracket will appear once the tournament starts.
            </div>
          ) : bracketView === "flow" ? (
            <FlowView
              rounds={rounds}
              matches={matches}
              participants={participants}
              logos={logos}
              teamMode={!isIndividualGame}
              onEntryClick={handleTeamEntryClick}
              getLiveScores={getLiveScores}
              onUpdateLiveScore={updateLiveScore}
              onStartMatch={setConfirmStartMatch}
              onCompleteMatch={openCompleteConfirm}
            />
          ) : bracketView === "tree" ? (
            <TreeView
              rounds={rounds}
              matches={matches}
              participants={participants}
              logos={logos}
              teamMode={!isIndividualGame}
              onEntryClick={handleTeamEntryClick}
              getLiveScores={getLiveScores}
              onUpdateLiveScore={updateLiveScore}
              onStartMatch={setConfirmStartMatch}
              onCompleteMatch={openCompleteConfirm}
            />
          ) : (
            <ListView
              rounds={rounds}
              matches={matches}
              participants={participants}
              logos={logos}
              teamMode={!isIndividualGame}
              onEntryClick={handleTeamEntryClick}
              getLiveScores={getLiveScores}
              onUpdateLiveScore={updateLiveScore}
              onStartMatch={setConfirmStartMatch}
              onCompleteMatch={openCompleteConfirm}
            />
          )}
        </section>

        {/* ── Roster ── */}
        <section className={styles.section} ref={rosterSectionRef}>
          <div className={styles.bracketHeader}>
            <h2 className={styles.sectionTitle}>{rosterLabel}</h2>
            <span className={styles.logoHint}>
              <Upload size={11} /> Click an avatar to add a logo or photo
            </span>
          </div>
          <div className={styles.participantList}>
            {isIndividualGame
              ? participants.map((p) => (
                  <ParticipantRow
                    key={p.id}
                    participant={p}
                    logo={logos[p.id]}
                    onLogoUpload={(file) => handleLogoUpload(p.id, file)}
                    teamMode={false}
                  />
                ))
              : teamGroups.map((team) => (
                  <TeamRow
                    key={team.name}
                    team={team}
                    logos={logos}
                    expanded={expandedTeams.includes(team.name)}
                    headerRef={(node) => {
                      teamHeaderRefs.current[team.name] = node;
                    }}
                    onToggle={() =>
                      setExpandedTeams((prev) =>
                        prev.includes(team.name)
                          ? prev.filter((name) => name !== team.name)
                          : [...prev, team.name],
                      )
                    }
                    onLogoUpload={handleLogoUpload}
                  />
                ))}
          </div>
        </section>

        {/* ── Locations ── */}
        {timeBlocks.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Time Slots</h2>
            <div className={styles.locationGrid}>
              {timeBlocks.map((timeBlock) => (
                <button
                  type="button"
                  key={timeBlock.id}
                  className={`${styles.locationCard} ${tournament.selectedTimeBlockId === timeBlock.id ? styles.locationSelected : ""}`}
                  onClick={() => handleRequestTimeBlockSelection(timeBlock.id)}
                >
                  <Clock size={14} />
                  <div>
                    <p className={styles.locName}>{timeBlock.label}</p>
                    <p className={styles.locBuilding}>
                      {formatDate(timeBlock.date, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      ·{" "}
                      {formatTimeRange(
                        timeBlock.start,
                        timeBlock.end,
                        timeBlock.date,
                        settings.timePrefs.format,
                        settings.timePrefs.timezone,
                      )}
                    </p>
                  </div>
                  <span className={styles.locStatus} style={{ color: "var(--accent)" }}>
                    {tournament.selectedTimeBlockId === timeBlock.id
                      ? "Selected"
                      : "Available"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {locations.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Locations</h2>
            <div className={styles.locationGrid}>
              {locations.map((l) => (
                <button
                  type="button"
                  key={l.id}
                  className={`${styles.locationCard} ${!l.available ? styles.unavailable : ""} ${tournament.venueLocationId === l.id ? styles.locationSelected : ""}`}
                  disabled={!l.available}
                  onClick={() => handleRequestLocationSelection(l.id)}
                >
                  <MapPin size={14} />
                  <div>
                    <p className={styles.locName}>{l.name}</p>
                    <p className={styles.locBuilding}>
                      {l.building} · Cap. {l.capacity}
                    </p>
                  </div>
                  <span
                    className={styles.locStatus}
                    style={{
                      color: l.available ? "var(--accent)" : "var(--red)",
                    }}
                  >
                    {l.available
                      ? tournament.venueLocationId === l.id
                        ? "Selected"
                        : "Available"
                      : "Booked"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      <ConfirmDialog
        open={confirmStartMatch !== null}
        title="Start match?"
        description="This will move the scheduled match into live status."
        confirmLabel="Start Match"
        confirmVariant="success"
        onConfirm={() => {
          if (!confirmStartMatch) return;
          startMatch(tournament.id, confirmStartMatch.id);
          toast("Match started");
          setConfirmStartMatch(null);
        }}
        onCancel={() => setConfirmStartMatch(null)}
      />
      <ConfirmDialog
        open={confirmCompleteMatch !== null}
        title="Mark match as done?"
        description={`This will complete the live match with a score of ${confirmCompleteMatch?.score1 ?? 0}-${confirmCompleteMatch?.score2 ?? 0}.`}
        confirmLabel="Mark Done"
        onConfirm={() => {
          if (!confirmCompleteMatch) return;
          const match = matches.find((item) => item.id === confirmCompleteMatch.matchId);
          if (!match) return;
          const winnerId =
            confirmCompleteMatch.score1 === confirmCompleteMatch.score2
              ? null
              : confirmCompleteMatch.score1 > confirmCompleteMatch.score2
                ? match.participant1Id
                : match.participant2Id;
          completeMatch(
            tournament.id,
            confirmCompleteMatch.matchId,
            winnerId,
            confirmCompleteMatch.score1,
            confirmCompleteMatch.score2,
          );
          toast("Match marked done");
          setConfirmCompleteMatch(null);
        }}
        onCancel={() => setConfirmCompleteMatch(null)}
      />
      <ConfirmDialog
        open={pendingSelection !== null}
        title={
          pendingSelection?.kind === "location"
            ? "Select location?"
            : "Select time slot?"
        }
        description={
          pendingSelection?.kind === "location"
            ? "This will set the tournament's selected room."
            : "This will set the tournament's selected time slot."
        }
        confirmLabel="Apply"
        confirmVariant="success"
        onConfirm={handleConfirmSelection}
        onCancel={() => setPendingSelection(null)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete tournament?"
        description="This cannot be undone. All match data will be lost."
        confirmLabel="Delete"
        onConfirm={() => {
          deleteTournament(tournament.id);
          toast('Tournament deleted');
          navigate('/dashboard');
        }}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={confirmTournamentStatusChange !== null}
        title={
          confirmTournamentStatusChange === "registration"
            ? "Open registration?"
            : confirmTournamentStatusChange === "draft"
              ? "Move to draft?"
              : "Activate tournament?"
        }
        description={
          confirmTournamentStatusChange === "registration"
            ? "This will make the tournament available for registration."
            : confirmTournamentStatusChange === "draft"
              ? "This will move the tournament back to draft."
              : "This will activate the tournament and allow matches to start."
        }
        confirmLabel={
          confirmTournamentStatusChange === "registration"
            ? "Register Now"
            : confirmTournamentStatusChange === "draft"
              ? "Move to Draft"
              : "Activate Now"
        }
        confirmVariant={
          confirmTournamentStatusChange === "registration"
            ? "success"
            : confirmTournamentStatusChange === "draft"
              ? "warning"
              : "success"
        }
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmTournamentStatusChange(null)}
      />
    </div>
  );
}

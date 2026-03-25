import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  Zap,
  Radio,
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
  Plus,
  ThumbsUp,
} from "lucide-react";
import { useApp } from "../store/store";
import type { Match, Participant, TournamentFormat } from "../types";
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
type MatchSlotSide = "participant1Id" | "participant2Id";
type AssignableEntry = {
  id: string;
  label: string;
  secondaryLabel: string;
};
type EntrySeed = {
  participantId: string;
  sortSeed: number;
};
type RosterRemoveTarget = {
  ids: string[];
  name: string;
  kind: "player" | "team";
};

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

function getRoundLabel(
  round: number,
  maxRound: number,
  format: TournamentFormat,
): string {
  if (format === "round-robin") return "Round Robin";
  if (format === "swiss") return `Swiss Round ${round}`;
  if (
    format === "free-for-all" ||
    format === "group-stage" ||
    format === "battle-royale" ||
    format === "ladder"
  ) {
    return `Round ${round}`;
  }
  if (round === maxRound) return "Grand Final";
  if (round === maxRound - 1) return "Semifinals";
  if (round === maxRound - 2) return "Quarterfinals";
  return `Round ${round}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shuffleEntries<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function buildGeneratedMatches(
  format: TournamentFormat,
  entryIds: EntrySeed[],
): Match[] {
  const randomizedEntryIds = shuffleEntries(
    [...entryIds]
      .sort((a, b) => a.sortSeed - b.sortSeed)
      .map((entry) => entry.participantId),
  );

  if (format === "round-robin") {
    const matches: Match[] = [];
    let matchNumber = 1;
    for (let i = 0; i < randomizedEntryIds.length; i += 1) {
      for (let j = i + 1; j < randomizedEntryIds.length; j += 1) {
        matches.push({
          id: `m-${Date.now()}-${matchNumber}`,
          round: 1,
          matchNumber,
          participant1Id: randomizedEntryIds[i],
          participant2Id: randomizedEntryIds[j],
          winnerId: null,
          score1: 0,
          score2: 0,
          status: "scheduled",
        });
        matchNumber += 1;
      }
    }
    return matches;
  }

  const totalSlots = 2 ** Math.ceil(Math.log2(Math.max(2, randomizedEntryIds.length)));
  const rounds = Math.log2(totalSlots);
  const matches: Match[] = [];
  let matchNumber = 1;

  for (let round = 1; round <= rounds; round += 1) {
    const matchCount = totalSlots / 2 ** round;
    for (let index = 0; index < matchCount; index += 1) {
      const isFirstRound = round === 1;
      matches.push({
        id: `m-${Date.now()}-${matchNumber}`,
        round,
        matchNumber: index + 1,
        participant1Id: isFirstRound ? randomizedEntryIds[index * 2] ?? null : null,
        participant2Id: isFirstRound ? randomizedEntryIds[index * 2 + 1] ?? null : null,
        winnerId: null,
        score1: 0,
        score2: 0,
        status: "scheduled",
      });
      matchNumber += 1;
    }
  }

  return matches;
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
        background: p ? `hsl(${hue}, 35%, 22%)` : "transparent",
        border: p ? `1px solid hsl(${hue}, 35%, 34%)` : "none",
        color: p ? `hsl(${hue}, 60%, 65%)` : "var(--text-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.36),
        fontWeight: 700,
      }}
    >
      {p ? initials : <ThumbsUp size={Math.round(size * 0.46)} strokeWidth={2.2} />}
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
  onAssignEntry,
  canStartMatches = true,
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
  onAssignEntry?: (match: Match, side: MatchSlotSide) => void;
  canStartMatches?: boolean;
}) {
  const p1 = participants.find((p) => p.id === match.participant1Id);
  const p2 = participants.find((p) => p.id === match.participant2Id);
  const st = matchStatusStyles[match.status];
  const isLive = match.status === "live";
  const showScore =
    match.status !== "scheduled" && match.status !== "cancelled";
  const canStartMatch =
    match.participant1Id !== null && match.participant2Id !== null;
  const p1Label = getEntryLabel(p1, teamMode);
  const p2Label = getEntryLabel(p2, teamMode);
  const currentScores = liveScores ?? {
    score1: match.score1 ?? 0,
    score2: match.score2 ?? 0,
  };
  const renderEntryLabel = (
    label: string,
    side: MatchSlotSide,
    participant?: Participant,
  ) =>
    label === "TBD" && match.round === 1 ? (
      <button
        type="button"
        className={styles.addEntryBtn}
        onClick={() => onAssignEntry?.(match, side)}
      >
        Add {teamMode ? "Team" : "Player"}
      </button>
    ) : label === "TBD" ? (
      <span className={styles.participantName}>TBD</span>
    ) : teamMode && participant ? (
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
          {renderEntryLabel(p1Label, "participant1Id", p1)}
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
          {renderEntryLabel(p2Label, "participant2Id", p2)}
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
          {match.status === "scheduled" && canStartMatches ? (
            <button
              type="button"
              className={styles.matchActionBtn}
              disabled={!canStartMatch}
              onClick={() => onStartMatch?.(match)}
              title={
                canStartMatch
                  ? "Start match"
                  : `Add both ${teamMode ? "teams" : "players"} before starting`
              }
            >
              Start Match
            </button>
          ) : match.status === "live" ? (
            <button
              type="button"
              className={`${styles.matchActionBtn} ${styles.matchActionBtnPrimary}`}
              onClick={() => onCompleteMatch?.(match)}
            >
              Mark Done
            </button>
          ) : null}
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
  format: TournamentFormat;
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
  onAssignEntry?: (match: Match, side: MatchSlotSide) => void;
  canStartMatches?: boolean;
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
  format,
  teamMode = false,
  onEntryClick,
  getLiveScores,
  onUpdateLiveScore,
  onStartMatch,
  onCompleteMatch,
  onAssignEntry,
  canStartMatches = true,
}: ViewProps) {
  const maxRound = Math.max(...rounds);
  const champion = getChampionInfo(matches, participants, logos, teamMode);
  return (
    <div className={styles.bracket}>
      {rounds.map((round) => (
        <div key={round} className={styles.round}>
          <p className={styles.roundLabel}>{getRoundLabel(round, maxRound, format)}</p>
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
                  onAssignEntry={onAssignEntry}
                  canStartMatches={canStartMatches}
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
  format,
  teamMode = false,
  onEntryClick,
  getLiveScores,
  onUpdateLiveScore,
  onStartMatch,
  onCompleteMatch,
  onAssignEntry,
  canStartMatches = true,
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
                {getRoundLabel(round, maxRound, format)}
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
                        onAssignEntry={onAssignEntry}
                        canStartMatches={canStartMatches}
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
  format,
  teamMode = false,
  onEntryClick,
  getLiveScores,
  onUpdateLiveScore,
  onStartMatch,
  onCompleteMatch,
  onAssignEntry,
  canStartMatches = true,
}: ViewProps) {
  const maxRound = Math.max(...rounds);
  const champion = getChampionInfo(matches, participants, logos, teamMode);
  return (
    <div className={styles.listView}>
      {champion && <ChampionCard champion={champion} />}
      {rounds.map((round) => (
        <div key={round}>
          <p className={styles.listRoundLabel}>
            {getRoundLabel(round, maxRound, format)}
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
                const canStartMatch =
                  match.participant1Id !== null && match.participant2Id !== null;
                const p1Label = getEntryLabel(p1, teamMode);
                const p2Label = getEntryLabel(p2, teamMode);
                const currentScores = getLiveScores?.(match) ?? {
                  score1: match.score1 ?? 0,
                  score2: match.score2 ?? 0,
                };
                const renderListLabel = (
                  label: string,
                  side: MatchSlotSide,
                  participant?: Participant,
                ) =>
                  label === "TBD" && match.round === 1 ? (
                    <button
                      type="button"
                      className={styles.addEntryBtn}
                      onClick={() => onAssignEntry?.(match, side)}
                    >
                      Add {teamMode ? "Team" : "Player"}
                    </button>
                  ) : label === "TBD" ? (
                    <span className={styles.listName}>TBD</span>
                  ) : teamMode && participant ? (
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
                      {renderListLabel(p1Label, "participant1Id", p1)}
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
                      {renderListLabel(p2Label, "participant2Id", p2)}
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
                        {match.status === "scheduled" && canStartMatches ? (
                          <button
                            type="button"
                            className={styles.matchActionBtn}
                            disabled={!canStartMatch}
                            onClick={() => onStartMatch?.(match)}
                          >
                            Start Match
                          </button>
                        ) : match.status === "live" ? (
                          <button
                            type="button"
                            className={`${styles.matchActionBtn} ${styles.matchActionBtnPrimary}`}
                            onClick={() => onCompleteMatch?.(match)}
                          >
                            Mark Done
                          </button>
                        ) : null}
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
  onRemove,
}: {
  participant: Participant;
  logo?: string;
  onLogoUpload: (file: File) => void;
  teamMode?: boolean;
  memberIndex?: number;
  onRemove?: () => void;
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
      {onRemove && (
        <button type="button" className={styles.removeRosterBtn} onClick={onRemove}>
          <Trash2 size={13} /> Remove Player
        </button>
      )}
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
  onRemoveTeam,
  onAddMember,
  onRemoveMember,
}: {
  team: TeamGroup;
  logos: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
  onLogoUpload: (participantId: string, file: File) => void;
  headerRef?: (node: HTMLButtonElement | null) => void;
  onRemoveTeam?: () => void;
  onAddMember?: () => void;
  onRemoveMember?: (member: Participant) => void;
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
          <div className={styles.teamMembersHeader}>
            {onAddMember && (
              <button type="button" className={styles.addRosterBtn} onClick={onAddMember}>
                <Plus size={13} /> Add Player
              </button>
            )}
            {onRemoveTeam && (
              <button type="button" className={styles.removeRosterBtn} onClick={onRemoveTeam}>
                <Trash2 size={13} /> Remove Team
              </button>
            )}
          </div>
          {team.members.map((member, index) => (
            <ParticipantRow
              key={member.id}
              participant={member}
              logo={member.id ? logos[member.id] : undefined}
              onLogoUpload={(file) => onLogoUpload(member.id, file)}
              teamMode={false}
              memberIndex={index + 1}
              onRemove={onRemoveMember ? () => onRemoveMember(member) : undefined}
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
type AddRosterTarget = "player" | "team";

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
    updateMatch,
    addParticipants,
    removeParticipants,
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
  const [confirmGenerateBracket, setConfirmGenerateBracket] = useState(false);
  const [assignEntryTarget, setAssignEntryTarget] = useState<{
    matchId: string;
    side: MatchSlotSide;
  } | null>(null);
  const [selectedAssignEntryId, setSelectedAssignEntryId] = useState<string | null>(
    null,
  );
  const [showAddRosterModal, setShowAddRosterModal] = useState(false);
  const [addRosterTarget, setAddRosterTarget] = useState<AddRosterTarget>("player");
  const [addMemberTeamName, setAddMemberTeamName] = useState<string | null>(null);
  const [selectedExistingRosterId, setSelectedExistingRosterId] = useState<string | null>(
    null,
  );
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerEmail, setNewPlayerEmail] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newCaptainName, setNewCaptainName] = useState("");
  const [newCaptainEmail, setNewCaptainEmail] = useState("");
  const [newTeamMemberCount, setNewTeamMemberCount] = useState("1");
  const [confirmRemoveRoster, setConfirmRemoveRoster] =
    useState<RosterRemoveTarget | null>(null);
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
  const rosterCapacityReached = rosterEntryCount >= tournament.maxParticipants;
  const canOpenRegistration = rosterEntryCount >= 1;
  const canActivateTournament =
    rosterEntryCount >= 2 &&
    Boolean(tournament.venueLocationId) &&
    Boolean(tournament.selectedTimeBlockId);
  const canGenerateBracket = matches.length === 0 && rosterEntryCount >= 2;
  const getActivateNowRequirementMessage = () => {
    const missing: string[] = [];
    if (rosterEntryCount < 2) {
      missing.push(`add at least two ${isIndividualGame ? "players" : "teams"}`);
    }
    if (!tournament.selectedTimeBlockId) {
      missing.push("select a time slot");
    }
    if (!tournament.venueLocationId) {
      missing.push("select a room");
    }
    if (missing.length === 0) {
      return "Activate tournament now";
    }
    return `Before activating, ${missing.join(", and ")}.`;
  };

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

  const bracketEntries: EntrySeed[] = isIndividualGame
    ? participants.map((participant, index) => ({
        participantId: participant.id,
        sortSeed: participant.seed ?? index + 1,
      }))
    : teamGroups.map((team, index) => ({
        participantId: team.members[0]?.id ?? `team-${index}`,
        sortSeed:
          Math.min(
            ...team.members.map((member, memberIndex) => member.seed ?? index + memberIndex + 1),
          ) || index + 1,
      }));

  const assignableEntries: AssignableEntry[] = isIndividualGame
    ? participants.map((participant) => ({
        id: participant.id,
        label: participant.name,
        secondaryLabel: participant.email,
      }))
    : teamGroups.map((team) => ({
        id: team.members[0]?.id ?? team.name,
        label: team.name,
        secondaryLabel: `${team.members.length} member${team.members.length === 1 ? "" : "s"}`,
      }));

  const assignTargetMatch = assignEntryTarget
    ? matches.find((match) => match.id === assignEntryTarget.matchId) ?? null
    : null;

  const availableEntries = assignTargetMatch
    ? assignableEntries.filter((entry) => {
        const otherSideId =
          assignEntryTarget?.side === "participant1Id"
            ? assignTargetMatch.participant2Id
            : assignTargetMatch.participant1Id;
        return entry.id !== otherSideId;
      })
    : [];

  const existingPlayerOptions = tournaments
    .flatMap((otherTournament) =>
      otherTournament.id === tournament.id ? [] : otherTournament.participants,
    )
    .filter(
      (participant, index, list) =>
        list.findIndex((entry) => entry.email === participant.email) === index,
    )
    .filter((participant) =>
      addMemberTeamName
        ? !participants.some((entry) => entry.email === participant.email)
        : true,
    )
    .map((participant) => ({
      id: participant.email,
      label: participant.name,
      secondaryLabel: participant.team
        ? `${participant.team} • ${participant.email}`
        : participant.email,
      participant,
    }));

  const existingTeamOptions = tournaments
    .flatMap((otherTournament) => {
      if (otherTournament.id === tournament.id) return [];
      const groups = otherTournament.participants.reduce<
        Array<{ name: string; members: Participant[] }>
      >((acc, participant) => {
        if (!participant.team) return acc;
        const existingGroup = acc.find((group) => group.name === participant.team);
        if (existingGroup) {
          existingGroup.members.push(participant);
        } else {
          acc.push({ name: participant.team, members: [participant] });
        }
        return acc;
      }, []);
      return groups.map((group) => ({
        id: group.name,
        label: group.name,
        secondaryLabel: `${group.members.length} member${group.members.length === 1 ? "" : "s"}`,
        members: group.members,
      }));
    })
    .filter(
      (team, index, list) => list.findIndex((entry) => entry.label === team.label) === index,
    )
    .filter((team) => !teamGroups.some((group) => group.name === team.label));

  const canApplyManualPlayer =
    Boolean(newPlayerName.trim()) && Boolean(newPlayerEmail.trim());
  const canApplyManualTeam =
    Boolean(newTeamName.trim()) &&
    Boolean(newCaptainName.trim()) &&
    Boolean(newCaptainEmail.trim());
  const canApplyAddRoster = selectedExistingRosterId
    ? true
    : isIndividualGame || addRosterTarget === "player" || addMemberTeamName
      ? canApplyManualPlayer
      : canApplyManualTeam;

  const resetRosterForm = () => {
    setSelectedExistingRosterId(null);
    setNewPlayerName("");
    setNewPlayerEmail("");
    setNewTeamName("");
    setNewCaptainName("");
    setNewCaptainEmail("");
    setNewTeamMemberCount("1");
  };

  const openAddRoster = (target: AddRosterTarget, teamName?: string) => {
    resetRosterForm();
    setAddRosterTarget(target);
    setAddMemberTeamName(teamName ?? null);
    setShowAddRosterModal(true);
  };

  const handleGenerateBracket = () => {
    if (!canGenerateBracket) {
      toast(`Add at least two ${isIndividualGame ? "players" : "teams"} before generating a bracket`);
      setConfirmGenerateBracket(false);
      return;
    }
    updateTournament(tournament.id, {
      matches: buildGeneratedMatches(tournament.format, bracketEntries),
    });
    toast("Bracket generated");
    setConfirmGenerateBracket(false);
  };

  const openAssignEntryPicker = (match: Match, side: MatchSlotSide) => {
    if (match.round !== 1) return;
    setSelectedAssignEntryId(null);
    setAssignEntryTarget({ matchId: match.id, side });
  };

  const handleAssignEntry = () => {
    if (!assignEntryTarget || !selectedAssignEntryId) return;
    updateMatch(tournament.id, assignEntryTarget.matchId, {
      [assignEntryTarget.side]: selectedAssignEntryId,
      winnerId: null,
    });
    const assignedEntry = assignableEntries.find((entry) => entry.id === selectedAssignEntryId);
    toast(`${assignedEntry?.label ?? (isIndividualGame ? "Player" : "Team")} added to bracket`);
    setAssignEntryTarget(null);
    setSelectedAssignEntryId(null);
  };

  const openStartMatchConfirm = (match: Match) => {
    if (tournament.status !== "active") {
      toast("Tournament must be active before matches can start");
      return;
    }
    if (!match.participant1Id || !match.participant2Id) {
      toast(`Add both ${isIndividualGame ? "players" : "teams"} before starting the match`);
      return;
    }
    setConfirmStartMatch(match);
  };

  const handleAddRoster = () => {
    const timestamp = Date.now();
    if (isIndividualGame || addRosterTarget === "player" || addMemberTeamName) {
      if (selectedExistingRosterId) {
        const selectedPlayer = existingPlayerOptions.find(
          (option) => option.id === selectedExistingRosterId,
        )?.participant;
        if (!selectedPlayer) return;
        addParticipants(tournament.id, [
          {
            ...selectedPlayer,
            id: `p${timestamp}`,
            team: addMemberTeamName ?? selectedPlayer.team,
          },
        ]);
        toast(addMemberTeamName ? "Existing player added to team" : "Existing player added");
      } else {
        if (!newPlayerName.trim() || !newPlayerEmail.trim()) return;
        addParticipants(tournament.id, [
          {
            id: `p${timestamp}`,
            name: newPlayerName.trim(),
            email: newPlayerEmail.trim(),
            team: addMemberTeamName ?? undefined,
            status: "confirmed",
            availability: [],
          },
        ]);
        toast(addMemberTeamName ? "Player added to team" : "Player added");
      }
    } else {
      if (selectedExistingRosterId) {
        const selectedTeam = existingTeamOptions.find(
          (option) => option.id === selectedExistingRosterId,
        );
        if (!selectedTeam) return;
        addParticipants(
          tournament.id,
          selectedTeam.members.map((member, index) => ({
            ...member,
            id: `p${timestamp}-${index + 1}`,
            team: selectedTeam.label,
          })),
        );
        toast("Existing team added");
      } else {
        if (!newTeamName.trim() || !newCaptainName.trim() || !newCaptainEmail.trim()) {
          return;
        }
        const teamName = newTeamName.trim();
        const teamSlug = slugify(teamName) || `team-${timestamp}`;
        const memberCount = Math.max(1, Number(newTeamMemberCount) || 1);
        addParticipants(
          tournament.id,
          Array.from({ length: memberCount }, (_, index) => ({
            id: `p${timestamp}-${index + 1}`,
            name: index === 0 ? newCaptainName.trim() : `${teamName} Player ${index + 1}`,
            email:
              index === 0
                ? newCaptainEmail.trim()
                : `${teamSlug}-${index + 1}@team.local`,
            team: teamName,
            status: "confirmed",
            availability: [],
          })),
        );
        toast("Team added");
      }
    }
    setShowAddRosterModal(false);
    setAddMemberTeamName(null);
    resetRosterForm();
  };

  const handleRemoveRoster = () => {
    if (!confirmRemoveRoster) return;
    removeParticipants(tournament.id, confirmRemoveRoster.ids);
    toast(confirmRemoveRoster.kind === "team" ? "Team removed" : "Player removed");
    setConfirmRemoveRoster(null);
  };

  const hasRoomConflictInTimeBlock = (locationId: string, timeBlockId: string) =>
    matches.some(
      (match) =>
        match.locationId === locationId &&
        match.timeBlockId === timeBlockId &&
        match.status !== "completed" &&
        match.status !== "cancelled",
    );

  const getAvailableRoomCountForTimeBlock = (timeBlockId: string) =>
    locations.filter(
      (location) =>
        location.available &&
        !hasRoomConflictInTimeBlock(location.id, timeBlockId),
    ).length;

  const isTimeBlockSelectable = (timeBlockId: string) => {
    if (selectedVenueLocation) {
      return (
        selectedVenueLocation.available &&
        !hasRoomConflictInTimeBlock(selectedVenueLocation.id, timeBlockId)
      );
    }
    return getAvailableRoomCountForTimeBlock(timeBlockId) > 0;
  };

  const isLocationSelectable = (locationId: string) => {
    const location = locations.find((item) => item.id === locationId);
    if (!location?.available) return false;
    if (!selectedTimeBlock) return true;
    return !hasRoomConflictInTimeBlock(locationId, selectedTimeBlock.id);
  };

  const handleRequestLocationSelection = (locationId: string) => {
    if (!isLocationSelectable(locationId)) return;
    setPendingSelection({ kind: "location", id: locationId });
  };

  const handleRequestTimeBlockSelection = (timeBlockId: string) => {
    if (!isTimeBlockSelectable(timeBlockId)) return;
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
      toast(getActivateNowRequirementMessage());
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

  const handleActivateNow = () => {
    if (!canActivateTournament) {
      toast(getActivateNowRequirementMessage());
      return;
    }
    setConfirmTournamentStatusChange("active");
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
                <Radio size={14} />
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
                style={
                  canActivateTournament
                    ? undefined
                    : {
                        color: "var(--text-3)",
                        borderColor: "var(--border)",
                        background: "var(--bg-3)",
                      }
                }
                title={getActivateNowRequirementMessage()}
                onClick={handleActivateNow}
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
            <div className={styles.bracketHeaderActions}>
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
              {matches.length === 0 && (
                <button
                  type="button"
                  className={styles.addRosterBtn}
                  disabled={!canGenerateBracket}
                  onClick={() => setConfirmGenerateBracket(true)}
                  title={
                    canGenerateBracket
                      ? "Generate bracket"
                      : `Add at least two ${isIndividualGame ? "players" : "teams"} first`
                  }
                >
                  <GitBranch size={13} /> Generate Bracket
                </button>
              )}
            </div>
          </div>

          {matches.length === 0 ? (
            <div className={styles.empty}>
              No matches yet. Generate the bracket when the roster is ready.
            </div>
          ) : bracketView === "flow" ? (
            <FlowView
              rounds={rounds}
              matches={matches}
              participants={participants}
              logos={logos}
              format={tournament.format}
              teamMode={!isIndividualGame}
              onEntryClick={handleTeamEntryClick}
              getLiveScores={getLiveScores}
              onUpdateLiveScore={updateLiveScore}
              onStartMatch={openStartMatchConfirm}
              onCompleteMatch={openCompleteConfirm}
              onAssignEntry={openAssignEntryPicker}
              canStartMatches={tournament.status === "active"}
            />
          ) : bracketView === "tree" ? (
            <TreeView
              rounds={rounds}
              matches={matches}
              participants={participants}
              logos={logos}
              format={tournament.format}
              teamMode={!isIndividualGame}
              onEntryClick={handleTeamEntryClick}
              getLiveScores={getLiveScores}
              onUpdateLiveScore={updateLiveScore}
              onStartMatch={openStartMatchConfirm}
              onCompleteMatch={openCompleteConfirm}
              onAssignEntry={openAssignEntryPicker}
              canStartMatches={tournament.status === "active"}
            />
          ) : (
            <ListView
              rounds={rounds}
              matches={matches}
              participants={participants}
              logos={logos}
              format={tournament.format}
              teamMode={!isIndividualGame}
              onEntryClick={handleTeamEntryClick}
              getLiveScores={getLiveScores}
              onUpdateLiveScore={updateLiveScore}
              onStartMatch={openStartMatchConfirm}
              onCompleteMatch={openCompleteConfirm}
              onAssignEntry={openAssignEntryPicker}
              canStartMatches={tournament.status === "active"}
            />
          )}
        </section>

        {/* ── Roster ── */}
        <section className={styles.section} ref={rosterSectionRef}>
          <div className={styles.bracketHeader}>
            <h2 className={styles.sectionTitle}>{rosterLabel}</h2>
            <div className={styles.rosterHeaderActions}>
              <span className={styles.logoHint}>
                <Upload size={11} /> Click an avatar to add a logo or photo
              </span>
              <button
                type="button"
                className={styles.addRosterBtn}
                disabled={rosterCapacityReached}
                onClick={() => openAddRoster(isIndividualGame ? "player" : "team")}
                title={
                  rosterCapacityReached
                    ? `${tournament.maxParticipants} ${countLabel} reached`
                    : `Add ${isIndividualGame ? "player" : "team"}`
                }
              >
                <Plus size={13} /> Add {isIndividualGame ? "Player" : "Team"}
              </button>
            </div>
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
                    onRemove={() =>
                      setConfirmRemoveRoster({
                        ids: [p.id],
                        name: p.name,
                        kind: "player",
                      })
                    }
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
                    onRemoveTeam={() =>
                      setConfirmRemoveRoster({
                        ids: team.members.map((member) => member.id),
                        name: team.name,
                        kind: "team",
                      })
                    }
                    onAddMember={() => openAddRoster("player", team.name)}
                    onRemoveMember={(member) =>
                      setConfirmRemoveRoster({
                        ids: [member.id],
                        name: member.name,
                        kind: "player",
                      })
                    }
                  />
                ))}
          </div>
        </section>

        {/* ── Locations ── */}
        {timeBlocks.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Time Slots</h2>
            <div className={styles.locationGrid}>
              {timeBlocks.map((timeBlock) => {
                const availableRoomCount = getAvailableRoomCountForTimeBlock(timeBlock.id);
                const selectable = isTimeBlockSelectable(timeBlock.id);
                const isSelected = tournament.selectedTimeBlockId === timeBlock.id;
                return (
                  <button
                    type="button"
                    key={timeBlock.id}
                    className={`${styles.locationCard} ${!selectable && !isSelected ? styles.unavailable : ""} ${isSelected ? styles.locationSelected : ""}`}
                    disabled={!selectable && !isSelected}
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
                    <span
                      className={styles.locStatus}
                      style={{
                        color: isSelected
                          ? "var(--accent)"
                          : selectable
                            ? "var(--text-2)"
                            : "var(--red)",
                      }}
                    >
                      {isSelected
                        ? "Selected"
                        : selectable
                          ? `${availableRoomCount} room${availableRoomCount === 1 ? "" : "s"} available`
                          : "No rooms available"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {locations.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Locations</h2>
            <div className={styles.locationGrid}>
              {locations.map((l) => {
                const selectable = isLocationSelectable(l.id);
                const isSelected = tournament.venueLocationId === l.id;
                return (
                  <button
                    type="button"
                    key={l.id}
                    className={`${styles.locationCard} ${(!selectable && !isSelected) || !l.available ? styles.unavailable : ""} ${isSelected ? styles.locationSelected : ""}`}
                    disabled={!selectable && !isSelected}
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
                        color: isSelected
                          ? "var(--accent)"
                          : selectable
                            ? "var(--text-2)"
                            : "var(--red)",
                      }}
                    >
                      {isSelected
                        ? "Selected"
                        : selectable
                          ? selectedTimeBlock
                            ? "Available in slot"
                            : "Available"
                          : selectedTimeBlock
                            ? "Booked in slot"
                            : "Booked"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
      <ConfirmDialog
        open={confirmGenerateBracket}
        title="Generate bracket?"
        description="This will create the tournament matchups before the tournament starts."
        confirmLabel="Generate Bracket"
        confirmVariant="success"
        onConfirm={handleGenerateBracket}
        onCancel={() => setConfirmGenerateBracket(false)}
      />
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
        open={assignEntryTarget !== null}
        title={`Add ${isIndividualGame ? "player" : "team"} to match?`}
        description="Choose an entry first, then apply it to this bracket slot."
        confirmLabel="Apply"
        confirmVariant="success"
        confirmDisabled={!selectedAssignEntryId}
        customContent={
          <div className={styles.assignEntryList}>
            {availableEntries.length === 0 ? (
              <div className={styles.assignEntryEmpty}>
                No available {isIndividualGame ? "players" : "teams"} to add.
              </div>
            ) : (
              availableEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`${styles.assignEntryOption} ${selectedAssignEntryId === entry.id ? styles.assignEntryOptionSelected : ""}`}
                  onClick={() => setSelectedAssignEntryId(entry.id)}
                >
                  <span className={styles.assignEntryLabel}>{entry.label}</span>
                  <span className={styles.assignEntryMeta}>{entry.secondaryLabel}</span>
                </button>
              ))
            )}
          </div>
        }
        onConfirm={handleAssignEntry}
        onCancel={() => {
          setAssignEntryTarget(null);
          setSelectedAssignEntryId(null);
        }}
      />
      <ConfirmDialog
        open={showAddRosterModal}
        title={
          addMemberTeamName
            ? `Add player to ${addMemberTeamName}?`
            : `Add ${isIndividualGame || addRosterTarget === "player" ? "player" : "team"}`
        }
        description={
          addMemberTeamName
            ? "Choose an existing participant or enter a new player for this team."
            : `Choose an existing ${isIndividualGame || addRosterTarget === "player" ? "player" : "team"} or enter one manually.`
        }
        confirmLabel="Apply"
        confirmVariant="success"
        confirmDisabled={!canApplyAddRoster}
        customContent={
          isIndividualGame || addRosterTarget === "player" || addMemberTeamName ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div className={styles.assignEntryList}>
                {existingPlayerOptions.length === 0 ? (
                  <div className={styles.assignEntryEmpty}>
                    No existing players available.
                  </div>
                ) : (
                  existingPlayerOptions.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className={`${styles.assignEntryOption} ${selectedExistingRosterId === entry.id ? styles.assignEntryOptionSelected : ""}`}
                      onClick={() =>
                        setSelectedExistingRosterId((current) =>
                          current === entry.id ? null : entry.id,
                        )
                      }
                    >
                      <span className={styles.assignEntryLabel}>{entry.label}</span>
                      <span className={styles.assignEntryMeta}>{entry.secondaryLabel}</span>
                    </button>
                  ))
                )}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)", textAlign: "center" }}>
                or enter a new player
              </div>
              <input
                value={newPlayerName}
                onChange={(e) => {
                  setNewPlayerName(e.target.value);
                  if (selectedExistingRosterId) setSelectedExistingRosterId(null);
                }}
                placeholder="Name"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text)" }}
              />
              <input
                value={newPlayerEmail}
                onChange={(e) => {
                  setNewPlayerEmail(e.target.value);
                  if (selectedExistingRosterId) setSelectedExistingRosterId(null);
                }}
                placeholder="Email"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text)" }}
              />
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div className={styles.assignEntryList}>
                {existingTeamOptions.length === 0 ? (
                  <div className={styles.assignEntryEmpty}>
                    No existing teams available.
                  </div>
                ) : (
                  existingTeamOptions.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className={`${styles.assignEntryOption} ${selectedExistingRosterId === entry.id ? styles.assignEntryOptionSelected : ""}`}
                      onClick={() =>
                        setSelectedExistingRosterId((current) =>
                          current === entry.id ? null : entry.id,
                        )
                      }
                    >
                      <span className={styles.assignEntryLabel}>{entry.label}</span>
                      <span className={styles.assignEntryMeta}>{entry.secondaryLabel}</span>
                    </button>
                  ))
                )}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)", textAlign: "center" }}>
                or enter a new team
              </div>
              <input
                value={newTeamName}
                onChange={(e) => {
                  setNewTeamName(e.target.value);
                  if (selectedExistingRosterId) setSelectedExistingRosterId(null);
                }}
                placeholder="Team name"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text)" }}
              />
              <input
                value={newCaptainName}
                onChange={(e) => {
                  setNewCaptainName(e.target.value);
                  if (selectedExistingRosterId) setSelectedExistingRosterId(null);
                }}
                placeholder="Captain name"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text)" }}
              />
              <input
                value={newCaptainEmail}
                onChange={(e) => {
                  setNewCaptainEmail(e.target.value);
                  if (selectedExistingRosterId) setSelectedExistingRosterId(null);
                }}
                placeholder="Captain email"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text)" }}
              />
              <input
                value={newTeamMemberCount}
                onChange={(e) => {
                  setNewTeamMemberCount(e.target.value);
                  if (selectedExistingRosterId) setSelectedExistingRosterId(null);
                }}
                placeholder="Team size"
                inputMode="numeric"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text)" }}
              />
            </div>
          )
        }
        onConfirm={handleAddRoster}
        onCancel={() => {
          setShowAddRosterModal(false);
          setAddMemberTeamName(null);
          resetRosterForm();
        }}
      />
      <ConfirmDialog
        open={confirmRemoveRoster !== null}
        title={confirmRemoveRoster?.kind === "team" ? "Remove team?" : "Remove player?"}
        description={
          confirmRemoveRoster?.kind === "team"
            ? `This will remove ${confirmRemoveRoster?.name ?? "this team"} and clear it from the bracket.`
            : `This will remove ${confirmRemoveRoster?.name ?? "this player"} and clear them from the bracket.`
        }
        confirmLabel={confirmRemoveRoster?.kind === "team" ? "Remove Team" : "Remove Player"}
        onConfirm={handleRemoveRoster}
        onCancel={() => setConfirmRemoveRoster(null)}
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

import React, { startTransition, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import {
  Zap,
  Trophy,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Shield,
  Gamepad2,
  Github,
  Mail,
  Globe,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import type { Variants } from "framer-motion";

// ── Parallax Wrapper ───────────────────────────────────────────────────────────
function Parallax({
  children,
  className = "",
}: {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
import valorantLogo from "../assets/game-logos/valorant-icon.png";
import leagueOfLegendsLogo from "../assets/game-logos/league-of-legends-icon.png";
import cs2Logo from "../assets/game-logos/icons/cs2.ico";
import rocketLeagueLogo from "../assets/game-logos/rocket-league.svg";
import overwatch2Logo from "../assets/game-logos/overwatch-2.svg";
import apexLegendsLogo from "../assets/game-logos/apex-legends.svg";
import smashBrosLogo from "../assets/game-logos/smash-bros.svg";
import streetFighterLogo from "../assets/game-logos/street-fighter-6.png";
import fortniteLogo from "../assets/game-logos/fortnite-icon.svg";
import tekken8Logo from "../assets/game-logos/tekken-8.svg";

// ── Types ──────────────────────────────────────────────────────────────────────
type Category = "E-Sports" | "Sports" | "Board" | "Card";
type BadgeIconProps = {
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
};
type Game = {
  name: string;
  genre: string;
  format: string;
  color1: string;
  color2: string;
  accent: string;
  category: Category;
  logoSrc?: string;
  logoClassName?: string;
  logoStyle?: React.CSSProperties;
  badgeIcon?: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
    strokeWidth?: number;
  }>;
  badgeLabel?: string;
};

function SoccerBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.2 14.8 9l-1 3.3h-3.6L9.2 9 12 7.2Z" fill="currentColor" />
      <path
        d="m9.2 9-2.8.4-1.2 2.9m9.6-3.3 2.8.4 1.2 2.9m-8.6-.1-2 2.3.7 2.9m6.2-5.2 2 2.3-.7 2.9M9.1 17.4 12 16l2.9 1.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BasketballBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5c2.1 2.1 3.2 5.2 3.2 8.5S14.1 18.4 12 20.5M12 3.5C9.9 5.6 8.8 8.7 8.8 12s1.1 6.4 3.2 8.5M3.8 12h16.4M6.3 6.3c3.9 1.3 7.5 1.3 11.4 0m0 11.4c-3.9-1.3-7.5-1.3-11.4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TennisBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M7.3 5.6c2.6 2 4.1 4.1 4.1 6.4s-1.5 4.4-4.1 6.4m9.4-12.8c-2.6 2-4.1 4.1-4.1 6.4s1.5 4.4 4.1 6.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FootballBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 7.4c2.8-2 7.2-2 10 0 2 2.8 2 6.4 0 9.2-2.8 2-7.2 2-10 0-2-2.8-2-6.4 0-9.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m9.2 9.3 5.6 5.4m-5.6 0 5.6-5.4M10.1 12h3.8m-2.8-1.2v2.4m1.8-2.4v2.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BadmintonBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.2 6.2 13 11m-6-1.2 3.7 3.7m-5-.3 3.7 3.7m8-8L11.3 2.8m8.1 8.1-6.1-6.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.8 10.2 18 18.4c.8.8.8 2 0 2.8s-2 .8-2.8 0L7 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VolleyballBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5c2.8 2.2 4.2 4.5 4.2 6.9m-8.4 0C7.8 8 9.2 5.7 12 3.5m7.9 3.3c-3.6 1.1-5.9 3-6.9 5.7m-8.9-5.7c3.6 1.1 5.9 3 6.9 5.7m7 7c-1.7-2.9-4-4.6-7-5m-5 4.8c1.7-2.9 4-4.6 7-5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChessBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 20.5h8m-7-13.5h6v3H9V7Zm1.2-3.5h3.6v2.2h-3.6V3.5Zm-.4 6.5v2.4l-1.5 2.8H16.7l-1.5-2.8v-2.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckersBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <circle
        cx="15"
        cy="14"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.9"
      />
      <path
        d="M7.2 10h3.6m2.4 4h3.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PokerBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 6.2c1.1-2 3.6-2 4.4-.1.6 1.5-.2 2.8-1.3 3.7L12 12.4 8.9 9.8C7.8 8.9 7 7.6 7.6 6.1 8.4 4.2 10.9 4.2 12 6.2Z"
        fill="currentColor"
      />
      <path
        d="M12 12.4v5.6m-2.8 0h5.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MahjongBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6.2"
        y="4.2"
        width="11.6"
        height="15.6"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9.4 8.3h5.2m-5.2 3.3h5.2m-3.8 3.4c.9-.8 1.5-.8 2.4 0m-5-6.7 1.2 1.1 1.2-1.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9.2" cy="12.8" r="3.3" fill="currentColor" />
      <circle
        cx="14.8"
        cy="11.2"
        r="3.3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UnoBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6.5"
        y="4.5"
        width="11"
        height="15"
        rx="2.8"
        transform="rotate(-12 12 12)"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9.2 12c1.2-2 4.4-2.2 5.9 0-1.1 1.9-4.5 2.1-5.9 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function renderGameWatermark(game: Game) {
  const common = { color: game.accent } as React.CSSProperties;

  if (game.category === "E-Sports") {
    const esportMarks: Record<string, React.ReactNode> = {
      VALORANT: (
        <>
          <circle
            cx="80"
            cy="40"
            r="15"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.5"
          />
          <path
            d="M80 8v14M80 58v14M48 40H62M98 40h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="m62 22 9 9m18 18 9 9m-36 0 9-9m18-18 9-9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.35"
          />
        </>
      ),
      "LEAGUE OF LEGENDS": (
        <>
          <rect
            x="48"
            y="18"
            width="64"
            height="44"
            rx="8"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity="0.22"
          />
          <circle
            cx="80"
            cy="40"
            r="17"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.42"
          />
          <path
            d="M80 18 96 34 80 50 64 34 80 18Z"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.62"
          />
          <path
            d="M58 52 72 38m30 14L88 38"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.3"
          />
        </>
      ),
      "COUNTER STRIKE 2": (
        <>
          <circle
            cx="80"
            cy="40"
            r="18"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.4"
          />
          <path
            d="M80 15v50M55 40h50"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.6"
          />
        </>
      ),
      "ROCKET LEAGUE": (
        <>
          <path
            d="M26 52c15-18 34-27 56-27 17 0 33 5 48 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M34 58c14-10 31-15 48-15 18 0 34 5 47 13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.28"
          />
          <circle
            cx="118"
            cy="28"
            r="6"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.6"
          />
          <path d="M48 47h16l10 8H58Z" fill="currentColor" opacity="0.2" />
        </>
      ),
      "OVERWATCH 2": (
        <>
          <path
            d="M56 52a24 24 0 0 1 48 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M61 30a26 26 0 0 1 38 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.32"
          />
          <path
            d="M80 16v10m-22 8 8 4m36-4-8 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.45"
          />
        </>
      ),
      "APEX LEGENDS": (
        <>
          <path
            d="M80 14 96 52H64L80 14Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.58"
          />
          <path
            d="M80 28v18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.48"
          />
          <path
            d="M52 22h14m28 0h14M46 58h68"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.24"
          />
        </>
      ),
      "SMASH BROS": (
        <>
          <path
            d="M58 42c0-10 10-18 22-18 12 0 22 8 22 18-4-2-8-3-12-3-3 0-5 1-8 2-2-1-5-2-8-2-4 0-8 1-12 3Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="currentColor"
            opacity="0.22"
          />
          <path
            d="M70 42h20v14c0 2-2 4-4 4H74c-2 0-4-2-4-4V42Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.34"
          />
          <circle
            cx="72"
            cy="34"
            r="3"
            fill="currentColor"
            opacity="0.34"
          />
          <circle cx="88" cy="34" r="3" fill="currentColor" opacity="0.34" />
        </>
      ),
      "STREET FIGHTER 6": (
        <>
          <path
            d="M44 56 70 30M70 56 96 30M96 56l20-20"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.58"
          />
          <path
            d="M56 24 70 30l-6-14m26 14 14 6-6-14"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </>
      ),
      FORTNITE: (
        <>
          <path
            d="M60 60 L100 20 V60 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <path
            d="M60 60 L100 60 M80 40 L100 40"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
        </>
      ),
      "TEKKEN 8": (
        <>
          <path
            d="M50 40l15-15 30 0-15 15-30 0z"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.5"
          />
          <path
            d="M65 55l15-15 30 0-15 15-30 0z"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.4"
          />
        </>
      ),
    };

    return (
      <svg
        viewBox="0 0 160 80"
        className="h-full w-full"
        style={common}
        fill="none"
        aria-hidden="true"
      >
        {esportMarks[game.name] ?? (
          <circle
            cx="80"
            cy="40"
            r="15"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.4"
          />
        )}
      </svg>
    );
  }

  if (game.category === "Sports") {
    const sportMarks: Record<string, React.ReactNode> = {
      SOCCER: (
        <path
          d="M50 54h60M80 24a18 18 0 1 0 0 36 18 18 0 0 0 0-36Zm0 0v36M62 42h36"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.45"
        />
      ),
      BASKETBALL: (
        <path
          d="M50 56c0-18 12-30 30-30s30 12 30 30M62 24c6 8 9 18 9 32m18-32c-6 8-9 18-9 32M48 42h64"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.45"
        />
      ),
      TENNIS: (
        <>
          <circle
            cx="80"
            cy="40"
            r="18"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.28"
          />
          <path
            d="M68 28c5 4 8 8 10 12m4-16c6 5 10 10 12 16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.42"
          />
          <path
            d="M62 52l16-16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.24"
          />
        </>
      ),
      "AMERICAN FOOTBALL": (
        <>
          <path
            d="M80 24c-14 5-24 15-24 24s10 19 24 24c14-5 24-15 24-24S94 29 80 24Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.26"
          />
          <path
            d="M72 40h16m-12-4 8 8m-8 0 8-8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.4"
          />
        </>
      ),
      BADMINTON: (
        <>
          <path
            d="M66 28l20 20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.26"
          />
          <path
            d="M88 30c5 0 9 4 9 9 0 2-1 4-3 6l-10-10c2-3 2-5 4-5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.4"
          />
          <path
            d="M62 24l10 10m-4-14 8 8m-12-4 8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.28"
          />
        </>
      ),
      VOLLEYBALL: (
        <>
          <circle
            cx="80"
            cy="40"
            r="18"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.24"
          />
          <path
            d="M62 34c6 1 10 5 12 11m24-13c-7 1-12 5-16 11m-2-21c4 6 5 12 2 19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.4"
          />
        </>
      ),
      BOXING: (
        <>
          <path
            d="M56 52c-4 0-7-3-7-7v-5c0-3 2-5 5-5h3v-4h8v6c3 1 5 3 5 6v1c0 5-4 8-8 8H56Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.32"
          />
          <path
            d="M98 52c4 0 7-3 7-7v-5c0-3-2-5-5-5h-3v-4h-8v6c-3 1-5 3-5 6v1c0 5 4 8 8 8h6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.32"
          />
          <path
            d="M61 35h6m32 0h-6M66 44h18m10 0H76"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.22"
          />
        </>
      ),
      CYCLING: (
        <>
          <circle
            cx="62"
            cy="48"
            r="10"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.24"
          />
          <circle
            cx="98"
            cy="48"
            r="10"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.24"
          />
          <path
            d="M62 48l12-14h10l14 14M74 34l8 14m-4-22h10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </>
      ),
      "TABLE TENNIS": (
        <>
          <circle
            cx="70"
            cy="42"
            r="10"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.28"
          />
          <path
            d="M77 49l10 9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.38"
          />
          <circle cx="95" cy="34" r="4" fill="currentColor" opacity="0.34" />
        </>
      ),
      GOLF: (
        <>
          <path
            d="M70 54c10 2 22 2 32-1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.24"
          />
          <path
            d="M80 24v26"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.34"
          />
          <path
            d="M80 24c8 2 13 5 16 8-4 3-9 5-16 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.4"
          />
          <circle cx="92" cy="52" r="3.2" fill="currentColor" opacity="0.3" />
        </>
      ),
      BASEBALL: (
        <>
          <circle
            cx="80"
            cy="40"
            r="18"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.22"
          />
          <path
            d="M68 27c-3 6-4 13-1 19m25-19c3 6 4 13 1 19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M66 31c2 1 4 3 5 5m18-5c-2 1-4 3-5 5m-18 8c2 1 4 3 5 5m18-5c-2 1-4 3-5 5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.28"
          />
        </>
      ),
    };
    return (
      <svg
        viewBox="0 0 160 80"
        className="h-full w-full"
        style={common}
        fill="none"
        aria-hidden="true"
      >
        {sportMarks[game.name] ?? (
          <path
            d="M52 40h56"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.35"
          />
        )}
      </svg>
    );
  }

  const boardMarks: Record<string, React.ReactNode> = {
    CHESS: (
      <path
        d="M58 52h44M64 48h32l-4-8H68l-4 8Zm6-18h20v10H70V30Zm4-10h12v10H74V20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.42"
      />
    ),
    CHECKERS: (
      <>
        <circle
          cx="68"
          cy="34"
          r="10"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.34"
        />
        <circle
          cx="92"
          cy="46"
          r="10"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.22"
        />
        <path
          d="M60 56h40"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.2"
        />
      </>
    ),
    POKER: (
      <path
        d="m68 26 10 10 10-10m-10 10v18m-8 0h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
    ),
    MAHJONG: (
      <>
        <rect
          x="64"
          y="22"
          width="32"
          height="36"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.28"
        />
        <circle cx="80" cy="34" r="4.5" fill="currentColor" opacity="0.18" />
        <path
          d="M74 46c2-3 10-3 12 0m-14 6h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.36"
        />
      </>
    ),
    GO: (
      <>
        <path
          d="M60 24v28m12-28v28m12-28v28m12-28v28M60 28h48M60 40h48M60 52h48"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.2"
        />
        <circle cx="72" cy="36" r="5" fill="currentColor" opacity="0.28" />
        <circle
          cx="92"
          cy="44"
          r="5"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.34"
        />
      </>
    ),
    SCRABBLE: (
      <>
        <rect
          x="60"
          y="24"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.26"
        />
        <rect
          x="82"
          y="38"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.18"
        />
        <path
          d="M67 29c1.8-1.2 4.8-.6 4.6 1.8-.3 2.1-4.3 2.1-4.5 4.2.2 2.4 2.9 3 4.8 1.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.38"
        />
        <circle cx="95" cy="52" r="1.4" fill="currentColor" opacity="0.3" />
      </>
    ),
    MONOPOLY: (
      <>
        <path
          d="M58 54h44M62 54V36l18-10 18 10v18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.28"
        />
        <path
          d="M80 26v9m-8 8h16m-11 11v-9h6v9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.38"
        />
      </>
    ),
    BACKGAMMON: (
      <>
        <rect
          x="58"
          y="24"
          width="44"
          height="32"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.18"
        />
        <path
          d="M80 24v32"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.22"
        />
        <path
          d="M62 26h14l-7 18Zm22 0h14l-7 18ZM62 54h14l-7-18Zm22 0h14l-7-18Z"
          fill="currentColor"
          opacity="0.26"
        />
      </>
    ),
    UNO: (
      <>
        <path
          d="M66 22h28v36H66Z"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.28"
        />
        <path
          d="M72 40c3-6 13-6 16 0-3 6-13 6-16 0Z"
          fill="currentColor"
          opacity="0.35"
        />
      </>
    ),
    BLACKJACK: (
      <>
        <path
          d="M60 24h24v32H60Z"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.28"
        />
        <path
          d="M76 28h24v32H76Z"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.18"
        />
        <path
          d="M67 35c2.4-4.2 9.2-4.2 11.6 0-2.4 4.2-9.2 4.2-11.6 0Z"
          fill="currentColor"
          opacity="0.32"
        />
        <path
          d="M85 32h7m-3.5-3.5V35.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.34"
        />
      </>
    ),
    "MAGIC: THE GATHERING": (
      <>
        <path
          d="M80 22c-10 5-16 14-16 24 0 8 7 14 16 14s16-6 16-14c0-10-6-19-16-24Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          opacity="0.22"
        />
        <path
          d="M80 27c-6 4-10 10-10 17 0 5 4.5 9 10 9s10-4 10-9c0-7-4-13-10-17Z"
          fill="currentColor"
          opacity="0.14"
        />
        <path
          d="M80 24v29m-11-9h22"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.28"
        />
      </>
    ),
    "YU-GI-OH": (
      <>
        <rect
          x="60"
          y="22"
          width="40"
          height="36"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.22"
        />
        <path
          d="M67 29c6-4 20-4 26 1 4 3 4 8 0 11-6 5-20 5-26 1-4-3-4-9 0-13Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.34"
        />
        <path
          d="M70 34c4-2 13-2 17 1 2 2 2 4 0 6-4 3-13 3-17 1-3-2-3-5 0-8Z"
          fill="currentColor"
          opacity="0.16"
        />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 160 80"
      className="h-full w-full"
      style={common}
      fill="none"
      aria-hidden="true"
    >
      {boardMarks[game.name] ?? (
        <path
          d="M60 24h40v32H60Z"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.28"
        />
      )}
    </svg>
  );
}

function getBrowseCardWatermarkVariants(game: Game): Variants {
  let seed = 0;
  for (const char of game.name) seed += char.charCodeAt(0);

  const categoryTuning: Record<Game["category"], { x: number; y: number; rotate: number; duration: number }> = {
    "E-Sports": { x: 13, y: 10, rotate: 13, duration: 4.8 },
    Sports: { x: 15, y: 8, rotate: 10, duration: 5.2 },
    Board: { x: 9, y: 7, rotate: 8, duration: 6.2 },
    Card: { x: 11, y: 9, rotate: 11, duration: 5.5 },
  };

  const tuning = categoryTuning[game.category];
  const directionX = seed % 2 === 0 ? 1 : -1;
  const directionY = seed % 3 === 0 ? 1 : -1;
  const directionRotate = seed % 5 < 2 ? 1 : -1;

  const xLead = tuning.x + (seed % 5);
  const xTrail = 4 + ((seed >> 1) % 7);
  const yLead = tuning.y + ((seed >> 2) % 4);
  const yTrail = 2 + ((seed >> 3) % 5);
  const rotateLead = tuning.rotate + ((seed >> 4) % 6);
  const rotateTrail = 3 + ((seed >> 5) % 6);
  const scalePeak = 1.1 + ((seed % 9) * 0.012);
  const scaleMid = 0.97 + (((seed >> 2) % 6) * 0.01);
  const scaleFloor = 0.92 + (((seed >> 3) % 4) * 0.01);
  const opacityPeak = 0.92 + (((seed >> 1) % 4) * 0.02);
  const opacityMid = 0.76 + (((seed >> 2) % 5) * 0.02);
  const opacityFloor = 0.66 + (((seed >> 4) % 5) * 0.02);
  const duration = tuning.duration + ((seed % 7) * 0.22);
  const hoverDuration = 0.8 + ((seed % 4) * 0.07);
  const patterns = [
    {
      idle: {
        rotate: [0, rotateLead * directionRotate, -rotateTrail * directionRotate, 0],
        scale: [scaleFloor, scalePeak, scaleMid, scaleFloor],
        x: [0, xLead * directionX, -xTrail * directionX, 0],
        y: [0, -yLead * directionY, yTrail * directionY, 0],
      },
      hover: {
        rotate: [0, (rotateLead + 4) * directionRotate, -2 * directionRotate],
        scale: [scaleMid, Math.min(scalePeak + 0.08, 1.24), scalePeak],
        x: [0, (xLead + 3) * directionX, 3 * directionX],
        y: [0, -(yLead + 3) * directionY, -2 * directionY],
      },
    },
    {
      idle: {
        rotate: [-rotateTrail * directionRotate, -2 * directionRotate, rotateLead * directionRotate, -rotateTrail * directionRotate],
        scale: [scaleMid, scaleFloor, scalePeak, scaleMid],
        x: [0, -(xTrail + 2) * directionX, xLead * directionX, 0],
        y: [0, yTrail * directionY, -(yLead + 2) * directionY, 0],
      },
      hover: {
        rotate: [-rotateTrail * directionRotate, (rotateLead + 5) * directionRotate, 3 * directionRotate],
        scale: [scaleFloor, Math.min(scalePeak + 0.1, 1.25), scalePeak],
        x: [0, -(xTrail + 5) * directionX, 4 * directionX],
        y: [0, (yTrail + 3) * directionY, -3 * directionY],
      },
    },
    {
      idle: {
        rotate: [3 * directionRotate, 0, -rotateTrail * directionRotate, rotateLead * directionRotate, 3 * directionRotate],
        scale: [scaleFloor, scaleMid, scalePeak, scaleMid, scaleFloor],
        x: [0, xTrail * directionX, 0, -xLead * directionX, 0],
        y: [0, -3 * directionY, -yLead * directionY, 2 * directionY, 0],
      },
      hover: {
        rotate: [0, -(rotateTrail + 2) * directionRotate, (rotateLead + 5) * directionRotate],
        scale: [scaleMid, Math.min(scalePeak + 0.09, 1.23), scalePeak],
        x: [0, (xTrail + 4) * directionX, -(xLead - 2) * directionX],
        y: [0, -(yLead + 2) * directionY, 1 * directionY],
      },
    },
    {
      idle: {
        rotate: [-2 * directionRotate, rotateLead * directionRotate, 1 * directionRotate, -(rotateTrail + 1) * directionRotate, -2 * directionRotate],
        scale: [scaleFloor, scalePeak, scaleFloor + 0.02, scaleMid, scaleFloor],
        x: [0, 0, xLead * directionX, -xTrail * directionX, 0],
        y: [0, -(yLead + 2) * directionY, 0, yTrail * directionY, 0],
      },
      hover: {
        rotate: [-2 * directionRotate, (rotateLead + 6) * directionRotate, -4 * directionRotate],
        scale: [scaleFloor, Math.min(scalePeak + 0.11, 1.25), scalePeak],
        x: [0, 0, (xLead + 5) * directionX],
        y: [0, -(yLead + 5) * directionY, 0],
      },
    },
    {
      idle: {
        rotate: [rotateTrail * directionRotate, -rotateLead * directionRotate, rotateTrail * directionRotate, 0],
        scale: [scalePeak, scaleFloor, scaleMid, scalePeak],
        x: [0, -(xLead + 1) * directionX, xTrail * directionX, 0],
        y: [0, -2 * directionY, (yLead + 1) * directionY, 0],
      },
      hover: {
        rotate: [rotateTrail * directionRotate, -(rotateLead + 6) * directionRotate, 2 * directionRotate],
        scale: [scaleMid, Math.min(scalePeak + 0.08, 1.22), scalePeak],
        x: [0, -(xLead + 4) * directionX, 2 * directionX],
        y: [0, (yLead + 4) * directionY, -2 * directionY],
      },
    },
    {
      idle: {
        rotate: [0, 0, rotateLead * directionRotate, -(rotateTrail + 2) * directionRotate, 0],
        scale: [scaleFloor, scaleMid, scalePeak, scaleMid, scaleFloor],
        x: [0, xLead * directionX, xLead * directionX, -xTrail * directionX, 0],
        y: [0, 0, -(yLead + 1) * directionY, yTrail * directionY, 0],
      },
      hover: {
        rotate: [0, (rotateLead + 4) * directionRotate, -(rotateTrail + 1) * directionRotate],
        scale: [scaleMid, Math.min(scalePeak + 0.07, 1.21), scalePeak],
        x: [0, (xLead + 4) * directionX, -(xTrail - 1) * directionX],
        y: [0, 0, -(yLead + 4) * directionY],
      },
    },
    {
      idle: {
        rotate: [-(rotateTrail + 1) * directionRotate, 4 * directionRotate, rotateLead * directionRotate, -(rotateTrail + 1) * directionRotate],
        scale: [scaleMid, scalePeak, scaleFloor, scaleMid],
        x: [0, -xTrail * directionX, xLead * directionX, 0],
        y: [0, -(yLead + 2) * directionY, -(yLead - 2) * directionY, 0],
      },
      hover: {
        rotate: [-(rotateTrail + 1) * directionRotate, (rotateLead + 5) * directionRotate, 1 * directionRotate],
        scale: [scaleFloor, Math.min(scalePeak + 0.12, 1.24), scalePeak],
        x: [0, -(xTrail + 4) * directionX, (xLead + 2) * directionX],
        y: [0, -(yLead + 5) * directionY, -1 * directionY],
      },
    },
    {
      idle: {
        rotate: [0, -rotateLead * directionRotate, 0, rotateTrail * directionRotate, 0],
        scale: [scaleFloor, scalePeak, scaleFloor, scaleMid, scaleFloor],
        x: [0, xLead * directionX, -2 * directionX, -(xTrail + 2) * directionX, 0],
        y: [0, yTrail * directionY, -(yLead + 2) * directionY, 0, 0],
      },
      hover: {
        rotate: [0, -(rotateLead + 6) * directionRotate, rotateTrail * directionRotate],
        scale: [scaleMid, Math.min(scalePeak + 0.09, 1.22), scalePeak],
        x: [0, (xLead + 3) * directionX, -(xTrail + 1) * directionX],
        y: [0, (yTrail + 3) * directionY, -(yLead + 3) * directionY],
      },
    },
  ];

  const pattern = patterns[seed % patterns.length];

  return {
    idle: {
      ...pattern.idle,
      opacity: [opacityFloor, opacityPeak, opacityMid, opacityFloor],
      transition: { duration, repeat: Infinity, ease: "easeInOut" },
    },
    hover: {
      ...pattern.hover,
      opacity: [Math.min(opacityMid + 0.04, 0.92), 1, Math.min(opacityPeak, 0.96)],
      transition: { duration: hoverDuration, ease: "easeOut" },
    },
  };
}

function ScrabbleBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      {/* back tile */}
      <rect
        x="10"
        y="8"
        width="10"
        height="12"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* front tile */}
      <rect
        x="4"
        y="4"
        width="10"
        height="12"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* letter hint — two strokes forming an "S" impression */}
      <path
        d="M7 8.5c1.2-.8 3.2-.4 3 1.2-.2 1.4-2.8 1.4-3 2.8.1 1.6 2 2 3.2 1.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* point value dot */}
      <circle cx="12.8" cy="19" r="0.9" fill="currentColor" />
    </svg>
  );
}

function MonopolyBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      {/* roof */}
      <path
        d="M3.5 13L12 5l8.5 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* walls */}
      <path
        d="M6.5 13v7h11v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* door */}
      <rect
        x="9.5"
        y="15.5"
        width="5"
        height="4.5"
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* chimney */}
      <path
        d="M15.5 10V7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackgammonBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      {/* board */}
      <rect
        x="3"
        y="3.5"
        width="18"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* center bar */}
      <line
        x1="12"
        y1="3.5"
        x2="12"
        y2="20.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* top triangles (dark points) */}
      <path
        d="M5 4.5L7.5 13 5 4.5Z M5 4.5L10 4.5 7.5 13Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M14 4.5L16.5 13 14 4.5Z M14 4.5L19 4.5 16.5 13Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* checkers at bottom */}
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16.5" cy="18" r="2" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function BlackjackBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      {/* back card */}
      <rect
        x="9.5"
        y="5.5"
        width="11"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* front card */}
      <rect
        x="3.5"
        y="3.5"
        width="11"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* spade suit */}
      <path
        d="M9 13.5c.9-1.6 3-1.6 3.9 0C11.8 15 9.2 15 9 13.5Z"
        fill="currentColor"
      />
      <path
        d="M10 8.5l-1.5 2.4c-.5.8 0 1.6.9 1.6h3.2c.9 0 1.4-.8.9-1.6Z"
        fill="currentColor"
      />
      <path
        d="M10.5 15.5v2m-.8 0h1.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MagicBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      {/* card outline */}
      <rect
        x="4.5"
        y="3.5"
        width="15"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* mana gem — pentagon/diamond */}
      <path
        d="M12 7.5l2.2 2.8-2.2 2.8-2.2-2.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* power/toughness box */}
      <rect
        x="13.5"
        y="17"
        width="4"
        height="2.5"
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* text lines */}
      <path
        d="M6.5 15h11M6.5 17h6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

function YuGiOhBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      {/* 8-pointed star (card star) */}
      <path
        d="M12 3.5l1.8 4.9 4.7-2-2 4.7 4.9 1.8-4.9 1.8 2 4.7-4.7-2-1.8 4.9-1.8-4.9-4.7 2 2-4.7-4.9-1.8 4.9-1.8-2-4.7 4.7 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

function BaseballBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.5 5C8.2 8 8.2 10.5 9.5 15c.5 1.8 1.3 3 2.5 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14.5 5c1.3 3 1.3 5.5 0 10-.5 1.8-1.3 3-2.5 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9.8 8.5l1.2.6M9.5 11.5l1.2.4M9.8 14.5l1 .4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M14.2 8.5l-1.2.6M14.5 11.5l-1.2.4M14.2 14.5l-1 .4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoxingBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 12C7 9 9 6.5 11.5 6.5h1C15 6.5 17 8.5 17 11.5V15c0 2.2-1.5 4-4 4h-2C8.5 19 7 17.2 7 15V12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17 10c1.8.2 2.5 1.2 2.5 2.5s-.7 2.3-2.5 2.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.5 15.5h9M8 17.5h8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TableTennisBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10.5"
        r="6.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 10.5h10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M14.5 15L19.5 20"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="19" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GolfBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="13"
        y1="2.5"
        x2="13"
        y2="20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M13 3L19.5 6 13 9.5V3Z" fill="currentColor" />
      <path
        d="M6.5 20.5c0-1.8 2.9-3.2 6.5-3.2s6.5 1.4 6.5 3.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="8"
        cy="17.5"
        r="2.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CyclingBadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="6"
        cy="16.5"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="18"
        cy="16.5"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 16.5L11 7l7 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M11 7L9 15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M15.5 7h3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7.5 5.5h4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const CATEGORIES: Category[] = ["E-Sports", "Sports", "Board", "Card"];
const CTA_PLUS_BURST = [
  {
    className:
      "left-[10%] top-[20%] -translate-x-2 group-hover:-translate-x-8 group-hover:-translate-y-6",
    delay: "0ms",
    size: "text-2xl",
  },
  {
    className:
      "left-[22%] top-[70%] -translate-y-1 group-hover:-translate-x-6 group-hover:translate-y-5",
    delay: "40ms",
    size: "text-3xl",
  },
  {
    className:
      "right-[18%] top-[18%] translate-x-2 group-hover:translate-x-8 group-hover:-translate-y-5",
    delay: "80ms",
    size: "text-2xl",
  },
  {
    className:
      "right-[12%] top-[58%] group-hover:translate-x-6 group-hover:translate-y-6",
    delay: "120ms",
    size: "text-2xl",
  },
  {
    className: "left-1/2 top-[14%] -translate-x-1/2 group-hover:-translate-y-8",
    delay: "160ms",
    size: "text-xl",
  },
  {
    className:
      "left-1/2 bottom-[18%] -translate-x-1/2 group-hover:translate-y-7",
    delay: "200ms",
    size: "text-3xl",
  },
] as const;

const CATEGORY_IMAGES: Record<Category, string> = {
  "E-Sports":
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&h=80&fit=crop&q=80",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=80&h=80&fit=crop&q=80",
  Board:
    "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=80&h=80&fit=crop&q=80",
  Card: "https://images.unsplash.com/photo-1541278107931-e006523892df?w=80&h=80&fit=crop&q=80",
};

// ── Games data ─────────────────────────────────────────────────────────────────
const games: Game[] = [
  // E-Sports
  {
    name: "VALORANT",
    genre: "Tactical FPS",
    format: "5v5",
    color1: "#1a0508",
    color2: "#8b1220",
    accent: "#ff4655",
    category: "E-Sports",
    logoSrc: valorantLogo,
    logoClassName: "h-8 w-8 object-contain",
    badgeLabel: "V",
  },
  {
    name: "LEAGUE OF LEGENDS",
    genre: "MOBA",
    format: "5v5",
    color1: "#020a14",
    color2: "#1e4878",
    accent: "#C89B3C",
    category: "E-Sports",
    logoSrc: leagueOfLegendsLogo,
    logoClassName: "h-10 w-10 object-contain",
    logoStyle: { filter: "drop-shadow(0 0 10px rgba(200,155,60,0.45))" },
    badgeLabel: "LoL",
  },
  {
    name: "COUNTER STRIKE 2",
    genre: "FPS",
    format: "5v5",
    color1: "#08101c",
    color2: "#1a3d7a",
    accent: "#4a9eff",
    category: "E-Sports",
    logoSrc: cs2Logo,
    logoClassName: "h-8 w-8 rounded-md object-contain",
    badgeLabel: "CS2",
  },
  {
    name: "ROCKET LEAGUE",
    genre: "Vehicle Sports",
    format: "3v3",
    color1: "#08001a",
    color2: "#2400a0",
    accent: "#00d4ff",
    category: "E-Sports",
    logoSrc: rocketLeagueLogo,
    logoClassName: "h-8 w-8 object-cover object-left",
    badgeLabel: "RL",
  },
  {
    name: "OVERWATCH 2",
    genre: "Hero Shooter",
    format: "5v5",
    color1: "#1a0c00",
    color2: "#7a3200",
    accent: "#ff6b00",
    category: "E-Sports",
    logoSrc: overwatch2Logo,
    logoClassName: "h-8 w-8 object-contain",
    badgeLabel: "OW2",
  },
  {
    name: "APEX LEGENDS",
    genre: "Battle Royale",
    format: "3v3",
    color1: "#100000",
    color2: "#6b1400",
    accent: "#fc4d2c",
    category: "E-Sports",
    logoSrc: apexLegendsLogo,
    logoClassName: "h-7 w-9 object-contain",
    logoStyle: {
      filter:
        "brightness(0) saturate(100%) invert(54%) sepia(84%) saturate(2851%) hue-rotate(344deg) brightness(100%) contrast(98%)",
    },
    badgeLabel: "Apex",
  },
  {
    name: "SMASH BROS",
    genre: "Fighting",
    format: "1v1",
    color1: "#0e0210",
    color2: "#5a006e",
    accent: "#ff2244",
    category: "E-Sports",
    logoSrc: smashBrosLogo,
    logoClassName: "h-7 w-10 object-contain",
    logoStyle: {
      filter:
        "brightness(0) saturate(100%) invert(27%) sepia(97%) saturate(3130%) hue-rotate(338deg) brightness(104%) contrast(106%)",
    },
    badgeLabel: "Smash",
  },
  {
    name: "STREET FIGHTER 6",
    genre: "Fighting",
    format: "1v1",
    color1: "#0a0010",
    color2: "#4a0090",
    accent: "#cc00ff",
    category: "E-Sports",
    logoSrc: streetFighterLogo,
    logoClassName: "h-7 w-10 object-contain",
    badgeLabel: "SF6",
  },
  {
    name: "FORTNITE",
    genre: "Battle Royale",
    format: "Squads",
    color1: "#001028",
    color2: "#003a90",
    accent: "#00b4ff",
    category: "E-Sports",
    logoSrc: fortniteLogo,
    logoClassName: "h-8 w-8 object-contain",
    logoStyle: {
      filter:
        "brightness(0) saturate(100%) invert(57%) sepia(96%) saturate(2982%) hue-rotate(165deg) brightness(104%) contrast(102%)",
    },
    badgeLabel: "FN",
  },
  {
    name: "TEKKEN 8",
    genre: "Fighting",
    format: "1v1",
    color1: "#100008",
    color2: "#5c0038",
    accent: "#ff0066",
    category: "E-Sports",
    logoSrc: tekken8Logo,
    logoClassName: "h-8 w-8 object-cover object-left",
    logoStyle: {
      filter:
        "brightness(0) saturate(100%) invert(19%) sepia(98%) saturate(5862%) hue-rotate(330deg) brightness(104%) contrast(110%)",
    },
    badgeLabel: "T8",
  },
  // Sports
  {
    name: "SOCCER",
    genre: "Sports",
    format: "11v11",
    color1: "#001a0a",
    color2: "#005c20",
    accent: "#00e676",
    category: "Sports",
    badgeIcon: SoccerBadgeIcon,
    badgeLabel: "SC",
  },
  {
    name: "BASKETBALL",
    genre: "Sports",
    format: "5v5",
    color1: "#1a0800",
    color2: "#7a2e00",
    accent: "#ff6d00",
    category: "Sports",
    badgeIcon: BasketballBadgeIcon,
    badgeLabel: "BK",
  },
  {
    name: "TENNIS",
    genre: "Sports",
    format: "1v1",
    color1: "#1a1400",
    color2: "#5c4800",
    accent: "#ffe57f",
    category: "Sports",
    badgeIcon: TennisBadgeIcon,
    badgeLabel: "TN",
  },
  {
    name: "AMERICAN FOOTBALL",
    genre: "Sports",
    format: "11v11",
    color1: "#0a1000",
    color2: "#2a4200",
    accent: "#76ff03",
    category: "Sports",
    badgeIcon: FootballBadgeIcon,
    badgeLabel: "AF",
  },
  {
    name: "BADMINTON",
    genre: "Sports",
    format: "1v1",
    color1: "#000e1a",
    color2: "#003870",
    accent: "#4fc3f7",
    category: "Sports",
    badgeIcon: BadmintonBadgeIcon,
    badgeLabel: "BD",
  },
  {
    name: "VOLLEYBALL",
    genre: "Sports",
    format: "6v6",
    color1: "#0a0010",
    color2: "#3a0068",
    accent: "#ce93d8",
    category: "Sports",
    badgeIcon: VolleyballBadgeIcon,
    badgeLabel: "VB",
  },
  {
    name: "BASEBALL",
    genre: "Sports",
    format: "9v9",
    color1: "#00001a",
    color2: "#001890",
    accent: "#448aff",
    category: "Sports",
    badgeIcon: BaseballBadgeIcon,
    badgeLabel: "BB",
  },
  {
    name: "BOXING",
    genre: "Combat",
    format: "1v1",
    color1: "#0d0000",
    color2: "#5c0000",
    accent: "#ef5350",
    category: "Sports",
    badgeIcon: BoxingBadgeIcon,
    badgeLabel: "BX",
  },
  {
    name: "TABLE TENNIS",
    genre: "Sports",
    format: "1v1",
    color1: "#000d18",
    color2: "#003a52",
    accent: "#26c6da",
    category: "Sports",
    badgeIcon: TableTennisBadgeIcon,
    badgeLabel: "TT",
  },
  {
    name: "GOLF",
    genre: "Sports",
    format: "Solo",
    color1: "#080e00",
    color2: "#2c3c00",
    accent: "#aeea00",
    category: "Sports",
    badgeIcon: GolfBadgeIcon,
    badgeLabel: "GL",
  },
  {
    name: "CYCLING",
    genre: "Sports",
    format: "Solo",
    color1: "#0d0900",
    color2: "#3a2c00",
    accent: "#ffeb3b",
    category: "Sports",
    badgeIcon: CyclingBadgeIcon,
    badgeLabel: "CY",
  },
  // Board
  {
    name: "CHESS",
    genre: "Strategy",
    format: "1v1",
    color1: "#0a0810",
    color2: "#2e1e60",
    accent: "#ffd740",
    category: "Board",
    badgeIcon: ChessBadgeIcon,
    badgeLabel: "CH",
  },
  {
    name: "CHECKERS",
    genre: "Strategy",
    format: "1v1",
    color1: "#100008",
    color2: "#4e0030",
    accent: "#ff4081",
    category: "Board",
    badgeIcon: CheckersBadgeIcon,
    badgeLabel: "CK",
  },
  {
    name: "MAHJONG",
    genre: "Tile",
    format: "4-Player",
    color1: "#1a0e00",
    color2: "#5c2c00",
    accent: "#ffab40",
    category: "Board",
    badgeIcon: MahjongBadgeIcon,
    badgeLabel: "MJ",
  },
  {
    name: "GO",
    genre: "Strategy",
    format: "1v1",
    color1: "#060a08",
    color2: "#163a20",
    accent: "#a5d6a7",
    category: "Board",
    badgeIcon: GoBadgeIcon,
    badgeLabel: "GO",
  },
  {
    name: "SCRABBLE",
    genre: "Word",
    format: "2–4 Players",
    color1: "#120d00",
    color2: "#3a2800",
    accent: "#d4a843",
    category: "Board",
    badgeIcon: ScrabbleBadgeIcon,
    badgeLabel: "SC",
  },
  {
    name: "MONOPOLY",
    genre: "Strategy",
    format: "2–8 Players",
    color1: "#001a08",
    color2: "#004d1a",
    accent: "#00c853",
    category: "Board",
    badgeIcon: MonopolyBadgeIcon,
    badgeLabel: "MN",
  },
  {
    name: "BACKGAMMON",
    genre: "Strategy",
    format: "1v1",
    color1: "#120400",
    color2: "#4a1000",
    accent: "#ff7043",
    category: "Board",
    badgeIcon: BackgammonBadgeIcon,
    badgeLabel: "BG",
  },
  // Card
  {
    name: "POKER",
    genre: "Card",
    format: "Multi",
    color1: "#001a00",
    color2: "#004d1a",
    accent: "#69f0ae",
    category: "Card",
    badgeIcon: PokerBadgeIcon,
    badgeLabel: "PK",
  },
  {
    name: "UNO",
    genre: "Card",
    format: "Multi",
    color1: "#1a0000",
    color2: "#6b0000",
    accent: "#ff1744",
    category: "Card",
    badgeIcon: UnoBadgeIcon,
    badgeLabel: "UNO",
  },
  {
    name: "BLACKJACK",
    genre: "Card",
    format: "Multi",
    color1: "#0d0900",
    color2: "#3a2800",
    accent: "#ffc400",
    category: "Card",
    badgeIcon: BlackjackBadgeIcon,
    badgeLabel: "BJ",
  },
  {
    name: "MAGIC: THE GATHERING",
    genre: "Trading Card",
    format: "1v1",
    color1: "#080012",
    color2: "#32006a",
    accent: "#e040fb",
    category: "Card",
    badgeIcon: MagicBadgeIcon,
    badgeLabel: "MTG",
  },
  {
    name: "YU-GI-OH",
    genre: "Trading Card",
    format: "1v1",
    color1: "#000a18",
    color2: "#001e60",
    accent: "#ffca28",
    category: "Card",
    badgeIcon: YuGiOhBadgeIcon,
    badgeLabel: "YGO",
  },
];

// ── Features data ──────────────────────────────────────────────────────────────
const features = [
  {
    icon: Trophy,
    title: "Tournament Management",
    desc: "Create and run single-elimination, round-robin, and double-elimination brackets with ease.",
  },
  {
    icon: Zap,
    title: "Live Match Control",
    desc: "Start matches, report scores, handle no-shows, and push real-time updates to all participants.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Collect availability, auto-generate conflict-free schedules, and send confirmation links.",
  },
  {
    icon: MapPin,
    title: "Room Booking",
    desc: "Assign venues, manage time slots, and prevent double-bookings across all your events.",
  },
  {
    icon: Users,
    title: "Participant Tracking",
    desc: "Register teams and players, track check-ins, and manage waitlists automatically.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Give organizers, referees, and volunteers the exact permissions they need — nothing more.",
  },
];

// ── Animation variants ─────────────────────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 100 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Floating category symbols background ───────────────────────────────────────
// Deterministic pseudo-random so positions are stable across re-renders
const dr = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// One symbol per entry — balanced mix across all 4 categories
const BG_SYMBOL_POOL: React.FC<BadgeIconProps>[] = [
  // E-Sports
  ({ className, style }) => (
    <Gamepad2 className={className} style={style} strokeWidth={1.4} />
  ),
  ({ className, style }) => (
    <Zap className={className} style={style} strokeWidth={1.4} />
  ),
  ({ className, style }) => (
    <Shield className={className} style={style} strokeWidth={1.4} />
  ),
  ({ className, style }) => (
    <Trophy className={className} style={style} strokeWidth={1.4} />
  ),
  // Sports
  SoccerBadgeIcon,
  BasketballBadgeIcon,
  TennisBadgeIcon,
  GolfBadgeIcon,
  CyclingBadgeIcon,
  BoxingBadgeIcon,
  // Board
  ChessBadgeIcon,
  MahjongBadgeIcon,
  GoBadgeIcon,
  ScrabbleBadgeIcon,
  BackgammonBadgeIcon,
  MonopolyBadgeIcon,
  // Card
  PokerBadgeIcon,
  BlackjackBadgeIcon,
  MagicBadgeIcon,
  YuGiOhBadgeIcon,
];

const BG_SYMBOLS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  Icon: BG_SYMBOL_POOL[i % BG_SYMBOL_POOL.length],
  x: dr(i + 0.11) * 100, // % across viewport
  y: dr(i + 0.22) * 100, // % down viewport
  size: 28 + dr(i + 0.33) * 34, // 28–62 px
  baseOpacity: 0.035 + dr(i + 0.44) * 0.04, // 0.035–0.075
  duration: 16 + dr(i + 0.55) * 22, // 16–38 s
  delay: -(dr(i + 0.66) * 32), // stagger start offset
  rotation: dr(i + 0.77) * 360, // initial tilt
}));

function FloatingSymbols() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf: number;
    let tx = window.innerWidth / 2,
      ty = window.innerHeight / 2;
    let cx = tx,
      cy = ty;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--cx", `${cx}px`);
      el.style.setProperty("--cy", `${cy}px`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const renderSymbols = (opacityMultiplier: number) =>
    BG_SYMBOLS.map(
      ({ id, Icon, x, y, size, baseOpacity, duration, delay, rotation }) => (
        <div
          key={id}
          className="absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            opacity: baseOpacity * opacityMultiplier,
            color: "var(--arena-accent)",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              animation: `symbolFloat ${duration}s ease-in-out ${delay}s infinite`,
            }}
          >
            <Icon className="w-full h-full" />
          </div>
        </div>
      ),
    );

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ "--cx": "50vw", "--cy": "50vh" } as React.CSSProperties}
    >
      {/* Cursor-reveal layer — symbols only visible when mouse is near */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(340px circle at var(--cx) var(--cy), black 10%, transparent 70%)",
          maskImage:
            "radial-gradient(340px circle at var(--cx) var(--cy), black 10%, transparent 70%)",
        }}
      >
        {renderSymbols(6)}
      </div>
    </div>
  );
}

// ── Interactive grid background ────────────────────────────────────────────────
function InteractiveGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      // Parallax offset for the background pattern
      const px = (cx / window.innerWidth - 0.5) * 40;
      const py = (cy / window.innerHeight - 0.5) * 40;
      el.style.setProperty("--cx", `${cx}px`);
      el.style.setProperty("--cy", `${cy}px`);
      el.style.setProperty("--px", `${px}px`);
      el.style.setProperty("--py", `${py}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 bg-arena-bg"
      style={
        {
          "--cx": "50vw",
          "--cy": "50vh",
          "--px": "0px",
          "--py": "0px",
        } as React.CSSProperties
      }
    >
      {/* Extremely Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: "var(--px) var(--py)",
        }}
      />

      {/* Mouse Reveal Layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(var(--accent-rgb), 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-rgb), 0.4) 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: "var(--px) var(--py)",
          WebkitMaskImage:
            "radial-gradient(400px circle at var(--cx) var(--cy), black 0%, transparent 80%)",
          maskImage:
            "radial-gradient(400px circle at var(--cx) var(--cy), black 0%, transparent 80%)",
        }}
      />

      {/* Subtle Glow Behind Mouse */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(400px circle at var(--cx) var(--cy), rgba(var(--accent-rgb), 0.08), transparent)",
        }}
      />
    </div>
  );
}

// ── Browse card (used in the scrolling Browse Tournaments strips) ──────────────
function BrowseCard({ game }: { game: Game }) {
  const watermarkVariants = getBrowseCardWatermarkVariants(game);

  return (
    <motion.div
      initial={false}
      animate="idle"
      whileHover="hover"
      className="relative shrink-0 w-68 h-40 rounded-2xl overflow-hidden border cursor-pointer group select-none"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 76%, transparent) 0%, color-mix(in srgb, var(--surface-2) 64%, transparent) 100%)",
        borderColor: "color-mix(in srgb, var(--border) 85%, transparent)",
        boxShadow:
          "0 10px 30px color-mix(in srgb, var(--text-main) 8%, transparent)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${game.color1}22 0%, ${game.color2}14 100%)`,
        }}
      />
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10"
        style={{ backgroundColor: game.accent }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--text-main) 1px, transparent 1px), linear-gradient(90deg, var(--text-main) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-full"
          style={{
            background: `linear-gradient(180deg, ${game.accent}08 0%, transparent 78%)`,
          }}
        />
        <motion.div
          variants={watermarkVariants}
          className="absolute inset-x-1 top-3 h-24 origin-center opacity-[0.8] dark:opacity-[0.25]"
        >
          {renderGameWatermark(game)}
        </motion.div>
        <div
          className="absolute left-4 top-8 h-px w-24"
          style={{
            background: `linear-gradient(90deg, ${game.accent}40, transparent)`,
          }}
        />
      </div>
      <div className="relative z-10 h-full p-4">
        <div className="absolute left-4 right-20 top-4">
          <div className="flex items-center gap-2">
            {game.category === "E-Sports" && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: `${game.accent}55`,
                  color: game.accent,
                  backgroundColor: `color-mix(in srgb, ${game.accent} 12%, transparent)`,
                }}
              >
                {game.genre}
              </span>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-20">
          <p
            className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            {game.format}
          </p>
          <h3
            className="font-display text-lg leading-tight"
            style={{ color: "var(--text-main)" }}
          >
            {game.name}
          </h3>
        </div>
        <div className="absolute bottom-4 right-4 flex items-end justify-end">
          <div
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md"
            style={{
              borderColor: `color-mix(in srgb, ${game.accent} 22%, var(--border))`,
              background: "color-mix(in srgb, var(--surface) 94%, transparent)",
              boxShadow: `0 10px 24px color-mix(in srgb, var(--text-main) 8%, transparent), 0 0 0 1px color-mix(in srgb, ${game.accent} 10%, transparent), 0 0 28px color-mix(in srgb, ${game.accent} 14%, transparent)`,
            }}
          >
            {game.logoSrc ? (
              <img
                src={game.logoSrc}
                alt={`${game.name} logo`}
                className={game.logoClassName ?? "h-11 w-11 object-contain"}
                style={game.logoStyle}
              />
            ) : game.badgeIcon ? (
              <game.badgeIcon
                className="h-9 w-9"
                style={{ color: game.accent }}
                strokeWidth={2.1}
              />
            ) : (
              <span
                className="text-[11px] font-black uppercase tracking-[0.16em]"
                style={{ color: "var(--text-main)" }}
              >
                {game.badgeLabel ?? game.name.slice(0, 3)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: "color-mix(in srgb, var(--bg) 18%, transparent)",
        }}
      >
        <span
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border backdrop-blur-sm"
          style={{
            color: "var(--text-main)",
            background: "color-mix(in srgb, var(--surface) 82%, transparent)",
            borderColor: "color-mix(in srgb, var(--border) 90%, transparent)",
          }}
        >
          Browse Tournaments <ArrowRight size={12} />
        </span>
      </div>
    </motion.div>
  );
}

// ── Repulsive category button ───────────────────────────────────────────────────
function CategoryButton({
  cat,
  isActive,
  imgSrc,
  onClick,
}: {
  cat: Category;
  isActive: boolean;
  imgSrc: string;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 300, damping: 20 });
  const y = useSpring(rawY, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isActive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cx - e.clientX;
    const dy = cy - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    rawX.set((dx / dist) * 18);
    rawY.set((dy / dist) * 18);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const mobileLabel =
    cat === "E-Sports" ? "Esports" : cat;

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x,
        y,
        ...(isActive
          ? {
              background: "rgba(var(--accent-rgb), 0.15)",
              borderColor: "rgba(var(--accent-rgb), 0.6)",
              color: "var(--arena-accent)",
              boxShadow: "0 0 18px rgba(var(--accent-rgb), 0.25)",
            }
          : {
              background: "transparent",
              borderColor: "var(--arena-border)",
              color: "var(--arena-text-muted)",
            }),
      }}
      whileHover={
        !isActive
          ? {
              scale: [1, 1.15, 1.07],
              filter: "brightness(1.4)",
              transition: {
                duration: 0.25,
                times: [0, 0.2, 1],
                ease: "easeOut",
              },
            }
          : {}
      }
      whileTap={{ scale: 0.88, filter: "brightness(0.9)" }}
      transition={{ type: "spring", stiffness: 500, damping: 12 }}
      className="relative flex min-w-0 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-bold sm:justify-start sm:pl-1.5 sm:pr-5 sm:py-1.5 sm:text-sm"
    >
      {/* thumbnail */}
      <span className="relative w-6 h-6 shrink-0 rounded-full overflow-hidden">
        <img
          src={imgSrc}
          alt=""
          className="w-full h-full object-cover"
          style={{
            filter: isActive
              ? "brightness(1.1) saturate(1.2)"
              : "brightness(0.7) saturate(0.8)",
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: isActive
              ? "rgba(var(--accent-rgb), 0.3)"
              : "rgba(0,0,0,0.35)",
            boxShadow: isActive
              ? "inset 0 0 0 1.5px rgba(var(--accent-rgb),0.5)"
              : undefined,
          }}
        />
      </span>
      <span className="sm:hidden">{mobileLabel}</span>
      <span className="hidden sm:inline">{cat}</span>
    </motion.button>
  );
}

// ── Scoreboard decode hook ─────────────────────────────────────────────────────
const SCOREBOARD_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$!?";

function useScorecardReveal(
  text: string,
  trigger: number,
): {
  display: string;
  flashIndex: number;
  done: boolean;
} {
  const [display, setDisplay] = useState<string[]>(
    text.split("").map((c) => (c === " " ? " " : SCOREBOARD_CHARS[0])),
  );
  const [flashIndex, setFlashIndex] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplay(
      text.split("").map((c) => (c === " " ? " " : SCOREBOARD_CHARS[0])),
    );
    setFlashIndex(-1);
    setDone(false);

    const CHAR_DELAY = 75;
    const chars = text.split("");
    let lockedCount = 0;
    let frame: number;
    let startTime: number | null = null;

    const tick = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const shouldLock = Math.floor(elapsed / CHAR_DELAY);

      if (shouldLock > lockedCount && lockedCount < chars.length) {
        while (lockedCount < shouldLock && lockedCount < chars.length) {
          if (chars[lockedCount] !== " ") setFlashIndex(lockedCount);
          lockedCount++;
        }
      }

      setDisplay(
        chars.map((c, i) => {
          if (c === " ") return " ";
          if (i < lockedCount) return c;
          return SCOREBOARD_CHARS[
            Math.floor(Math.random() * SCOREBOARD_CHARS.length)
          ];
        }),
      );

      if (lockedCount < chars.length) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(chars);
        setDone(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, trigger]);

  return { display: display.join(""), flashIndex, done };
}

// ── Landing page ───────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("E-Sports");

  const [slamGlow, setSlamGlow] = useState(false);
  const [scoreTrigger, setScoreTrigger] = useState(1);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const heroTextInView = useInView(heroTextRef, { once: false, margin: "-100px" });

  useEffect(() => {
    if (!heroTextInView) return;
    const raf = requestAnimationFrame(() => {
      setScoreTrigger((t) => t + 1);
      setSlamGlow(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [heroTextInView]);

  const {
    display: line1Display,
    flashIndex,
    done: line1Done,
  } = useScorecardReveal("Run your tournaments.", scoreTrigger);

  const filteredGames = games.filter((g) => g.category === activeCategory);
  const rotateGames = (items: Game[], offset: number) => {
    if (items.length === 0) return items;
    const normalized = ((offset % items.length) + items.length) % items.length;
    return [...items.slice(normalized), ...items.slice(0, normalized)];
  };
  const topStripGames = [
    ...filteredGames,
    ...rotateGames(
      filteredGames,
      Math.max(1, Math.floor(filteredGames.length / 2)),
    ),
  ];
  const bottomBaseGames = [...filteredGames].reverse();
  const bottomStripGames = [
    ...bottomBaseGames,
    ...rotateGames(
      bottomBaseGames,
      Math.max(1, Math.floor(bottomBaseGames.length / 3)),
    ),
  ];

  const handleTabChange = (cat: Category) => {
    if (cat !== activeCategory) {
      startTransition(() => {
        setActiveCategory(cat);
      });
    }
  };

  return (
    <div className="min-h-screen bg-arena-bg relative overflow-hidden font-sans text-arena-text flex flex-col">
      <InteractiveGrid />
      <FloatingSymbols />

      {/* Ambient glow blobs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-200 h-100 bg-arena-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-150 h-150 bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-x-0 border-t-0 rounded-none px-6 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="p-2 bg-arena-accent/10 rounded-lg text-arena-accent">
            <Zap size={22} className="fill-current" />
          </div>
          <span className="font-display tracking-wide text-2xl font-bold">
            Arena<span className="text-arena-accent">OPS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 text-sm font-medium text-arena-text-muted hover:text-arena-text transition-colors"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
          <button
            className="px-5 py-2 text-sm font-bold text-arena-bg bg-arena-accent hover:bg-arena-accent-hover rounded-lg shadow-[0_0_20px_rgba(232,255,71,0.2)] hover:shadow-[0_0_30px_rgba(232,255,71,0.4)] transition-all active:scale-95"
            onClick={() => navigate("/register")}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-accent mb-8 shadow-lg"
        >
          <Zap size={14} className="fill-current" />
          <span className="tracking-[0.14em] uppercase leading-tight text-center sm:hidden">
            Tournament Platform
            <br />
            for Every Sport & Game
          </span>
          <span className="hidden tracking-wider uppercase sm:inline">
            Tournament Platform for Every Sport & Game
          </span>
        </motion.div>

        <h1
          ref={heroTextRef}
          className="font-display text-[2.5rem] sm:text-6xl md:text-8xl font-black uppercase leading-[0.92] tracking-tight mb-6"
          aria-label="Run your tournaments. Not spreadsheets."
        >
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {line1Display.split("").map((char, i) => (
              <span
                key={i}
                className="inline-block transition-all duration-75"
                style={{
                  filter: flashIndex === i ? "brightness(3)" : "brightness(1)",
                  minWidth: char === " " ? "0.35em" : undefined,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>

          <br />

          <motion.span
            className={`text-accent-gradient drop-shadow-md inline-block${slamGlow ? " slam-glow" : ""}`}
            aria-hidden="true"
            initial={{ y: -70, scaleY: 1.6, opacity: 0, filter: "blur(6px)" }}
            animate={
              line1Done
                ? { y: 0, scaleY: 1, opacity: 1, filter: "blur(0px)" }
                : { y: -70, scaleY: 1.6, opacity: 0, filter: "blur(6px)" }
            }
            transition={{ type: "spring", stiffness: 700, damping: 16 }}
            onAnimationComplete={() => {
              if (line1Done) setSlamGlow(true);
            }}
          >
            Not spreadsheets.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-lg md:text-xl text-arena-text-muted mb-10 leading-relaxed"
        >
          ArenaOPS is the all-in-one tournament management platform built for
          university clubs — from first registration to final bracket, live on
          game day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-arena-accent hover:bg-arena-accent-hover text-arena-bg font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(232,255,71,0.25)] hover:shadow-[0_0_50px_rgba(232,255,71,0.4)] transition-all active:scale-95"
            onClick={() => navigate("/register")}
          >
            Create an account
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-arena-text-muted font-medium"
        >
          No credit card required · Free to get started
        </motion.p>
      </section>

      {/* Stats bar */}
      <div className="relative z-10 border-y border-arena-border bg-arena-surface/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-arena-border"
          >
            {[
              { num: "50+", label: "Active orgs" },
              { num: "2,400+", label: "Tournaments run" },
              { num: "18k+", label: "Players managed" },
              { num: "99.9%", label: "Uptime on game day" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex flex-col items-center text-center px-4"
              >
                <span className="font-display text-4xl md:text-5xl text-arena-accent font-bold mb-1 drop-shadow-[0_0_15px_rgba(232,255,71,0.3)]">
                  {stat.num}
                </span>
                <span className="text-sm text-arena-text-muted font-medium uppercase tracking-wider">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── GAMES SECTION ── */}
      <section className="relative py-20 z-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-125 h-75 bg-purple-600/5 blur-[120px] rounded-full" />
          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-100 h-75 bg-blue-600/5 blur-[100px] rounded-full" />
        </div>

        {/* Section header */}
        <Parallax
          offset={60}
          className="max-w-6xl mx-auto px-6 mb-12 text-center"
        >
          <h2 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight mb-4">
            {["Your", "game."].map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, x: -60, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.13,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block mr-4"
              >
                {word}
              </motion.span>
            ))}
            <br />
            {["Your", "tournament."].map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, x: 60, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.26 + i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block mr-4 text-accent-gradient"
              >
                {word}
              </motion.span>
            ))}
          </h2>
          <p className="text-arena-text-muted text-lg max-w-xl mx-auto">
            From FPS to fighting games — run professional tournaments for every
            major title.
          </p>
        </Parallax>

        {/* ── Browse Tournaments ── */}
        <Parallax offset={40} className="max-w-6xl mx-auto px-6">
          {/* Category tabs */}
          <div className="mx-auto mb-10 grid max-w-md grid-cols-2 gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryButton
                key={cat}
                cat={cat}
                isActive={activeCategory === cat}
                imgSrc={CATEGORY_IMAGES[cat]}
                onClick={() => handleTabChange(cat)}
              />
            ))}
          </div>
        </Parallax>

        {/* Mobile browse scroller */}
        <Parallax offset={40} className="px-6 md:hidden">
          <div className="-mx-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
            <div className="flex w-max gap-4 pr-6">
              {filteredGames.map((game) => (
                <BrowseCard key={`${game.name}-mobile`} game={game} />
              ))}
            </div>
          </div>
        </Parallax>

        {/* Browse marquee strips */}
        <Parallax offset={60}>
          <div className="hidden md:block">
            {/* Strip 1 — left */}
            <div
              className="relative mb-4 overflow-hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <div className="flex gap-4 w-max marquee-track animate-marquee-left px-4">
                {topStripGames.map((game, i) => (
                  <BrowseCard key={`${game.name}-top-${i}`} game={game} />
                ))}
              </div>
            </div>

            {/* Strip 2 — right */}
            <div
              className="relative overflow-hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <div className="flex gap-4 w-max marquee-track animate-marquee-right px-4">
                {bottomStripGames.map((game, i) => (
                  <BrowseCard key={`${game.name}-bottom-${i}`} game={game} />
                ))}
              </div>
            </div>
          </div>
        </Parallax>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6 z-10 flex-1">
        <div className="max-w-6xl mx-auto">
          <Parallax offset={50} className="text-center mb-16">
            <h2 className="font-display text-[2rem] font-bold uppercase tracking-tight leading-[1.05] mb-4 md:hidden">
              Everything your{" "}
              <span style={{ color: "var(--accent)" }}>club</span> needs
            </h2>
            <h2
              className="hidden md:block font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4"
              style={{ perspective: "800px" }}
            >
              {"Everything your club needs".split("").map((char, i) =>
                char === " " ? (
                  <span key={i} className="inline-block">
                    &nbsp;
                  </span>
                ) : (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{
                      y: -(20 + ((i * 13) % 44)),
                      opacity: 0,
                      rotateX: -90,
                    }}
                    whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
                    viewport={{ once: false, margin: "-80px" }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 16,
                      delay: i * 0.04,
                    }}
                  >
                    <span
                      style={
                        i >= 16 && i <= 19
                          ? { color: "var(--accent)" }
                          : undefined
                      }
                    >
                      {char}
                    </span>
                  </motion.span>
                ),
              )}
            </h2>
            <p className="text-arena-text-muted text-lg max-w-2xl mx-auto">
              Purpose-built for the chaos of running tournaments at scale.
            </p>
          </Parallax>

          <Parallax
            offset={80}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="glass-card p-6 flex flex-col group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-arena-accent/10 border border-arena-accent/20 flex items-center justify-center text-arena-accent mb-6 group-hover:scale-110 group-hover:bg-arena-accent group-hover:text-arena-bg transition-all duration-300">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-arena-text mb-2">
                  {title}
                </h3>
                <p className="text-arena-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </Parallax>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 relative z-10">
        <Parallax
          offset={60}
          className="max-w-4xl mx-auto glass-panel p-12 text-center relative overflow-visible group"
        >
          <div className="absolute inset-0 bg-linear-to-br from-arena-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="pointer-events-none absolute inset-0">
            {CTA_PLUS_BURST.map((item, index) => (
              <span
                key={index}
                className={`absolute ${item.className} ${item.size} font-display font-bold text-arena-accent/0 opacity-0 transition-all duration-500 ease-out group-hover:text-arena-accent/70 group-hover:opacity-100`}
                style={{ transitionDelay: item.delay }}
              >
                +
              </span>
            ))}
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
              Ready to{" "}
              <motion.span
                className="relative inline-flex items-center text-arena-accent"
                initial={{
                  y: 0,
                  scale: 1,
                  textShadow: "0 0 0px rgba(var(--accent-rgb), 0)",
                }}
                whileInView={{
                  y: [0, -10, 0],
                  scale: [1, 1.06, 1],
                  textShadow: [
                    "0 0 0px rgba(var(--accent-rgb), 0)",
                    "0 0 18px rgba(var(--accent-rgb), 0.35)",
                    "0 0 0px rgba(var(--accent-rgb), 0)",
                  ],
                }}
                whileHover={{
                  y: [0, -10, 0],
                  scale: [1, 1.06, 1],
                  textShadow: [
                    "0 0 0px rgba(var(--accent-rgb), 0)",
                    "0 0 18px rgba(var(--accent-rgb), 0.35)",
                    "0 0 0px rgba(var(--accent-rgb), 0)",
                  ],
                }}
                viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.75, ease: "easeOut" }}
              >
                <span>level</span>
              </motion.span>{" "}
              up your events?
            </h2>
            <p className="text-arena-text-muted text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of clubs & organisations already using ArenaOPS.
            </p>
            <button
              className="group/cta relative flex items-center justify-center gap-2 px-8 py-4 mx-auto bg-arena-accent hover:bg-[#dfff00] text-[#0a0a09] font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(232,255,71,0.2)] hover:shadow-[0_0_50px_rgba(232,255,71,0.4)] transition-all active:scale-95"
              onClick={() => navigate("/register")}
              aria-label="Create your account"
            >
              <span className="relative inline-flex items-center">
                <span className="relative inline-block">
                  <span className="pointer-events-none absolute left-full top-full ml-2 mt-4 -translate-x-3 translate-y-2 opacity-0 transition-all duration-200 group-hover/cta:translate-x-0 group-hover/cta:translate-y-0 group-hover/cta:opacity-100 group-active/cta:translate-x-0 group-active/cta:translate-y-0 group-active/cta:opacity-100">
                    <span className="relative flex items-center whitespace-nowrap rounded-2xl border border-arena-accent/25 bg-arena-surface/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-arena-text shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
                      Create your account
                      <span className="absolute left-4 bottom-full h-3 w-3 translate-y-1/2 rotate-45 border-t border-l border-arena-accent/25 bg-arena-surface/95" />
                    </span>
                  </span>
                  <span className="relative inline-flex h-[1.35em] items-center overflow-hidden transition-transform duration-200 group-hover/cta:-translate-x-0.5 group-active/cta:-translate-x-0.5">
                    <span className="transition-all duration-200 group-hover/cta:-translate-y-full group-hover/cta:opacity-0 group-active/cta:-translate-y-full group-active/cta:opacity-0">
                      Yes!
                    </span>
                    <span className="absolute left-0 top-full transition-all duration-200 group-hover/cta:top-0 group-hover/cta:opacity-100 group-active/cta:top-0 group-active/cta:opacity-100 opacity-0">
                      Yay!
                    </span>
                  </span>
                </span>
              </span>
              <ArrowRight
                size={20}
                className="transition-transform group-hover/cta:translate-x-1 group-active/cta:translate-x-1"
              />
            </button>
          </div>
        </Parallax>
      </section>

      <ThemeToggle />

      {/* Footer */}
      <footer className="relative z-10">
        <div className="h-px bg-linear-to-r from-transparent via-arena-accent/40 to-transparent" />
        <div className="border-t border-arena-border bg-arena-surface/20 backdrop-blur-sm">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-6xl mx-auto px-6 py-16"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
              {/* Brand */}
              <div className="sm:col-span-2 lg:col-span-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                  <div className="p-1.5 bg-arena-accent/10 rounded-lg text-arena-accent">
                    <Zap size={18} className="fill-current" />
                  </div>
                  <span className="font-display tracking-wide text-xl font-bold">
                    Arena<span className="text-arena-accent">OPS</span>
                  </span>
                </div>
                <p className="text-sm text-arena-text-muted leading-relaxed mb-6 max-w-sm sm:max-w-xs mx-auto sm:mx-0">
                  The all-in-one tournament platform built for clubs &
                  organisations — from first registration to final bracket.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {[
                    { icon: Github, label: "GitHub" },
                    { icon: Globe, label: "Website" },
                    { icon: Mail, label: "Email" },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      aria-label={label}
                      className="w-9 h-9 rounded-lg border border-arena-border bg-arena-surface/50 flex items-center justify-center text-arena-text-muted hover:text-arena-accent hover:border-arena-accent/30 hover:bg-arena-accent/5 transition-all duration-200"
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div className="text-center sm:text-left">
                <h4 className="font-display text-xs uppercase tracking-[0.15em] text-arena-text font-bold mb-4 sm:mb-5">
                  Platform
                </h4>
                <ul className="space-y-3">
                  {[
                    "Tournament Management",
                    "Live Match Control",
                    "Smart Scheduling",
                    "Room Booking",
                    "Participant Tracking",
                    "Role-Based Access",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-arena-text-muted hover:text-arena-accent transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className="text-center sm:text-left">
                <h4 className="font-display text-xs uppercase tracking-[0.15em] text-arena-text font-bold mb-4 sm:mb-5">
                  Resources
                </h4>
                <ul className="space-y-3">
                  {[
                    "Documentation",
                    "How It Works",
                    "Changelog",
                    "System Status",
                    "Support Center",
                    "Community",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-arena-text-muted hover:text-arena-accent transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
                <h4 className="font-display text-xs uppercase tracking-[0.15em] text-arena-text font-bold mb-4 sm:mb-5">
                  Legal
                </h4>
                <ul className="space-y-3">
                  {[
                    "Privacy Policy",
                    "Terms of Service",
                    "Cookie Policy",
                    "Data Processing",
                    "Contact Us",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-arena-text-muted hover:text-arena-accent transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="border-t border-arena-border"
          >
            <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-xs text-arena-text-muted">
                © 2026 ArenaOPS · All rights reserved
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-arena-text-muted">
                <span>Built for every organiser</span>
                <span className="text-arena-border">·</span>
                <span className="text-arena-accent font-semibold">
                  No credit card required
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

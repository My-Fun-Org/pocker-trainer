/** Opponent archetypes shared by Player Types, Villain Profiling and HUD modules. */
export const PlayerType = {
  Nit: "nit",
  Tag: "tag",
  Lag: "lag",
  CallingStation: "callingStation",
  Maniac: "maniac",
  Whale: "whale",
  ShortStack: "shortStack",
} as const;

export type PlayerType = (typeof PlayerType)[keyof typeof PlayerType];

export const PLAYER_TYPES: PlayerType[] = [
  PlayerType.Nit,
  PlayerType.Tag,
  PlayerType.Lag,
  PlayerType.CallingStation,
  PlayerType.Maniac,
  PlayerType.Whale,
  PlayerType.ShortStack,
];

export interface PlayerTypeProfile {
  type: PlayerType;
  label: string;
  /** Typical HUD signature (percentages; stackBB for short stacks). */
  vpip: number;
  pfr: number;
  af: number;
  stackBB?: number;
  /** One-line behavioral tell. */
  tell: string;
  /** The core exploit against this type. */
  adjustment: string;
}

export const PLAYER_TYPE_PROFILES: Record<PlayerType, PlayerTypeProfile> = {
  [PlayerType.Nit]: {
    type: PlayerType.Nit,
    label: "Nit",
    vpip: 12,
    pfr: 9,
    af: 2,
    tell: "Tight and passive; only enters with premiums, folds to aggression.",
    adjustment: "Steal their blinds relentlessly and fold to their big bets - their raises are the nuts.",
  },
  [PlayerType.Tag]: {
    type: PlayerType.Tag,
    label: "TAG (Tight-Aggressive)",
    vpip: 22,
    pfr: 18,
    af: 3,
    tell: "Solid, selective, aggressive with strong ranges.",
    adjustment: "Respect their aggression, avoid marginal spots, and pick on their capped ranges.",
  },
  [PlayerType.Lag]: {
    type: PlayerType.Lag,
    label: "LAG (Loose-Aggressive)",
    vpip: 32,
    pfr: 26,
    af: 4,
    tell: "Plays many hands aggressively, applies constant pressure.",
    adjustment: "Widen your calling range, trap with strong hands, and let them bluff into you.",
  },
  [PlayerType.CallingStation]: {
    type: PlayerType.CallingStation,
    label: "Calling Station",
    vpip: 55,
    pfr: 8,
    af: 1,
    tell: "Calls three streets with weak hands, rarely raises.",
    adjustment: "Value bet thin and relentlessly; never bluff - they do not fold.",
  },
  [PlayerType.Maniac]: {
    type: PlayerType.Maniac,
    label: "Maniac",
    vpip: 60,
    pfr: 45,
    af: 6,
    tell: "Raises and re-raises wildly, hyper-aggressive.",
    adjustment: "Trap with strong hands, call down lighter, and let them barrel into your value.",
  },
  [PlayerType.Whale]: {
    type: PlayerType.Whale,
    label: "Whale",
    vpip: 65,
    pfr: 12,
    af: 2,
    tell: "Loose recreational player chasing everything, unpredictable.",
    adjustment: "Bet big for value with any strong hand; avoid fancy bluffs.",
  },
  [PlayerType.ShortStack]: {
    type: PlayerType.ShortStack,
    label: "Short Stack",
    vpip: 20,
    pfr: 16,
    af: 3,
    stackBB: 20,
    tell: "Sits with 20 BB or less, shoves or folds.",
    adjustment: "Tighten your calling range against shoves; play a push/fold-aware game.",
  },
};

export const PLAYER_TYPE_LABEL: Record<PlayerType, string> = PLAYER_TYPES.reduce(
  (acc, t) => {
    acc[t] = PLAYER_TYPE_PROFILES[t].label;
    return acc;
  },
  {} as Record<PlayerType, string>,
);

/** Classify an observed stat line to the nearest archetype (squared distance). */
export function classifyByStats(vpip: number, pfr: number, af: number): PlayerType {
  let best: PlayerType = PlayerType.Tag;
  let bestDist = Infinity;
  for (const type of PLAYER_TYPES) {
    const p = PLAYER_TYPE_PROFILES[type];
    const dist =
      (p.vpip - vpip) ** 2 + (p.pfr - pfr) ** 2 + ((p.af - af) * 5) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = type;
    }
  }
  return best;
}

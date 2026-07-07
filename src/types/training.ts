/** Every training mode / platform screen in the app, referenced as values. */
export const TrainingMode = {
  // Fundamentals
  Preflop: "preflop",
  Position: "position",
  Outs: "outs",
  PotOdds: "pot-odds",
  Equity: "equity",
  BoardTexture: "board-texture",
  BetSize: "bet-size",
  // Intermediate
  Range: "range",
  RangeBuilder: "range-builder",
  HandReading: "hand-reading",
  StackDepth: "stack-depth",
  Spr: "spr",
  PlayerTypes: "player-types",
  Bluff: "bluff",
  SemiBluff: "semi-bluff",
  ValueBetting: "value-betting",
  River: "river",
  ComboCounting: "combo-counting",
  DecisionTree: "decision-tree",
  VillainProfiling: "villain-profiling",
  Hud: "hud",
  // Psychology
  MentalGame: "mental-game",
  // Platform / tools
  SessionReview: "session-review",
  HandAnalyzer: "hand-analyzer",
  Replay: "replay",
  ScenarioBuilder: "scenario-builder",
} as const;

export type TrainingMode = (typeof TrainingMode)[keyof typeof TrainingMode];

export const ModeCategory = {
  Fundamentals: "Fundamentals",
  Intermediate: "Intermediate",
  Psychology: "Psychology",
  Platform: "Platform & Tools",
} as const;

export type ModeCategory = (typeof ModeCategory)[keyof typeof ModeCategory];

export const CATEGORY_ORDER: ModeCategory[] = [
  ModeCategory.Fundamentals,
  ModeCategory.Intermediate,
  ModeCategory.Psychology,
  ModeCategory.Platform,
];

export interface TrainingModeMeta {
  mode: TrainingMode;
  title: string;
  tagline: string;
  description: string;
  path: string;
  glyph: string;
  category: ModeCategory;
  /** PRD module number, for reference. */
  moduleNo: number;
}

const S = "\u2660";
const H = "\u2665";
const D = "\u2666";
const C = "\u2663";

export const TRAINING_MODES: TrainingModeMeta[] = [
  {
    mode: TrainingMode.Preflop,
    title: "Preflop Hands",
    tagline: "Position & starting ranges",
    description:
      "Deal a hand from a random position and choose fold, call, raise, or 3-bet against a chart-correct range.",
    path: "/train/preflop",
    glyph: S,
    category: ModeCategory.Fundamentals,
    moduleNo: 1,
  },
  {
    mode: TrainingMode.Position,
    title: "Position",
    tagline: "Acting last is power",
    description:
      "Learn who acts first, when to widen, steal, and defend - so positional awareness becomes automatic.",
    path: "/train/position",
    glyph: C,
    category: ModeCategory.Fundamentals,
    moduleNo: 2,
  },
  {
    mode: TrainingMode.Outs,
    title: "Outs & Equity",
    tagline: "Count your draws",
    description:
      "See your hand on the flop, identify the draw, count the outs, and estimate equity with the rule of 2 and 4.",
    path: "/train/outs",
    glyph: H,
    category: ModeCategory.Fundamentals,
    moduleNo: 3,
  },
  {
    mode: TrainingMode.PotOdds,
    title: "Pot Odds",
    tagline: "Call or fold, profitably",
    description:
      "Facing a bet with a draw, compare your equity to the required equity and make the mathematically correct call.",
    path: "/train/pot-odds",
    glyph: D,
    category: ModeCategory.Fundamentals,
    moduleNo: 4,
  },
  {
    mode: TrainingMode.Equity,
    title: "Equity Trainer",
    tagline: "Calibrate your win %",
    description:
      "See a matchup - AA vs KK, AK vs QQ, flush draw vs top pair - and guess how often you win. Scored against a live simulation.",
    path: "/train/equity",
    glyph: H,
    category: ModeCategory.Fundamentals,
    moduleNo: 5,
  },
  {
    mode: TrainingMode.BoardTexture,
    title: "Board Texture",
    tagline: "Dry, wet, or very wet",
    description:
      "Read the flop's flush and straight coordination and classify how connected the board really is.",
    path: "/train/board-texture",
    glyph: C,
    category: ModeCategory.Fundamentals,
    moduleNo: 9,
  },
  {
    mode: TrainingMode.BetSize,
    title: "Bet Size",
    tagline: "Size follows a reason",
    description:
      "Pick a size and learn why it maximizes EV: texture, intent, and the hands you want to call or fold.",
    path: "/train/bet-size",
    glyph: D,
    category: ModeCategory.Fundamentals,
    moduleNo: 8,
  },
  {
    mode: TrainingMode.Range,
    title: "Range Reading",
    tagline: "Think in ranges, not hands",
    description:
      "Work through real spots and select which hands continue, raise, call, or bluff in the villain's range.",
    path: "/train/range",
    glyph: S,
    category: ModeCategory.Intermediate,
    moduleNo: 7,
  },
  {
    mode: TrainingMode.RangeBuilder,
    title: "Range Builder",
    tagline: "Narrow it street by street",
    description:
      "Build villain's range on a 13x13 grid, then watch it collapse as each street's action removes combos.",
    path: "/train/range-builder",
    glyph: S,
    category: ModeCategory.Intermediate,
    moduleNo: 6,
  },
  {
    mode: TrainingMode.HandReading,
    title: "Hand Reading",
    tagline: "Worse calls, better raises, bluffs",
    description:
      "The full reasoning gate: name worse hands that call, better hands that continue, and bluffs - before you act.",
    path: "/train/hand-reading",
    glyph: S,
    category: ModeCategory.Intermediate,
    moduleNo: 7,
  },
  {
    mode: TrainingMode.StackDepth,
    title: "Stack Depth",
    tagline: "Same hand, different depths",
    description:
      "See a hand at 30 / 50 / 100 / 200 / 300 BB and learn how correct strategy shifts with the stacks.",
    path: "/train/stack-depth",
    glyph: C,
    category: ModeCategory.Intermediate,
    moduleNo: 10,
  },
  {
    mode: TrainingMode.Spr,
    title: "SPR Trainer",
    tagline: "Stack-to-pot commitment",
    description:
      "Estimate the SPR and decide whether your one-pair hand is committed - low SPR commits, high SPR demotes.",
    path: "/train/spr",
    glyph: D,
    category: ModeCategory.Intermediate,
    moduleNo: 11,
  },
  {
    mode: TrainingMode.PlayerTypes,
    title: "Player Types",
    tagline: "Classify and exploit",
    description:
      "Recognize Nits, TAGs, LAGs, Calling Stations, Maniacs, Whales and Short Stacks, then choose the counter.",
    path: "/train/player-types",
    glyph: C,
    category: ModeCategory.Intermediate,
    moduleNo: 12,
  },
  {
    mode: TrainingMode.Bluff,
    title: "Bluff Trainer",
    tagline: "Fold equity & blockers",
    description:
      "Decide bluff or don't-bluff. The coach weighs required fold %, villain type, and your blockers.",
    path: "/train/bluff",
    glyph: S,
    category: ModeCategory.Intermediate,
    moduleNo: 13,
  },
  {
    mode: TrainingMode.SemiBluff,
    title: "Semi-Bluff",
    tagline: "Two ways to win",
    description:
      "With a draw, choose check / bet / raise / call - combining fold equity now with your outs later.",
    path: "/train/semi-bluff",
    glyph: H,
    category: ModeCategory.Intermediate,
    moduleNo: 14,
  },
  {
    mode: TrainingMode.ValueBetting,
    title: "Value Betting",
    tagline: "Name 3 worse calls first",
    description:
      "Before you may bet, list worse hands that call. If nothing worse calls, it is a check-back, not a value bet.",
    path: "/train/value-betting",
    glyph: D,
    category: ModeCategory.Intermediate,
    moduleNo: 15,
  },
  {
    mode: TrainingMode.River,
    title: "River Trainer",
    tagline: "Bluff-catch, thin value, big folds",
    description:
      "The hardest street: use the narrowed range and value:bluff combo ratio to make the tough river decision.",
    path: "/train/river",
    glyph: S,
    category: ModeCategory.Intermediate,
    moduleNo: 16,
  },
  {
    mode: TrainingMode.ComboCounting,
    title: "Combo Counting",
    tagline: "6, 4, 12, 16 - and blockers",
    description:
      "Count combinations and compare value vs bluff quantities, adjusting for the cards already on the board.",
    path: "/train/combo-counting",
    glyph: D,
    category: ModeCategory.Intermediate,
    moduleNo: 17,
  },
  {
    mode: TrainingMode.DecisionTree,
    title: "Decision Tree",
    tagline: "Play a whole hand",
    description:
      "Navigate a branching hand - check, villain bets, you respond, next street - with every branch explained.",
    path: "/train/decision-tree",
    glyph: C,
    category: ModeCategory.Intermediate,
    moduleNo: 21,
  },
  {
    mode: TrainingMode.VillainProfiling,
    title: "Villain Profiling",
    tagline: "Read them over 20 hands",
    description:
      "Watch an opponent's actions build a HUD, classify their type, then apply the right adjustment.",
    path: "/train/villain-profiling",
    glyph: C,
    category: ModeCategory.Intermediate,
    moduleNo: 22,
  },
  {
    mode: TrainingMode.Hud,
    title: "HUD Trainer",
    tagline: "VPIP, PFR, 3Bet & more",
    description:
      "Learn what each HUD stat means and how a stat line maps to a player type and an exploit.",
    path: "/train/hud",
    glyph: D,
    category: ModeCategory.Intermediate,
    moduleNo: 24,
  },
  {
    mode: TrainingMode.MentalGame,
    title: "Mental Game",
    tagline: "Tilt, fear, hope & discipline",
    description:
      "Face spots designed to trigger tilt, fear, or hope and practice the disciplined, +EV response.",
    path: "/train/mental-game",
    glyph: H,
    category: ModeCategory.Psychology,
    moduleNo: 23,
  },
  {
    mode: TrainingMode.SessionReview,
    title: "Session Review",
    tagline: "Learn from your own play",
    description:
      "Turn this session's attempts into structured reflection with an AI summary and recommended drills.",
    path: "/train/session-review",
    glyph: C,
    category: ModeCategory.Platform,
    moduleNo: 18,
  },
  {
    mode: TrainingMode.HandAnalyzer,
    title: "Hand Analyzer",
    tagline: "Paste a hand, get a review",
    description:
      "Build or paste a hand and get a street-by-street review with mistakes, alternatives, and EV reasoning.",
    path: "/train/hand-analyzer",
    glyph: S,
    category: ModeCategory.Platform,
    moduleNo: 19,
  },
  {
    mode: TrainingMode.Replay,
    title: "Replay Simulator",
    tagline: "What if you'd played it differently?",
    description:
      "Replay a hand, pause on any street, change your action, and see the alternate line and EV delta.",
    path: "/train/replay",
    glyph: H,
    category: ModeCategory.Platform,
    moduleNo: 20,
  },
  {
    mode: TrainingMode.ScenarioBuilder,
    title: "Scenario Builder",
    tagline: "Author drills, export JSON",
    description:
      "Build scenarios visually with a live table preview and export valid JSON - no hand-editing files.",
    path: "/train/scenario-builder",
    glyph: C,
    category: ModeCategory.Platform,
    moduleNo: 26,
  },
];

export const MODE_BY_ID: Record<TrainingMode, TrainingModeMeta> =
  TRAINING_MODES.reduce(
    (acc, meta) => {
      acc[meta.mode] = meta;
      return acc;
    },
    {} as Record<TrainingMode, TrainingModeMeta>,
  );

export const ROUTES = {
  home: "/",
  stats: "/stats",
  audit: "/audit",
  shuffle: "/train/shuffle",
} as const;

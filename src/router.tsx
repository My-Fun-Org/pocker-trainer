import { createBrowserRouter, Navigate } from "react-router-dom";
import { MODE_BY_ID, ROUTES, TrainingMode } from "@/types/training";
import {
  BetSizeTrainer,
  BluffTrainer,
  BoardTextureTrainer,
  ComboCountingTrainer,
  DecisionTreeTrainer,
  EquityTrainer,
  HandAnalyzer,
  HandReadingTrainer,
  HudTrainer,
  MentalGameTrainer,
  OutsTrainer,
  PlayerTypesTrainer,
  PositionTrainer,
  PotOddsTrainer,
  PreflopTrainer,
  RangeBuilderTrainer,
  RangeTrainer,
  ReplaySimulator,
  RiverTrainer,
  ScenarioBuilder,
  SemiBluffTrainer,
  SessionReview,
  SprTrainer,
  StackDepthTrainer,
  ValueBettingTrainer,
  VillainProfilingTrainer,
} from "@/modes";
import { StartScreen } from "@/screens/StartScreen";
import { StatsDashboard } from "@/screens/StatsDashboard";
import { AuditLog } from "@/screens/AuditLog";

const MODE_COMPONENT: Record<TrainingMode, React.ComponentType> = {
  [TrainingMode.Preflop]: PreflopTrainer,
  [TrainingMode.Position]: PositionTrainer,
  [TrainingMode.Outs]: OutsTrainer,
  [TrainingMode.PotOdds]: PotOddsTrainer,
  [TrainingMode.Equity]: EquityTrainer,
  [TrainingMode.BoardTexture]: BoardTextureTrainer,
  [TrainingMode.BetSize]: BetSizeTrainer,
  [TrainingMode.Range]: RangeTrainer,
  [TrainingMode.RangeBuilder]: RangeBuilderTrainer,
  [TrainingMode.HandReading]: HandReadingTrainer,
  [TrainingMode.StackDepth]: StackDepthTrainer,
  [TrainingMode.Spr]: SprTrainer,
  [TrainingMode.PlayerTypes]: PlayerTypesTrainer,
  [TrainingMode.Bluff]: BluffTrainer,
  [TrainingMode.SemiBluff]: SemiBluffTrainer,
  [TrainingMode.ValueBetting]: ValueBettingTrainer,
  [TrainingMode.River]: RiverTrainer,
  [TrainingMode.ComboCounting]: ComboCountingTrainer,
  [TrainingMode.DecisionTree]: DecisionTreeTrainer,
  [TrainingMode.VillainProfiling]: VillainProfilingTrainer,
  [TrainingMode.Hud]: HudTrainer,
  [TrainingMode.MentalGame]: MentalGameTrainer,
  [TrainingMode.SessionReview]: SessionReview,
  [TrainingMode.HandAnalyzer]: HandAnalyzer,
  [TrainingMode.Replay]: ReplaySimulator,
  [TrainingMode.ScenarioBuilder]: ScenarioBuilder,
};

const modeRoutes = Object.values(MODE_BY_ID).map((meta) => {
  const Component = MODE_COMPONENT[meta.mode];
  return { path: meta.path, element: <Component /> };
});

// Vite injects the deploy base (e.g. "/pocker-trainer/") as BASE_URL; React
// Router wants a basename without the trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createBrowserRouter(
  [
    { path: ROUTES.home, element: <StartScreen /> },
    { path: ROUTES.stats, element: <StatsDashboard /> },
    { path: ROUTES.audit, element: <AuditLog /> },
    ...modeRoutes,
    { path: "*", element: <Navigate to={ROUTES.home} replace /> },
  ],
  { basename: basename || "/" },
);

import { createBrowserRouter, Navigate } from "react-router-dom";
import { MODE_BY_ID, ROUTES } from "@/types/training";
import { MODE_COMPONENT } from "@/modes/componentMap";
import { StartScreen } from "@/screens/StartScreen";
import { StatsDashboard } from "@/screens/StatsDashboard";
import { AuditLog } from "@/screens/AuditLog";
import { ShuffleRunner } from "@/screens/ShuffleRunner";

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
    { path: ROUTES.shuffle, element: <ShuffleRunner /> },
    ...modeRoutes,
    { path: "*", element: <Navigate to={ROUTES.home} replace /> },
  ],
  { basename: basename || "/" },
);

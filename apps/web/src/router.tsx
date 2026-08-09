import { createRouter, createRoute, Route } from '@tanstack/react-router';
import { rootRoute } from './routes/__root';
import { indexRoute } from './routes/index';
import { calculatorRoute } from './routes/calculator';
import { historyRoute } from './routes/history';
import { presetsRoute } from './routes/presets';
import { settingsRoute } from './routes/settings';
import { loginRoute } from './routes/auth/login';
import { registerRoute } from './routes/auth/register';
import { authGuard } from './guards/authGuard';
import { guestGuard } from './guards/guestGuard';

const routeTree = rootRoute.addChildren([
  indexRoute,
  calculatorRoute,
  historyRoute,
  presetsRoute,
  settingsRoute,
  loginRoute.addGuard(guestGuard),
  registerRoute.addGuard(guestGuard),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as calculatorRoute } from './routes/calculator';
import { Route as historyRoute } from './routes/history';
import { Route as presetsRoute } from './routes/presets';
import { Route as settingsRoute } from './routes/settings';
import { Route as loginRoute } from './routes/auth/login';
import { Route as registerRoute } from './routes/auth/register';
import { authGuard, guestGuard } from './guards/authGuard';

const routeTree = rootRoute.addChildren([
  indexRoute,
  calculatorRoute,
  historyRoute,
  presetsRoute,
  settingsRoute,
  loginRoute,
  registerRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
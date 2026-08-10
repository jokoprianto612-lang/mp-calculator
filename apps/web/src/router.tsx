import { createRouter, createRoute } from '@tanstack/react-router';
import { rootRoute } from './routes/__root';
import { indexRoute } from './routes/index';
import { calculatorRoute } from './routes/calculator';
import { historyRoute } from './routes/history';
import { presetsRoute } from './routes/presets';
import { settingsRoute } from './routes/settings';
import { translationRoute } from './routes/translation';
import { loginRoute } from './routes/auth/login';
import { registerRoute } from './routes/auth/register';

const routeTree = rootRoute.addChildren([
  indexRoute,
  calculatorRoute,
  historyRoute,
  presetsRoute,
  settingsRoute,
  translationRoute,
  loginRoute,
  registerRoute,
  // Aliases for legacy paths used in <Link to="/login"> etc.
  // Alias routes - simple placeholders (redirected to real routes by client)
  createRoute({ getParentRoute: () => rootRoute, path: '/login' } as any),
  createRoute({ getParentRoute: () => rootRoute, path: '/register' } as any),
  createRoute({ getParentRoute: () => rootRoute, path: '/profile' } as any),
  createRoute({ getParentRoute: () => rootRoute, path: '/forgot-password' } as any),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

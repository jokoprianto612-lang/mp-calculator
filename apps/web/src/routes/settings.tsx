import { createRoute } from '@tanstack/react-router';
import { SettingsPage } from '../components/settings/SettingsPage';
import { rootRoute } from '../routes/__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});
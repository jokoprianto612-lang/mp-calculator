import { createRoute } from '@tanstack/react-router';
import { PresetsPage } from '../components/presets/PresetsPage';
import { rootRoute } from '../routes/__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/presets',
  component: PresetsPage,
});
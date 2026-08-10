import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PresetsPage } from '../components/presets/PresetsPage';

export const presetsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/presets',
  component: () => <PresetsPage />,
});
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { rootRoute } from './__root';
import { HistoryPage } from '../components/history/HistoryPage';

export const historyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/history',
  component: () => <HistoryPage />,
});
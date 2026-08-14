import { createRoute } from '@tanstack/react-router';
import { HistoryPage } from '../components/history/HistoryPage';
import { rootRoute } from '../routes/__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
});
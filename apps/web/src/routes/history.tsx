import { createFileRoute } from '@tanstack/react-router';
import { HistoryPage } from '../components/history/HistoryPage';

export const historyRoute = createFileRoute('/history')({
  component: () => <HistoryPage />,
});
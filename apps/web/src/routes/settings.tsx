import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '../components/settings/SettingsPage';

export const settingsRoute = createFileRoute('/settings')({
  component: SettingsPage,
});
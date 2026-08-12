import { createFileRoute } from '@tanstack/react-router';
import { PresetsPage } from '../components/presets/PresetsPage';

export const presetsRoute = createFileRoute('/presets')({
  component: PresetsPage,
});
import { createFileRoute } from '@tanstack/react-router';
import { TranslationPage } from '../../components/translation/TranslationPage';

export const translationRoute = createFileRoute('/translation')({
  component: () => <TranslationPage />,
});
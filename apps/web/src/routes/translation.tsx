import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { TranslationPage } from '../components/translation/TranslationPage';

export const translationRoute = createRoute({ getParentRoute: () => rootRoute, path: '/translation',
  component: () => <TranslationPage />,
});

import 'i18next';
import translationEs from '../locales/es/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof translationEs;
    };
  }
}
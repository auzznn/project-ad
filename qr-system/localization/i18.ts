import { I18n } from 'i18n-js';
import en from './en';
import ms from './ms';

const i18n = new I18n();

i18n.translations = {
  en,
  ms,
};

i18n.defaultLocale = 'en';
i18n.locale = 'en';

export default i18n;

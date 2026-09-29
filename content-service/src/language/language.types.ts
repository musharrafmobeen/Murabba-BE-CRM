export type LanguageChrome = {
  menuLabel: string;
  title: string;
};

export type LanguageOption = {
  code: string;
  name: { en: string; ar: string };
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
};

export type LanguageContent = {
  defaultMode: 'system';
  fallbackCode: string;
  en: LanguageChrome;
  ar: LanguageChrome;
  languages: LanguageOption[];
};

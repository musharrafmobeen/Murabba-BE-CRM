export type HelpItem = {
  id: string;
  question: string;
  answer: string;
};

export type HelpCategory = {
  id: string;
  name: string;
  items: HelpItem[];
};

export type HelpLocale = {
  menuLabel: string;
  title: string;
  intro: string;
  emptyFallback: string;
  contactCta: string;
  categories: HelpCategory[];
};

export type HelpContent = {
  en: HelpLocale;
  ar: HelpLocale;
};

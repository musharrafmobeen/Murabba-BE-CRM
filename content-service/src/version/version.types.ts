export type VersionLocale = {
  menuLabel: string;
  title: string;
  fallback: string;
};

export type VersionContent = {
  version: string;
  build: string;
  channel: string;
  display: string;
  en: VersionLocale;
  ar: VersionLocale;
};

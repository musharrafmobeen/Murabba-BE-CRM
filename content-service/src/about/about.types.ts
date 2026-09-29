export type AboutLocale = {
  menuLabel: string;
  title: string;
  purposeTitle: string;
  purpose: string;
  featuresTitle: string;
  features: string[];
  missionTitle: string;
  mission: string;
};

export type AboutContent = {
  appVersion: string;
  imageUrl: string | null;
  en: AboutLocale;
  ar: AboutLocale;
};

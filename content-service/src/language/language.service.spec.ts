import { LanguageService } from './language.service.js';

const page = {
  id: 'lang-page-1',
  isActive: true,
  fallbackCode: 'en',
  en: { menuLabel: 'Language', title: 'Choose language' },
  ar: { menuLabel: 'اللغة', title: 'اختر اللغة' },
};

const languages = [
  {
    id: 'lang-ar',
    code: 'ar',
    nameEn: 'Arabic',
    nameAr: 'العربية',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    sortOrder: 0,
    isEnabled: true,
  },
  {
    id: 'lang-en',
    code: 'en',
    nameEn: 'English',
    nameAr: 'الإنجليزية',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    sortOrder: 1,
    isEnabled: true,
  },
];

describe('LanguageService', () => {
  const pages = {
    findOne: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({ id: 'new-page', ...data })),
    save: vi.fn(async (row) => row),
    createQueryBuilder: vi.fn(() => ({
      update: () => ({ set: () => ({ execute: vi.fn() }) }),
    })),
    remove: vi.fn(),
  };
  const languageRepo = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({ id: 'new-lang', ...data })),
    save: vi.fn(async (row) => row),
    remove: vi.fn(),
  };

  const service = new LanguageService(pages as never, languageRepo as never);

  beforeEach(() => {
    vi.clearAllMocks();
    pages.findOne.mockResolvedValue(page);
    languageRepo.find.mockResolvedValue(languages);
    languageRepo.findOneBy.mockResolvedValue(languages[0]);
  });

  it('returns Arabic and English options with RTL/LTR', async () => {
    const body = await service.get();
    expect(body.en.title).toBe('Choose language');
    expect(body.ar.menuLabel).toBe('اللغة');
    expect(body.defaultMode).toBe('system');
    expect(body.fallbackCode).toBe('en');
    expect(body.languages.map((item) => item.code)).toEqual(['ar', 'en']);
    expect(body.languages[0].direction).toBe('rtl');
    expect(body.languages[1].direction).toBe('ltr');
  });

  it('creates a language option', async () => {
    const row = await service.createLanguage({
      code: 'AR',
      nameEn: 'Arabic',
      nameAr: 'العربية',
      nativeName: 'العربية',
      flag: '🇸🇦',
      direction: 'rtl',
    });
    expect(row.code).toBe('ar');
    expect(languageRepo.save).toHaveBeenCalled();
  });
});

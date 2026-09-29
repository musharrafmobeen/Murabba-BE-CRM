import { AboutService } from './about.service.js';
import { ErrorCode } from '../common/errors.js';

const page = {
  id: 'about-1',
  appVersion: '1.0.0',
  imageUrl: null,
  isActive: true,
  en: {
    menuLabel: 'About the App',
    title: 'About Murabba',
    purposeTitle: 'What is this app?',
    purpose: 'Purpose',
    featuresTitle: 'Features',
    features: ['Explore', 'Share', 'Connect'],
    missionTitle: 'Mission',
    mission: 'Mission text',
  },
  ar: {
    menuLabel: 'حول التطبيق',
    title: 'حول مربّع',
    purposeTitle: 'ما هذا التطبيق؟',
    purpose: 'الغرض',
    featuresTitle: 'الميزات',
    features: ['استكشف', 'شارك', 'تواصل'],
    missionTitle: 'الرؤية',
    mission: 'نص الرؤية',
  },
};

describe('AboutService', () => {
  const pages = {
    findOne: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({ id: 'about-2', ...data })),
    save: vi.fn(async (row) => row),
    createQueryBuilder: vi.fn(() => ({
      update: () => ({ set: () => ({ execute: vi.fn() }) }),
    })),
    remove: vi.fn(),
  };

  const service = new AboutService(pages as never);

  beforeEach(() => {
    vi.clearAllMocks();
    pages.findOne.mockResolvedValue(page);
    pages.find.mockResolvedValue([page]);
    pages.findOneBy.mockResolvedValue(page);
  });

  it('returns bilingual about content from the table', async () => {
    const body = await service.get();
    expect(body.en.menuLabel).toBe('About the App');
    expect(body.ar.menuLabel).toBe('حول التطبيق');
    expect(body.en.features.length).toBeGreaterThanOrEqual(3);
  });

  it('creates an about page', async () => {
    const created = await service.create({
      appVersion: '1.1.0',
      en: page.en,
      ar: page.ar,
    });
    expect(created.appVersion).toBe('1.1.0');
    expect(pages.save).toHaveBeenCalled();
  });

  it('throws when a page is missing', async () => {
    pages.findOneBy.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toMatchObject({
      response: { error: ErrorCode.CONTENT_NOT_FOUND },
    });
  });
});

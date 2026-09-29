import { VersionService } from './version.service.js';

const row = {
  id: 'ver-1',
  version: '1.0.0',
  build: '20250707',
  channel: 'production',
  isActive: true,
  en: {
    menuLabel: 'App Version',
    title: 'App Version',
    fallback: 'Version: Unknown',
  },
  ar: {
    menuLabel: 'إصدار التطبيق',
    title: 'إصدار التطبيق',
    fallback: 'الإصدار: غير معروف',
  },
};

describe('VersionService', () => {
  const versions = {
    findOne: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({ id: 'ver-2', ...data })),
    save: vi.fn(async (item) => item),
    createQueryBuilder: vi.fn(() => ({
      update: () => ({ set: () => ({ execute: vi.fn() }) }),
    })),
    remove: vi.fn(),
  };

  const config = {
    get: vi.fn((key: string) => {
      const values: Record<string, string> = {
        APP_VERSION: '2.0.0',
        APP_BUILD: '20260928',
        APP_CHANNEL: 'staging',
      };
      return values[key];
    }),
  };

  const service = new VersionService(versions as never, config as never);

  beforeEach(() => {
    vi.clearAllMocks();
    versions.findOne.mockResolvedValue(row);
    versions.findOneBy.mockResolvedValue(row);
  });

  it('returns a read-only version footer line from the table', async () => {
    const body = await service.get();
    expect(body.display).toBe('v1.0.0 | Build 20250707');
    expect(body.version).toBe('1.0.0');
    expect(body.en.menuLabel).toBe('App Version');
    expect(body.ar.menuLabel).toBe('إصدار التطبيق');
  });

  it('creates a version row', async () => {
    const created = await service.create({
      version: '1.1.0',
      build: '20260928',
      en: row.en,
      ar: row.ar,
    });
    expect(created.version).toBe('1.1.0');
    expect(versions.save).toHaveBeenCalled();
  });

  it('falls back to env when no version row exists', async () => {
    versions.findOne.mockResolvedValue(null);
    const body = await service.get();
    expect(body.version).toBe('2.0.0');
    expect(body.build).toBe('20260928');
    expect(body.channel).toBe('staging');
    expect(body.display).toBe('v2.0.0 | Build 20260928');
  });
});

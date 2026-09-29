import { HelpService } from './help.service.js';

const helpPage = {
  id: 'help-page-1',
  isActive: true,
  en: {
    menuLabel: 'Help Center',
    title: 'Help Center',
    intro: 'Find quick answers.',
    emptyFallback: 'Unable to load help content. Please try again later.',
    contactCta: 'Contact Us',
  },
  ar: {
    menuLabel: 'مركز المساعدة',
    title: 'مركز المساعدة',
    intro: 'اعثر على إجابات.',
    emptyFallback: 'تعذر التحميل.',
    contactCta: 'تواصل معنا',
  },
};

const categories = [
  { id: 'cat-1', slug: 'login', sortOrder: 0, nameEn: 'Login', nameAr: 'تسجيل الدخول' },
  { id: 'cat-2', slug: 'account', sortOrder: 1, nameEn: 'Account', nameAr: 'الحساب' },
];

const items = [
  {
    id: 'item-1',
    categoryId: 'cat-1',
    slug: 'otp-not-received',
    sortOrder: 0,
    questionEn: 'Why didn’t I receive my OTP?',
    answerEn: 'Check the number format.',
    questionAr: 'لماذا لم يصل رمز التحقق؟',
    answerAr: 'تأكد من صيغة الرقم.',
  },
];

describe('HelpService', () => {
  const pages = {
    findOne: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({ id: 'new', ...data })),
    save: vi.fn(async (row) => row),
    createQueryBuilder: vi.fn(() => ({
      update: () => ({ set: () => ({ execute: vi.fn() }) }),
    })),
    remove: vi.fn(),
  };
  const categoryRepo = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({ id: 'cat-new', ...data })),
    save: vi.fn(async (row) => row),
    remove: vi.fn(),
  };
  const itemRepo = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({ id: 'item-new', ...data })),
    save: vi.fn(async (row) => row),
    remove: vi.fn(),
  };

  const service = new HelpService(
    pages as never,
    categoryRepo as never,
    itemRepo as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    pages.findOne.mockResolvedValue(helpPage);
    categoryRepo.find.mockResolvedValue(categories);
    itemRepo.find.mockResolvedValue(items);
    categoryRepo.findOneBy.mockResolvedValue(categories[0]);
  });

  it('returns bilingual categories and accordion items from tables', async () => {
    const body = await service.get();
    expect(body.en.menuLabel).toBe('Help Center');
    expect(body.ar.menuLabel).toBe('مركز المساعدة');
    expect(body.en.categories.map((c) => c.id)).toEqual(
      body.ar.categories.map((c) => c.id),
    );
    expect(body.en.categories[0].items[0].question.length).toBeGreaterThan(0);
  });

  it('creates a help category', async () => {
    const row = await service.createCategory({
      slug: 'billing',
      nameEn: 'Billing',
      nameAr: 'الفوترة',
    });
    expect(row.slug).toBe('billing');
    expect(categoryRepo.save).toHaveBeenCalled();
  });
});

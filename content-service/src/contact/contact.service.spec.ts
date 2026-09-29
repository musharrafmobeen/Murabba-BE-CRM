import { HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import { ErrorCode } from '../common/errors.js';

describe('ContactService', () => {
  const submissions = {
    count: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn(async (row) => ({ id: 'ticket-1', ...row })),
  };

  const typesRepo = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({ id: 'type-1', ...data })),
    save: vi.fn(async (row) => row),
    remove: vi.fn(),
  };

  const service = new ContactService(submissions as never, typesRepo as never);

  beforeEach(() => {
    vi.clearAllMocks();
    submissions.count.mockResolvedValue(0);
    typesRepo.findOneBy.mockImplementation(async (where: { code?: string }) =>
      where.code ? { id: 'type-1', code: where.code } : null,
    );
    typesRepo.find.mockResolvedValue([
      { code: 'FEEDBACK', labelEn: 'Feedback', labelAr: 'ملاحظات', sortOrder: 0 },
      { code: 'BUG_REPORT', labelEn: 'Bug Report', labelAr: 'بلاغ عن خلل', sortOrder: 1 },
      {
        code: 'FEATURE_REQUEST',
        labelEn: 'Feature Request',
        labelAr: 'طلب ميزة',
        sortOrder: 2,
      },
      {
        code: 'ACCOUNT_ISSUE',
        labelEn: 'Account Issue',
        labelAr: 'مشكلة في الحساب',
        sortOrder: 3,
      },
      { code: 'OTHER', labelEn: 'Other', labelAr: 'أخرى', sortOrder: 4 },
    ]);
  });

  const valid = {
    phone: '+96651234567',
    email: 'user@example.com',
    title: 'Cannot login',
    type: 'ACCOUNT_ISSUE',
    message: 'I cannot sign in with my phone number today.',
    acceptedPrivacy: true,
  };

  it('stores a valid submission', async () => {
    const result = await service.create(valid);

    expect(result.id).toBe('ticket-1');
    expect(result.message.en).toContain('Thank you');
    expect(result.message.ar.length).toBeGreaterThan(0);
    expect(submissions.save).toHaveBeenCalled();
  });

  it('requires phone or email', async () => {
    await expect(
      service.create({ ...valid, phone: '', email: '' }),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: { error: ErrorCode.CONTACT_PHONE_OR_EMAIL_REQUIRED },
    });
  });

  it('allows email only', async () => {
    await expect(
      service.create({ ...valid, phone: undefined }),
    ).resolves.toMatchObject({ id: 'ticket-1' });
  });

  it('rejects a short message', async () => {
    await expect(
      service.create({ ...valid, message: 'Too short' }),
    ).rejects.toMatchObject({
      response: { error: ErrorCode.MESSAGE_TOO_SHORT },
    });
  });

  it('requires privacy consent', async () => {
    await expect(
      service.create({ ...valid, acceptedPrivacy: false }),
    ).rejects.toMatchObject({
      response: { error: ErrorCode.PRIVACY_REQUIRED },
    });
  });

  it('rate limits repeat submissions', async () => {
    submissions.count.mockResolvedValue(3);

    await expect(service.create(valid)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
      response: { error: ErrorCode.CONTACT_RATE_LIMITED },
    });
  });

  it('returns bilingual type labels from the table', async () => {
    const { types } = await service.types();
    expect(types).toHaveLength(5);
    expect(types[0]).toEqual({
      value: 'FEEDBACK',
      label: { en: 'Feedback', ar: 'ملاحظات' },
    });
  });

  it('creates a contact type', async () => {
    const row = await service.createType({
      code: 'billing',
      labelEn: 'Billing',
      labelAr: 'الفوترة',
    });
    expect(row.code).toBe('BILLING');
    expect(typesRepo.save).toHaveBeenCalled();
  });
});

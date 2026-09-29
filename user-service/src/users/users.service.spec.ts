import { HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { ErrorCode } from '../common/errors.js';

describe('UsersService', () => {
  const users = {
    findOne: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn(async (row) => row),
    remove: vi.fn(),
  };
  const photos = {
    save: vi.fn(async () => 'profiles/u1.jpg'),
    remove: vi.fn(),
  };

  const service = new UsersService(users as never, photos as never);

  const user = {
    id: 'u1',
    username: 'Murabaa-1837',
    phone: '+96651234567',
    displayName: null as string | null,
    city: null as string | null,
    bio: null as string | null,
    photoPath: null as string | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    photos.save.mockResolvedValue('profiles/u1.jpg');
  });

  it('exposes profile fields and a local photo url', () => {
    expect(
      service.toPublic({ ...user, displayName: 'Mohammed Ahmed', photoPath: 'profiles/u1.jpg' }),
    ).toEqual({
      id: 'u1',
      username: 'Murabaa-1837',
      phone: '+96651234567',
      displayName: 'Mohammed Ahmed',
      city: null,
      bio: null,
      photoUrl: '/uploads/profiles/u1.jpg',
      isAdvertiser: false,
    });
  });

  it('updates city and bio', async () => {
    const saved = await service.updateProfile(user as never, {
      city: 'Riyadh',
      bio: 'Real estate expert.',
    });
    expect(saved.city).toBe('Riyadh');
    expect(users.save).toHaveBeenCalled();
  });

  it('stores a jpeg on local disk via the photo store', async () => {
    const saved = await service.savePhoto(user as never, {
      buffer: Buffer.from('fake'),
      mimetype: 'image/jpeg',
      size: 12,
    });
    expect(photos.save).toHaveBeenCalled();
    expect(saved.photoPath).toBe('profiles/u1.jpg');
  });

  it('rejects a missing photo', async () => {
    await expect(service.savePhoto(user as never, undefined)).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: { error: ErrorCode.PHOTO_REQUIRED },
    });
  });

  it('rejects a non-image file', async () => {
    await expect(
      service.savePhoto(user as never, {
        buffer: Buffer.from('pdf'),
        mimetype: 'application/pdf',
        size: 4,
      }),
    ).rejects.toMatchObject({
      response: { error: ErrorCode.PHOTO_INVALID },
    });
  });
});

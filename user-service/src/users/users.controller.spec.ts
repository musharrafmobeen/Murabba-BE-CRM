import { HttpStatus } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { ErrorCode } from '../common/errors.js';

describe('UsersController', () => {
  const users = { findByUsername: vi.fn() };
  const follows = {};
  const controller = new UsersController(users as never, follows as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns available for a unique valid username', async () => {
    users.findByUsername.mockResolvedValue(null);
    await expect(controller.usernameAvailable('Murabaa-1837')).resolves.toEqual({
      available: true,
    });
  });

  it('returns unavailable when the username is taken', async () => {
    users.findByUsername.mockResolvedValue({ id: 'u1' });
    await expect(controller.usernameAvailable('Murabaa-1837')).resolves.toEqual({
      available: false,
    });
  });

  it('rejects an invalid username', async () => {
    await expect(controller.usernameAvailable('Mu')).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: { error: ErrorCode.USERNAME_INVALID },
    });
  });
});

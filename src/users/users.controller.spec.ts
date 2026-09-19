import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { ErrorCode } from '../common/errors.js';

describe('UsersController', () => {
  const users = { findByUsername: vi.fn() };
  let controller: UsersController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: users }],
    }).compile();
    controller = module.get(UsersController);
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

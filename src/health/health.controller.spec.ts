import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return a healthy status', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('user-service');
    expect(result.timestamp).toEqual(expect.any(String));
  });
});

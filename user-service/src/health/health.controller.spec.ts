import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('should return a healthy status', () => {
    const controller = new HealthController();
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('user-service');
    expect(result.timestamp).toEqual(expect.any(String));
  });
});

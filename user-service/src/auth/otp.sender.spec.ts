import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ConsoleOtpSender,
  JawalyOtpSender,
  createOtpSender,
} from './otp.sender.js';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
  AxiosError: class AxiosError extends Error {},
}));

describe('createOtpSender', () => {
  it('uses the console sender when 4Jawaly is not configured', () => {
    expect(createOtpSender({})).toBeInstanceOf(ConsoleOtpSender);
  });

  it('uses 4Jawaly when key, secret, and sender are set', () => {
    expect(
      createOtpSender({
        apiKey: 'key',
        apiSecret: 'secret',
        sender: 'METR',
      }),
    ).toBeInstanceOf(JawalyOtpSender);
  });
});

describe('JawalyOtpSender', () => {
  afterEach(() => {
    vi.mocked(axios.post).mockReset();
    delete process.env.NODE_ENV;
  });

  it('posts the OTP to the 4Jawaly send API', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      status: 200,
      data: { job_id: 'job-1', messages: [{}] },
    });

    const sender = new JawalyOtpSender('key', 'secret', 'METR');
    await sender.send('+96651234567', '123456');

    expect(axios.post).toHaveBeenCalledWith(
      'https://api-sms.4jawaly.com/api/v1/account/area/sms/send',
      {
        messages: [
          {
            text: 'Your Metr verification code is 123456',
            numbers: ['96651234567'],
            sender: 'METR',
          },
        ],
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from('key:secret').toString('base64')}`,
        },
      },
    );
  });
});

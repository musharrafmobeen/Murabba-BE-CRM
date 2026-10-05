import { Logger } from '@nestjs/common';
import { toJawalyNumber } from '../common/utils.js';

export const OTP_SENDER = 'OTP_SENDER';
const JAWALY_SEND_URL =
  'https://api-sms.4jawaly.com/api/v1/account/area/sms/send';

export interface OtpSender {
  send(phone: string, code: string): Promise<void>;
}

export class ConsoleOtpSender implements OtpSender {
  private readonly logger = new Logger('OtpSender');

  async send(phone: string, code: string): Promise<void> {
    this.logger.log(`Recovery OTP for ${phone}: ${code}`);
  }
}

type JawalySendResponse = {
  job_id?: string;
  message?: string;
  messages?: Array<{ err_text?: string }>;
};

export class JawalyOtpSender implements OtpSender {
  private readonly logger = new Logger('OtpSender');
  private readonly fallback = new ConsoleOtpSender();
  private readonly auth: string;

  constructor(
    apiKey: string,
    apiSecret: string,
    private readonly sender: string,
  ) {
    this.auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  }

  async send(phone: string, code: string): Promise<void> {
    try {
      const response = await fetch(JAWALY_SEND_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.auth}`,
        },
        body: JSON.stringify({
          messages: [
            {
              text: `Your Metr recovery verification code is ${code}`,
              numbers: [toJawalyNumber(phone)],
              sender: this.sender,
            },
          ],
        }),
      });

      const data = (await response.json()) as JawalySendResponse;
      const sendError = data.messages?.[0]?.err_text;
      if (!response.ok || sendError) {
        throw new Error(
          sendError ?? data.message ?? `4Jawaly status ${response.status}`,
        );
      }

      this.logger.log(`Recovery SMS sent to ${phone}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`4Jawaly SMS failed: ${message}`);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      await this.fallback.send(phone, code);
    }
  }
}

export function createOtpSender(config: {
  apiKey?: string;
  apiSecret?: string;
  sender?: string;
}): OtpSender {
  const logger = new Logger('OtpSender');
  const { apiKey, apiSecret, sender } = config;
  if (apiKey && apiSecret && sender) {
    logger.log(`Using 4Jawaly sender ${sender}`);
    return new JawalyOtpSender(apiKey, apiSecret, sender);
  }
  logger.warn('4Jawaly is not configured; OTPs will be logged in the console');
  return new ConsoleOtpSender();
}

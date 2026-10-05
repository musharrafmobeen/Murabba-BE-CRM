import { AboutPage } from '../about/about-page.entity.js';
import { ContactSubmission } from '../contact/contact-submission.entity.js';
import { ContactType } from '../contact/contact-type.entity.js';
import { RecoveryOtpSession } from '../contact/recovery-otp-session.entity.js';
import { HelpCategory } from '../help/help-category.entity.js';
import { HelpItem } from '../help/help-item.entity.js';
import { HelpPage } from '../help/help-page.entity.js';
import { AppLanguage } from '../language/app-language.entity.js';
import { LanguagePage } from '../language/language-page.entity.js';
import { AppVersion } from '../version/app-version.entity.js';

export function typeormOptions() {
  const sslEnabled = process.env.DB_SSL === 'true';

  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
      ContactSubmission,
      ContactType,
      RecoveryOtpSession,
      AboutPage,
      HelpPage,
      HelpCategory,
      HelpItem,
      AppVersion,
      LanguagePage,
      AppLanguage,
    ],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  };
}

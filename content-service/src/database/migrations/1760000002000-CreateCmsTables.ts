import type { MigrationInterface, QueryRunner } from 'typeorm';

const ABOUT_EN = {
  menuLabel: 'About the App',
  title: 'About Murabba',
  purposeTitle: 'What is this app?',
  purpose:
    'Murabba helps you explore what’s around you, share your moments, and connect with people in a simple, trusted way.',
  featuresTitle: 'What can you do with it?',
  features: [
    'Explore places and content near you',
    'Share your thoughts and moments',
    'Connect with others in the community',
  ],
  missionTitle: 'Why was it built?',
  mission:
    'Murabba was built so first-time visitors can quickly see the value of the app: discover, share, and belong — without noise or complexity.',
};

const ABOUT_AR = {
  menuLabel: 'حول التطبيق',
  title: 'حول مربّع',
  purposeTitle: 'ما هذا التطبيق؟',
  purpose:
    'يساعدك مربّع على استكشاف ما حولك، ومشاركة لحظاتك، والتواصل مع الآخرين بطريقة بسيطة وموثوقة.',
  featuresTitle: 'ماذا يمكنك أن تفعل به؟',
  features: [
    'استكشف الأماكن والمحتوى من حولك',
    'شارك أفكارك ولحظاتك',
    'تواصل مع الآخرين في المجتمع',
  ],
  missionTitle: 'لماذا أُنشئ؟',
  mission:
    'أُنشئ مربّع ليتمكن الزائر لأول مرة من فهم قيمة التطبيق بسرعة: اكتشف، شارك، وانتمِ — بدون تعقيد.',
};

const HELP_EN = {
  menuLabel: 'Help Center',
  title: 'Help Center',
  intro:
    'Find quick answers to common questions about signing in, your account, and using Murabba.',
  emptyFallback: 'Unable to load help content. Please try again later.',
  contactCta: 'Didn’t find your answer? Contact Us',
};

const HELP_AR = {
  menuLabel: 'مركز المساعدة',
  title: 'مركز المساعدة',
  intro:
    'اعثر على إجابات سريعة للأسئلة الشائعة حول تسجيل الدخول وحسابك واستخدام مربّع.',
  emptyFallback: 'تعذر تحميل محتوى المساعدة. يرجى المحاولة لاحقاً.',
  contactCta: 'لم تجد إجابتك؟ تواصل معنا',
};

const VERSION_EN = {
  menuLabel: 'App Version',
  title: 'App Version',
  fallback: 'Version: Unknown',
};

const VERSION_AR = {
  menuLabel: 'إصدار التطبيق',
  title: 'إصدار التطبيق',
  fallback: 'الإصدار: غير معروف',
};

const CAT = {
  login: '10000000-0000-4000-8000-000000000001',
  account: '10000000-0000-4000-8000-000000000002',
  features: '10000000-0000-4000-8000-000000000003',
  troubleshooting: '10000000-0000-4000-8000-000000000004',
};

export class CreateCmsTables1760000002000 implements MigrationInterface {
  name = 'CreateCmsTables1760000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "about_pages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "imageUrl" varchar,
        "appVersion" varchar NOT NULL DEFAULT '',
        "en" jsonb NOT NULL,
        "ar" jsonb NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "help_pages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "en" jsonb NOT NULL,
        "ar" jsonb NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "help_categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "slug" varchar NOT NULL UNIQUE,
        "sortOrder" int NOT NULL DEFAULT 0,
        "nameEn" varchar NOT NULL,
        "nameAr" varchar NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "help_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "categoryId" uuid NOT NULL REFERENCES "help_categories"("id") ON DELETE CASCADE,
        "slug" varchar NOT NULL UNIQUE,
        "sortOrder" int NOT NULL DEFAULT 0,
        "questionEn" varchar NOT NULL,
        "answerEn" text NOT NULL,
        "questionAr" varchar NOT NULL,
        "answerAr" text NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_help_items_categoryId" ON "help_items" ("categoryId")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "app_versions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "version" varchar NOT NULL,
        "build" varchar NOT NULL,
        "channel" varchar NOT NULL DEFAULT 'production',
        "en" jsonb NOT NULL,
        "ar" jsonb NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "contact_types" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar NOT NULL UNIQUE,
        "sortOrder" int NOT NULL DEFAULT 0,
        "labelEn" varchar NOT NULL,
        "labelAr" varchar NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `INSERT INTO "about_pages" ("appVersion", "imageUrl", "en", "ar", "isActive")
       VALUES ($1, NULL, $2::jsonb, $3::jsonb, true)`,
      ['1.0.0', JSON.stringify(ABOUT_EN), JSON.stringify(ABOUT_AR)],
    );

    await queryRunner.query(
      `INSERT INTO "help_pages" ("en", "ar", "isActive")
       VALUES ($1::jsonb, $2::jsonb, true)`,
      [JSON.stringify(HELP_EN), JSON.stringify(HELP_AR)],
    );

    await queryRunner.query(
      `INSERT INTO "help_categories" ("id", "slug", "sortOrder", "nameEn", "nameAr")
       VALUES
         ($1, 'login', 0, 'Login', 'تسجيل الدخول'),
         ($2, 'account', 1, 'Account', 'الحساب'),
         ($3, 'features', 2, 'Using the App', 'استخدام التطبيق'),
         ($4, 'troubleshooting', 3, 'Troubleshooting', 'استكشاف الأخطاء')`,
      [CAT.login, CAT.account, CAT.features, CAT.troubleshooting],
    );

    await queryRunner.query(
      `INSERT INTO "help_items"
        ("categoryId", "slug", "sortOrder", "questionEn", "answerEn", "questionAr", "answerAr")
       VALUES
         ($1, 'otp-not-received', 0,
          'Why didn’t I receive my OTP?',
          'Check that your mobile number is in international format (for example +9665…). The code is valid for 2 minutes. You can resend after 30 seconds, up to 3 times. After 3 wrong codes the number is locked for 5 minutes.',
          'لماذا لم يصل رمز التحقق؟',
          'تأكد أن رقم الجوال بالصيغة الدولية (مثل +9665…). الرمز صالح لمدة دقيقتين. يمكنك إعادة الإرسال بعد 30 ثانية حتى 3 مرات. بعد 3 رموز خاطئة يُقفل الرقم لمدة 5 دقائق.'),
         ($1, 'login-without-password', 1,
          'Can I log in without a password?',
          'Yes. Murabba uses your mobile number and a one-time code. There is no password.',
          'هل يمكنني الدخول بدون كلمة مرور؟',
          'نعم. يعتمد مربّع على رقم الجوال ورمز لمرة واحدة. لا توجد كلمة مرور.'),
         ($2, 'delete-account', 0,
          'How can I delete my account?',
          'Open the app while logged in and use Delete account. This permanently removes your profile, as required by App Store guidelines.',
          'كيف أحذف حسابي؟',
          'افتح التطبيق وأنت مسجّل الدخول ثم استخدم حذف الحساب. يؤدي ذلك إلى إزالة ملفك نهائياً وفق متطلبات متجر التطبيقات.'),
         ($2, 'change-mobile', 1,
          'How do I change my mobile number?',
          'Changing a registered mobile number is not available in the app yet. Submit a Contact Us request with type Account Issue.',
          'كيف أغيّر رقم الجوال؟',
          'تغيير الرقم المسجّل غير متاح في التطبيق حالياً. أرسل طلباً من تواصل معنا بنوع «مشكلة في الحساب».'),
         ($3, 'guest-access', 0,
          'What can I do without logging in?',
          'You can open About the App, Help Center, and Contact Us without an account. Sign in with your mobile number when you want to use your profile.',
          'ماذا يمكنني أن أفعل بدون تسجيل الدخول؟',
          'يمكنك فتح حول التطبيق ومركز المساعدة وتواصل معنا بدون حساب. سجّل الدخول برقم الجوال عندما تريد استخدام ملفك.'),
         ($3, 'save-share', 1,
          'How do I save or share content?',
          'Sharing and saving will appear in the app as those features roll out. Until then, use Help Center or Contact Us if you need support.',
          'كيف أحفظ المحتوى أو أشاركه؟',
          'ستظهر ميزات الحفظ والمشاركة مع إطلاقها. حتى ذلك الحين استخدم مركز المساعدة أو تواصل معنا.'),
         ($4, 'otp-locked', 0,
          'I entered the wrong code too many times. What now?',
          'After 3 failed attempts you must wait 5 minutes, then request a new code. Starting a new login will not skip the lock.',
          'أدخلت الرمز خطأ عدة مرات. ماذا أفعل؟',
          'بعد 3 محاولات فاشلة انتظر 5 دقائق ثم اطلب رمزاً جديداً. بدء تسجيل دخول جديد لن يتجاوز القفل.'),
         ($4, 'phone-already-registered', 1,
          'The app says my phone is already registered.',
          'Use Log in instead of Sign up with that number. If you no longer have access, contact support from Contact Us.',
          'التطبيق يقول إن رقمي مسجّل مسبقاً.',
          'استخدم تسجيل الدخول بدل إنشاء حساب لنفس الرقم. إذا فقدت الوصول، تواصل معنا من نموذج الدعم.')`,
      [CAT.login, CAT.account, CAT.features, CAT.troubleshooting],
    );

    await queryRunner.query(
      `INSERT INTO "app_versions" ("version", "build", "channel", "en", "ar", "isActive")
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, true)`,
      [
        '1.0.0',
        '20250707',
        'production',
        JSON.stringify(VERSION_EN),
        JSON.stringify(VERSION_AR),
      ],
    );

    await queryRunner.query(`
      INSERT INTO "contact_types" ("code", "sortOrder", "labelEn", "labelAr")
      VALUES
        ('FEEDBACK', 0, 'Feedback', 'ملاحظات'),
        ('BUG_REPORT', 1, 'Bug Report', 'بلاغ عن خلل'),
        ('FEATURE_REQUEST', 2, 'Feature Request', 'طلب ميزة'),
        ('ACCOUNT_ISSUE', 3, 'Account Issue', 'مشكلة في الحساب'),
        ('OTHER', 4, 'Other', 'أخرى')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "help_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "help_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "help_pages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "about_pages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "app_versions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_types"`);
  }
}

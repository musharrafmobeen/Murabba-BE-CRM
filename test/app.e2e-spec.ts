import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { OTP_SENDER } from './../src/auth/otp.sender.js';

describe('UserService (e2e)', () => {
  let app: INestApplication<App>;
  let lastCode = '';
  const suffix = Date.now().toString().slice(-7);
  const phone = `+1555${suffix}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OTP_SENDER)
      .useValue({
        send: async (_phone: string, code: string) => {
          lastCode = code;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  it('/health (GET)', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('signs up, reads the current user, and logs out', async () => {
    const username = `user${phone.slice(-6)}`;
    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ phone, username, acceptedTerms: true })
      .expect(201);

    const verify = await request(app.getHttpServer())
      .post('/auth/otp/verify')
      .send({ sessionId: signup.body.sessionId, code: lastCode })
      .expect(201);

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${verify.body.accessToken}`)
      .expect(200);

    expect(me.body).toMatchObject({ phone, username });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${verify.body.accessToken}`)
      .expect(201);
  });

  it('rejects a second signup for the same phone', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        phone,
        username: `other${phone.slice(-6)}`,
        acceptedTerms: true,
      })
      .expect(409)
      .expect((res) => {
        expect(res.body.error).toBe('PHONE_ALREADY_REGISTERED');
      });
  });

  it('rejects an incorrect OTP', async () => {
    const otpPhone = `+1556${suffix}`;
    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        phone: otpPhone,
        username: `otp${suffix.slice(-5)}`,
        acceptedTerms: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/otp/verify')
      .send({ sessionId: signup.body.sessionId, code: '000000' })
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('OTP_INVALID');
        expect(res.body.attemptsRemaining).toBe(2);
      });
  });

  it('rejects login for an unknown phone', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: '+15550000001' })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('PHONE_NOT_REGISTERED');
      });
  });

  it('deletes the account', async () => {
    const deletePhone = `+1558${suffix}`;
    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        phone: deletePhone,
        username: `del${suffix.slice(-5)}`,
        acceptedTerms: true,
      })
      .expect(201);

    const verify = await request(app.getHttpServer())
      .post('/auth/otp/verify')
      .send({ sessionId: signup.body.sessionId, code: lastCode })
      .expect(201);

    await request(app.getHttpServer())
      .delete('/auth/account')
      .set('Authorization', `Bearer ${verify.body.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: deletePhone })
      .expect(404);
  });
});

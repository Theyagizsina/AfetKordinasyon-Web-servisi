import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_TLS,
  SMTP_USERNAME,
  ANTP,
  SMTP_FROM
} from "../config/index";
interface MailInterface {
  from?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
}

export default async () => {
  try {
    const mailService = MailService.getInstance();
    if (ANTP !== "production") {
      const mailer = await mailService.createLocalConnection();
      console.log("Mailer Instance Created")

      return mailer;
    } else {
      const mailer = await mailService.createConnection();
      console.log("Mailer Instance Created")

      return mailer;
    }
  } catch (err) {
    console.log(err)
    return err;
  }
};

export class MailService {
  private static instance: MailService;
  private transporter: nodemailer.Transporter;

  private constructor() { }
  static getInstance() {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }
  async createLocalConnection() {
    let account = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }
  async createConnection() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_TLS,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
    });
  }
  async sendMail(
    requestId: string | number | string[],
    options: MailInterface
  ) {
    return await this.transporter.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
      .then((info) => {
        console.log(`${requestId} - Mail sent successfully!!`);
        console.log(
          `${requestId} - [MailResponse]=${info.response} [MessageID]=${info.messageId}`
        );
        if (ANTP !== "production") {
          console.log(
            `${requestId} - Nodemailer ethereal URL: ${nodemailer.getTestMessageUrl(
              info
            )}`
          );
        }
        return info;
      });
  }
  async verifyConnection() {
    return this.transporter.verify();
  }
  getTransporter() {
    return this.transporter;
  }
}

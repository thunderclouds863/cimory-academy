import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },   
  debug: true,
  logger: true
});

(async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection OK");

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: "Test Email dari Cimory Academy",
      text: "Kalau kamu baca ini, SMTP works!"
    });
    console.log("✅ Email terkirim:", info.messageId);
  } catch (e) {
    console.error("❌ ERROR:", e.message);
  }
})();
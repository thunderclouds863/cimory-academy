import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Cimory Sales Academy" <noreply@cimory.com>`,
    to,
    subject,
    text: text || html.replace(/<[^>]*>/g, ""),
    html,
  });
  console.log("📧 Email terkirim:", info.messageId);
  return info;
}
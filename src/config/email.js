const nodemailer = require('nodemailer');
const env = require('./env');

const isConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.ethereal.email',
  port: env.SMTP_PORT || 587,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

module.exports = {
  transporter,
  isConfigured,
  fromEmail: env.SMTP_FROM
};

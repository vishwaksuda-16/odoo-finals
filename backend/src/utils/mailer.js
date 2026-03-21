const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendNotification = async (to, subject, text, html) => {
  transporter.sendMail({
    from: '"PLM Sentry" <nowshathyasir61@gmail.com>',
    to,
    subject,
    text,
    html
  })
  .then(() => console.log(` Email sent to ${to}`))
  .catch((error) => console.error(" Email failed:", error.message));
};

module.exports = { sendNotification };
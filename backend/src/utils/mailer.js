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

const stripHtml = (html = "") =>
  String(html)
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const buildHtmlTemplate = (subject, contentHtml) => `
<div style="margin:0;padding:0;background:#eef2ff;font-family:Segoe UI,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 10px;background:#eef2ff;">
    <tr>
      <td align="center">
        <table role="presentation" width="660" cellspacing="0" cellpadding="0" style="max-width:660px;width:100%;background:#ffffff;border:1px solid #dbeafe;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:20px 24px;color:#ffffff;">
              <div style="font-size:22px;font-weight:700;">PLM Sentry</div>
              <div style="font-size:13px;opacity:0.95;margin-top:4px;">Engineering Change Notification</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">${subject}</h2>
              <div style="font-size:14px;line-height:1.75;color:#334155;">
                ${contentHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#64748b;">Automated mail from PLM Sentry. For audit traceability only.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`;

const sendNotification = async (to, subject, text, html) => {
  const contentHtml = html || `<p>${String(text || "").replace(/\n/g, "<br/>")}</p>`;
  const formattedHtml = buildHtmlTemplate(subject, contentHtml);
  const plainText = text && text.trim() ? text.trim() : stripHtml(contentHtml);

  await transporter.sendMail({
    from: '"PLM Sentry" <nowshathyasir61@gmail.com>',
    to,
    subject,
    text: plainText,
    html: formattedHtml
  });
  console.log(` Email sent to ${to}`);
};

module.exports = { sendNotification };
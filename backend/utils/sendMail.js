require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text }) => {
  await transporter.sendMail({
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
};

const sendPasswordChangeEmail = async (email, name) => {
  const mailOptions = {
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Changed Successfully",
    html: `
      <p>Hi ${name},</p>
      <p>This is to confirm that your password or image was changed successfully.</p>
      <p>If you did not initiate this change, please contact support immediately.</p>
      <br/>
      <p>Regards,<br/>Task Manager Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordChangeEmail,
  sendEmail,
};

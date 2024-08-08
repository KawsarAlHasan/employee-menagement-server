const nodemailer = require("nodemailer");
require("dotenv").config();
const punycode = require("punycode/");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADD,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(data) {
  try {
    const {
      email,
      name,
      password,
      phone,
      type,
      salaryType,
      salaryRate,
      randomCode,
    } = data;

    const emailAddress = punycode.toASCII(email);

    const subject = "RMS Employee Information";
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                  <td>
                      <h2>Dear ${name},</h2>
                      <p>Welcome to joining our company. Your information given below:</p>
                      <h3>Details:</h3>
                      <ul>
                          <li><strong>Name:</strong> ${name}</li>
                          <li><strong>Email:</strong> ${email}</li>
                          <li><strong>Phone:</strong> ${phone}</li>
                          <li><strong>Role:</strong> ${type}</li>
                          <li><strong>Salary:</strong> ${salaryType}</li>
                          <li><strong>Salary Rate:</strong>$ ${salaryRate}</li>
                      </ul>
                      <p>Now you can login into your dashboard. Your login credentials are:</p>
                      <h3>Login Credential:</h3>
                      <ul>
                          <li><strong>Email:</strong> ${email}</li>
                          <li><strong>Password:</strong> ${password}</li>
                          <li><strong>PIN Code:</strong> ${randomCode}</li>
                      </ul>
                      <p>You need to clock-in when you start work. Our clocking apps:</p>
                      <ul>
                          <li><strong>Google Play Store:</strong> <a href="https://play.google.com/store/apps/">Play Store link</a></li>
                          <li><strong>Apple Store:</strong> <a href="https://www.apple.com/app-store/">Apple Store link</a></li>
                      </ul>
                      <p>If you have any questions or need further assistance, please do not hesitate to contact the admin.</p>
                      <p>Best regards,</p>
                      <p>Abu,<br>
                      Owner of RMS,<br>
                      BMS.<br>
                      +1938479403</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailAddress,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = { sendMail };

const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const punycode = require("punycode/");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(data) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER || "kawsaralhasan.420@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const emailAddress = punycode.toASCII(data.email);
    let subject = "RMS Employee Information";
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
                      <h2>Dear ${data.name},</h2>
                      <p>Welcome to joining our company. Your information given below:</p>
                      <h3>Details:</h3>
                      <ul>
                          <li><strong>Name:</strong> ${data.name}</li>
                          <li><strong>Email:</strong> ${data.email}</li>
                          <li><strong>Phone:</strong> ${data.phone}</li>
                          <li><strong>Role:</strong> ${data.type}</li>
                          <li><strong>Salary:</strong> ${data.salaryType}</li>
                          <li><strong>Salary Rate:</strong>$ ${data.salaryRate}</li>
                      </ul>
                      <p>Now you can login into your dashboard. Your login credentials are:</p>
                      <h3>Login Credential:</h3>
                      <ul>
                          <li><strong>Email:</strong> ${data.email}</li>
                          <li><strong>Password:</strong> ${data.password}</li>
                          <li><strong>PIN Code:</strong> ${data.randomCode}</li>
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
      from: `Kawsar 360 <${
        process.env.EMAIL_USER || "kawsaralhasan.360@gmail.com"
      }>`,
      to: emailAddress || data?.email,
      subject: subject,
      html: htmlContent,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = { sendMail };

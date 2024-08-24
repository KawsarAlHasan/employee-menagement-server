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
      business_name,
      business_address,
      percentage,
      email,
      name,
      password,
      phone,
      type,
      empType,
      empPosition,
      salaryType,
      salaryRate,
      randomCode,
    } = data;

    const emailAddress = punycode.toASCII(email);

    let subject = "";

    if (type == "admin") {
      subject = "BMS Admin Information";
    } else if (type == "Partner") {
      subject = "BMS Partner Information";
    } else {
      subject = "BMS Employee Information";
    }

    let htmlContent = "";

    if (type == "admin") {
      htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${business_name}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                  <td>
                      <h2>Dear ${name},</h2>
                      <p>Welcome to ${business_name}! We're excited to have you on board. Below is your account information:</p>
                      <h3>Business Details:</h3>
                      <ul>
                          <li><strong>Business Name:</strong> ${business_name}</li>
                          <li><strong>Business Address:</strong> ${business_address}</li>
                      </ul>
                      <h3>Your Account Details:</h3>
                      <ul>
                          <li><strong>Name:</strong> ${name}</li>
                          <li><strong>Email:</strong> ${email}</li>
                          <li><strong>Phone:</strong> ${phone}</li>
                      </ul>
                      <p>Your login credentials for the dashboard are as follows:</p>
                      <h3>Login Credentials:</h3>
                      <ul>
                          <li><strong>Email:</strong> ${email}</li>
                          <li><strong>Password:</strong> ${password}</li>
                      </ul>
                      <p>You will need to clock in when you start work. Here are the links to our clocking apps:</p>
                      <ul>
                          <li><strong>Google Play Store:</strong> <a href="https://play.google.com/store/apps/">Play Store link</a></li>
                          <li><strong>Apple Store:</strong> <a href="https://www.apple.com/app-store/">Apple Store link</a></li>
                      </ul>
                      <p>If you have any questions or need further assistance, please don't hesitate to contact us at ${business_name}.</p>
                      <p>Best regards,</p>
                      <p>Abu,<br>
                        Owner of BMS,<br>
                        BMS.<br>
                        +1938479403</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>`;
    } else if (type == "Partner") {
      htmlContent = `
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
                      <p>Welcome to becoming a partner of our company. Your information is given below:</p>
                      <h3>Business Details:</h3>
                      <ul>
                          <li><strong>Business Name:</strong> ${business_name}</li>
                          <li><strong>Business Address:</strong> ${business_address}</li>
                          <li><strong>Partner Name:</strong> ${name}</li>
                          <li><strong>Email:</strong> ${email}</li>
                          <li><strong>Phone:</strong> ${phone}</li>
                          <li><strong>Role:</strong> ${type}</li>
                          <li><strong>Partnership Percentage:</strong> ${percentage}%</li>
                      </ul>
                      <p>Now you can log in to your partner dashboard. Your login credentials are:</p>
                      <h3>Login Credential:</h3>
                      <ul>
                          <li><strong>Email:</strong> ${email}</li>
                          <li><strong>Password:</strong> ${password}</li>
                      </ul>
                      <p>If you have any questions or need further assistance, please do not hesitate to contact the admin.</p>
                      <p>Best regards,</p>
                      <p>Abu,<br>
                      Owner of BMS,<br>
                      BMS.<br>
                      +1938479403</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>`;
    } else {
      htmlContent = `
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
                          <li><strong>Employee Type:</strong> ${empType}</li>
                          <li><strong>Employee Position:</strong> ${empPosition}</li>
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
                      Owner of BMS,<br>
                      BMS.<br>
                      +1938479403</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>`;
    }

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

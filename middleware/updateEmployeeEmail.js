const nodemailer = require("nodemailer");
require("dotenv").config();
const punycode = require("punycode/");

// Hostinger SMTP credentials
let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADD,
    pass: process.env.EMAIL_PASS,
  },
});

async function updateEmpoyeeMail(data) {
  try {
    const {
      business_name,
      business_address,
      percentage,
      name,
      email,
      phone,
      type,
      employeeType,
      employeePosition,
      salaryType,
      salaryRate,
    } = data;

    const emailAddress = punycode.toASCII(email);

    let subject = "";

    // Define the subject based on the user type and purpose
    if (type === "Partner") {
      subject = "ABS Partner Account Update Information";
    } else {
      subject = "ABS Employee Account Update Information";
    }

    let htmlContent = "";

    // Admin Email Template
    if (type === "Partner") {
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ABS Account Update Information</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <h2>Dear ${name},</h2>
                        <p>We would like to inform you that your partnership details have been updated successfully.</p>
                        <h3>Updated Business Details:</h3>
                        <ul>
                            <li><strong>Business Name:</strong> ${business_name}</li>
                            <li><strong>Business Address:</strong> ${business_address}</li>
                            <li><strong>Partner Name:</strong> ${name}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Phone:</strong> ${phone}</li>
                            <li><strong>Role:</strong> ${type}</li>
                            <li><strong>Updated Partnership Percentage:</strong> ${percentage}%</li>
                        </ul>
                        <p>If you have any questions or need further assistance, please do not hesitate to contact the admin.</p>
                        <p>Best regards,</p>
                        <p>Abu,<br>
                        Owner of ABS,<br>
                        ABS.<br>
                        +1938479403</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>`;

      // Employee Email Template
    } else {
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ABS Account Update Information</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <h2>Dear ${name},</h2>
                        <p>We would like to inform you that your employee details have been updated successfully.</p>
                        <h3>Your Updated Details:</h3>
                        <ul>
                            <li><strong>Name:</strong> ${name}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Phone:</strong> ${phone}</li>
                            <li><strong>Role:</strong> ${type}</li>
                            <li><strong>Employee Type:</strong> ${employeeType}</li>
                            <li><strong>Employee Position:</strong> ${employeePosition}</li>
                            <li><strong>Updated Salary:</strong> ${salaryType}</li>
                            <li><strong>Updated Salary Rate:</strong>$ ${salaryRate}</li>
                        </ul>
                        <p>Please make sure to check your updated details. If you find any errors, contact the admin for further assistance.</p>
                        <p>Best regards,</p>
                        <p>Abu,<br>
                        Owner of ABS,<br>
                        ABS.<br>
                        +1938479403</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>`;
    }

    const mailOptions = {
      from: process.env.EMAIL_ADD,
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

module.exports = { updateEmpoyeeMail };

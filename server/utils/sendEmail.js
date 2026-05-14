const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If credentials aren't set, fallback to console log for development
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        console.log(`\n[EMAIL MOCK] To: ${options.email}\nSubject: ${options.subject}\nMessage: \n${options.message}\n`);
        return;
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'Gmail', // e.g. 'Gmail', 'SendGrid'
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
        },
    });

    // Define email options
    const mailOptions = {
        from: `SDMCET Certificate Tracker <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Setup email data
const mailOptions = {
    from: process.env.EMAIL_FROM, // sender address
    to: 'amanjha9808@gmail.com', // list of receivers
    subject: 'Test Email from Brevo', // Subject line
    text: 'Hello, this is a test email sent using Brevo SMTP!', // plain text body
    html: '<b>Hello, this is a test email sent using Brevo SMTP!</b>', // html body
};

// Send mail
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Error occurred: ' + error.message);
    }
    console.log('Message sent: %s', info.messageId);
});

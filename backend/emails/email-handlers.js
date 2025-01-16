// Add email sending functionality using Brevo
const { transporter, sender } = require('../config/brevo-config');
const {
    createWelcomeEmailTemplate,
    createConnectionAcceptedEmailTemplate,
    createCommentNotificationEmailTemplate
} = require('./email-Templates');

// Function to send welcome email
const sendWelcomeEmail = async (to, name, profileUrl) => {
    const htmlContent = createWelcomeEmailTemplate(name, profileUrl);
    await sendEmail(to, 'Welcome to UnLinked!', htmlContent);
};

// Function to send connection accepted email
const sendConnectionAcceptedEmail = async (to, senderName, recipientName, profileUrl) => {
    const htmlContent = createConnectionAcceptedEmailTemplate(senderName, recipientName, profileUrl);
    await sendEmail(to, 'Connection Request Accepted', htmlContent);
};

// Function to send comment notification email
const sendCommentNotificationEmail = async (to, recipientName, commenterName, postUrl, commentContent) => {
    const htmlContent = createCommentNotificationEmailTemplate(recipientName, commenterName, postUrl, commentContent);
    await sendEmail(to, 'New Comment on Your Post', htmlContent);
};

// Function to send email using Nodemailer
const sendEmail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: sender,
            to,
            subject,
            html: htmlContent,
        });
        console.log('Email sent successfully to:', to);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendConnectionAcceptedEmail,
    sendCommentNotificationEmail,
};

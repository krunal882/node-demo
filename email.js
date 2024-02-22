
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: "krunal vekariya <krunalvekariya254@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
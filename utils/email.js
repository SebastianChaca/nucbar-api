const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //Crear transporter
  const transport = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.envEMAIL_PORT,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });
  //Definir emial options
  const mailOptions = {
    from: 'seba chakra <seba@chakra.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transport.sendMail(mailOptions);
  // mandar el mail
};
module.exports = sendEmail;

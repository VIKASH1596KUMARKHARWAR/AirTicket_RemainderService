const sender = require("../config/email-config");

const sendBasicMail = async (mailFrom, mailTo, mailSubject, mailBody) => {
  try {
    const response = await sender.sendMail({
      from: mailFrom,
      to: mailTo,
      subject: mailSubject,
      text: mailBody,
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendBasicMail,
};

/**
 * SMTP -> a@b.com
 * receiver->d@e.com
 *
 * from:support@noti.com
 */

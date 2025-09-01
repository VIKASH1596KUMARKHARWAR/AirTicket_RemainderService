const cron = require("node-cron");
const emailService = require("../services/email-services");
const sender = require("../config/email-config");
/**
 * let assume we have to sent from 10:00 am
 * Every 5 minutes
 * We will check are their any pending emails which was expected to be sent by now and is pending
 */

const setupJobs = () => {
  cron.schedule("*/2 * * * * ", async () => {
    const response = await emailService.fetchPendingEmails();
    console.log(response);

    response.forEach((email) => {
      sender.sendMail(
        {
          to: email.recipientEmail,
          subject: email.subject,
          text: email.content,
        },
        async (err, data) => {
          if (err) {
            console.error("Error sending email:", err);
          } else {
            console.log("Email sent:", data);
            await emailService.updateTicket(email.id, { status: "SUCCESS" });
          }
        }
      );
    });
    console.log(response);
  });
};

module.exports = setupJobs;

/**
 *
 * [Service 1 (100qps) Publisher] ----------> message queue [ msg1,msg2 ...msg100 ]   ----------> [Service2 (20qps) Subscriber]
 *
 *
 * if want to use those msg after the process....we can even do that
 *
 * [Service2 (Publisher)] ----------> message queue [ msgs ] ----------> [Service 1 (Subscriber)]
 */

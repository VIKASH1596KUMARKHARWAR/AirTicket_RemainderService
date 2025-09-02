const cron = require("node-cron");
const emailService = require("../services/email-services");
const sender = require("../config/email-config");
/**
 * let assume we have to sent from 10:00 am
 * Every 5 minutes
 * We will check are their any pending emails which was expected to be sent by now and is pending
 */

const setupJobs = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      const pendingEmails = await emailService.fetchPendingEmails();
      console.log("Pending emails:", pendingEmails);

      for (const email of pendingEmails) {
        try {
          // 1️⃣ Send the email (under process / reminder)
          await sender.sendMail({
            to: email.recipientEmail,
            subject: email.subject,
            text: email.content,
          });
          console.log("Email sent:", email.recipientEmail);

          // 2️⃣ Update ticket status to SUCCESS
          await emailService.updateTicket(email.id, { status: "SUCCESS" });
          console.log(
            "Ticket status updated to SUCCESS for:",
            email.recipientEmail
          );

          // 3️⃣ Send final booking confirmation
          await sender.sendMail({
            to: email.recipientEmail,
            subject: "Booking Confirmed ✅",
            text: `Hello, your booking for ${
              email.noOfSeats || ""
            } seats is now confirmed. Happy journey! ✈️`,
          });
          console.log("📧 Booking confirmation sent to:", email.recipientEmail);
        } catch (err) {
          console.error(
            "Error processing email/ticket for",
            email.recipientEmail,
            err
          );
        }
      }
    } catch (err) {
      console.error("Error fetching pending emails:", err);
    }
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

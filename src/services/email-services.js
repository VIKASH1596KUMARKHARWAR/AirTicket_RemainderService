// /**
//  * SMTP -> a@b.com
//  * receiver->d@e.com
//  *
//  * from:support@noti.com
//  */
const sender = require("../config/email-config");
const TicketRepository = require("../repository/ticket-repository");

const repo = new TicketRepository();

// Send actual email
const sendBasicMail = async (mailFrom, mailTo, mailSubject, mailBody) => {
  try {
    const response = await sender.sendMail({
      from: mailFrom,
      to: mailTo,
      subject: mailSubject,
      text: mailBody,
    });
    console.log(`📧 Email sent to ${mailTo}:`, response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// Fetch pending emails from DB
const fetchPendingEmails = async (timestamp) => {
  try {
    const response = await repo.get({ status: "PENDING" });
    return response;
  } catch (error) {
    console.error("❌ Error fetching pending emails:", error);
  }
};

// Create ticket in DB
const createNotification = async (data) => {
  try {
    const email = data.recipientEmail || data.to;

    if (!email) {
      throw new Error("Missing recipient email for ticket");
    }

    const ticketPayload = {
      recipientEmail: email,
      subject: data.subject,
      content: data.content || data.body,
      status: "PENDING",
      notificationTime: data.notificationTime || new Date(),
    };

    const response = await repo.create(ticketPayload);
    console.log("✅ Ticket created in DB:", response.dataValues);

    // Optional: send "under process" email immediately
    await sendBasicMail(
      "support@noti.com",
      email,
      "Booking Under Process",
      `Hello, your booking for ${
        data.noOfSeats || ""
      } seats is under process. We will notify you once confirmed.`
    );

    return response;
  } catch (error) {
    console.error("❌ Error creating ticket or sending email:", error.message);
  }
};

// Update ticket in DB
const updateTicket = async (ticketId, data) => {
  try {
    const response = await repo.update(ticketId, data);
    console.log(`✅ Ticket updated:`, response.dataValues);
    return response;
  } catch (error) {
    console.error("❌ Error updating ticket:", error);
  }
};

// Main handler for subscriber
const subscribeEvents = async (payload) => {
  const { service, data } = payload;

  switch (service) {
    case "CREATE_TICKET":
      await createNotification(data); // inserts into DB
      break;

    case "SEND_BASIC_MAIL":
      await sendBasicMail("support@noti.com", data.to, data.subject, data.body); // sends actual email
      break;

    default:
      console.warn("⚠️ No valid event received:", service);
      break;
  }
};

module.exports = {
  sendBasicMail,
  fetchPendingEmails,
  createNotification,
  updateTicket,
  subscribeEvents,
};

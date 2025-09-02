const express = require("express");
const bodyParser = require("body-parser");
const { PORT, REMAINDER_BINDING_KEY } = require("./config/server-config");

const jobs = require("./utils/job");

const TicketController = require("./controllers/ticket-controller");
const { createChannel, subscribeMessage } = require("./utils/messageQueues");
const EmailService = require("./services/email-services");

const setupAndStartServer = async () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post("/api/v1/tickets", TicketController.create);

  // Start subscriber
  const channel = await createChannel();
  const bindingKey = String(REMAINDER_BINDING_KEY).replace(/['"]+/g, "").trim();
  await subscribeMessage(channel, bindingKey);

  app.listen(PORT, () => {
    console.log(`Server started at  ${PORT}`);
    jobs();
  });
};
setupAndStartServer();

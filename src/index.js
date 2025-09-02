const express = require("express");
const bodyParser = require("body-parser");
const { PORT } = require("./config/server-config");

const jobs = require("./utils/job");

const TicketController = require("./controllers/ticket-controller");
const { createChannel } = require("./utils/messageQueues");

const setupAndStartServer = async () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // const channel = await createChannel();

  app.post("/api/v1/tickets", TicketController.create);

  app.listen(PORT, () => {
    console.log(`Server started at  ${PORT}`);
    jobs();
  });
};
setupAndStartServer();

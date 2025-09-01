const express = require("express");
const bodyParser = require("body-parser");
const { PORT } = require("./config/server-config");

// const { sendBasicMail } = require("./services/email-services");
const jobs = require("./utils/job");

const TicketController = require("./controllers/ticket-controller");

const setupAndStartServer = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post("/api/v1/tickets", TicketController.create);

  app.listen(PORT, () => {
    console.log(`Server started at  ${PORT}`);
    jobs();
    // sendBasicMail(
    //   "support@admin.com",
    //   "vikashg1596@gmail.com",
    //   "This is a testing email",
    //   "Hey,how are you, hope u like this"
    //);
  });
};
setupAndStartServer();

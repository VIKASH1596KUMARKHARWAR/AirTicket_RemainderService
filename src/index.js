const express = require("express");
const bodyParser = require("body-parser");
const { PORT } = require("./config/server-config");

// const { sendBasicMail } = require("./services/email-services");

const setupAndStartServer = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.listen(PORT, () => {
    console.log(`Server started at  ${PORT}`);

    // sendBasicMail(
    //   "support@admin.com",
    //   "vikashg1596@gmail.com",
    //   "This is a testing email",
    //   "Hey,how are you, hope u like this"
    //);
  });
};
setupAndStartServer();

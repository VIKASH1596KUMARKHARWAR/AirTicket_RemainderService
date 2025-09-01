const TicketService = require("../services/email-services");

const create = async (req, res) => {
  try {
    const response = await TicketService.createNotification(req.body);
    return res.status(210).json({
      success: true,
      data: response,
      err: {},
      message: "Successfully registered an email remainder",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: data,
      err: error,
      message: "unable to  registered an email remainder",
    });
  }
};

module.exports = {
  create,
};

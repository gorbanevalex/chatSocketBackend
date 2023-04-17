const messageModel = require("../models/messageModel");

module.exports.addMessage = async (req, res) => {
  try {
    const doc = await new messageModel({
      message: req.body.message,
      users: [req.userId, req.body.to],
      sender: req.userId,
    });
    const message = await doc.save();
    res.json({
      msg: "Сообщение добавлено!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Произошла ошибка при добавлении сообщения!",
    });
  }
};

module.exports.getMessages = async (req, res) => {
  try {
    const doc = await messageModel
      .find({
        users: {
          $all: [req.userId, req.body.to],
        },
      })
      .sort({ updatedAt: 1 });
    if (doc) {
      const messages = doc.map((message) => {
        return {
          mySelf: message.sender.toString() === req.userId,
          text: message.message,
        };
      });
      return res.json(messages);
    } else {
      return res.status(400).json({
        msg: "Сообщений не найдено!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Произошла ошибка!",
    });
  }
};

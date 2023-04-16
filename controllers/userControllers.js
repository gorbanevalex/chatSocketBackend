const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res) => {
  const checkEMail = await userModel.findOne({
    email: req.body.email,
  });
  if (checkEMail) {
    return res.status(400).json({
      msg: "Упс! Кажется эта почта уже бывала у нас",
    });
  }
  const checkUsername = await userModel.findOne({
    username: req.body.username,
  });
  if (checkUsername) {
    return res.status(400).json({
      msg: "Хм... Кажется мы уже знаем такое имя пользователя",
    });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      req.body.password.toString(),
      salt
    );
    const doc = await new userModel({
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    res.json({
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Произошла ошибка на сервере, попробуйте чуть позже",
    });
  }
};

module.exports.login = async (req, res) => {
  try {
    const user = await userModel.findOne({
      username: req.body.username,
    });
    if (!user) {
      return res.status(403).json({
        msg: "Хм..Кажется мы вас не знаем, проверьте введенный данные",
      });
    }
    const isValidPassword = await bcrypt.compare(
      req.body.password.toString(),
      user.password
    );
    if (!isValidPassword) {
      return res.status(403).json({
        msg: "Хм..Кажется мы вас не знаем, проверьте введенный данные",
      });
    }
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" }
    );
    res.json({
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Произошла какая-то ошибка, попробуйте еще раз",
    });
  }
};

module.exports.getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    res.json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Не удалось получить пользователя!",
    });
  }
};

module.exports.getContacts = async (req, res) => {
  try {
    const contacts = await userModel
      .find({
        _id: { $ne: req.userId },
      })
      .select("email username avatarUrl _id");
    return res.json(contacts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Не удалось получить контакты!",
    });
  }
};

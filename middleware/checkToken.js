const jwt = require("jsonwebtoken");

module.exports.checkToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const decoded = jwt.verify(token, "secret123");
      req.userId = decoded._id;
      next();
    } catch (error) {
      return res.status(403).json({
        msg: "Не верно указан токен",
      });
    }
  } else {
    return res.status(403).json({
      msg: "Не верно указан токен",
    });
  }
};

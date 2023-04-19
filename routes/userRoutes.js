const {
  register,
  getMe,
  login,
  getContacts,
  updateAvatar,
} = require("../controllers/userControllers");
const { checkToken } = require("../middleware/checkToken");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", checkToken, getMe);
router.get("/contacts", checkToken, getContacts);
router.post('/avatar-update', checkToken, updateAvatar);

module.exports = router;

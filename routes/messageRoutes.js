const { addMessage, getMessages } = require("../controllers/messageController");
const { checkToken } = require("../middleware/checkToken");

const router = require("express").Router();

router.post("/add-message", checkToken, addMessage);
router.post("/get-messages", checkToken, getMessages);

module.exports = router;

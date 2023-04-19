const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const messageRouter = require("./routes/messageRoutes");
const socket = require("socket.io");
const multer = require('multer');

require("dotenv").config();
const app = express();

const storage = multer.diskStorage({
  destination: (_,__,cb) =>{
    cb(null,'avatars');
  },
  filename:(_,file,cb) =>{
    cb(null,file.originalname);
  }
})
const upload = multer({storage});

app.use(cors());
app.use(express.json());

app.use('/avatars',express.static('avatars'));
app.post('/avatars',upload.single('avatar'), (req,res)=>{
  try {
    res.json({
      url: `/avatars/${req.file.originalname}`,
    })
  } catch (error) {
    res.status(500).json({
      msg: 'Не удалось загрузить файл'
    })
  }
})

app.use("/", userRouter);
app.use("/chat", messageRouter);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT} port`);
});

mongoose
  .connect(
    `mongodb+srv://admin:${process.env.PASSWORD_MONGOBD}@chatsocketio.20jmb92.mongodb.net/chatSocketIo?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("MongoDb already!");
  });

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("send-message", (msg) => {
    const sendUresSocket = onlineUsers.get(msg.to);
    if (sendUresSocket) {
      socket.to(sendUresSocket).emit("message-recieve", msg.message);
    }
  });
});

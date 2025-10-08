const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { globalErrorHandeler } = require("./utils/globalErrorHandeler");
const app = express();
const http = require("http");
const { initSocket } = require("./Socket/server");

const server = http.createServer(app);
const io = initSocket(server);
/**
 * todo : All MidleWare
 * */
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));

/**
 * todo : routes will there
 * */

const apiVersion = process.env.BASE_URL;
app.use(`/api/v1`, require("./routes/index"));

/**
 * todo : error handle midleware
 * */

app.use(globalErrorHandeler);

module.exports = { server, io };

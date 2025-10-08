const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", { transports: ["websocket"], query: { userId: "123" } });

socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("cart", (data) => {
    console.log("Order sucessfully placed from server",data);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");

})
socket.on("connect_error", (error) => {
    console.log("Connection error:", error);
});
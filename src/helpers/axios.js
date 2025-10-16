const { default: axios } = require("axios");

const axiosinstance = axios.create({
  baseURL: process.env.COURIER_BASE_URL,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    "Api-Key": process.env.COURIER_API_KEY,
    "Secret-Key": process.env.COURIER_SECRET_KEY,
  },
});


module.exports = { axiosinstance };
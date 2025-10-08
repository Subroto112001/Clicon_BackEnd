const { dbName } = require("../constant/constant")
const mongoose = require("mongoose");

require("dotenv").config()

exports.DbConection = async () => {
    try {
        const status = await mongoose.connect(`${process.env.MONGODB_URL}/${dbName}`);
        console.log("database conect on hostid", status.connection.host);
        
    } catch (error) {
        console.log("database conection failed", error);
        
    }
}
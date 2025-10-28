require("dotenv").config();
const { dbName } = require("../constant/constant");
const mongoose = require("mongoose");
const roleModel = require("../models/role.model");

const DataBaseconnection = async () => {
  try {
    const databaseconnection = await mongoose.connect(
      `${process.env.MONGODB_URL}/${dbName}`
    );
    console.log("Database Connection sucessfully ", databaseconnection);
    await SeedRole();
  } catch (error) {
    console.log("Database Connection refused ", error);
  }
};

const SeedRole = async () => {
  try {
    await roleModel.deleteMany();

    const roledata = [
      {
        name: "admin",
      },
      {
        name: "manager",
      },
      {
        name: "user",
      },
      {
        name: "salesman",
      },
    ];
    const allrole = await roleModel.insertMany(roledata);
    console.log("Role Assign successfully", allrole);
  } catch (error) {
    console.log("error from seedRole", error);
  }
};
DataBaseconnection();

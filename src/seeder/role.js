require("dotenv").config();
const { dbName } = require("../constant/constant");
const mongoose = require("mongoose");
const roleModel = require("../models/role.model");
const permissionModel = require("../models/permission.model");

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
        const permission = await permissionModel.find()
        const roledata = [
            {
                name: "admin",
                permission: permission.map((item)=>item._id)
            },
            {
                name: "manager",
                permission: permission.filter((item) => {
                    if (item.name == "brand" || item.name == "category" || item.name == "subcategory") {
                        return item._id
                    }
                }) 
            }
        ]
        const allrole = await roleModel.insertMany(roledata);
        console.log("Role Assign successfully", allrole);
        
    } catch (error) {
        console.log("error from seedRole", error);
        
    }
}
DataBaseconnection();
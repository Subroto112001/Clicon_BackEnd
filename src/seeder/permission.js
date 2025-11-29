require("dotenv").config();
const { dbName } = require("../constant/constant");
const mongoose = require("mongoose");
const permissionModel = require("../models/permission.model");
const { default: slugify } = require("slugify");

const DataBaseconnection = async () => {
  try {
    const databaseconnection = await mongoose.connect(
      `${process.env.MONGODB_URL}/${dbName}`
    );
    console.log("Database Connection sucessfully ", databaseconnection);
    await seededPermission();
  } catch (error) {
    console.log("Database Connection refused ", error);
  }
};

// seed all permission resource

const seededPermission = async () => {
  try {
    // remove old permission
    await permissionModel.deleteMany();
    const permissonData = [
      {
        name: "category",
      },
      {
        name: "subcategory",
      },
      {
        name: "brand",
      },
      {
        name: "coupon",
      },
      {
        name: "deliverycharge",
      },
      {
        name: "discount",
      },
      {
        name: "invoice",
      },
      {
        name: "order",
      },
      {
        name: "permission",
      },
      {
        name: "product",
      },
      {
        name: "role",
      },
      {
        name: "variant",
      },
      {
        name: "user",
      },
      {name: "banner",}
    ];
 const finalData = permissonData.map((item) => ({
   ...item,
   slug: slugify(item.name, { lower: true }),
 }));
    const permissionsSeed = await permissionModel.insertMany(finalData);
    console.log("permission seed sucessfully", permissionsSeed);
  } catch (error) {
    console.log("error", error);
  }
};

DataBaseconnection();

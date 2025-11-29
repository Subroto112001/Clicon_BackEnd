require("dotenv").config();
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { customError } = require("../utils/customError");
const userSchema = new Schema({
  fristName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
  },

  compnayName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  image: {},
  adress: {
    type: String,
    trim: true,
  },
  isEmailverifyed: {
    type: Boolean,
    default: false,
  },
  isPhoneVerifyed: {
    type: Boolean,
    default: false,
  },
  role: [{
    type: Types.ObjectId, 
    ref: "Role",
  }],
  permission: [
    {
      permissionId: { type: Types.ObjectId, ref: "Permission" },
      actions: [{ type: String, enum: ["view", "add", "edit", "delete"] }],
    },
  ],
  region: {
    type: String,
    trim: true,
  },
  distric: {
    type: String,
    trim: true,
  },
  thana: {
    type: String,
    trim: true,
  },
  zipcode: {
    type: Number,
  },
  country: {
    type: String,
    trim: true,
    default: "Bangladesh",
  },
  dateofBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "custom"],
  },
  lastLogin: {
    type: Date,
  },
  lastlogout: {
    type: Date,
  },
  cart: [
    {
      type: Types.ObjectId,
      ref: "Product",
    },
  ],
  wishList: [
    {
      type: Types.ObjectId,
      ref: "Product",
    },
  ],
  newsLetterSubscribe: {
    type: Boolean,
  },
  resetPasswordOtp: {
    type: Number,
  },
  resetPasswordExpireTime: {
    type: Date,
  },
  twoFactorEnable: {
    type: Boolean,
  },
  isBlocked: {
    type: Boolean,
  },
  refressToken: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
  },
  createdBy: {
    type: Types.ObjectId,
    ref: "User",
  }
});

// @desc schema model middleware

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    console.log(this.password);
  }
  next();
});

// @desc check already exist this mail

userSchema.pre("save", async function (next) {
  const findUser = await this.constructor.findOne({ email: this.email });

  if (findUser && findUser._id.toString() !== this._id.toString()) {
    throw new customError(400, "User already exist try another Email");
  }
  next();
});

// @desc compare hash password
userSchema.methods.compareHashPassword = async function (humanPass) {
  return await bcrypt.compare(humanPass, this.password);
};

// @desc generate access token

userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      userid: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESTOKEN_SECRET?.trim(), // ✅ trim যোগ করুন
    { expiresIn: process.env.ACCESTOKEN_EXPIRE?.trim() } // ✅ এখানেও
  );
};

// @desc generate refress token
userSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      userid: this._id,
    },
    process.env.REFRESHTOKEN_SECRET?.trim(), // ✅ trim যোগ করুন
    { expiresIn: process.env.REFRESHTOKEN_EXPIRE?.trim() } // ✅ এখানেও
  );
};
// @desc verify access token
userSchema.methods.VerifyAccessToken = function (token) {
  return jwt.verify(token, process.env.ACCESTOKEN_SECRET);
};
// @desc verify refress token
userSchema.methods.VerifyRefressToken = function (token) {
  return jwt.verify(token, process.env.REFRESHTOKEN_SECRET);
};

module.exports = mongoose.model("User", userSchema);

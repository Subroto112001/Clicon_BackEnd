const User = require("../models/user.model");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../utils/customError");
const { asyncHandeler } = require("../utils/asyncHandeler");
const { default: axios } = require("axios");
const { validateUser } = require("../validation/user.validation");
const { mailSender, smsSender } = require("../helpers/helper");
const {
  RegistrationMailTemplate,
  resetPasswordTemplate,
} = require("../TemplateEmail/Template");
const userModel = require("../models/user.model");
const crypto = require("crypto");
const { date } = require("joi");

/**
 * todo : registration -----> this function will work for registration
 * */

exports.registration = asyncHandeler(async (req, res) => {
  const value = await validateUser(req);

  const { fristName, email, password, phoneNumber } = value;
  if (email === undefined && phoneNumber === undefined) {
    throw new customError(401, "Email or PhoneNumber is required");
  }

  const user = await new User({
    fristName,
    email: email || null,
    phoneNumber: phoneNumber || null,
    password,
  }).save();

  if (!user) {
    throw new customError(500, "Registration Failed");
  }

  const otp = crypto.randomInt(100000, 999999);
  const otpExpireTime = Date.now() + 10 * 60 * 1000;
  if (user.email) {
    const verificationLInk = `http://localhost:5157/verifyemail/${email}`;
    const template = RegistrationMailTemplate(
      fristName,
      verificationLInk,
      otp,
      otpExpireTime
    );

    try {
      await mailSender(email, template);
    } catch (error) {
      console.error("Email sending failed:", error);
      // Don't throw error, continue with registration
    }
  }

  // phone number

  if (user.phoneNumber) {
    const verificationLInk = `http://localhost:5157/verifyphone/${phoneNumber}`;

    const smsBody = `Hey ${fristName} 
Your code is ${otp} and it will expire on ${new Date(
      otpExpireTime
    ).toLocaleString()}
-Clicon`;

    // that is not working... 31mi in video
    try {
      const smsResponse = await smsSender(phoneNumber, smsBody);
      console.log("SMS Response:", smsResponse);
    } catch (error) {
      console.error("SMS sending failed:", error);
      // Don't throw error, continue with registration
    }
  }

  await User.updateOne(
    { _id: user._id },
    { resetPasswordOtp: otp, resetPasswordExpireTime: otpExpireTime }
  );

  apiResponse.senSuccess(
    res,
    201,
    "Registration Successfull Check Your Email",
    {
      fristName,
      phoneNumber: phoneNumber
        ? phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3")
        : null, // Mask phone number
    }
  );
});

/**
 * todo : Login---> this function will work for login
 * */

exports.Login = asyncHandeler(async (req, res) => {
  const value = await validateUser(req);
  const { email, phoneNumber, password, fristName } = value;

  const user = await userModel.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (!user) { 
    throw new customError(400, "User not found");
  }

  const resultOfPassword = await user.compareHashPassword(password);
  if (!resultOfPassword) {
    throw new customError(400, "Your Password or Email is Incorrect");
  }

  // now we will check there that email or phoneNumber verified or not

  const loginMethod = email? "email" : "phoneNumber";
  let isVerified = false;


  if (email && user.email) {
    isVerified = user.isEmailverifyed|| false;
  } else {
    isVerified = user.isPhoneVerifyed ||false
  }

  // if we found not verified then

  if(!isVerified) {
  const otp = crypto.randomInt(100000, 999999);
    const otpExpireTime = Date.now() + 10 * 60 * 1000;
    
    if (email && user.email) {
       const verificationLInk = `http://localhost:5157/verifyemail/${email}`;
       const template = RegistrationMailTemplate(
         fristName,
         verificationLInk,
         otp,
         otpExpireTime
       );
       try {
         await mailSender(email, template);
       } catch (error) {
         console.error("Email sending failed:", error);
        throw new customError(400, 'Email Sending Failed, Try Again', error);
       }
    }
    

    if (phoneNumber && user.phoneNumber) {
        const smsBody = `Hey ${user.fristName} 
Your verification code is ${otp} and it will expire on ${new Date(
          otpExpireTime
        ).toLocaleString()}
-Clicon`;

        try {
          const smsResponse = await smsSender(phoneNumber, smsBody);
          console.log("SMS Response:", smsResponse);
        } catch (error) {
          console.error("SMS sending failed:", error);
          throw new customError(400,' SMS sending Failed');
        }
    }

     await userModel.updateOne(
       { _id: user._id },
       {
         resetPasswordOtp: otp,
         resetPasswordExpireTime: otpExpireTime,
       }
     );


return apiResponse.senSuccess(
  res,
  200,
  "Account not verified. Verification code sent.",
  {
    verified: false,
    verificationMethod: loginMethod,
    message:
      loginMethod === "email"
        ? "Please check your email for verification code"
        : "Please check your phone for verification code",
    maskedContact:
      loginMethod === "email"
        ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
        : phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3"),
  }
);

  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  user.refressToken = refreshToken;
  await user.save();

  apiResponse.senSuccess(res, 200, "Login Successful", {
    accessToken,
    username: user.fristName,
    email: user.email,
  });
});

/**
 * todo : Email and Phone Number verification ---------> this fucntion will work for email verification and Phone number verification
 * */
exports.VerificationUserContact = asyncHandeler(async (req, res) => {
  const { otp, email, phoneNumber } = req.body;
  if (!otp || (!email && !phoneNumber)) {
    throw new customError(401, "Otp and  Email or Phone Number not found");
  }
  /**
   *title : Query system add
   *@desc : this query system will help to find user by email or phone number. it hold just one if user use phone number or email for verification
   */
  const query = {
    resetPasswordOtp: otp,
    resetPasswordExpireTime: { $gt: Date.now() },
    $or: [],
  };

  if (email) {
    query.$or.push({ email });
  }
  if (phoneNumber) {
    query.$or.push({ phoneNumber });
  }

  const findUser = await User.findOne(query);

  // start
  if (!findUser) {
    //  if there geeting otp invalid and expeire time .
    const user = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (!user) {
      throw new customError(404, "User not found");
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000);
    user.resetPasswordOtp = newOtp;
    user.resetPasswordExpireTime = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (email) {
      await mailSender(
        user.email,
        "Your Verification OTP",
        `Your OTP is ${newOtp}`
      );
    }
    if (phoneNumber) {
      await smsSender(user.phoneNumber, `Your OTP is ${newOtp}`);
    }

    throw new customError(
      401,
      "Invalid or expired OTP. A new OTP has been sent."
    );
  }
  // end

  //@desc after using this data to verify
  findUser.resetPasswordExpireTime = null;
  findUser.resetPasswordOtp = null;
  if (email) {
    findUser.isEmailverifyed = true;
  }
  if (phoneNumber) {
    findUser.isPhoneVerifyed = true;
  }

  await findUser.save();
  apiResponse.senSuccess(res, 200, "Email Verification Sucessfull", {
    email: findUser.email,
    fristName: findUser.fristName,
  });
  console.log(findUser);
});

/**
 * todo : Forgot Password -------> this function will work for forgot password
 * */
exports.forgotPassword = asyncHandeler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError(401, "Email Missing");
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    throw new customError(401, "User not found");
  }

  // here we will geenrate a otp

  const otp = crypto.randomInt(100000, 999999);
  const otpExpireTime = Date.now() + 10 * 60 * 60 * 1000;
  const verificationLInk = `http://localhost:5157/reset-password/${email}`;
  const template = resetPasswordTemplate(
    user.fristName,
    verificationLInk,
    otp,
    otpExpireTime
  );
  await mailSender(email, template);
  apiResponse.senSuccess(res, 301, "Check Your Email", null);
});

/**
 * todo : Reset Password -----------> this function will work for reset password
 **/
exports.resetPassword = asyncHandeler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email) {
    throw new customError(401, "Email is missing");
  }
  if (!newPassword) {
    throw new customError(401, "Newpassword is missing");
  }

  if (!confirmPassword) {
    throw new customError(401, "Confirm Password is missing");
  }

  if (newPassword !== confirmPassword) {
    throw new customError(401, "newpassword and confirm password don't match!");
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    throw new customError(401, "Your Email not found!");
  }

  user.password = newPassword;
  user.resetPasswordExpireTime = null;
  user.resetPasswordOtp = null;
  await user.save();
  apiResponse.senSuccess(res, 200, "Password reset successfully");
});

/**
 * todo : Logout ------------> this function will work for Log out
 * */
exports.logout = asyncHandeler(async (req, res) => {
  console.log("From controller", req.user);

  // now find the user

  const finduser = await User.findById(req.user.id);
  console.log(finduser);
  if (!finduser) {
    throw new customError(401, "User Not Found");
  }

  // now clear the cookie

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction ? true : false,
    sameSite: "none",
    path: "/",
  });

  finduser.refressToken = null;
  await finduser.save();
  apiResponse.senSuccess(res, 200, "Logout Successfull");
});

/**
 * todo : getme --------------> this function will show to user their data
 * */
exports.getme = asyncHandeler(async (req, res) => {
  const id = req.user.id;
  const finduser = await User.findById(id);
  console.log(finduser);
  if (!finduser) {
    throw new customError(401, "User not found");
  }
  apiResponse.senSuccess(res, 200, "User Get Successfull", finduser);
});

/**
 * todo : refreshtoken -----> making a refresh token and save it database
 * */

exports.getrefreshtoken = asyncHandeler(async (req, res) => {
  const token = req.headers.cookie.replace("refreshToken=", " ");
  console.log(token);

  if (!token) {
    throw new customError(401, "Token not found");
  }

  const finduser = await User.findOne({ refressToken: token });

  if (!finduser) {
    throw new customError(401, "user not found");
  }

  const accesstoken = finduser.generateAccessToken();

  apiResponse.senSuccess(res, 200, "Login Successful", {
    accessToken: accesstoken,
    username: finduser.fristName,
    email: finduser.email,
  });
});

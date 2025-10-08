require("dotenv").config();

/**
 * if it will development mode
 * */

const development = (error, res) => {
  console.log(error);
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    statusCode: error.statusCode,
    status: error.status,
    isOperationalError: error.isOperationalError,
    ErrortrackTrace: error.stack,
    message: error.message,
    data: error.data,
  });
};

/**
 *  if it will production mode
 * */

const production = (error, res) => {
  const statusCode = error.statusCode || 500;
  if (error.isOperationalError) {
    return res.status(statusCode).json({
      statusCode: error.statusCode,
        status: error.status,
      message : error.message
    });
  } else {
    return res.status(statusCode).json({
      status: "!OK",
      message: "Something wrong, Try again later",
    });
  }
};

exports.globalErrorHandeler = (error, req, res, next) => {
  if (process.env.NODE_ENV == "development") {
    development(error, res);
  } else {
    production(error, res);
  }
};

class customError extends Error{
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? "Client Error" : "Server Error"
        this.isOperationalError = true;
        this.message = message || "Server / Client Error";
        this.data = null;
       Error.captureStackTrace(this, customError);

    }
}


module.exports = {customError}
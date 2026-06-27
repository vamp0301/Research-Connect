// src/utils/sendResponse.js

const sendResponse = (
    res,
    statusCode,
    message,
    data = null
) => {

    return res.status(statusCode).json({
        success: true,
        message,
        data
    });

};

module.exports = sendResponse;
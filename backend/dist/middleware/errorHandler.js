"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errorCode = err.code || 'INTERNAL_ERROR';
    // Log the error
    logger_1.logger.error(`Error: ${message}`, {
        path: req.path,
        method: req.method,
        statusCode,
        errorCode,
        stack: err.stack
    });
    // Send error response
    res.status(statusCode).json({
        error: {
            message,
            code: errorCode,
            status: statusCode
        }
    });
};
exports.errorHandler = errorHandler;

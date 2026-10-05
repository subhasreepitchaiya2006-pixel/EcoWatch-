export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
    availableDocs: "/api/docs",
  });
}

export function errorHandler(err, req, res, next) {
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred.",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
    timestamp: new Date().toISOString(),
  });
}

export default {
  notFoundHandler,
  errorHandler,
};

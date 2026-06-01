const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Prisma: unique constraint violation
  if (err.code === 'P2002') {
    statusCode = 400;
    const field = (err.meta && err.meta.target && err.meta.target[0]) || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Prisma: record not found / required relation missing
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Prisma: invalid ID format / validation
  if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid request data';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };

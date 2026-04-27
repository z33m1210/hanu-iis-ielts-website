const errorHandler = (err, req, res, next) => {
  console.error('--- ERROR LOG START ---');
  console.error(`Path: ${req.path}`);
  console.error(`Method: ${req.method}`);
  if (err.stack) console.error(err.stack);
  else console.error(err);
  console.error('--- ERROR LOG END ---');

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ 
    success: false, 
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;

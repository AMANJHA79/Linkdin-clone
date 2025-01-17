// Custom error handling middleware
const errorHandler = (err, req, res, next) => {
    
    console.error(err.stack);
  
    // Set default status code if not set
    const statusCode = err.statusCode || 500;
  
    // Respond with a consistent error message
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
    });
  };
  
  module.exports = errorHandler;
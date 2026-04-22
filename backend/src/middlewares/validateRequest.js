/**
 * Generic validation middleware using Joi
 * @param {Object} schema - Joi schema object
 * @param {string} source - Where to find the data (body, query, params)
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[source], { abortEarly: false });
    
    if (error) {
      const details = error.details.map(d => d.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details
      });
    }
    
    next();
  };
};

module.exports = validateRequest;

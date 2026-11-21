const AppError = require("../utils/AppError");

const validate = (schema, property = "params") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: true,
      convert: false,
    });

    if (error) {
      return next(
        new AppError(error.details[0].message, 400)
      );
    }

    next();
  };
};

module.exports = validate;
const Joi = require("joi");

const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .required()
    .messages({
      "string.pattern.base": "User ID must be a positive integer",
      "any.required": "User ID is required",
    }),
});

module.exports = {
  userIdSchema,
};
const Joi = require("joi");

// Validation schema for the ?lang= query
const languageSchema = Joi.object({
  lang: Joi.string().valid("zh", "ms", "ta").required().messages({
    "any.only": "Language must be zh, ms or ta",
    "any.required": "Language is required"
  })
});

// Middleware to validate the language for GET /quests
function validateLanguage(req, res, next) {
  const { error } = languageSchema.validate(req.query, {
    abortEarly: false
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");

    return res.status(400).json({
      error: errorMessage
    });
  }

  next();
}

module.exports = {
  validateLanguage
};
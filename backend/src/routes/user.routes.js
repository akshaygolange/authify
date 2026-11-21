const express = require("express");

const { getUserById } = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const { userIdSchema } = require("../validators/user.validator");

const router = express.Router();

router.get(
  "/:id",
  validate(userIdSchema),
  getUserById
);

module.exports = router;
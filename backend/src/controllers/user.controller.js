const query = require("../utils/query");
const AppError = require("../utils/AppError");

const getUserById = async (req, res) => {
  const { id } = req.params;

 const result = await query(
  `SELECT id, name, email, created_at
   FROM users
   WHERE id = $1`,
  [id]
);

  if (!result.rows.length) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
   success: true,
    data: result.rows[0],
  });
};

module.exports = {
  getUserById,
};

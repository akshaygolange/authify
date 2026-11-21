require("dotenv").config();

const pool = require("./config/db");

const testSQLInjection = async () => {
  try {
    // Simulated attacker input
    const email = "anything' OR '1'='1";

    // UNSAFE QUERY
    const unsafeQuery = `
      SELECT id, name, email
      FROM users
      WHERE email = '${email}'
    `;

    const unsafeResult = await pool.query(unsafeQuery);

    console.log("Unsafe query results:");
    console.log(unsafeResult.rows);

    // SAFE QUERY
    const safeQuery = `
      SELECT id, name, email
      FROM users
      WHERE email = $1
    `;

    const safeResult = await pool.query(safeQuery, [email]);

    console.log("Safe query results:");
    console.log(safeResult.rows);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
};

testSQLInjection();
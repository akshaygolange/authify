require("dotenv").config();

const query = require("./utils/query");

const testQuery = async () => {
  try {
    const result = await query("SELECT NOW()");

    console.log("Query successful!");
    console.log(result.rows);
  } catch (error) {
    console.error("Query failed:", error.message);
  } finally {
    process.exit();
  }
};

testQuery();
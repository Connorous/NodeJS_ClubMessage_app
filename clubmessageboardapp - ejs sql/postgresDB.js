const { Pool } = require("pg");

const postgresDBUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@127.0.0.1:5432/${process.env.PGDATABBASE}`;

module.exports = new Pool({
  connectionString: postgresDBUrl,
});

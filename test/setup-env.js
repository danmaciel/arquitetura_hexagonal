// Each Jest test file uses an isolated, disposable SQLite database.
const path = require("node:path");
const os = require("node:os");
const { randomUUID } = require("node:crypto");

process.env.SQLITE_DB_PATH = path.join(
  os.tmpdir(),
  `hexagonal-test-${process.pid}-${randomUUID()}.sqlite3`
);

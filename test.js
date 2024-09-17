const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)`);

  const stmt = db.prepare("INSERT INTO test (name) VALUES (?)");
  stmt.run("Test name");
  stmt.finalize();

  db.each("SELECT * FROM test", (err, row) => {
    if (err) {
      console.error(err);
    } else {
      console.log(row);
    }
  });
});

db.close();

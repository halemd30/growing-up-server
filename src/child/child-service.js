const xss = require("xss");

const ChildService = {
  getAllChildren(db) {
    return db.select("*").from("child");
  },
  insertChild(db, newChild) {
    return db
      .insert(newChild)
      .into("child")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

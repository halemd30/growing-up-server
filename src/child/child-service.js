const xss = require("xss");

const ChildService = {
  insertChild(db, newChild) {
    return db
      .insert(newChild)
      .into("child")
      .returning("*")
      .then(([child]) => child);
  },
  getById(db, id) {
    return db.select("*").from("child").where({ id }).first();
  },
  getByUserId(db, user_id) {
    return db.select("*").from("child").where({ user_id });
  },
  deleteChild(db, id) {
    return db.from("child").where({ id }).delete();
  },
  updateChild(db, id, child) {
    return db.from("child").where({ id }).update(child);
  },
  serializeChild(child) {
    return {
      id: child.id,
      name: child.name,
      age: child.age,
      user_id: child.user_id,
    };
  },
};

module.exports = ChildService;

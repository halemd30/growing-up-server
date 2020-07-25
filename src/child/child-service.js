const xss = require("xss");

const ChildService = {
  insertChild(db, newChild) {
    return db
      .insert(newChild)
      .into("children")
      .returning("*")
      .then(([child]) => child);
  },
  getById(db, id) {
    return db.select("*").from("children").where({ id }).first();
  },
  getByUserId(db, user_id) {
    return db.select("*").from("children").where({ user_id });
  },
  deleteChild(db, id) {
    return db.from("children").where({ id }).delete();
  },
  updateChild(db, id, child) {
    return db.from("children").where({ id }).update(child);
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

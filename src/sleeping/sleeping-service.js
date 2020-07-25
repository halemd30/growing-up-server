const SleepingServcie = {
  getAllSleep(db) {
    return db.select("*").from("sleeping");
  },
  insertSleep(db, newSleep) {
    return db
      .insert(newSleep)
      .into("sleeping")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getById(db, id) {
    return db.select("*").from("sleeping").where({ id }).first();
  },
  getByChildId(id, childId) {
    return db.select("*").from("sleeping").where({ childId });
  },
  deleteSleep(id, id) {
    return db.from("sleeping").where({ id }).delete();
  },
  updateEndSleep(db, id, endSleep) {
    return db.from("sleeping").where({ id }).update(endSleep);
  },
  serializeSleep(sleep) {
    return {
      id: sleep.id,
      date: sleep.date,
      notes: sleep.notes,
      duration: sleep.duration,
      sleep_type: sleep.sleep_type,
      sleep_category: sleep.sleep_category,
      child_id: sleep.child_id,
    };
  },
};

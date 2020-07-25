const EatingService = {
  getAllMeals(db) {
    return db.select("*").from("eating");
  },
  insertMeal(db, newMeal) {
    return db
      .insert(newMeal)
      .into("eating")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getById(db, id) {
    return db.select("*").from("eating").where({ id }).first();
  },
  getByChildId(db, childId) {
    return db.select("*").from("eating").where({ childId });
  },
  deleteMeal(db, id) {
    return db.from("eating").where({ id }).delete();
  },
  updateEndMeal(db, id, endMeal) {
    return db.from("eating").where({ id }).update(endMeal);
  },
  serializeMeal(meal) {
    return {
      id: meal.id,
      date: meal.date,
      notes: meal.notes,
      duration: meal.duration,
      food_type: meal.food_type,
      side_fed: meal.side_fed,
      child_id: meal.child_id,
    };
  },
};

module.exports = EatingService;

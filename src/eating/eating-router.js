const express = require("express");
const path = require("path");
const EatingService = require("./eating-service");

const eatingRouter = express.Router();
const db = req.app.get("db");

eatingRouter
  .route("/")
  .get((req, res, next) => {
    EatingService.getAllMeals(db)
      .then((meals) => {
        res.json(meals.map(EatingService.serializeMeal));
      })
      .catch(next);
  })
  .post((req, res, next) => {
    const { notes, duration, food_type, side_fed } = req.body;
    const newMeal = {
      child_id: req.child_id,
      notes,
      duration,
      food_type,
      side_fed,
    };

    for (const [key, value] of Object.entries(newMeal))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });

    EatingService.insertMeal(db, newMeal)
      .then((meal) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${meal.id}`))
          .json(EatingService.serializeMeal(meal));
      })
      .catch(next);
  });

eatingRouter.route("/:childId").get((req, res) => {
  const id = parseInt(req.params.childId);
  EatingService.getByChildId(db, id).then((childMeals) => {
    res.json(childMeals.map(EatingService.serializeMeal));
  });
});

eatingRouter
  .route("/:mealId")
  .delete((req, res, next) => {
    const id = parseInt(req.params.mealId);
    EatingService.deleteMeal(db, id).then(res.status(204).end()).catch(next);
  })
  .patch((req, res, next) => {
    const id = parseInt(req.params.mealId);
    EatingService.updateEndMeal(db, id, {
      date: new Date(),
      duration: duration.value,
      food_type: food_type.value,
      side_fed: side_fed.value,
    })
      .then(res.status(204).end())
      .catch(next);
  });

module.exports = eatingRouter;

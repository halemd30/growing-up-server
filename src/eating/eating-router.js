const express = require("express");
const path = require("path");
const EatingService = require("./eating-service");
const moment = require("moment");

const eatingRouter = express.Router();

eatingRouter.route("/").get((req, res, next) => {
  const db = req.app.get("db");
  EatingService.getAllMeals(db)
    .then((meals) => {
      res.json(meals.map(EatingService.serializeMeal));
    })
    .catch(next);
});

eatingRouter
  .route("/:childId")
  .get((req, res, next) => {
    const db = req.app.get("db");
    const id = parseInt(req.params.childId);
    EatingService.getByChildId(db, id)
      .then((childMeals) => {
        res.json(childMeals.map(EatingService.serializeMeal));
      })
      .catch(next);
  })
  .post((req, res) => {
    const db = req.app.get("db");
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

    EatingService.insertMeal(db, newMeal).then((meal) => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${meal.id}`))
        .json(EatingService.serializeMeal(meal));
    });
  });

eatingRouter
  .route("/:mealId")
  .delete((req, res, next) => {
    const db = req.app.get("db");
    const id = parseInt(req.params.mealId);
    EatingService.deleteMeal(db, id).then(res.status(204).end()).catch(next);
  })
  .patch((req, res, next) => {
    const db = req.app.get("db");
    const id = parseInt(req.params.mealId);
    const currentDate = new Date();
    const duration = currentDate - req.params.date;
    EatingService.updateEndMeal(db, id, {
      duration: duration,
      food_type: req.params.food_type,
      side_fed: req.params.side_fed,
    })
      .then(res.status(204).end())
      .catch(next);
  });

module.exports = eatingRouter;

const express = require('express');
require('dotenv').config();
const path = require('path');
const EatingService = require('./eating-service');
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const moment = require('moment');

const eatingRouter = express.Router();

// eatingRouter.route('/').get((req, res, next) => {
//     const db = req.app.get('db');
//     EatingService.getAllMeals(db)
//         .then(meals => {
//             console.log(meals)
//             res.json(meals.map(EatingService.serializeMeal));
//         })
//         .catch(next);
// });

//add to each
// const db = req.app.get("db");

eatingRouter
  .route("/all/:childId")
  .get(requireAuth, jsonParser,(req, res, next) => {
    const id = req.params.childId;
    const db = req.app.get("db");

    EatingService.getByChildId(db, id)
      .then((childMeals) => {
        res.json(childMeals.map(EatingService.serializeMeal));
      })
      .catch(next);
  })
//   .post((req, res) => {
//     const { notes, duration, food_type, side_fed } = req.body;
//     const newMeal = {
//       child_id: req.child_id,
//       notes,
//       duration,
//       food_type,
//       side_fed,
//     };

//     for (const [key, value] of Object.entries(newMeal))
//       if (value == null)
//         return res.status(400).json({
//           error: { message: `Missing '${key}' in request body` },
//         });

//     EatingService.insertMeal(db, newMeal).then((meal) => {
//       res
//         .status(201)
//         .location(path.posix.join(req.originalUrl, `/${meal.id}`))
//         .json(EatingService.serializeMeal(meal));
//     });
//   });

eatingRouter
  .route("/:mealId")
  .all(requireAuth, jsonParser, (req, res, next) => {
    const db = req.app.get("db");
    
    const meal_id = req.params.mealId;

    EatingService.getById(db, meal_id)
      .then((meal) => {
        if (!meal) {
          return res.status(404).json({
            error: { message: "Meal does not exist" },
          });
        }
        res.meal = meal;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(EatingService.serializeMeal(res.meal));
  })
  .delete((req, res, next) => {
    const db = req.app.get("db");

    const id = parseInt(req.params.mealId);
    EatingService.deleteMeal(db, id).then(res.status(204).end()).catch(next);
  })
//   .patch((req, res, next) => {
//     const id = parseInt(req.params.mealId);
//     const currentDate = new Date();
//     const duration = currentDate - req.params.date;
//     EatingService.updateEndMeal(db, id, {
//       duration: duration,
//       food_type: req.params.food_type,
//       side_fed: req.params.side_fed,
//     })
//       .then(res.status(204).end())
//       .catch(next);
//   });

module.exports = eatingRouter;

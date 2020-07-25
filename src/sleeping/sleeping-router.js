const express = require("express");
const path = require("path");
const SleepingService = require("./sleeping-service");

const sleepingRouter = express.Router();
const db = req.app.get("db");

sleepingRouter.route("/").get((req, res) => {
  SleepingService.getAllSleep(db).then((sleep) => {
    res.json(sleep.map(SleepingService.serializeSleep));
  });
});

sleepingRouter
  .route("/:childId")
  .get((req, res, next) => {
    const id = parseInt(req.params.childId);
    SleepingService.getByChildId(db, id)
      .then((childSleep) => {
        res.json(childSleep.map(SleepingService.serializeSleep));
      })
      .catch(next);
  })
  .post((req, res) => {
    const { notes, duration, sleep_type, sleep_category } = req.body;
    const newSleep = {
      child_id: req.child_id,
      notes,
      duration,
      sleep_type,
      sleep_category,
    };

    for (const [key, value] of Object.entries(newSleep))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });

    SleepingService.insertSleep(db, newSleep).then((sleep) => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${sleep.id}`))
        .json(SleepingService.serializeSleep(sleep));
    });
  });

sleepingRouter
  .route("/:sleepId")
  .delete((req, res, next) => {
    const id = parseInt(req.params.sleepId);
    SleepingService.deleteSleep(db, id).then(req.status(204).end()).catch(next);
  })
  .patch((req, res) => {
    const id = req.params.sleepId;
    const currentDate = new Date();
    const duration = currentDate - req.params.Date;
    SleepingService.updateSleep(db, id, {
      duration: duration,
      food_type: req.params.food_type,
      side_fed: req.params.side_fed,
    }).then(res.status(204).end());
  });

module.exports = sleepingRouter;

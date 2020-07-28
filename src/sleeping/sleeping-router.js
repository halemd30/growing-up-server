const express = require('express');
const path = require('path');
const SleepingService = require('./sleeping-service');

const sleepingRouter = express.Router();

sleepingRouter.route('/').get((req, res) => {
    const db = req.app.get('db');
    SleepingService.getAllSleep(db).then((sleep) => {
        res.json(sleep.map(SleepingService.serializeSleep));
    });
});

sleepingRouter
    .route('/:childId')
    .get((req, res, next) => {
        const db = req.app.get('db');
        const id = parseInt(req.params.childId);
        SleepingService.getByChildId(db, id)
            .then((childSleep) => {
                res.json(childSleep.map(SleepingService.serializeSleep));
            })
            .catch(next);
    })
    .post((req, res) => {
        const db = req.app.get('db');
        const { notes, duration, sleep_type, sleep_category } = req.body;
        const newSleep = {
            child_id: req.child_id,
            notes,
            duration,
            sleep_type,
            sleep_category
        };

        for (const [key, value] of Object.entries(newSleep))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });

        SleepingService.insertSleep(db, newSleep).then((sleep) => {
            res.status(201)
                .location(path.posix.join(req.originalUrl, `/${sleep.id}`))
                .json(SleepingService.serializeSleep(sleep));
        });
    });

sleepingRouter
    .route('/:sleepId')
    .delete((req, res, next) => {
        const db = req.app.get('db');
        const id = parseInt(req.params.sleepId);
        SleepingService.deleteSleep(db, id)
            .then(req.status(204).end())
            .catch(next);
    })
    .patch((req, res) => {
        const db = req.app.get('db');
        const id = req.params.sleepId;
        const currentDate = new Date();
        const duration = currentDate - req.params.Date;
        SleepingService.updateSleep(db, id, {
            duration: duration,
            sleep_type: req.params.sleep_type,
            sleep_category: req.params.sleep_category
        }).then(res.status(204).end());
    });

module.exports = sleepingRouter;

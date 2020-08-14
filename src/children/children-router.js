require('dotenv').config();
const express = require('express');
const path = require('path');
const ChildrenService = require('./children-service');
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const childrenRouter = express.Router();

childrenRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const db = req.app.get('db');
        const user_id = req.user.id;

        ChildrenService.getByUserId(db, user_id)
            .then((children) => {
                res.json(children.map(ChildrenService.serializeChildren));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const db = req.app.get('db');

        const { first_name, age, weight } = req.body;
        const newChildren = {
            first_name,
            age,
            user_id: req.user.id,
            weight
        };
        
        for (const [key, value] of Object.entries(newChildren))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });

        ChildrenService.insertChildren(db, newChildren)
            .then((child) => {
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${child.id}`))
                    .json(ChildrenService.serializeChildren(child));
            })
            .catch(next);
    });

childrenRouter
    .route('/:childId')
    .all(requireAuth, jsonParser, (req, res, next) => {
        const db = req.app.get('db');
        const child_id = req.params.childId;

        ChildrenService.getById(db, child_id)
            .then((child) => {
                if (!child) {
                    return res.status(404).json({
                        error: { message: 'Child does not exist' }
                    });
                }
                res.child = child;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(ChildrenService.serializeChildren(res.child));
    })
    .delete((req, res, next) => {
        const db = req.app.get('db');

        const id = req.params.childId;
        ChildrenService.deleteChildren(db, id)
            .then(res.status(204).end())
            .catch(next);
    })
    .patch((req, res, next) => {
        const db = req.app.get('db');
        const { first_name, age, weight, image } = req.body;
        const child_id = req.params.childId;

        const updatedChildren = {
            first_name,
            age,
            weight,
            image
        };

        const values = Object.values(updatedChildren).filter(Boolean).length;
        if (values === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain value to update` }
            });
        }

        ChildrenService.updateChildren(db, child_id, updatedChildren)
            .then((child) => {
                res.status(201).json(ChildrenService.serializeChildren(child));
            })
            .catch(next);
    });

childrenRouter
    .route('/:childId/image')
    .all(requireAuth, jsonParser, (req, res, next) => {
        const db = req.app.get('db');
        const child_id = req.params.childId;

        ChildrenService.getById(db, child_id)
            .then((child) => {
                if (!child) {
                    return res.status(404).json({
                        error: { message: 'Child does not exist' }
                    });
                }
                res.child = child;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        const db = req.app.get('db');
        const id = req.params.childId;

        ChildrenService.getById(db, id).then((child) => {
            res.contentType('image/jpeg').send(child.image);
        });
    })
    .patch(upload.single('image'), (req, res, next) => {
        const db = req.app.get('db');
        const id = req.params.childId;
        const newImage = req.files.img;

        console.log('FORMDATA', newImage);

        if (newImage === null) {
            return res.status(400).json({
                error: { message: `Request body must contain image to update` }
            });
        }

        ChildrenService.updateChildren(db, id, { image: newImage.name }).then(
            res.status(201).end()
        );
    });

module.exports = childrenRouter;

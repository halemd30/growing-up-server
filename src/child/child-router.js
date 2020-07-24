const express = require("express");
const path = require("path");
const ChildService = require("./child-service");

const childRouter = express.Router();
const db = req.app.get("db");

childRouter
  .route("/")
  .get((req, res, next) => {
    res.json(ChildService.serializeChild(req.child));
  })
  .post((req, res, next) => {
    const { name, age } = req.body;
    const newChild = {
      user_id: req.user_id,
      name,
      age,
    };

    for (const [key, value] of Object.entries(newChild))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });

    ChildService.insertChild(db, newChild)
      .then((child) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${child.id}`))
          .json(ChildService.serializeChild(child));
      })
      .catch(next);
  });

childRouter.route("/:userId").get((req, res) => {
  const id = parseInt(req.params.userId);
  ChildService.getByUserId(db, id).then((children) => {
    res.json(children.map(ChildService.serializeChild));
  });
});

childRouter
  .route("/:childId")
  .delete((req, res, next) => {
    const id = parseInt(req.params.childId);
    ChildService.deleteChild(db, id).then(res.status(204).end()).catch(next);
  })
  .patch((req, res, next) => {
    const id = parseInt(req.params.childId);
    ChildService.updateChild(db, id, {
      name: name.value,
      age: age.value,
    });
  });

const express = require("express");
const AuthService = require("./auth-service");

const authRouter = express.Router();

authRouter.post("/login", (req, res, next) => {});

module.exports = authRouter;

const express = require('express');
const path = require('path');
const jsonParser = express.json();
const UsersService = require('./users-service');

const usersRouter = express.Router();

usersRouter
    .post('/', jsonParser, (req, res, next) => {
        const { password, username, first_name, last_name } = req.body;

        for (const field of ['password', 'username', 'first_name', 'last_name'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`,
                });

        const passwordError = UsersService.validatePassword(password);
        if (passwordError) return res.status(400).json({ error: passwordError });

        UsersService.hasUserWithUsername(req.app.get('db'), username)
            .then(hasUserWithUsername => {
                if (hasUserWithUsername)
                    return res.status(400).json({ error: 'Username already taken' });

                return UsersService.hashPassword(password).then(hashedPassword => {
                    const newUser = {
                        username,
                        first_name,
                        last_name,
                        password: hashedPassword,
                    };

                    return UsersService.insertUser(req.app.get('db'), newUser).then(user => {
                        res.status(201)    
                            .location(path.posix.join(req.originalUrl, `/${user.id}`))
                            .json(UsersService.serializeUser(user));
                    });
                });
            })
            .catch(next);
    });

module.exports = usersRouter;

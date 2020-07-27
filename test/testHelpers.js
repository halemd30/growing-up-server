const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeTestUsers() {
    return [
        {
            id: 1,
            first_name: 'pam',
            last_name: 'halpert',
            username: 'beesly',
            password: 'heyPassword',
        },
        {
            id: 2,
            first_name: 'jim',
            last_name: 'halpert',
            username: 'jimothy',
            password: 'aNewPassword',
        },
    ];
}

function makeTestChildren() {
    return [
        {
            first_name: 'ryan',
            age: 5,
            user_id: 1,
        },
        {
            first_name: 'cece',
            age: 12,
            user_id: 2,
        },
        {
            first_name: 'philip',
            age: 3,
            user_id: 1,
        },
    ];
}

function makeTestMeals() {
    return [
        {
            notes: 'fussy - fight to eat',
            duration: '00:25:22',
            food_type: 'bottle',
            side_fed: '',
            child_id: 1,
        },
        {
            notes: 'good job',
            duration: '01:25:22',
            food_type: 'breast_fed',
            side_fed: 'right',
            child_id: 1,
        },
        {
            notes: '',
            duration: '00:05:22',
            food_type: 'formula',
            side_fed: '',
            child_id: 2,
        },
        {
            notes: 'fussy',
            duration: '00:15:22',
            food_type: 'breast_fed',
            side_fed: 'left',
            child_id: 2,
        },
    ];
}

function cleanAllTables(db) {
    return db.transaction(trx =>
        trx
            .raw(
                `TRUNCATE
                sleeping,
                eating,
                children,
                users
              RESTART IDENTITY CASCADE`
            )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE sleeping_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE eating_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE children_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('sleeping_id_seq', 0)`),
                    trx.raw(`SELECT setval('eating_id_seq', 0)`),
                    trx.raw(`SELECT setval('children_id_seq', 0)`),
                    trx.raw(`SELECT setval('users_id_seq', 0)`),
                ])
            )
    );
}

function cleanTables_NotUsers(db) {
    return db.transaction(trx =>
        trx
            .raw(
                `TRUNCATE
                sleeping,
                eating,
                children
              RESTART IDENTITY CASCADE`
            )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE sleeping_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE eating_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE children_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('sleeping_id_seq', 0)`),
                    trx.raw(`SELECT setval('eating_id_seq', 0)`),
                    trx.raw(`SELECT setval('children_id_seq', 0)`),
                ])
            )
    );
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 8),
    }));
    return db
        .into('users')
        .insert(preppedUsers)
        .then(() => db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id]));
}

function makeMaliciousUser() {
    const maliciousUser = {
        first_name: `image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        last_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        username: 'Naughty naughty very naughty <script>alert("xss");</script>',
        password: '11Naughty naughty very naughty <script>alert("xss");</script>',
    };
    const expectedUser = {
        first_name: `image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        last_name: 'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
        username: 'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
        password: '11Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    };
    return {
        maliciousUser,
        expectedUser,
    };
}

function makeMaliciousChild() {
    const maliciousChild = {
        first_name: `image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        age: 3,
        user_id: 1,
    };
    const expectedChild = {
        first_name: `image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        age: 3,
        user_id: 1,
    };
    return {
        maliciousChild,
        expectedChild,
    };
}

function makeMaliciousMeals() {
    const maliciousMeal = {
        notes:
            'image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
        duration: '00:25:22',
        food_type: 'bottle',
        side_fed:
            'image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
        child_id: 1,
    };
    const expectedMeal = {
        notes: `image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        duration: '00:25:22',
        food_type: 'bottle',
        side_fed: `image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        child_id: 1,
    };
    return {
        maliciousMeal,
        expectedMeal,
    };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256',
    });
    return `Bearer ${token}`;
}

module.exports = {
    makeTestUsers,
    makeTestChildren,
    makeTestMeals,

    makeMaliciousUser,
    makeMaliciousChild,
    makeMaliciousMeals,

    cleanAllTables,
    cleanTables_NotUsers,
    seedUsers,
    makeAuthHeader,
};

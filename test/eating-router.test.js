const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./testHelpers');
const assert = require('assert');

describe.only('eating-router endpoints', () => {
    let db;
    let testUsers = helpers.makeTestUsers();
    let testChildren = helpers.makeTestChildren();
    let testMeals = helpers.makeTestMeals();

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy(db));
    beforeEach('clean the table', () => helpers.cleanAllTables(db));

    beforeEach('insert users', () => {
        return db.into('users').insert(testUsers);
    });
    beforeEach('insert children', () => {
        return db.into('children').insert(testChildren);
    });

    context('Given there are meals in the database', () => {
        beforeEach('insert meals', () => {
            return db.into('eating').insert(testMeals);
        });

        it(`GET /api/eating/all/childId responds with 200 and all of the meals for that child`, () => {
            const child_id = 1;
            const expectedmeals = testMeals.filter(meal => meal.child_id == child_id);
            return supertest(app)
                .get(`/api/eating/all/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    assert.strictEqual(res.body.length === 2, true);
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('date');
                    expect(res.body[0].notes).to.eql(expectedmeals[0].notes);
                    expect(res.body[0].duration).to.eql(expectedmeals[0].duration);
                    expect(res.body[0].food_type).to.eql(expectedmeals[0].food_type);
                    expect(res.body[0].side_fed).to.eql(expectedmeals[0].side_fed);
                    expect(res.body[0].child_id).to.eql(expectedmeals[0].child_id);
                    expect(res.body[1]).to.have.property('id');
                    expect(res.body[1]).to.have.property('date');
                    expect(res.body[1].notes).to.eql(expectedmeals[1].notes);
                    expect(res.body[1].duration).to.eql(expectedmeals[1].duration);
                    expect(res.body[1].food_type).to.eql(expectedmeals[1].food_type);
                    expect(res.body[1].side_fed).to.eql(expectedmeals[1].side_fed);
                    expect(res.body[1].child_id).to.eql(expectedmeals[1].child_id);
                });
        });
        it('GET /api/children/:mealId responds with 200 and requested meal', () => {
            const meal_id = 1;
            const expectedMeal = testMeals[meal_id - 1];
            return supertest(app)
                .get(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('date');
                    expect(res.body.notes).to.eql(expectedMeal.notes);
                    expect(res.body.duration).to.eql(expectedMeal.duration);
                    expect(res.body.food_type).to.eql(expectedMeal.food_type);
                    expect(res.body.side_fed).to.eql(expectedMeal.side_fed);
                    expect(res.body.child_id).to.eql(expectedMeal.child_id);
                });
        });
    //     it('PATCH /api/children/:childrenId responds with 204, updates child', () => {
    //         const child_id = 1;
    //         const editedChild = {
    //             first_name: 'newchild',
    //             age: 5,
    //             user_id: testUsers[0].id,
    //             id: child_id,
    //         };
    //         const expectedChild = {
    //             ...testChildren[child_id - 1],
    //             id: child_id,
    //             first_name: 'newchild',
    //             age: 5,
    //             user_id: testUsers[0].id,
    //         };
    //         return supertest(app)
    //             .patch(`/api/children/${child_id}`)
    //             .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //             .send(editedChild)
    //             .expect(201)
    //             .then(res =>
    //                 supertest(app)
    //                     .get(`/api/children/${child_id}`)
    //                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //                     .expect(expectedChild)
    //             );
    //     });
    //     it('PATCH /api/children/:childrenId responds with 204 when updating a subset of fields', () => {
    //         const child_id = 1;
    //         const editedChild = {
    //             first_name: 'newchild',
    //         };
    //         const expectedChild = {
    //             ...testChildren[child_id - 1],
    //             id: child_id,
    //             first_name: 'newchild',
    //         };
    //         return supertest(app)
    //             .patch(`/api/children/${child_id}`)
    //             .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //             .send(editedChild)
    //             .expect(201)
    //             .then(res =>
    //                 supertest(app)
    //                     .get(`/api/children/${child_id}`)
    //                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //                     .expect(expectedChild)
    //             );
    //     });
    //     it('PATCH /api/children/:childrenId responds 400 when no required fields are given', () => {
    //         const child_id = 1;
    //         return supertest(app)
    //             .patch(`/api/children/${child_id}`)
    //             .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //             .send({ childrenId: 1 })
    //             .expect(400, {
    //                 error: {
    //                     message: 'Request body must contain value to update',
    //                 },
    //             });
    //     });
        it('DELETE /api/eating/:mealId responds with 204 and removes the meal', () => {
            const meal_id = 2;
            return supertest(app)
                .delete(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204);
        });
    });

    context('Given no meals in the database', () => {
        describe('/api/eating', () => {
            it('DELETE /api/eating/:mealId responds with 404', () => {
                const meal_id = 1;
                return supertest(app)
                    .delete(`/api/eating/${meal_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Meal does not exist' },
                    });
            });
            it(`GET /api/eating/all responds with 200 and an empty list`, () => {
                const child_id = 1
                return supertest(app)
                    .get(`/api/eating/all/${child_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
            it('GET /api/eating/:mealId responds with 404', () => {
                const meal_id = 1;
                return supertest(app)
                    .get(`/api/eating/${meal_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Meal does not exist' },
                    });
            });
    //         it('PATCH /api/children/:childrenId responds with 404', () => {
    //             const child_id = 123;
    //             return supertest(app)
    //                 .patch(`/api/children/${child_id}`)
    //                 .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //                 .expect(404, {
    //                     error: { message: 'Child does not exist' },
    //                 });
    //         });
        });

    //     it('POST /api/children responds with 201 and the new child', () => {
    //         const newChild = {
    //             first_name: 'newchild',
    //             age: 5,
    //             user_id: testUsers[0].id,
    //         };
    //         return supertest(app)
    //             .post('/api/children')
    //             .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //             .send(newChild)
    //             .expect(201)
    //             .expect(res => {
    //                 expect(res.body).to.have.property('id');
    //                 expect(res.body.first_name).to.eql(newChild.first_name);
    //                 expect(res.body.age).to.eql(newChild.age);
    //                 expect(res.body.user_id).to.eql(newChild.user_id);
    //                 expect(res.headers.location).to.eql(`/api/children/${res.body.id}`);
    //             })
    //             .then(postRes =>
    //                 supertest(app)
    //                     .get(`/api/children/${postRes.body.id}`)
    //                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //                     .expect(postRes.body)
    //             );
    //     });

    //     const requiredFields = ['first_name', 'age'];
    //     requiredFields.forEach(field => {
    //         const reqNewChild = {
    //             first_name: 'newchild',
    //             age: 5,
    //             user_id: testUsers[0].id,
    //         };
    //         it(`responds with 400 and an error when the '${field}' is missing`, () => {
    //             delete reqNewChild[field];
    //             return supertest(app)
    //                 .post('/api/children')
    //                 .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //                 .send(reqNewChild)
    //                 .expect(400, {
    //                     error: { message: `Missing '${field}' in request body` },
    //                 });
    //         });
    //     });
    });

    context('Given an xss attack', () => {
        const { maliciousMeal, expectedMeal } = helpers.makeMaliciousMeals();

        beforeEach('insert malicious meal', () => {
            return db.into('eating').insert(maliciousMeal);
        });

        it(`GET /api/eating/all/:childId removes xss content`, () => {
            return supertest(app)
                .get('/api/eating/all/1')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('date');
                    expect(res.body[0].notes).to.eql(expectedMeal.notes);
                    expect(res.body[0].duration).to.eql(expectedMeal.duration);
                    expect(res.body[0].food_type).to.eql(expectedMeal.food_type);
                    expect(res.body[0].side_fed).to.eql(expectedMeal.side_fed);
                    expect(res.body[0].child_id).to.eql(expectedMeal.child_id);
                });
        });
        it(`GET /api/eating/:mealId removes xss content`, () => {
            const meal_id = 1;
            return supertest(app)
                .get(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('date');
                    expect(res.body.notes).to.eql(expectedMeal.notes);
                    expect(res.body.duration).to.eql(expectedMeal.duration);
                    expect(res.body.food_type).to.eql(expectedMeal.food_type);
                    expect(res.body.side_fed).to.eql(expectedMeal.side_fed);
                    expect(res.body.child_id).to.eql(expectedMeal.child_id);
                });
        });
    //     it(`POST /api/children removes xss content`, () => {
    //         return supertest(app)
    //             .post(`/api/children`)
    //             .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //             .send(maliciousChild)
    //             .expect(201)
    //             .expect(res => {
    //                 expect(res.body.first_name).to.eql(expectedChild.first_name);
    //                 expect(res.body.age).to.eql(expectedChild.age);
    //             });
    //     });
    });
});

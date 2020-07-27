const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./testHelpers');
const assert = require('assert');

describe.only('sleeping-router endpoints', () => {
    let db;
    let testUsers = helpers.makeTestUsers();
    let testChildren = helpers.makeTestChildren();
    let testSleeps = helpers.makeTestSleeps();

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

    context('Given there are sleep instances in the database', () => {
        beforeEach('insert sleeps', () => {
            return db.into('sleeping').insert(testSleeps);
        });

        it(`GET /api/sleeping/all/childId responds with 200 and all of the sleeps for that child`, () => {
            const child_id = 1;
            const expectedSleeps = testSleeps.filter(sleep => sleep.child_id == child_id);
            return supertest(app)
                .get(`/api/sleeping/all/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    assert.strictEqual(res.body.length === 2, true);
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('date');
                    expect(res.body[0].notes).to.eql(expectedSleeps[0].notes);
                    expect(res.body[0].duration).to.eql(expectedSleeps[0].duration);
                    expect(res.body[0].sleep_type).to.eql(expectedSleeps[0].sleep_type);
                    expect(res.body[0].sleep_category).to.eql(expectedSleeps[0].sleep_category);
                    expect(res.body[0].child_id).to.eql(expectedSleeps[0].child_id);
                    expect(res.body[1]).to.have.property('id');
                    expect(res.body[1]).to.have.property('date');
                    expect(res.body[1].notes).to.eql(expectedSleeps[1].notes);
                    expect(res.body[1].duration).to.eql(expectedSleeps[1].duration);
                    expect(res.body[1].sleep_type).to.eql(expectedSleeps[1].sleep_type);
                    expect(res.body[1].sleep_category).to.eql(expectedSleeps[1].sleep_category);
                    expect(res.body[1].child_id).to.eql(expectedSleeps[1].child_id);
                });
        });
        it('GET /api/sleeping/:sleepId responds with 200 and requested sleep instance', () => {
            const sleep_id = 1;
            const expectedSleep = testSleeps[sleep_id - 1];
            return supertest(app)
                .get(`/api/sleeping/${sleep_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('date');
                    expect(res.body.notes).to.eql(expectedSleep.notes);
                    expect(res.body.duration).to.eql(expectedSleep.duration);
                    expect(res.body.sleep_type).to.eql(expectedSleep.sleep_type);
                    expect(res.body.sleep_category).to.eql(expectedSleep.sleep_category);
                    expect(res.body.child_id).to.eql(expectedSleep.child_id);
                });
        });
        it('PATCH /api/sleeping/:sleepId responds with 204, updates sleep instance', () => {
            const sleep_id = 1;
            const editedSleep = {
                notes:`good sleep`,
                duration: '00:25:22',
                sleep_type: 'calm',
                sleep_category: 'bedtime',
                child_id: 1,
            };
            return supertest(app)
                .patch(`/api/sleeping/${sleep_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(editedSleep)
                .expect(201)
                .then(res =>
                    supertest(app)
                        .get(`/api/sleeping/${sleep_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(res => {
                            expect(res.body).to.have.property('id');
                            expect(res.body).to.have.property('date');
                            expect(res.body.notes).to.eql(editedSleep.notes);
                            expect(res.body.duration).to.eql(editedSleep.duration);
                            expect(res.body.sleep_type).to.eql(editedSleep.sleep_type);
                            expect(res.body.sleep_category).to.eql(editedSleep.sleep_category);
                            expect(res.body.child_id).to.eql(editedSleep.child_id);
                        })
                );
        });
        it('PATCH /api/sleeping/:sleepId responds with 204 when updating a subset of fields', () => {
            const sleep_id = 1;
            const editedSleep = {
                sleep_category: 'bedtime',
            };
            const sleepToChange = testSleeps[sleep_id - 1];
            return supertest(app)
                .patch(`/api/sleeping/${sleep_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(editedSleep)
                .expect(201)
                .then(res =>
                    supertest(app)
                        .get(`/api/sleeping/${sleep_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(res => {
                            expect(res.body).to.have.property('id');
                            expect(res.body).to.have.property('date');
                            expect(res.body.notes).to.eql(sleepToChange.notes);
                            expect(res.body.duration).to.eql(sleepToChange.duration);
                            expect(res.body.sleep_type).to.eql(sleepToChange.sleep_type);
                            expect(res.body.sleep_category).to.eql(sleepToChange.sleep_category);
                            expect(res.body.child_id).to.eql(sleepToChange.child_id);
                        })
                );
        });
        it('PATCH /api/sleeping/:sleepId responds 400 when no required fields are given', () => {
            const sleep_id = 1;
            return supertest(app)
                .patch(`/api/sleeping/${sleep_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send({ childrenId: 1 })
                .expect(400, {
                    error: {
                        message: 'Request body must contain value to update',
                    },
                });
        });
        it('DELETE /api/sleeping/:sleepId responds with 204 and removes the sleep instance', () => {
            const sleep_id = 2;
            return supertest(app)
                .delete(`/api/sleeping/${sleep_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204);
        });
    });

    context('Given no sleeps in the database', () => {
            it('DELETE /api/sleeping/:sleepId responds with 404', () => {
                const sleep_id = 1;
                return supertest(app)
                    .delete(`/api/sleeping/${sleep_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Sleep instance does not exist' },
                    });
            });
            it(`GET /api/sleeping/all responds with 200 and an empty list`, () => {
                const child_id = 1;
                return supertest(app)
                    .get(`/api/sleeping/all/${child_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
            it('GET /api/sleeping/:sleepId responds with 404', () => {
                const sleep_id = 1;
                return supertest(app)
                    .get(`/api/sleeping/${sleep_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Sleep instance does not exist' },
                    });
            });
            it.only('PATCH /api/sleeping/:sleepId responds with 404', () => {
                const sleep_id = 1;
                return supertest(app)
                    .patch(`/api/sleeping/${sleep_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Sleep instance does not exist' },
                    });
            });
        });

    //     it('POST /api/eating/all responds with 201 and the new meal', () => {
    //         const child_id = 1;
    //         const newMeal = {
    //             notes: 'fussy',
    //             duration: '00:15:22',
    //             food_type: 'breast_fed',
    //             side_fed: 'left',
    //         };
    //         return supertest(app)
    //             .post(`/api/eating/all/${child_id}`)
    //             .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //             .send(newMeal)
    //             .expect(201)
    //             .expect(res => {
    //                 expect(res.body).to.have.property('id');
    //                 expect(res.body).to.have.property('date');
    //                 expect(res.body.notes).to.eql(newMeal.notes);
    //                 expect(res.body.duration).to.eql(newMeal.duration);
    //                 expect(res.body.food_type).to.eql(newMeal.food_type);
    //                 expect(res.body.side_fed).to.eql(newMeal.side_fed);
    //                 expect(res.body.child_id).to.eql(child_id);
    //                 expect(res.headers.location).to.eql(
    //                     `/api/eating/all/${child_id}/${res.body.id}`
    //                 );
    //             })
    //             .then(postRes =>
    //                 supertest(app)
    //                     .get(`/api/eating/${postRes.body.id}`)
    //                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //                     .expect(postRes.body)
    //             );
    //     });

    //     const requiredFields = ['duration', 'food_type'];
    //     requiredFields.forEach(field => {
    //         const reqNewMeal = {
    //             duration: '00:56:33',
    //             food_type: 'bottle',
    //         };
    //         it(`responds with 400 and an error when the '${field}' is missing`, () => {
    //             delete reqNewMeal[field];
    //             const child_id = 1;
    //             return supertest(app)
    //                 .post(`/api/eating/all/${child_id}`)
    //                 .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //                 .send(reqNewMeal)
    //                 .expect(400, {
    //                     error: { message: `Missing '${field}' in request body` },
    //                 });
    //         });
    });

    context('Given an xss attack', () => {
        const { maliciousSleep, expectedSleep } = helpers.makeMaliciousSleeps();

        beforeEach('insert malicious sleep', () => {
            return db.into('sleeping').insert(maliciousSleep);
        });

        it(`GET /api/sleeping/all/:childId removes xss content`, () => {
            const child_id = 1
            return supertest(app)
                .get(`/api/sleeping/all/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('date');
                    expect(res.body[0].notes).to.eql(expectedSleep.notes);
                    expect(res.body[0].duration).to.eql(expectedSleep.duration);
                    expect(res.body[0].sleep_type).to.eql(expectedSleep.sleep_type);
                    expect(res.body[0].sleep_category).to.eql(expectedSleep.sleep_category);
                    expect(res.body[0].child_id).to.eql(expectedSleep.child_id);
                });
        });
        it(`GET /api/sleeping/:sleepId removes xss content`, () => {
            const sleep_id = 1;
            return supertest(app)
                .get(`/api/sleeping/${sleep_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('date');
                    expect(res.body.notes).to.eql(expectedSleep.notes);
                    expect(res.body.duration).to.eql(expectedSleep.duration);
                    expect(res.body.sleep_type).to.eql(expectedSleep.sleep_type);
                    expect(res.body.sleep_category).to.eql(expectedSleep.sleep_category);
                    expect(res.body.child_id).to.eql(expectedSleep.child_id);
                });
        });
    //     it(`POST /api/eating/all removes xss content`, () => {
    //         const child_id = 1;
    //         return supertest(app)
    //             .post(`/api/eating/all/${child_id}`)
    //             .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //             .send(maliciousMeal)
    //             .expect(201)
    //             .expect(res => {
    //                 expect(res.body).to.have.property('id');
    //                 expect(res.body).to.have.property('date');
    //                 expect(res.body.notes).to.eql(expectedMeal.notes);
    //                 expect(res.body.duration).to.eql(expectedMeal.duration);
    //                 expect(res.body.food_type).to.eql(expectedMeal.food_type);
    //                 expect(res.body.side_fed).to.eql(expectedMeal.side_fed);
    //                 expect(res.body.child_id).to.eql(expectedMeal.child_id);
    //             });
        // });
    // });
});

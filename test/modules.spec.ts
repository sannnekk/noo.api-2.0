import request from 'supertest'
import app from '../src/main'
import fs from 'fs'

let userToken: string
let teacherToken: string
let userId: string
let teacherId = '01HJNGKPMFH5P93669W9J6HEFA'

describe('User module', function () {
	it('Registering user with a short password', function (done) {
		request(app)
			.post('/user/register')
			.send({
				username: 'test_user',
				name: 'Test User',
				email: 'test@text.com',
				password: '123456',
			})
			.expect(400, done)
	})

	it('Registering user with a short username', function (done) {
		request(app)
			.post('/user/register')
			.send({
				username: 't',
				name: 'Test User',
				email: 'test2@test.com',
				password: '12345678',
			})
			.expect(400, done)
	})

	it('Registering user', function (done) {
		request(app)
			.post('/user/register')
			.send({
				username: 'test_user',
				name: 'Test User',
				email: 'test@text.com',
				password: '12345678',
			})
			.expect(201, done)
	})

	it('Logging in with wrong credentials', function (done) {
		request(app)
			.post('/user/login')
			.send({
				username: 'test_userrrrr',
				password: '12345678',
			})
			.expect(401, done)
	})

	it('Logging in with correct credentials', function (done) {
		request(app)
			.post('/user/login')
			.send({
				username: 'test_user',
				password: '12345678',
			})
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err)
				userToken = res.body.token
				done()
			})
	})

	it('Getting user info with no authentification', function (done) {
		request(app).get('/user/test_user').expect(401, done)
	})

	it('Getting user info with authentification', function (done) {
		request(app)
			.get('/user/test_user')
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err)
				if (res.body.username !== 'test_user') return done('Wrong user')
				userId = res.body.id
				done()
			})
	})

	it('Updating user info with no authentification', function (done) {
		request(app)
			.patch(`/user/${userId}`)
			.send({
				username: 'test_user',
				name: 'Test User',
				email: 'test2@gmail.com',
			})
			.expect(400, done)
	})

	it('Updating user info with auth and wrong id in GET but right in body', function (done) {
		request(app)
			.patch(`/user/01HJCW6X2C0VBN07760DPGWJG8`)
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				id: userId,
				username: 'test_user',
				name: 'Test User',
				email: 'test2@gmail.com',
			})
			.expect(403, done)
	})

	it('Updating user info with authentification', function (done) {
		request(app)
			.patch(`/user/${userId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				id: userId,
				username: 'test_user',
				name: 'Test User',
				email: 'test2@gmail.com',
			})
			.expect(204, done)
	})

	it('Deleting user without auth that doesnt exist', function (done) {
		request(app)
			.delete(`/user/01HJCW6X2C0VBN07760DPGWJG8`)
			.expect(403, done)
	})

	it('Deleting existing user without auth', function (done) {
		request(app).delete(`/user/${userId}`).expect(403, done)
	})

	it('Logging in as a teacher', function (done) {
		request(app)
			.post('/user/login')
			.send({
				username: 'test_teacher',
				password: '12345678',
			})
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err)
				teacherToken = res.body.token
				done()
			})
	})
})

let courseSlug: string
let courseId: string

describe('Course module', function () {
	it('Getting some course with no authentication', function (done) {
		request(app).get('/course/1').expect(400, done)
	})

	it('Creating a course as a student', function (done) {
		request(app)
			.post('/course')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				name: 'Test Course',
				description: 'Test Course Description',
			})
			.expect(403, done)
	})

	it('Creating a course as a teacher', function (done) {
		request(app)
			.post('/course')
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({
				name: 'Test Course',
				description: 'Test Course Description',
				chapters: [
					{
						name: 'Test Chapter',
						materials: [],
					},
					{
						name: 'Test Chapter 2',
						materials: [
							{
								name: 'Test Material',
								description: 'Test Material Description',
								content: {
									ops: [
										{
											insert: 'Test Material Content',
										},
									],
								},
							},
						],
					},
				],
			})
			.expect(201, done)
	})

	it('Getting some course with authentication but wrong id', function (done) {
		request(app)
			.get('/course/01HJMA9275EG5Q19B07QV8F3DC')
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(404, done)
	})

	it('Getting courses with no authentication', function (done) {
		request(app).get('/course').expect(401, done)
	})

	it('Getting courses with authentication as a student', function (done) {
		request(app)
			.get('/course')
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err)
				if (res.body.length === 0) return done('No courses found')
				courseSlug = res.body[0].slug
				courseId = res.body[0].id
				done()
			})
	})

	it('Getting courses with authentication as a teacher', function (done) {
		request(app)
			.get('/course')
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err)
				if (res.body.length === 0) return done('No courses found')
				if (!res.body[0].author) return done('No author found')
				done()
			})
	})

	it('Updating a course with no authentication', function (done) {
		request(app)
			.patch(`/course/${courseId}`)
			.send({
				id: courseId,
				name: 'Test Course',
				description: 'Test Course Description',
			})
			.expect(401, done)
	})

	it('Updating a course with authentication as a student', function (done) {
		request(app)
			.patch(`/course/${courseId}`)
			.send({
				id: courseId,
				name: 'Test Course',
				description: 'Test Course Description',
			})
			.expect(401, done)
	})

	it('Updating a course that doesnt exist', function (done) {
		request(app)
			.patch('/course/01HJNGKPMFH5P93669W9J6HEFA')
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({
				id: '01HJNGKPMFH5P93669W9J6HEFA',
				name: 'Test Course with a new Name',
				description: 'Test Course Another Description',
			})
			.expect(404, done)
	})

	it('Updating a course with chapters and materials as a teacher', function (done) {
		request(app)
			.patch(`/course/${courseId}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({
				id: courseId,
				name: 'Test Course with a new Name',
				description: 'Test Course Another Description',
				chapters: [
					{
						name: 'Test Chapter',
						materials: [],
					},
					{
						name: 'Test Chapter 1.5',
						materials: [
							{
								name: 'Test Material 555',
								description: 'Test Material Description ASS',
								content: {
									ops: [
										{
											insert: 'Test Material Content 555',
										},
									],
								},
							},
						],
					},
					{
						name: 'Test Chapter 2',
						materials: [
							{
								name: 'Test Material',
								description: 'Test Material Description',
								content: {
									ops: [
										{
											insert: 'Test Material Content 2',
										},
									],
								},
							},
						],
					},
				],
			})
			.expect(204)
			.end(async function (err, res) {
				if (err) {
					await fs.writeFile(
						'test.json',
						JSON.stringify(res.body),
						() => {}
					)
					return done(err)
				}
				done()
			})
	})

	it('Getting courses with authentication as a teacher after update', function (done) {
		request(app)
			.get('/course')
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err)
				if (res.body.length === 0) return done('No courses found')
				if (!res.body[0].author) return done('No author found')
				done()
			})
	})

	it('Checking if the course was updated', function (done) {
		request(app)
			.get(`/course/${courseSlug}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err)
				if (res.body.name !== 'Test Course with a new Name')
					return done('Wrong name')
				if (res.body.description !== 'Test Course Another Description')
					return done('Wrong description')
				if (res.body.chapters.length !== 3)
					return done('Wrong chapters')
				if (res.body.chapters[1].materials.length !== 1)
					return done('Wrong materials')
				done()
			})
	})

	it('Deleting a course as a student', function (done) {
		request(app)
			.delete(`/course/${courseId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(403, done)
	})

	it('Deleting a course as a teacher', function (done) {
		request(app)
			.delete(`/course/${courseId}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(204, done)
	})
})

let workId: string
let workSlug: string

describe('Works module', function () {
	it('Creating a work as a student', function (done) {
		request(app)
			.post('/work')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				name: 'Test Work',
				description: 'Test Work Description',
				type: 'text',
				tasks: [
					{
						name: 'Test Task',
						content: {
							ops: [
								{
									insert: 'Test Task Content',
								},
							],
						},
						highestScore: 10,
					},
				],
			})
			.expect(403, done)
	})

	it('Creating a work as a teacher', function (done) {
		request(app)
			.post('/work')
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({
				name: 'Test Work',
				description: 'Test Work Description',
				type: 'text',
				tasks: [
					{
						name: 'Test Task',
						content: {
							ops: [
								{
									insert: 'Test Task Content',
								},
							],
						},
						highestScore: 10,
					},
				],
			})
			.expect(201, done)
	})

	it('Getting a work that doesnt exist', function (done) {
		request(app)
			.get('/work/01HJMA9275EG5Q19B07QV8F3DC')
			.set('Authorization', `Bearer ${userToken}`)
			.expect(404, done)
	})

	it('Getting works', function (done) {
		request(app)
			.get('/work')
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err)
				if (res.body.length === 0) return done('No works found')
				workSlug = res.body[0].slug
				done()
			})
	})

	it('Getting work by slug', function (done) {
		request(app)
			.get(`/work/${workSlug}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err)
				if (res.body.name !== 'Test Work') return done('Wrong work')
				workId = res.body.id
				done()
			})
	})

	it('Updating a work that doesnt exist', function (done) {
		request(app)
			.patch(`/work/01HJMA9275EG5Q19B07QV8F3DC`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({
				id: '01HJMA9275EG5Q19B07QV8F3DC',
				name: 'Test Work with a new Name',
				description: 'Test Work Another Description',
			})
			.expect(404, done)
	})

	it('Updating a work', function (done) {
		request(app)
			.patch(`/work/${workId}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({
				id: workId,
				name: 'Test Work with a new Name',
				description: 'Test Work Another Description',
			})
			.expect(204, done)
	})

	it('Checking if the work was updated', function (done) {
		request(app)
			.get(`/work/${workSlug}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err)
				if (res.body.name !== 'Test Work with a new Name')
					return done('Wrong name')
				if (res.body.description !== 'Test Work Another Description')
					return done('Wrong description')
				done()
			})
	})
})

describe('Assigned Works module', function () {
	it('Creating an assigned work as a student', function (done) {
		request(app)
			.post('/assigned-work')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				workId,
				studentId: userId,
			})
			.expect(403, done)
	})

	it('Creating an assigned work as a teacher', function (done) {
		request(app)
			.post('/assigned-work')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				workId,
				studentId: userId,
			})
			.expect(403, done)
	})
})

describe('Deleting a work', function () {
	it('Deleting a work as a student', function (done) {
		request(app)
			.delete(`/work/${workId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(403, done)
	})

	it('Deleting a work as a teacher', function (done) {
		request(app)
			.delete(`/work/${workId}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.expect(204, done)
	})
})

describe('Deleting a user', function () {
	it('Deleting a user', function (done) {
		request(app)
			.delete(`/user/${userId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(204, done)
	})
})

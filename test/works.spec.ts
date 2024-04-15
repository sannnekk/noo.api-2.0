import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { app, initUser, USERNAME, EMAIL } from './init'
import { expect } from 'chai'
import itParam from 'mocha-param'
import { v4 as uuid } from 'uuid'
import { ulid } from 'ulidx'

describe('Works Module', function () {
	// Test Data
	var studentUser = { role: 'student' as const }
	initUser(studentUser)
	var studentToken = studentUser.token

	var mentorUser = { role: 'mentor' as const }
	initUser(mentorUser)
	var mentorToken = mentorUser.token

	var teacherUser = { role: 'teacher' as const }
	initUser(teacherUser)
	var teacherToken = teacherUser.token

	var adminUser = { role: 'admin' as const }
	initUser(adminUser)
	var adminToken = adminUser.token

	var testWork = {
		slug: uuid(),
		name: 'testName',
		type: 'test',
		description: 'testDescription',
		tasks: [
			{
				content: 'content1',
				highestScore: 2,
				type: 'text',
				rightAnswer: 'answer1',
				solveHint: 'solveHint1',
				checkHint: 'checkHint1',
				checkingStrategy: 'type1',
			},
			{
				content: 'content2',
				highestScore: 3,
				type: 'text2',
				rightAnswer: 'answer2',
				solveHint: 'solveHint2',
				checkHint: 'checkHint2',
				checkingStrategy: 'type2',
			},
		],
	}

	var updateWorkTestObject = {
		id: 'notSetYet_Invalid_id',
		slug: uuid(),
		name: 'newName',
		type: 'second-part',
		description: 'newDescription',
		tasks: [
			{
				content: 'content1',
				highestScore: 2,
				type: 'text',
				rightAnswer: 'answer1',
				solveHint: 'solveHint1',
				checkHint: 'checkHint1',
				checkingStrategy: 'type1',
			},
			{
				content: 'content2',
				highestScore: 3,
				type: 'text2',
				rightAnswer: 'answer2',
				solveHint: 'solveHint2',
				checkHint: 'checkHint2',
				checkingStrategy: 'type2',
			},
			{
				content: 'content3',
				highestScore: 10,
				type: 'text3',
				rightAnswer: 'answer3',
				solveHint: 'solveHint3',
				checkHint: 'checkHint3',
				checkingStrategy: 'type3',
			},
		],
	}

	// Tests
	it('Does not get works when unauthorised', function (done) {
		request(app)
			.get('/work')
			.send()
			.expect(StatusCodes.UNAUTHORIZED, done)
	})

	it('Does not get works when student', function (done) {
		request(app)
			.get('/work')
			.set('Authorization', `Bearer ${studentToken}`)
			.send()
			.expect(StatusCodes.FORBIDDEN, done)
	})

	it('Does not get works when mentor', function (done) {
		request(app)
			.get('/works')
			.set('Authorization', `Bearer ${mentorToken}`)
			.send()
			.expect(StatusCodes.FORBIDDEN, done)
	})

	itParam(
		'Gets works when teacher or admin',
		[teacherToken, adminToken],
		function (done, authToken) {
			request(app)
				.get('/work')
				.set('Authorization', `Bearer ${authToken}`)
				.send()
				.expect(StatusCodes.OK)
				.end((err, res) => {
					if (err) done(err)
					var data = res.body.data

					if (Array.isArray(data)) {
						for (const work of data) {
							expect(work).toEqual(
								expect.objectContaining({
									id: expect.any(Object),
								})
							)
						}
						done()
					} else {
						done(new Error('Wrong payload, expected array of Works'))
					}
				})
		}
	)

	it('Does not get work by slug when unauthorised', function (done) {
		request(app)
			.get('/work/testSlug')
			.send()
			.expect(StatusCodes.UNAUTHORIZED, done)
	})

	itParam(
		'Does not get work by short slug',
		[studentToken, mentorToken, teacherToken, adminToken],
		function (done, authToken) {
			request(app)
				.get('/work/t')
				.set('Authorization', `Bearer ${authToken}`)
				.send()
				.expect(StatusCodes.BAD_REQUEST, done)
		}
	)

	itParam(
		'Does not get work by 257 chars and longer slug',
		[studentToken, mentorToken, teacherToken, adminToken],
		function (done, authToken) {
			request(app)
				.get(
					'/work/slugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersslugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersAnotherTwentyNineCharactersss'
				)
				.set('Authorization', `Bearer ${authToken}`)
				.send()
				.expect(StatusCodes.BAD_REQUEST, done)
		}
	)

	itParam(
		'Gets work by slug',
		[studentToken, mentorToken, teacherToken, adminToken],
		function (done, authToken) {
			request(app)
				.get('/work/testSlug')
				.set('Authorization', `Bearer ${authToken}`)
				.send()
				.expect(StatusCodes.OK)
				.end((err, res) => {
					if (err) done(err)
					var data = res.body.data

					expect(data).toEqual(
						expect.objectContaining({
							id: expect.any(Object),
						})
					)
					done()
				})
		}
	)

	it('Does not create work when unauthorised', function (done) {
		request(app)
			.post('/work')
			.send()
			.expect(StatusCodes.UNAUTHORIZED, done)
	})

	itParam(
		'Does not create work if not teacher',
		[studentToken, mentorToken, adminToken],
		function (done, authToken) {
			request(app)
				.post('/work')
				.set('Authorization', `Bearer ${authToken}`)
				.send()
				.expect(StatusCodes.FORBIDDEN, done)
		}
	)

	itParam(
		'Does not create invalid work',
		[teacherToken],
		function (done, authToken) {
			request(app)
				.post('/work')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: 'workWithOnlyNameDefined',
				})
				.expect(StatusCodes.BAD_REQUEST, done)
		}
	)

	itParam(
		'Can get work when successfully created work',
		[teacherToken],
		function (done, authToken) {
			request(app)
				.post('/work')
				.send({
					...testWork,
				})
				.expect(StatusCodes.OK)

			request(app)
				.get(`/work/${testWork.slug}`)
				.send()
				.expect(StatusCodes.OK)
				.end((err, res) => {
					if (err) done(err)
					var data = res.body.data

					expect(data, done).toEqual(
						expect.objectContaining({
							id: expect.any(Object),
							...testWork,
						})
					)
					done()
				})
		}
	)

	it('Does not copy work by slug when unauthorised', function (done) {
		request(app)
			.post('/work/copy/1')
			.send({})
			.expect(StatusCodes.UNAUTHORIZED, done)
	})

	itParam(
		'Does not copy work by slug if not teacher',
		[studentToken, mentorToken, adminToken],
		function (done, authToken) {
			request(app)
				.post('/work/copy/1')
				.set('Authorization', `Bearer ${authToken}`)
				.send({})
				.expect(StatusCodes.FORBIDDEN, done)
		}
	)

	itParam(
		'Does not copy work by invalid slug',
		[
			'1',
			'slugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersslugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersAnotherTwentyNineCharactersss',
		],
		function (done, invalidSlug) {
			request(app)
				.post(`/work/copy/${invalidSlug}`)
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({})
				.expect(StatusCodes.BAD_GATEWAY, done)
		}
	)

	it('Cannot copy work by slug which does not exist', function (done) {
		request(app)
			.post(
				'/work/copy/slugWhichDefinitelyAndForSureDoesNotExistIAmSureItDoesNotExist'
			)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({})
			.expect(StatusCodes.NOT_FOUND, done)
	})

	it('Copies existing work by slug', function (done) {
		request(app)
			.post(`/work/copy/${testWork.slug}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({})
			.expect(StatusCodes.CREATED, done)
	})

	it('Does not update Work when unauthorised', function (done) {
		request(app)
			.patch('/work/1')
			.send()
			.expect(StatusCodes.UNAUTHORIZED, done)
	})

	itParam(
		'Does not update Work with invalid id',
		['1', 'invalidUlid'],
		function (done, id) {
			request(app)
				.patch(`/work/${id}`)
				.set('Authorization', `Bearer ${teacherToken}`)
				.send()
				.expect(StatusCodes.BAD_REQUEST, done)
		}
	)

	it('Does not update Work when invalid request body', function (done) {
		updateWorkTestObject.id = 'invalid_id'
		request(app)
			.patch(`/work/${uuid()}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send(updateWorkTestObject)
			.expect(StatusCodes.BAD_REQUEST, done)
	})

	it('Updates existing work', function (done) {
		request(app)
			.get(`/work/${testWork.slug}`)
			.send()
			.expect(StatusCodes.OK)
			.end((err, res) => {
				if (err) done(err)
				updateWorkTestObject.id = res.body.data.id
			})

		request(app)
			.patch(`/work/${updateWorkTestObject.id}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send(updateWorkTestObject)
			.expect(StatusCodes.OK)

		request(app)
			.get(`/work/${updateWorkTestObject.slug}`)
			.send()
			.expect(StatusCodes.OK)
			.end((err, res) => {
				expect(res.body.data).toEqual(
					expect.objectContaining({
						...updateWorkTestObject,
					})
				)
				done()
			})
	})

	itParam(
		'Does not update Work when not teacher',
		[
			'1',
			'slugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersslugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersSlugWithTwoHundredFiftySevenCharactersAnotherTwentyNineCharactersss',
		],
		function (done, invalidSlug) {
			request(app)
				.post(`/work/copy/${invalidSlug}`)
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({})
				.expect(StatusCodes.BAD_GATEWAY, done)
		}
	)

	it('Cannot copy work by slug which does not exist', function (done) {
		request(app)
			.post(
				'/work/copy/slugWhichDefinitelyAndForSureDoesNotExistIAmSureItDoesNotExist'
			)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({})
			.expect(StatusCodes.NOT_FOUND, done)
	})

	it('Copies existing work by slug', function (done) {
		request(app)
			.post(`/work/copy/${testWork.slug}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send({})
			.expect(StatusCodes.CREATED, done)
	})

	itParam(
		'Can get and then delete existing work',
		[teacherToken],
		function (done, authToken) {
			var workId = null

			request(app)
				.get(`/work/${testWork.slug}`)
				.send()
				.expect(StatusCodes.OK)
				.end((err, res) => {
					if (err) done(err)
					workId = res.body.data.id
				})

			request(app)
				.delete(`/work/${workId}`)
				.send()
				.expect(StatusCodes.OK, done)
		}
	)

	it('Does not delete work when unauthorised', function (done) {
		request(app)
			.delete('/work/id1')
			.send()
			.expect(StatusCodes.UNAUTHORIZED, done)
	})

	itParam(
		'Does not delete work if not teacher',
		[studentToken, mentorToken, adminToken],
		function (done, authToken) {
			request(app)
				.delete('/work/id1')
				.set('Authorization', `Bearer ${authToken}`)
				.send()
				.expect(StatusCodes.FORBIDDEN, done)
		}
	)

	itParam(
		'Validates id when deleting work',
		['1', 'invalidUlid'],
		function (done, testData) {
			request(app)
				.delete(`/work/${testData}`)
				.set('Authorization', `Bearer ${teacherToken}`)
				.send()
				.expect(StatusCodes.BAD_REQUEST, done)
		}
	)

	it('Does not delete work which does not exist', function (done) {
		request(app)
			.delete(`/work/${ulid()}`)
			.set('Authorization', `Bearer ${teacherToken}`)
			.send()
			.expect(StatusCodes.NOT_FOUND, done)
	})
})

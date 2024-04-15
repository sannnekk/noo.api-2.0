import request from 'supertest'
import { app, initUser, USERNAME, EMAIL } from './init'
import { StatusCodes } from 'http-status-codes'
import { expect } from 'chai'
import { getNewPasswordAfterForgotten, verifyUser } from './helpers'
import { v4 as uuid } from 'uuid'

describe('User module', function () {
	it('Registering user with a short password', function (done) {
		request(app)
			.post('/user/auth/register')
			.send({
				username: 'test_user',
				name: 'Test User',
				email: 'test@text.com',
				password: '123456',
			})
			.expect(StatusCodes.BAD_REQUEST, done)
	})

	it('Registering user with short username', function (done) {
		request(app)
			.post('/user/auth/register')
			.send({
				username: 't',
				name: 'Test User',
				email: 'afasf@hotmail.com',
				password: '12345678!oo',
			})
			.expect(StatusCodes.BAD_REQUEST, done)
	})

	it('Registering user with username with whitespace', function (done) {
		request(app)
			.post('/user/auth/register')
			.send({
				username: 'test user',
				name: 'Test User',
				email: 'afasf@hotmail.com',
				password: '12345678!kk',
			})
			.expect(StatusCodes.BAD_REQUEST, done)
	})

	it('Registering user with nonlatin username', function (done) {
		request(app)
			.post('/user/auth/register')
			.send({
				username: 'тест',
				name: 'Test User',
				email: 'afasf@hotmail.com',
				password: '12345678asd!@#',
			})
			.expect(StatusCodes.BAD_REQUEST, done)
	})

	it('Registering user with invalid email', function (done) {
		request(app)
			.post('/user/auth/register')
			.send({
				username: 'test_user',
				name: 'Test User',
				email: 'afasf',
				password: '12345678!jncksd',
			})
			.expect(StatusCodes.BAD_REQUEST, done)
	})

	it('Registering user with existing username', function (done) {
		request(app)
			.post('/user/auth/register')
			.send({
				username: USERNAME.admin,
				name: 'Test User',
				email: 'asdas@hotmail.ru',
				password: '12345678',
			})
			.expect(StatusCodes.CONFLICT, done)
	})

	it('Registering user with existing email', function (done) {
		request(app)
			.post('/user/auth/register')
			.send({
				username: 'test_user1233',
				name: 'Test User',
				email: EMAIL.admin,
				password: '12345678',
			})
			.expect(StatusCodes.CONFLICT, done)
	})

	const tmpUser = {
		username: uuid(),
		email: 'afasf@hotmail.com',
		password: '12345678!oo',
		id: '',
		token: '',
	}

	it('Registering user with role (should always create student)', function (done) {
		request(app)
			.post('/user/auth/register')
			.send({
				username: tmpUser.username,
				name: 'Test User',
				email: tmpUser.email,
				role: 'admin',
				password: tmpUser.password,
			})
			.expect(StatusCodes.NO_CONTENT, done)
	})

	it('Verifying user', function (done) {
		verifyUser(app, tmpUser.email, done)
	})

	it('Checking the users role (should be student)', function (done) {
		request(app)
			.post('/user/auth/login')
			.send({
				usernameOrEmail: tmpUser.username,
				password: tmpUser.password,
			})
			.expect(StatusCodes.OK)
			.end(function (err, res) {
				if (err) return done(err)

				const user = res.body.data?.user

				tmpUser.id = user?.id
				tmpUser.token = res.body.data?.token

				expect(user?.role).to.equal('student')
				done()
			})
	})

	it('Changing user username (shouldnt be changed)', function (done) {
		request(app)
			.patch(`/user/${tmpUser.id}`)
			.set('Authorization', `Bearer ${tmpUser.token}`)
			.send({
				id: tmpUser.id,
				username: 'new_username',
			})
			.expect(StatusCodes.OK, done)
	})

	it('Checking if username was changed', function (done) {
		request(app)
			.post('/user/auth/login')
			.send({
				usernameOrEmail: 'new_username',
				password: tmpUser.password,
			})
			.expect(StatusCodes.UNAUTHORIZED, done)
	})

	it('Changing user credentials', function (done) {
		request(app)
			.patch(`/user/${tmpUser.id}`)
			.set('Authorization', `Bearer ${tmpUser.token}`)
			.send({
				id: tmpUser.id,
				email: 'abc@hdef.de',
				name: 'New Name',
				telegramUsername: 'new_telegram',
			})
			.expect(StatusCodes.OK, done)
	})

	it('Checking if credentials were changed', function (done) {
		request(app)
			.get(`/user/${tmpUser.username}`)
			.set('Authorization', `Bearer ${tmpUser.token}`)
			.expect(StatusCodes.OK)
			.end(function (err, res) {
				if (err) return done(err)

				const user = res.body.data

				expect(user).to.deep.include({
					username: tmpUser.username,
					email: 'abc@hdef.de',
					name: 'New Name',
					telegramUsername: 'new_telegram',
				})

				tmpUser.email = 'abc@hdef.de'

				done()
			})
	})

	it('Changing password (should fail because password is invalid)', function (done) {
		request(app)
			.patch(`/user/${tmpUser.username}`)
			.set('Authorization', `Bearer ${tmpUser.token}`)
			.send({
				id: tmpUser.id,
				password: 'new_password',
			})
			.expect(StatusCodes.BAD_REQUEST, done)
	})

	it('Changing password', function (done) {
		request(app)
			.patch(`/user/${tmpUser.username}`)
			.set('Authorization', `Bearer ${tmpUser.token}`)
			.send({
				id: tmpUser.id,
				password: 'new_password123!',
			})
			.expect(StatusCodes.OK, done)
	})

	it('Logging in with old password (should fail)', function (done) {
		request(app)
			.post('/user/auth/login')
			.send({
				usernameOrEmail: tmpUser.username,
				password: tmpUser.password,
			})
			.expect(StatusCodes.UNAUTHORIZED, done)
	})

	it('Logging in with new password', function (done) {
		request(app)
			.post('/user/auth/login')
			.send({
				usernameOrEmail: tmpUser.username,
				password: 'new_password123!',
			})
			.expect(StatusCodes.OK, done)
	})

	it('Forgot password', function (done) {
		request(app)
			.post('/user/auth/forgot-password')
			.send({
				email: tmpUser.email,
			})
			.expect(StatusCodes.OK, done)
	})

	it('Cheking the new password from email', function (done) {
		const newPassword = getNewPasswordAfterForgotten(tmpUser.email)

		request(app)
			.post('/user/auth/login')
			.send({
				usernameOrEmail: tmpUser.username,
				password: newPassword,
			})
			.expect(StatusCodes.OK, done)
	})

	it('Deleting user', function (done) {
		request(app)
			.delete(`/user/${tmpUser.id}`)
			.set('Authorization', `Bearer ${tmpUser.token}`)
			.expect(StatusCodes.OK, done)
	})

	it('Checking if user was deleted', function (done) {
		request(app)
			.get(`/user/${tmpUser.username}`)
			.expect(StatusCodes.UNAUTHORIZED, done)
	})
})

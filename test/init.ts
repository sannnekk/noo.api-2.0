import app from '../src/main'
import request from 'supertest'

const EMAIL = {
	admin: 'admin@noo-school.ru',
	student: 'student@noo-school.ru',
	teacher: 'teacher@noo-school.ru',
	mentor: 'mentor@noo-school.ru',
}

const USERNAME = {
	admin: 'test_admin',
	student: 'test_student',
	teacher: 'test_teacher',
	mentor: 'test_mentor',
}

const PASSWORD = 'password'

/**
 * Initialize a user with the given credentials
 *
 * Only pass the role, the username, id and token will be filled in from server response
 */
function initUser(credentials: {
	role: keyof typeof USERNAME
	username?: string
	token?: string
	id?: string
}): asserts credentials is {
	id: string
	role: keyof typeof USERNAME
	username: string
	token: string
} {
	describe('Test initialization', function () {
		it('Logging in', function (done) {
			request(app)
				.post('/user/auth/login')
				.send({
					usernameOrEmail: USERNAME[credentials.role],
					password: PASSWORD,
				})
				.expect(200)
				.end(function (err, res) {
					if (err) return done(err)

					if (!res.body.data) {
						done(new Error('No data found'))
					}

					const { token, user } = res.body.data

					if (!token) {
						done(new Error('No token found'))
					}

					if (!user) {
						done(new Error('No user found in response'))
					}

					credentials.token = token
					credentials.id = user.id
					credentials.username = user.username

					done()
				})
		})
	})
}

export { app, initUser, USERNAME, EMAIL }

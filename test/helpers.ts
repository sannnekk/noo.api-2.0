import fs from 'fs'
import path from 'path'
import { Express } from 'express'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'

export function verifyUser(app: Express, email: string, done) {
	// get email file
	const emailfile = fs.readFileSync(
		path.join(process.cwd(), 'test/email', `${email}.html`),
		'utf8'
	)

	// find token in email. Token is always between 'token=' and '&;
	const token = emailfile.match(/token=(.*?)&/)?.[1]

	if (!token) {
		throw new Error('No token found in email')
	}

	// find username in email. Username is always between username= and "
	const username = emailfile.match(/username=(.*?)"/)?.[1]

	if (!username) {
		throw new Error('No username found in email')
	}

	// Verify user
	request(app)
		.patch(`/user/auth/verify/${username}`, { username, token })
		.expect(StatusCodes.CREATED, done)
}

export function getNewPasswordAfterForgotten(email: string) {
	// get email file
	const emailfile = fs.readFileSync(
		path.join(process.cwd(), 'test/email', `${email}.html`),
		'utf8'
	)

	/**
	 * Find token in email. Token is always in the line:
	 * <p>Ваш новый пароль: <b>{{newPassword}}</b></p>
	 */
	const password = emailfile.match(
		/<p>Ваш новый пароль: <b>(.*?)<\/b>/
	)?.[1]

	if (!password) {
		throw new Error('No password found in email')
	}

	return password
}

import Mailer from 'nodemailer'

export class EmailService {
	private readonly stylesTemplate = `
    <style>
      * {
        font-family: Arial, sans-serif;
      }
      h1 {
        background-color: #defba1;
        color: #181818;
        pading: 1em;
        font-weight: normal;
        margin: 0;
      }
      p {
        background-color: #fff;
        color: #181818;
        padding: 1em;
        margin: 0;
      }
      .button-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 3em 1em;
        background-color: #fff;
      }
      .button {
        background-color: #d795f1;
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
        border-radius: 100px;
      }
      .button:hover {
        border: 2px solid #181818;
      }
      footer {
        background-color: #cdc9ff;
        color: #181818;
        padding: 1em;
        margin: 0;
      }
    </style>`

	private readonly registrationTemplate =
		`
    <h1><b>НОО.</b>Платформа - подтверждение регистрации</h1>
    <br><br>
    <p>Здравствуйте, {{name}}!</p>
    <p>Для подтверждения регистрации на сайте noo-school.ru перейдите по ссылке:</p>
    <div class="button-container">
      <a class="button" href="https://api.noo-school.ru/user/verify/?token={{token}}">Подтвердить регистрацию</a>
    </div>
    <p>
      <br><br>
      <i>Это письмо было отправлено автоматически. Пожалуйста, не отвечайте на него</i>
    </p>
    <footer>&copy; ${new Date().getFullYear()} НОО</footer>
  ` + this.stylesTemplate

	private readonly forgotPasswordTemplate =
		`
    <h1><b>НОО.</b>Платформа - восстановление пароля</h1>
    <br><br>
    <p>Здравствуйте, {{name}}!</p>
    <p>Ваш новый пароль: <b>{{newPassword}}</b></p>
    <p>
      <br><br>
      <i>Это письмо было отправлено автоматически. Пожалуйста, не отвечайте на него</i>
    </p>
    <footer>&copy; ${new Date().getFullYear()} НОО</footer>
  ` + this.stylesTemplate

	public async sendForgotPasswordEmail(
		email: string,
		name: string,
		newPassword: string
	): Promise<void> {
		const subject = 'НОО.Платформа - Восстановление пароля'
		const htmlTemplate = this.forgotPasswordTemplate
			.replaceAll('{{newPassword}}', newPassword)
			.replaceAll('{{name}}', name)

		await this.sendEmail(email, subject, htmlTemplate)
	}

	public async sendVerificationEmail(
		email: string,
		name: string,
		token: string
	): Promise<void> {
		const subject = 'НОО.Платформа - Подтверждение почты'
		const htmlTemplate = this.registrationTemplate
			.replaceAll('{{token}}', token)
			.replaceAll('{{name}}', name)

		await this.sendEmail(email, subject, htmlTemplate)
	}

	private async sendEmail(
		email: string,
		subject: string,
		htmlTemplate: string
	): Promise<void> {
		// Send email
		const transport = Mailer.createTransport({
			name: 'api.noo-school.ru',
		})

		const mailOptions = {
			from: 'noreply@noo-school.ru',
			to: email,
			subject,
			html: htmlTemplate,
		}

		await transport.sendMail(mailOptions)
	}
}

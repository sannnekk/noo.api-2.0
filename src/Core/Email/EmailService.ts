import Mailer from 'nodemailer'

export class EmailService {
	private readonly stylesTemplate = `
    <style>
      * {
        font-family: 'Montserrat', sans-serif;
      }
      h1 {
        display: block;
        background-color: #defba1;
        color: #000;
        padding: 1em;
        font-weight: normal;
        font-size: 1.3rem;
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
        border: 2px solid transparent;
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
      footer a {
        color: inherit;
        text-decoration: none;
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
    <div class="footer">
      &copy; ${new Date().getFullYear()} НОО | 
      <a href="https://noo-school.ru">noo-school.ru</a>
      <a href="https://no-os.ru/confidentiality">Политика конфиденциальности</a> |
      <a href="https://no-os.ru/oferta">Пользовательское соглашение</a>
    </div>
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
    <div class="footer">
      &copy; ${new Date().getFullYear()} НОО | 
      <a href="https://noo-school.ru">noo-school.ru</a>
      <a href="https://no-os.ru/confidentiality">Политика конфиденциальности</a> |
      <a href="https://no-os.ru/oferta">Пользовательское соглашение</a>
    </div>
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
			host: process.env.SMTP_HOST, //'root04.hmnet.eu',
			port: process.env.SMTP_PORT, // 465,
			secure: true,
			auth: {
				user: process.env.SMTP_LOGIN, //'noreply@noo-school.ru',
				pass: process.env.SMTP_PASSWORD, //'983dAb2x!'
			},
		} as any)

		const mailOptions = {
			from: 'noreply@noo-school.ru',
			to: email,
			subject,
			html: htmlTemplate,
		}

		await transport.sendMail(mailOptions)
	}
}

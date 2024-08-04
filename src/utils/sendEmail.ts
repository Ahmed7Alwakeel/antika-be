import nodemailer from "nodemailer"
import pug from "pug"
import { htmlToText } from "html-to-text"

//SendGrid send with SMTP protocol with nodemailer

export class Email {
	name: string
	to: string
	from: string
	url: string
	code?: string

	constructor(user: any, url: string, code?: string) {
		this.name = user.name.split(" ")[0]
		this.to = user.email
		this.url = url
		this.from = process.env.EMAIL_SENDER as string
		this.code = code
	}
	createTransport = () => {
		//for dev
		return nodemailer.createTransport({
			service: "SendGrid",
			secure: false, // Ensure port is a number
			auth: {
				user: process.env.SENDGRID_USERNAME,
				pass: process.env.SENDGRID_PASSWORD,
			},
		})
	}

	//sendgrid
	send = async (template: any, subject: any) => {
			const html = pug.renderFile(
				`${__dirname}/../views/emails/${template}.pug`,
				{
					name: this.name,
					subject,
					url: this.url,
					code: this.code,
				}
			)
			//2-define the email options
			const mailOptions = {
				from: `team <${this.from}>`,
				to: this.to,
				subject,
				html,
				text: htmlToText(html),
			}

			//3-create transport and send email
			await this.createTransport().sendMail(mailOptions)
	}

	sendWelcome = async () => {
		await this.send("welcome", "Welcome to the family!")
	}
	sendReset = async () => {
		await this.send("passwordReset", "Password Reset")
	}
	sendVerifyEmail = async () => {
		try{

			console.log("test")
			await this.send("verifyEmail", "Verify email")
		}
		catch(error){
			console.log(error)
		}
	}
}

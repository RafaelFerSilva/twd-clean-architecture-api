import { User } from '@/entities'
import { Either, left, right } from '@/shared'
import { MailServiceError } from '@/usecases/errors/mail-service-error'
import { SendEmail } from '@/usecases/send-email'
import { EmailOptions, EmailService } from '@/usecases/send-email/ports/email-service'

const attachmentFilePath = '../resources/text.txt'
const fromName = 'Test'
const fromEmail = 'from_email@mail.com'
const toName = 'any_name'
const toEmail = 'any_email@mai.com'
const subject = 'Test e-mail'
const emailBody = 'Hello world attachment test'
const emailBodyHtml = '<b>Hello world attachment test</b>'
const attachment = [{
  filename: attachmentFilePath,
  contentType: 'text/plain'
}]

const mailOptions: EmailOptions = {
  host: 'test',
  port: 867,
  username: 'any_name',
  from: fromName + ' ' + fromEmail,
  to: toName + '<' + toEmail + '>',
  subject: subject,
  text: emailBody,
  html: emailBodyHtml,
  attachments: attachment,
  password: ''
}

class MailServiceStub implements EmailService {
  async send (emailOptions: EmailOptions): Promise<Either<MailServiceError, EmailOptions>> {
    return right(emailOptions)
  }
}

class MailServiceErrorStub implements EmailService {
  async send (emailOptions: EmailOptions): Promise<Either<MailServiceError, EmailOptions>> {
    return left(new MailServiceError())
  }
}

describe('Send email to user', () => {
  test('should email user with valid name and email address', async () => {
    const emailServiceStub = new MailServiceStub()
    const useCase = new SendEmail(mailOptions, emailServiceStub)
    const user = User.create({ name: toName, email: toEmail }).value as User
    const response = (await useCase.perform(user)).value as EmailOptions
    expect(response.username).toEqual(toName)
  })

  test('should return error when email service fails', async () => {
    const emailServiceErrorStub = new MailServiceErrorStub()
    const useCase = new SendEmail(mailOptions, emailServiceErrorStub)
    const user = User.create({ name: toName, email: toEmail }).value as User

    const response = await useCase.perform(user)
    expect(response.value).toBeInstanceOf(MailServiceError)
  })
})

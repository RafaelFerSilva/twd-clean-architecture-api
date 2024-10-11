import { User, UserData } from '@/entities'
import { Either, right } from '@/shared'
import { MailServiceError } from '@/usecases/errors/mail-service-error'
import { RegisterAndSendEmail } from '@/usecases/register-and-send-email'
import { RegisterUserOnMailingList } from '@/usecases/register-user-on-mailing-list'
import { UserRepository } from '@/usecases/register-user-on-mailing-list/ports'
import { InMemoryUserRepository } from '@/usecases/register-user-on-mailing-list/repository'
import { SendEmail } from '@/usecases/send-email'
import { EmailOptions, EmailService } from '@/usecases/send-email/ports'

describe('Register and send email to user', () => {
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
    username: 'test',
    from: fromName + ' ' + fromEmail,
    to: toName + '<' + toEmail + '>',
    subject: subject,
    text: emailBody,
    html: emailBodyHtml,
    attachments: attachment,
    password: ''
  }

  class MailServiceMock implements EmailService {
    public timesSendWasCaled = 0
    async send (emailOptions: EmailOptions): Promise<Either<MailServiceError, EmailOptions>> {
      this.timesSendWasCaled++
      return right(emailOptions)
    }
  }

  test('should add user with complete data to mailing list', async () => {
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)

    const registerUseCase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const emailServiceMock = new MailServiceMock()
    const sendEmailUseCase = new SendEmail(mailOptions, emailServiceMock)
    const registerAndSendEmailUseCase: RegisterAndSendEmail = new RegisterAndSendEmail(registerUseCase, sendEmailUseCase)

    const name = 'any_name'
    const email = 'any@email.com'
    const response = (await registerAndSendEmailUseCase.perform({ name, email })).value as User
    const user = await repo.findUserByEmail('any@email.com')
    expect(user.name).toBe('any_name')
    expect(response.name.value).toBe('any_name')
    expect(emailServiceMock.timesSendWasCaled).toEqual(1)
    expect(response.name.value).toEqual('any_name')
  })

  test('should not add user with invalid email to mailing list', async () => {
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)

    const registerUseCase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const emailServiceMock = new MailServiceMock()
    const sendEmailUseCase = new SendEmail(mailOptions, emailServiceMock)
    const registerAndSendEmailUseCase: RegisterAndSendEmail = new RegisterAndSendEmail(registerUseCase, sendEmailUseCase)

    const name = 'any_name'
    const invalidEmail = 'invalid_email'
    const response = (await registerAndSendEmailUseCase.perform({ name, email: invalidEmail })).value as Error
    const user = await repo.findUserByEmail('any@email.com')
    expect(user).toBeNull()
    expect(response.name).toEqual('InvalidEmailError')
  })

  test('should not add user with invalid name to mailing list', async () => {
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)

    const registerUseCase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const emailServiceMock = new MailServiceMock()
    const sendEmailUseCase = new SendEmail(mailOptions, emailServiceMock)
    const registerAndSendEmailUseCase: RegisterAndSendEmail = new RegisterAndSendEmail(registerUseCase, sendEmailUseCase)

    const invalidName = 'a'
    const email = 'any@email.com'
    const response = (await registerAndSendEmailUseCase.perform({ name: invalidName, email })).value as Error
    const user = await repo.findUserByEmail(email)
    expect(user).toBeNull()
    expect(response.name).toEqual('InvalidNameError')
  })
})

import { RegisterUserOnMailingList } from '@/usecases/register-user-on-mailing-list'
import { HttpRequest } from '@/web-controllers/ports'
import { UserData } from '@/entities'
import { UserRepository } from '@/usecases/register-user-on-mailing-list/ports'
import { InMemoryUserRepository } from '@/usecases/register-user-on-mailing-list/repository'
import { RegisterAndSendEmailController } from '@/web-controllers/register-user-controller'
import { HttpResponse } from '@/web-controllers/ports/http-response'
import { InvalidEmailError, InvalidNameError } from '@/entities/errors'
import { MissingParamError } from '@/web-controllers/errors/missing-param-error'
import { UseCase } from '@/usecases/ports'
import { RegisterAndSendEmail } from '@/usecases/register-and-send-email'
import { SendEmail } from '@/usecases/send-email'
import { Either, right } from '@/shared'
import { MailServiceError } from '@/usecases/errors/mail-service-error'
import { EmailService, EmailOptions } from '@/usecases/send-email/ports'

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

class MailServiceStub implements EmailService {
  async send (emailOptions: EmailOptions): Promise<Either<MailServiceError, EmailOptions>> {
    return right(emailOptions)
  }
}

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

describe('Register user web controller', () => {
  const users: UserData[] = []
  const repo: UserRepository = new InMemoryUserRepository(users)

  const registerUseCase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
  const emailServiceMock = new MailServiceStub()
  const sendEmailUseCase = new SendEmail(mailOptions, emailServiceMock)
  const registerAndSendEmailUseCase: RegisterAndSendEmail = new RegisterAndSendEmail(registerUseCase, sendEmailUseCase)
  const controller: RegisterAndSendEmailController = new RegisterAndSendEmailController(registerAndSendEmailUseCase)

  class ErrorThrowingUseCaseStub implements UseCase {
    perform (request: any): Promise<void> {
      throw Error()
    }
  }
  const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()

  test('should return status code OK when request contains valid user data', async () => {
    const request: HttpRequest = {
      body: {
        name: 'Any name',
        email: 'any@email.com'
      }
    }

    const response: HttpResponse = await controller.handle(request)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(request.body)
  })

  test('should return status code 400 when request contains valid user data', async () => {
    const requestWithInvalidName: HttpRequest = {
      body: {
        name: 'A',
        email: 'any@email.com'
      }
    }

    const response: HttpResponse = await controller.handle(requestWithInvalidName)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toBeInstanceOf(InvalidNameError)
  })

  test('should return status code 400 when request contains valid user data', async () => {
    const requestWithInvalidName: HttpRequest = {
      body: {
        name: 'Any name',
        email: 'invalidemail.com'
      }
    }

    const response: HttpResponse = await controller.handle(requestWithInvalidName)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toBeInstanceOf(InvalidEmailError)
  })

  test('should return status code 400 when request is missing user name', async () => {
    const request: HttpRequest = {
      body: {
        email: 'any@email.com'
      }
    }

    const response: HttpResponse = await controller.handle(request)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toBeInstanceOf(MissingParamError)
    expect((response.body as Error).message).toEqual('Missing parameter from request: name')
  })

  test('should return status code 400 when request is missing user email', async () => {
    const request: HttpRequest = {
      body: {
        name: 'Any name'
      }
    }

    const response: HttpResponse = await controller.handle(request)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toBeInstanceOf(MissingParamError)
    expect((response.body as Error).message).toEqual('Missing parameter from request: email')
  })

  test('should return status code 400 when request is missing user email', async () => {
    const request: HttpRequest = {
      body: {
      }
    }

    const response: HttpResponse = await controller.handle(request)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toBeInstanceOf(MissingParamError)
    expect((response.body as Error).message).toEqual('Missing parameter from request: name email')
  })

  test('should return status code 500 when server raises', async () => {
    const request: HttpRequest = {
      body: {
        name: 'Any name',
        email: 'invalidemail.com'
      }
    }

    const controller: RegisterAndSendEmailController = new RegisterAndSendEmailController(errorThrowingUseCaseStub)
    const response: HttpResponse = await controller.handle(request)
    expect(response.statusCode).toEqual(500)
    expect(response.body).toBeInstanceOf(Error)
  })
})

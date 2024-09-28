import { RegisterUserOnMailingList } from '@/usecases/register-user-on-mailing-list'
import { HttpRequest } from '@/web-controllers/ports'
import { UserData } from '@/entities'
import { UserRepository } from '@/usecases/register-user-on-mailing-list/ports'
import { InMemoryUserRepository } from '@test/usecases/register-user-on-mailing-list/repository'
import { RegisterUserController } from '@/web-controllers/register-user-controller'
import { HttpResponse } from '@/web-controllers/ports/http-response'
import { InvalidEmailError, InvalidNameError } from '@/entities/errors'
import { MissingParamError } from '@/web-controllers/errors/missing-param-error'

describe('Register user web controller', () => {
  test('should return status code 201 when request contains valid user data', async () => {
    const request: HttpRequest = {
      body: {
        name: 'Any name',
        email: 'any@email.com'
      }
    }
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)
    const usecase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const controller: RegisterUserController = new RegisterUserController(usecase)
    const response: HttpResponse = await controller.handle(request)
    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual(request.body)
  })

  test('should return status code 400 when request contains valid user data', async () => {
    const requestWithInvalidName: HttpRequest = {
      body: {
        name: 'A',
        email: 'any@email.com'
      }
    }
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)
    const usecase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const controller: RegisterUserController = new RegisterUserController(usecase)
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
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)
    const usecase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const controller: RegisterUserController = new RegisterUserController(usecase)
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
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)
    const usecase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const controller: RegisterUserController = new RegisterUserController(usecase)
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
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)
    const usecase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const controller: RegisterUserController = new RegisterUserController(usecase)
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
    const users: UserData[] = []
    const repo: UserRepository = new InMemoryUserRepository(users)
    const usecase: RegisterUserOnMailingList = new RegisterUserOnMailingList(repo)
    const controller: RegisterUserController = new RegisterUserController(usecase)
    const response: HttpResponse = await controller.handle(request)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toBeInstanceOf(MissingParamError)
    expect((response.body as Error).message).toEqual('Missing parameter from request: name email')
  })
})

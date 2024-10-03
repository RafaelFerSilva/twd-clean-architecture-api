import { RegisterUserController } from '@/web-controllers'
import { RegisterUserOnMailingList } from '@/usecases/register-user-on-mailing-list'
import { MongodbUserRepository } from '@/external/repositories/mongodb'
// import { InMemoryUserRepository } from '@/usecases/register-user-on-mailing-list/repository'

export const makeRegisterUserController = (): RegisterUserController => {
  // const inMemoryUserRepository = new InMemoryUserRepository([])
  const mondoDbUserRepository = new MongodbUserRepository()
  const registerUserOnMailingList = new RegisterUserOnMailingList(mondoDbUserRepository)
  const registerUserController = new RegisterUserController(registerUserOnMailingList)
  return registerUserController
}

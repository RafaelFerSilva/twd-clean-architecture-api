import { RegisterAndSendEmailController } from '@/web-controllers'
import { RegisterUserOnMailingList } from '@/usecases/register-user-on-mailing-list'
import { MongodbUserRepository } from '@/external/repositories/mongodb'
// import { InMemoryUserRepository } from '@/usecases/register-user-on-mailing-list/repository'

export const makeRegisterAndSendEmailController = (): RegisterAndSendEmailController => {
  // const inMemoryUserRepository = new InMemoryUserRepository([])
  const mondoDbUserRepository = new MongodbUserRepository()
  const registerUserOnMailingList = new RegisterUserOnMailingList(mondoDbUserRepository)
  const registerAndSendEmailController = new RegisterAndSendEmailController(registerUserOnMailingList)
  return registerAndSendEmailController
}

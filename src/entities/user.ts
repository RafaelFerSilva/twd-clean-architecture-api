import { Either, left } from '../shared/either'
import { Email } from './email'
import { InvalidEmailError } from './errors/invalid-email-error'
import { InvalidNameError } from './errors/invalid-name-error'
import { Name } from './name'
import { UserData } from './user-data'

export class User {
  static create (userData: UserData): Either<InvalidNameError | InvalidEmailError, User> {
    const nameOrError = Name.create(userData.name)
    const emailOrError = Email.create(userData.email)

    if (nameOrError.isLeft()) return left(new InvalidNameError())
    if (emailOrError.isLeft()) return left(new InvalidEmailError())
  }
}

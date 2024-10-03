import { MongodbUserRepository } from '@/external/repositories/mongodb'
import { MongoHelper } from '@/external/repositories/mongodb/helper'

describe('MongoDb User Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconect()
  })

  beforeEach(async () => {
    MongoHelper.clearCollection('users')
  })

  test('When user is added, it should exist', async () => {
    const userRepository = new MongodbUserRepository()
    const user = {
      name: 'any name',
      email: 'any@email.com'
    }
    await userRepository.add(user)
    expect(await userRepository.exists(user)).toBeTruthy()
  })

  test('find all users should return all added user', async () => {
    const userRepository = new MongodbUserRepository()
    await userRepository.add({
      name: 'any_name',
      email: 'any@mail.com'
    })

    await userRepository.add({
      name: 'second_name',
      email: 'second@mail.com'
    })

    const users = await userRepository.findAllUsers()
    expect(users[0].name).toEqual('any_name')
    expect(users[1].name).toEqual('second_name')
  })
})

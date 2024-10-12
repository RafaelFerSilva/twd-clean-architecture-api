import { User } from '@/entities'
import { UseCase } from '@/usecases/ports/'
import { EmailOptions, EmailService } from '@/usecases/send-email/ports'
import { MailServiceError } from '../errors/mail-service-error'
import { Either } from '@/shared'

export class SendEmail implements UseCase {
  private readonly emailOptions: EmailOptions
  private readonly emailService: EmailService
  constructor (emailOptions: EmailOptions, emailService: EmailService) {
    this.emailOptions = emailOptions
    this.emailService = emailService
  }

  async perform (user: User): Promise<Either<MailServiceError, EmailOptions>> {
    const greetings = 'E ai <b>' + user.name + '</b>, beleza?'
    const customizedHtml = greetings + '<br> <br>' + this.emailOptions.html

    const emailInfo: EmailOptions = {
      host: this.emailOptions.host,
      port: this.emailOptions.port,
      username: this.emailOptions.username,
      password: this.emailOptions.password,
      from: this.emailOptions.from,
      to: user.name + '<' + user.email + '>',
      subject: this.emailOptions.subject,
      text: this.emailOptions.text,
      html: customizedHtml,
      attachments: this.emailOptions.attachments
    }
    return await this.emailService.send(emailInfo)
  }
}

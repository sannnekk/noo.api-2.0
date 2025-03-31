import { ControllerResponse } from 'express-controller-decorator'
import HttpStatusCode from 'express-controller-decorator/lib/decorators/HTTPStatusCodes'

export class RedirectResponse extends ControllerResponse {
  constructor(link: string, code: number = HttpStatusCode.FOUND) {
    super()

    this.setRedirect(link, code)
  }
}

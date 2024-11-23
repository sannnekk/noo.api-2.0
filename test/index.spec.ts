/* eslint-disable */
import { describe } from 'mocha'
import app from '../src/main'
import request from 'supertest'
import { getToken, Users } from './auth-utils'
import type { RequestTest } from '../src/Core/Test/RequestTest'

// module tests
import AssignedWorkModuleTests from '../src/AssignedWorks/Tests'
import AuthModuleTests from '../src/Auth/Tests'

const tests: Record<string, RequestTest[]> = {
  'AssignedWorks module': AssignedWorkModuleTests,
  'Auth module': AuthModuleTests,
}

for (const [moduleName, moduleTests] of Object.entries(tests)) {
  describe(moduleName, () => {
    for (const test of moduleTests) {
      if (typeof test.body === 'function') {
        test.body = test.body(Users)
      }

      it(test.name, (done) => {
        const req = request(app)[test.method.toLowerCase()](test.route)

        if (test.authAs) {
          req.set('Authorization', `Bearer ${getToken(test.authAs)}`)
        }

        req
          .query(test.query)
          .send(test.body)
          .expect(test.expectedStatus)
          .end((err, res) => {
            if (err) {
              return done(err)
            }

            if (test.responseSchema) {
              try {
                test.responseSchema.parse(res.body)
              } catch (error: any) {
                return done(error)
              }
            }

            done()
          })
      })
    }
  })
}

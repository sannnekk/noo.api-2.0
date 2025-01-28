/* eslint-disable */
import { describe } from 'mocha'
import app from '../src/main'
import request from 'supertest'
import { getToken, Users } from './auth-utils'
import type { RequestTest } from '../src/Core/Test/RequestTest'

// module tests
import AssignedWorkModuleTests from '../src/AssignedWorks/Tests'
import AuthModuleTests from '../src/Auth/Tests'
import PlatformModuleTests from '../src/Platform/Tests'
import CalenderModuleTests from '../src/Calender/Tests'
import CoursesModuleTests from '../src/Courses/Tests'
import FAQModuleTests from '../src/FAQ/Tests'
import GoogleSheetsModuleTests from '../src/GoogleSheets/Tests'
import NotificationsModuleTests from '../src/Notifications/Tests'
import PollsModuleTests from '../src/Polls/Tests'
import SessionsModuleTests from '../src/Sessions/Tests'
import SnippetsModuleTests from '../src/Snippets/Tests'
import StatisticsModuleTests from '../src/Statistics/Tests'
import SubjectsModuleTests from '../src/Subjects/Tests'
import UsersModuleTests from '../src/Users/Tests'
import UserSettingsModuleTests from '../src/UserSettings/Tests'
import WorksModuleTests from '../src/Works/Tests'

const tests: Record<string, RequestTest[]> = {
  'AssignedWorks module': AssignedWorkModuleTests,
  'Auth module': AuthModuleTests,
  'Platform module': PlatformModuleTests,
  'Calender module': CalenderModuleTests, 
  'Courses module': CoursesModuleTests,
  'FAQ module': FAQModuleTests,
  'GoogleSheets module': GoogleSheetsModuleTests,
  'Notifications module': NotificationsModuleTests,
  'Polls module': PollsModuleTests,
  'Sessions module': SessionsModuleTests,
  'Snippets module': SnippetsModuleTests,
  'Statistics module': StatisticsModuleTests,
  'Subjects module': SubjectsModuleTests,
  'Users module': UsersModuleTests,
  'UserSettings module': UserSettingsModuleTests,
  'Works module': WorksModuleTests
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

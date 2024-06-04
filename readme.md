# NOO api module

## TODO

Here a todo list

### ASAP

1. **[REFC]** ✅ Back to express-controller-decorator
2. **[REFC]** ✅ Validators
3. **[REFC]** Switch to query builder for pagination/search
4. **[REFC]** Workaround for `Context.isAuthenticated()`
5. **[REFC]** File abstraction system
6. **[IMPR]** Delta zod schema in Core/Schemas
7. **[IMPR]** ✅ Media scheme in course module in validator
8. **[TEST]** ✅ File upload
9. **[IMPR]** ✅ Poll controller
10. **[IMPR]** Switch from db sync to migrations
11. **[IMPR]** Make `class Service` not generic, but only it's method `getRequestMeta`
12. **[REFC]** Utilize all the time and dates to process them correctly
13. **[REFC]** Comment controllers
14. **[IMPR]** Configure linter and prettier
15. **[IMPR]** Logs

## Tags

!!! DON'T PUSH CODE WITH `sync: true` OPTION IN `Core/Data/DataSource`.
This can lead to loss of production data

- [FIX] - Bugfix
- [REFC] - Refactoring
- [IMPR] - Improvement
- [TEST] - Only test
- [BUILD] - Only build

## User roles

- **admin** main role, has access to almost everything but cant manage content
- **teacher** almost the same, except it can change/create content
- **mentor** can ONLY assign students to themeselves and check their AssignedWorks
- **student** default role for every new user

## Assigned work checking strategies for task type `word`

- **type1:** Wrong symbol - 0 points

- **type2:** Wrong symbol - -1 point

- **type3:** Wrong symbol, including missing and more than - 0 points

- **type4:** Sequence

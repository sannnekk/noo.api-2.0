# NOO api module

This is a Node.js (Typescript) server app that provides a RESTful (not completely) API for the NOO application.

## Technologies

- Node.js
- Express.js
- Typescript
- MySQL
- express-controller-decorator package
- Redis (not implemented yet)

## Setup

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file in the root directory and add the following environment variables:

```env
# port for the app
APP_PORT=1234
MAX_REQUEST_SIZE=50mb

# environment of the app (dev, prod)
APP_ENV=development

# database credentials
DB_USER=user
DB_PASSWORD=password
DB_PORT=1234
DB_NAME=database_name
DB_HOST=db_host

# jwt authentication
JWT_EXPIRES_IN=1d
JWT_SECRET=some_secret

# secret for the amo crm access to the api
WEBHOOK_SECRET=some_amo_secret

# google integrations
GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret

# telegram
TELEGRAM_BOT_TOKEN=token

# path to the uploads folder
CDN_PATH=\path\to\uploads
CDN_URL=some_url

# logs
LOG_MODE=console # console, file, telegram
LOG_TELEGRAM_BOT_TOKEN=token # telegram bot to log errors
LOG_TELEGRAM_CHAT_ID=12345 # chat id to log errors
LOG_DIR=C:\Users\nukle\OneDrive\projects\noo\web-2.0\logs # path to the logs directory
LOG_ERROR_FILE=error.log # file to log errors
LOG_DEBUG_FILE=debug.log # file to log debug messages
LOG_COMBINED_FILE=combined.log # file to log combined messages
```

4. Run `npm run dev` to start the server in development mode

## Deployment

1. Go to `changelog.json` and update the version of the app, the date of the release, and the changes that were made
2. Run `npm run build`. This will do the following:
   - Use prettier to format the code
   - Use eslint to check the code
   - Use custom scripts in the `scripts` folder to ensure that the app is ready for production
   - [Not implemented yet] Use jest to run tests
   - Compile the Typescript code to Javascript
   - Resolve ts aliases
3. Commit the changes using the following format for the commit message: `[TYPE]: Message`. The type can be one of the following:
   - [IMPR] - Improvements
   - [FEAT] - New features
   - [FIX] - Bug fixes
   - [REFC] - Refactoring
   - [DOCS] - Documentation
   - [TEST] - Tests
   - [BUILD] - Build
4. Push the changes to the repository. This will automatically trigger docker hub to build a new image.

## Structure

The app is a typical MVC with a fex exceptions and rules. All the code is in `src` folder. The structure is as follows:

- `src`
  - `<module-name-in-camelcase>`
    - `readme.md`
    - `ExampleController.ts` - controller for the module
    - `ExampleValidator.ts` - validation for the controller
    - `ExampleOptions.ts` - options for the controller (like a local config)
    - `Services` - business logic layer
      - `ExampleService.ts`
    - `Data` - data abstraction layer
      - `Example.ts` - interface for the model
      - `ExampleModel.ts` - model for the database
      - `ExampleRepository.ts` - repository for the model
      - `Relations`
        - `...`
    - `DTO` - data transfer objects
      - `ExampleDTO.ts`
    - `Errors` - custom errors
      - `ExampleError.ts`
    - `Schemes` - validation schemes (zod)
      - `ExampleScheme.ts`
    - `Types` - custom types
      - `ExampleType.ts`
    - `Utils` - utility functions
      - `...`

When creating a new module, do not forget to import the controller in the `src/main.ts` file. The module will be automatically added to the app.

There is also a special module called `Core` which has the following structure:

- `Core`
  - [In Development] `Cache` This folder is for caching data in Redis. It is not implemented yet.
  - `Data` This folder is for the database connection and base classes used for data abstraction layer.
  - `Decorators` This folder is for custom decorators used in the app.
  - `Email` This folder is for sending emails.
  - `Errors` This folder is for custom errors.
  - `Logs` This folder is for logging errors and debug messages.
  - `Request` This folder is for everything related to the request and context objects.
  - `Response` This folder is for everything related to the response object.
  - `Schemes` This folder is for base validation schemes.
  - `Security` This folder is for everything related to security, like checking the token, role, hashing passwords, etc.
  - `Utils` This folder is for utility functions.
  - [In Development] `Version` This folder is for versioning the API. It is not implemented yet.

For the module docs check the `readme.md` file in the module folder.

## Rules

1. There is no DI implemented yet. But it is planned to be implemented in the future. So you must create all the dependencies using `new` in the class constructor. Doing this makes it easier to implement DI in the future.

2. Before creating any functionality, ensure that is not already implemented in the `Core` module. If it is, use it. If not, create a new one.

3. Commit only one change in the app. If you have multiple changes, commit them separately.

4. Use wrappers for all the third-party libraries. This makes it easier to change the library in the future. DO NOT use the library directly in the code (except for the `Core` module).

5. The biggest concern is not logaritmical complexity, but the RAM it uses. So, if you have a choice between using a lot of RAM and a little CPU, or a lot of CPU and a little RAM, choose the second one.

6. Avoid a lot of joins in the database. It is better to make multiple queries than to make one big query with a lot of joins.

7. If you need a custom error, make it extend AppError class. All the errors that are not extended from AppError will be caught by the global error handler and will be returned as a 500 system error and logged.

8. DO NOT USE GLOBAL VARIABLES. ALL THE SERVICES, CONTROLLERS, VALIDATORS etc. MUST BE STATELESS.

9. If a request should take long, consider using a queue [In Development]. Do not make the user wait for a long time.

10. The app MUST be crash-safe. That means that if the app crashes, it must be able to recover from the crash and continue working as if nothing happened. Thats why everuthing should be stateless.

11. Interract with the database ONLY through the repository.

## Roadmap

Those are the current changes that are planned to be implemented in the future or are in development:

- Implement DI (future)
- Implement Redis (Will be added in 3.3)
- Implement Versioning (future)
- Implement Queue (Will be added in 3.3)
- Implement Tests (Will be finished in 3.3)

If you want to contribute, please follow the rules and the structure of the app. If you have any questions, feel free to ask.

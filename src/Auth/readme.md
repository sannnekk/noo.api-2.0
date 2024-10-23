# Auth module

This module is responsible for authentification, registration and forgot-password functionalities. It uses jwt for authentification that is transferred as a Bearer header. The jwt is generated using the `jsonwebtoken` package.

### Note

- There is a route to resend verification per email if it did not arrive.
- It must be the most secure and reliable module of the application because it is the entry point for the users.
- It has to be lightweight to handle a lot of requests in case of DDos or other attacks as it is the only module that can be accessed without the authentification token.

### Known problems

- The verification does not have time limit
- If the user hasnt been verified within 24 hours, the account must be deleted, but it is not implemented yet

# Poll module

Polls and votes.

### Note

- A poll can be voted without authentification if a field `requireAuth` is set to false.
- When trying to vote without authentification, the user needs to provide a telegram authentification object to validate the request.

### Known problems

- THe telegram auth payload is not being validated
- Tables in the database have latin_swedish charset because of a mistake in a migration. THis should be corrected

# Google Sheets module

All the interractions with Google Sheets are made here.

### Note

When creating a Google Sheets inegration, a user (only teacher and admin can do this) must provide google access token that will be used for the integration. The token will than be exchanged for a refresh token and the refresh token than stored in the database.

### Known problems

- There is a field in the integration called `frequency` which tells how often the integration should run. But it is not yet implemented to run automatically and it is only possible to run it manually by the user. The reason is that the queue needs to be implemented, which is planned only for a fiture release

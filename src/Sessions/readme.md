# Session module

THe user sessions and online status.

### Note

- The user online is the last used session.
- The whole module should live onlu in redis. This needs to be changed in future

### Known problems

- The users ip address is not retrieved because of ingress proxy settings

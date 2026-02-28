# Notification module

The notifications are managed and stored here.

### Note

- A notification can also be used as a banner when the `isBanner` field is set to `true`.
- There is a proposal to switch to event-driven design to handle notifications, but it requires a lot of changeы and is only being considered now.

### Known problems

- The notifications should be paginated, but it is not implemented yet.
- A notification must be deleted after 7 days but also not implemented yet.
- THe notifiactions should be transferred to redis

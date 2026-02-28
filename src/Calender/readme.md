# Calender module

Here the calender is managed.

### Note

There are 5 types of events:

- work made
- work checked
- work student deadline
- work check deadline

And there are 4 types of event visibilities:

- `'all'` - everyone can see
- `'own-students'` - only for mentor events. The own students of the mentor can see
- `'all-mentors'` - all the mentors can see
- `'own-mentor'` - only for students. The own mentor can see
- `'private'` - only visible for the user created the event

### Known problems

- All the queries are very slow because there are no index on date columns. Must be implemented in the future.
- The visibilities are not fully implemented

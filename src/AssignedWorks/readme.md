# AssignedWorks module

This module is responsible for managing the assigned works of the students and mentors. It is the largest and most complex module. It is also the most used: in average, there are 6 000 assigned works being created every day, each containing in average 75 answers and comments.

### Note

- An AssignedWork can contain maximum 2 mentors.

### Known problems

- Sometimes a mentor (user row in db) assigned to the work gets updated when the student of this work saves the progress.
- The save route to save the progress is the most used and must be optimized.

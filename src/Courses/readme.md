# Courses module

Creation, updating, getting and deleting courses, managing the students assigned to the course.

### Note

- A course must have a subject, but the course author is optional
- A course must have at least on echapter and a chapter must have at least one material
- Chapters and materials have `isActive` field. Students and mentors can't see the inactive chapters and materials.
- If a course has no chapters or materials that are active and the course is requested be a student or mentor, he/she will get the error the the course is empty
- A material has reactions which are visible only for students and are individual.

### Known problems

- When updating the course, the whole course is updated, which is slow. Material-based or chapter-based update needs to be implemented

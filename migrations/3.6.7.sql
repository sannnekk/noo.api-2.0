-- A student can only be assigned to a course once.
-- Remove the duplicates (keeping the oldest assignment) before adding the index
DELETE duplicate
FROM
	course_assignment duplicate
	JOIN course_assignment original ON original.studentId = duplicate.studentId
	AND original.courseId = duplicate.courseId
	AND original.id < duplicate.id;

ALTER TABLE course_assignment
ADD UNIQUE INDEX UQ_course_assignment_student_course (studentId, courseId);

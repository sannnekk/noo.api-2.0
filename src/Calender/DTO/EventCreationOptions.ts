export interface EventCreationOptions {
	title: string
	description: string
	date: Date
	visibility: 'all' | 'own-students' | 'all-mentors' | 'own-mentor' | 'private'
}

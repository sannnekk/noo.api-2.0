export const MediaOptions = {
	allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
	maxFileSize: 50 * 1024 * 1024,
	maxFileCount: 1,
	fileDestinationFolder: process.env.CDN_PATH || '/noo-cdn/uploads',
}

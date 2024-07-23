export const MediaOptions = {
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024,
    maxFileCount: 1,
    fileDestinationFolder: process.env.CDN_PATH || '/noo-cdn/uploads',
    getFileSubdir() {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        return `${year}/${month}/${day}`;
    },
};

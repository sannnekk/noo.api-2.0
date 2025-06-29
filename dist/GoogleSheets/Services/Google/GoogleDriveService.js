import { GoogleSpreadsheet } from 'google-spreadsheet';
export class GoogleDriveService {
    /**
     * Sync data with file in google drive
     *
     * @param fileName name of the file
     * @param filePath array of ids of folders and id of the file
     * @param data data to sync
     * @param tokens tokens to auth into google
     */
    async syncFile(fileName, filePath, data, auth) {
        const documentId = filePath?.at(-1);
        const props = {
            title: fileName,
        };
        const document = documentId
            ? new GoogleSpreadsheet(documentId, auth)
            : await GoogleSpreadsheet.createNewSpreadsheetDocument(auth, props);
        await document.loadInfo();
        const currentSheet = document.sheetsByIndex[0]
            ? document.sheetsByIndex[0]
            : await document.addSheet({
                title: 'Автоматический экспорт',
            });
        await currentSheet.clear();
        await currentSheet.resize({
            rowCount: data.data.length + 1000,
            columnCount: data.header.length + 10,
        });
        await currentSheet.setHeaderRow(data.header.map(({ key }) => key));
        await currentSheet.addRows(data.data);
        // replace header keys with header values
        await currentSheet.setHeaderRow(data.header.map(({ title }) => title));
        return documentId ? filePath : [document.spreadsheetId];
    }
}

import { GoogleSpreadsheet } from 'google-spreadsheet';
export class GoogleDriveService {
    /**
     * Max number of rows to send to the Google Sheets API in a single
     * `values:append` request. Appending all rows at once (e.g. ~60k users)
     * produces an oversized request that Google rejects with a 403.
     */
    static ADD_ROWS_CHUNK_SIZE = 5000;
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
        // Append rows in chunks: a single append request with all rows
        // (e.g. ~60k users) is rejected by the Google Sheets API with a 403.
        for (let i = 0; i < data.data.length; i += GoogleDriveService.ADD_ROWS_CHUNK_SIZE) {
            const chunk = data.data.slice(i, i + GoogleDriveService.ADD_ROWS_CHUNK_SIZE);
            await currentSheet.addRows(chunk);
        }
        // replace header keys with header values
        await currentSheet.setHeaderRow(data.header.map(({ title }) => title));
        return documentId ? filePath : [document.spreadsheetId];
    }
}

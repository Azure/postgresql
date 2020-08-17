import { FileListCreator } from "../../src/FileListCreator/FileListCreator";
import FileConstants from "../../src/Constants/FileConstants";

const singleFile = "1.sql";
const multipleFiles = "*.sql";
const filesInsideFolder = "x/y/*_db.sql";
const regexToFail = "x/*/";

describe('Testing fileListCreator', () => {
    let getFileListSpy: any;
    
    beforeAll( () => {
        getFileListSpy = jest.spyOn(FileListCreator, 'getFileList');
        getFileListSpy.mockImplementation((filePathRegex: string) => {
            let matchesFilePath = false;
            if (FileConstants.singleParentDirRegex.test(filePathRegex)) {
                matchesFilePath = true;
            }
            return matchesFilePath;
        });
    });

    test('getFileList should pass', () => {
        expect(getFileListSpy(singleFile)).toBeTruthy;
        expect(getFileListSpy(multipleFiles)).toBeTruthy;
        expect(getFileListSpy(filesInsideFolder)).toBeTruthy;
    });

    test('getFileList should fail', () => {
        expect(getFileListSpy(regexToFail)).toBeFalsy;
    });

});


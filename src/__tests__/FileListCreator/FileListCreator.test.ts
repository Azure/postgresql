import { FileListCreator } from "../../FileListCreator/FileListCreator";
import SingleParentDir from "../../FileListCreator/SingleParentDir";

jest.mock('../../FileListCreator/SingleParentDir');

const singleFile = "1.sql";
const multipleFiles = "*.sql";
const filesInsideFolder = "x/y/*_db.sql";
const regexToFail = "x/*/";
const notSqlFile = "x/*.txt";

describe('Testing fileListCreator', () => {
    let getFileListSpy: any;
    
    beforeAll( () => {
        getFileListSpy = SingleParentDir.prototype.getFileList = jest.fn().mockImplementation(() => {
            return ['1.sql'];
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getFileList should pass', () => {
        expect(FileListCreator.getFileList(singleFile)).toMatchObject(['1.sql']);
        expect(FileListCreator.getFileList(multipleFiles)).toMatchObject(['1.sql']);
        expect(FileListCreator.getFileList(filesInsideFolder)).toMatchObject(['1.sql']);

        expect(getFileListSpy).toHaveBeenCalled();
    });

    test('getFileList should fail', () => {
        expect(FileListCreator.getFileList.bind(regexToFail)).toThrow();
        expect(FileListCreator.getFileList.bind(notSqlFile)).toThrow();
        expect(getFileListSpy).not.toHaveBeenCalled();
    });

});

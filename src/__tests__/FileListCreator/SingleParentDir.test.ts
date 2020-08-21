import SingleParentDir from "../../FileListCreator/SingleParentDir";
import { FileList } from "../../FileListCreator/FileListCreator";
import { glob } from "glob";
import path from "path";

jest.mock("glob");

let OLD_ENV: any;
const filePathRegex = "1.sql";
let singleParentDir: FileList;
let globSpy: any;
let getFileListSpy: any;

describe('Testing single parent dir', () => {
    beforeAll(() => {
        OLD_ENV = process.env.GITHUB_WORKSPACE; 
        globSpy = glob.sync = jest.fn().mockImplementation(() => {
            return ['1.sql'];
        });
        getFileListSpy = jest.spyOn(SingleParentDir.prototype, 'getFileList');
        singleParentDir = new SingleParentDir(filePathRegex);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env.GITHUB_WORKSPACE = OLD_ENV;
    });

    test('getFileList should return list of files', () => {
        process.env.GITHUB_WORKSPACE = "gh-workspace";
        singleParentDir.getFileList();

        expect(globSpy).toHaveBeenCalled();
        expect(getFileListSpy).toHaveBeenCalled();
        expect(getFileListSpy).toReturnWith([path.join(process.env.GITHUB_WORKSPACE, filePathRegex)]);
    });

});
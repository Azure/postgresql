import SingleParentDir from "./SingleParentDir";
import { FileConstants } from "../Constants";

export interface FileList {
    filePathRegex: string;
    getFileList(): any;
}

export class FileListCreator {
    static fileList: any;

    static getFileList(filePathRegex: string) {
        if (FileConstants.singleParentDirRegex.test(filePathRegex)) {
            const singleParentDir = new SingleParentDir(filePathRegex);
            this.fileList = singleParentDir.getFileList();
        }
        if(!this.fileList) {
            throw new Error(`Invalid file path. File path should be of the format <file>.sql, <folder>/<regex>.sql, <folder1>/<folder2>/<folder3>/<regex>.sql`);
        }
        return this.fileList;
    }

}
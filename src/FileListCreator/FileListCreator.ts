import SingleParentDir from "./SingleParentDir";
import FileConstants from "../Constants/FileConstants";

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
        return this.fileList;
    }

}
import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";
import { FileList } from "./FileListCreator";

export default class SingleParentDir implements FileList {
    filePathRegex: string;

    constructor(filePathRegex: string) {
        this.filePathRegex = filePathRegex;
    }

    getFileList(): any {
        core.debug(`Getting list of files to execute`);
        const basedir = process.env.GITHUB_WORKSPACE;
        if (!basedir) {
            throw new Error("GITHUB_WORKSPACE env variable is empty");
        };
        const targetDirectory = this.getTargetDirectory(basedir, this.filePathRegex);
        const filesInTargetDir = fs.readdirSync(targetDirectory);
        core.debug(`File list for matching against regex: ${filesInTargetDir}`);

        const fileNameFromRegex: RegExp = new RegExp(this.getFileNameFromRegex(this.filePathRegex));
        core.debug(`Regex to match file names in targetDirectory: ${fileNameFromRegex}`);

        const listOfMatchedFiles: string[] = [];
        let absoluteFilePath;
        filesInTargetDir.forEach( (file) => {
            absoluteFilePath = path.join(targetDirectory, file);
            if (fs.lstatSync(absoluteFilePath).isFile() && fileNameFromRegex.test(file)) {
                core.debug(`Matching files found: ${file}`);
                listOfMatchedFiles.push(absoluteFilePath);
            }
        });
        listOfMatchedFiles.sort();
        console.log("List of files to be executed in order: " + listOfMatchedFiles);
        return listOfMatchedFiles;
    }

    private getTargetDirectory(basedir:string, sqlFilesPathRegex: string) {
        const folderPathFromRegex = sqlFilesPathRegex.slice(0, this.getLastIndex(sqlFilesPathRegex));
        core.debug(`folder path from ${sqlFilesPathRegex} is ${folderPathFromRegex}`);
        
        const targetDirectory = path.join(basedir, folderPathFromRegex);
        core.debug(`TargetDirectory: ${targetDirectory}`);
        return targetDirectory;
    }

    private getLastIndex(sqlFilesPathRegex: string) {
        return sqlFilesPathRegex.lastIndexOf("/") + 1;
    }

    private getFileNameFromRegex(sqlFilesPathRegex: string) {
        return sqlFilesPathRegex.slice(this.getLastIndex(sqlFilesPathRegex), sqlFilesPathRegex.length);
    }

}
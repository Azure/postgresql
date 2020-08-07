import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';

export default class FileUtils {
    public static getFileList(sqlFilesPathRegex: string) {
        const basedir: string = process.env.GITHUB_WORKSPACE;
        if (!basedir) {
            throw new Error("GITHUB_WORKSPACE env variable is empty");
        };

        const filesInTargetDir = this.getFilesFromTargetDir(basedir, sqlFilesPathRegex);
        core.debug(`file list for matching against regex: ${filesInTargetDir}`);

        const fileNameFromRegex: RegExp = new RegExp(this.getFileNameFromRegex(sqlFilesPathRegex));
        core.debug(`regex to be matched against file names in targetDirectory: ${fileNameFromRegex}`);

        const listOfMatchedFiles: string[] = [];
        filesInTargetDir.forEach( (file) => {
            core.debug("File being tested: " + file);
            if (fileNameFromRegex.test(file) && fs.lstatSync(file).isFile()) {
                    core.debug("matching regex found: " + file + '\n');
                    listOfMatchedFiles.push(file);
            }
        });
        listOfMatchedFiles.sort();
        console.log("List of files to be executed in order: " + listOfMatchedFiles);
        return listOfMatchedFiles;
    }

    private static getFilesFromTargetDir(basedir:string, sqlFilesPathRegex: string) {
        const folderPathFromRegex = sqlFilesPathRegex.slice(0, this.getLastIndex(sqlFilesPathRegex));
        core.debug(`folder path from ${sqlFilesPathRegex} is ${folderPathFromRegex}`);
        
        const targetDirectory = path.join(basedir, folderPathFromRegex);
        core.debug(`getting list of files from targetDirectory: ${targetDirectory}`);
        return fs.readdirSync(targetDirectory);
    }

    private static getLastIndex(sqlFilesPathRegex: string) {
        return sqlFilesPathRegex.lastIndexOf("/") + 1;
    }

    static getFileNameFromRegex(sqlFilesPathRegex: string) {
        return sqlFilesPathRegex.slice(this.getLastIndex(sqlFilesPathRegex), sqlFilesPathRegex.length);
    }

}
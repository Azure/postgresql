import * as path from "path";
import * as core from "@actions/core";
import * as glob from "glob";
import { FileList } from "./FileListCreator";

export default class SingleParentDir implements FileList {
    filePathRegex: string;

    constructor(filePathRegex: string) {
        this.filePathRegex = filePathRegex;
    }

    /**
     * Get list of files to execute in lexicographical order from the given filePathRegex
     * Supported filePathRegex are: 
     *      <file>.sql
     *      <folder>/<regex>.sql
     *      <folder1>/<folder2>/<folder3>/<regex>.sql
     */
    getFileList(): any {
        core.debug(`Getting list of files to execute`);
        const basedir = process.env.GITHUB_WORKSPACE;
        if (!basedir) {
            throw new Error("GITHUB_WORKSPACE env variable is empty");
        };
        let listOfMatchedFiles = glob.sync(this.filePathRegex, {});
        core.debug(`Matching list of files: ${listOfMatchedFiles}`);

        listOfMatchedFiles.sort();
        listOfMatchedFiles = listOfMatchedFiles.map( (fileName: string) => path.join(basedir, fileName) );
        console.log("List of files to be executed in order: " + listOfMatchedFiles);
        return listOfMatchedFiles;
    }

}
import * as fs from 'fs';
import * as core from '@actions/core';

export default class FileUtils {
    // TODO: fix targetDirectory!!
    public static getFileList(targetDirectory: string, filesPathRegex: RegExp) {
        const fileList: string[] = [];
        const files = fs.readdirSync(targetDirectory);
        files.forEach( (file)  => {
            core.debug("File being tested: " + file);
            if(filesPathRegex.test(file))
            {
                console.log("File matching regex found: " + file + '\n');
                fileList.push(file);
            }
        });
        fileList.sort();
        core.debug("File list is: " + fileList);
        return fileList;
    }

}
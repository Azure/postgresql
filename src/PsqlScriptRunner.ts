import FileListCreator from './Utils/FileUtils';
import PsqlToolRunner from './Utils/PsqlUtils/PsqlToolRunner';

export default class PsqlFilesExecutor {
    connectionString: string;
    filesPathRegex: RegExp;
    args: string;
    fileList: any;

    constructor(connectionString: string, filesPathRegex: string, args: string) {
        this.connectionString = connectionString;
        this.filesPathRegex = RegExp(filesPathRegex);
        this.args = args;
        // TODO: check empty string
        this.fileList = FileListCreator.getFileList("", this.filesPathRegex);
    }

    public async execute() {
        for(const file of this.fileList) {
            console.log("Executing file " + file);
            await PsqlToolRunner.init();
            await PsqlToolRunner.executePsqlFile(this.connectionString, file, this.args);
        }
    }

}
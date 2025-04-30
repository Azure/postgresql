import PsqlToolRunner from './Utils/PsqlUtils/PsqlToolRunner';
import { FileListCreator } from './FileListCreator/FileListCreator';

export default class PsqlFilesExecutor {
    static psqlFileExecutor: PsqlFilesExecutor;
    connectionString: string;
    plsqlFilePath: string;
    args: string;
    extractedFiles: any;
    
    constructor(connectionString: string, filePath: string, args: string) {
        this.connectionString = connectionString;
        this.plsqlFilePath = filePath;
        this.args = args;
        this.extractedFiles = FileListCreator.getFileList(this.plsqlFilePath);
    }

    public static getPsqlFilesExecutor(connectionString: string, filePath: string, args: string) {
        if (!this.psqlFileExecutor) {
            this.psqlFileExecutor = new PsqlFilesExecutor(connectionString, filePath, args);
        }
        return this.psqlFileExecutor;
    }

    public async execute() {
        let error: string = "";
        const options: any = {
            listeners: {
                stderr: (data: Buffer) => {
                    error += data.toString();
                }
            }
        };
        await PsqlToolRunner.init();
        for(const file of this.extractedFiles) {
            console.log(`Executing file: ${file}`);
            await PsqlToolRunner.executePsqlFile(this.connectionString, file, this.args, options);
            if (error) {
                // Logging the error instead of throwing an exception to allow the process to continue.
                // This is intentional to ensure all files are attempted for execution, even if some fail.
                console.error(`error in file: ${file}\n${error}`);
                error = "";
            }
        }
    }

}

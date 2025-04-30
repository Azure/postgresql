import PsqlToolRunner from './Utils/PsqlUtils/PsqlToolRunner';
import { FileListCreator } from './FileListCreator/FileListCreator';

export default class PsqlFilesExecutor {
    static psqlFileExecutor: PsqlFilesExecutor;
    connectionString: string;
    plsqlFilePath: string;
    args: string;
    extractedFiles: any;
    continueOnError: boolean;
    
    constructor(connectionString: string, filePath: string, args: string, continueOnError: boolean) {
        this.connectionString = connectionString;
        this.plsqlFilePath = filePath;
        this.args = args;
        this.extractedFiles = FileListCreator.getFileList(this.plsqlFilePath);
        this.continueOnError = continueOnError;
    }

    public static getPsqlFilesExecutor(connectionString: string, filePath: string, args: string, continueOnError: boolean) {
        if (!this.psqlFileExecutor) {
            this.psqlFileExecutor = new PsqlFilesExecutor(connectionString, filePath, args, continueOnError);
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
                if (this.continueOnError) {
                    console.error(`error in file: ${file}\n${error}`);
                    error = "";
                } else {
                    throw new Error(`error in file: ${file}\n${error}`);
                }
            }
        }
    }

}

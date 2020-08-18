"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PsqlToolRunner_1 = __importDefault(require("./Utils/PsqlUtils/PsqlToolRunner"));
const FileListCreator_1 = require("./FileListCreator/FileListCreator");
class PsqlFilesExecutor {
    constructor(connectionString, filePath, args) {
        this.connectionString = connectionString;
        this.plsqlFilePath = filePath;
        this.args = args;
        this.extractedFiles = FileListCreator_1.FileListCreator.getFileList(this.plsqlFilePath);
    }
    static getPsqlFilesExecutor(connectionString, filePath, args) {
        if (!this.psqlFileExecutor) {
            this.psqlFileExecutor = new PsqlFilesExecutor(connectionString, filePath, args);
        }
        return this.psqlFileExecutor;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let error = "";
            const options = {
                listeners: {
                    stderr: (data) => {
                        error += data.toString();
                    }
                }
            };
            yield PsqlToolRunner_1.default.init();
            for (const file of this.extractedFiles) {
                console.log(`Executing file: ${file}`);
                yield PsqlToolRunner_1.default.executePsqlFile(this.connectionString, file, this.args, options);
                if (error) {
                    throw new Error(`error in file: ${file}\n${error}`);
                }
            }
        });
    }
}
exports.default = PsqlFilesExecutor;

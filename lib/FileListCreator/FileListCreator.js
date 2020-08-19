"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileListCreator = void 0;
const SingleParentDir_1 = __importDefault(require("./SingleParentDir"));
const Constants_1 = require("../Constants");
class FileListCreator {
    static getFileList(filePathRegex) {
        if (Constants_1.FileConstants.singleParentDirRegex.test(filePathRegex)) {
            const singleParentDir = new SingleParentDir_1.default(filePathRegex);
            this.fileList = singleParentDir.getFileList();
        }
        if (!this.fileList) {
            throw new Error(`Invalid file path. File path should be of the format <file>.sql, <folder>/<regex>.sql, <folder1>/<folder2>/<folder3>/<regex>.sql`);
        }
        return this.fileList;
    }
}
exports.FileListCreator = FileListCreator;

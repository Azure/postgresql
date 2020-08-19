"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const glob = __importStar(require("glob"));
class SingleParentDir {
    constructor(filePathRegex) {
        this.filePathRegex = filePathRegex;
    }
    /**
     * Get list of files to execute in lexicographical order from the given filePathRegex
     * Supported filePathRegex are:
     *      <file>.sql
     *      <folder>/<regex>.sql
     *      <folder1>/<folder2>/<folder3>/<regex>.sql
     */
    getFileList() {
        core.debug(`Getting list of files to execute`);
        const basedir = process.env.GITHUB_WORKSPACE;
        if (!basedir) {
            throw new Error("GITHUB_WORKSPACE env variable is empty");
        }
        ;
        let listOfMatchedFiles = glob.sync(this.filePathRegex, {});
        core.debug(`Matching list of files: ${listOfMatchedFiles}`);
        
        listOfMatchedFiles.sort();
        listOfMatchedFiles = listOfMatchedFiles.map((fileName) => path.join(basedir, fileName));
        console.log("List of files to be executed in order: " + listOfMatchedFiles);
        return listOfMatchedFiles;
    }
}
exports.default = SingleParentDir;

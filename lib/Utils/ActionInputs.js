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
exports.ActionInputs = void 0;
const core = __importStar(require("@actions/core"));
const Constants_1 = require("../Constants");
class ActionInputs {
    constructor() {
        this._serverName = core.getInput('server-name', { required: true });
        this._connectionString = core.getInput('connection-string', { required: true });
        this._plsqlFile = core.getInput('plsql-file', { required: true });
        this._args = core.getInput('arguments');
        this.parseConnectionString();
    }
    static getActionInputs() {
        if (!this.actionInputs) {
            this.actionInputs = new ActionInputs();
        }
        return this.actionInputs;
    }
    parseConnectionString() {
        this._connectionString = this._connectionString.replace('psql', "").replace(/["]+/g, '').trim();
        if (!this.validateConnectionString()) {
            throw new Error(`Please provide a valid connection string`);
        }
        const password = this.getPassword();
        if (!password) {
            throw new Error(`Password not found in connection string`);
        }
        core.setSecret(password);
    }
    validateConnectionString() {
        return Constants_1.PsqlConstants.connectionStringTestRegex.test(this.connectionString);
    }
    get connectionString() {
        return this._connectionString;
    }
    get plsqlFile() {
        return this._plsqlFile;
    }
    get args() {
        return this._args;
    }
    getPassword() {
        let password = '';
        let matchingGroup = Constants_1.PsqlConstants.extractPasswordRegex.exec(this.connectionString);
        if (matchingGroup) {
            for (let match of matchingGroup) {
                password = match;
            }
        }
        return password;
    }
    ;
    get serverName() {
        return this._serverName;
    }
}
exports.ActionInputs = ActionInputs;

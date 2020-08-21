import * as core from '@actions/core';
import { PsqlConstants } from '../Constants';

export class ActionInputs {
    private static actionInputs: ActionInputs;
    private _serverName: string;
    private _connectionString: string;
    private _plsqlFile: string;
    private _args: string;

    constructor() {
        this._serverName = core.getInput('server-name', { required: true });
        this._connectionString = core.getInput('connection-string', { required: true });
        this._plsqlFile = core.getInput('plsql-file', { required: true });
        this._args = core.getInput('arguments');
        this.parseConnectionString();
    }

    public static getActionInputs() {
        if (!this.actionInputs) {
            this.actionInputs = new ActionInputs();
        }
        return this.actionInputs;
    }

    private parseConnectionString() {
        this._connectionString = this._connectionString.replace('psql', "").replace(/["]+/g, '').trim();
        if (!this.validateConnectionString()) {
            throw new Error(`Please provide a valid connection string. A valid connection string is a series of keyword/value pairs separated by space. Spaces around the equal sign are optional. To write an empty value, or a value containing spaces, surround it with single quotes, e.g., keyword = 'a value'. Single quotes and backslashes within the value must be escaped with a backslash`);
        }
        const password = this.getPassword();
        if (!password) {
            throw new Error(`Password not found in connection string`);
        }
        core.setSecret(password);
    }

    private validateConnectionString(): boolean {
        return PsqlConstants.connectionStringTestRegex.test(this.connectionString);
    }
    
    private getPassword() {
        let password = '';
        let matchingGroup = PsqlConstants.extractPasswordRegex.exec(this.connectionString);
        if (matchingGroup) {
            for(let match of matchingGroup) {
                password = match;
            }
        }
        return password;
    };
    
    public get connectionString() {
        return this._connectionString;
    }

    public get plsqlFile() {
        return this._plsqlFile;
    }

    public get args() {
        return this._args;
    }

    public get serverName() {
        return this._serverName;
    }

}

import * as core from '@actions/core';
import PsqlConstants from '../Constants/PsqlConstants';

export class ActionInputs {
    private static actionInputs: ActionInputs;
    private _serverName: string;
    private _connectionString: string;
    private _plsqlFile: string;
    private _args: string;

    constructor() {
        this._serverName = core.getInput('server-name', { required: true })
        this._connectionString = core.getInput('connection-string', { required: true }).split("psql")[1].trim();
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
        const password = this.getPassword();
        if (!password) {
            throw new Error(`Password not found in connection string`);
        }
        core.setSecret(password);
    }
    
    public get connectionString() {
        return this._connectionString;
    }

    public get plsqlFile() {
        return this._plsqlFile;
    }

    public get args() {
        return this._args;
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

    public get serverName() {
        return this._serverName;
    }

}

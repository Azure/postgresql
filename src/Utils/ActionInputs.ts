import * as core from '@actions/core';

export class ActionInputs {
    private static actionInputs: ActionInputs;
    private _serverName: string;
    private _connectionString: string;
    private _filesPath: string;
    private _args: string;

    constructor() {
        this._serverName = core.getInput('server-name', { required: true })
        this._connectionString = core.getInput('connection-string', { required: true });
        // TODO: double check on name "filesPath" in whole app
        this._filesPath = core.getInput('plsql-file', { required: true });
        this._args = core.getInput('arguments');
    }

    public static getActionInputs() {
        if (!this.actionInputs) {
            this.actionInputs = new ActionInputs();
        }
        return this.actionInputs;
    }

    public get serverName() {
        return this._serverName;
    }

    public get connectionString() {
        return this._connectionString;
    }

    public get filesPath() {
        return this._filesPath;
    }

    public get args() {
        return this._args;
    }

}
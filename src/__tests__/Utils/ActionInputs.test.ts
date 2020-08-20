import * as core from '@actions/core';
import { ActionInputs } from "../../Utils/ActionInputs";

jest.mock('@actions/core');
let connString = 'psql "host={host} port={port} dbname={database} user={user} password={password} sslmode=require"';

describe('Testing ActionInputs', () => {
    let coreSpy: any;
    let actionInputs: ActionInputs;

    beforeAll(() => {
        coreSpy = jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
            switch(name) {
                case 'server-name': 
                    return 'ak-db.postgres.database.azure.com';

                case "connection-string":
                    return connString;

                case 'plsql-file':
                    return '1.sql';

                case 'arguments':
                    return '';

                default:
                    return '';
            }

        });

    });

    test('getActionInputs should pass', () => {
        actionInputs = ActionInputs.getActionInputs();
        expect(coreSpy).toHaveBeenCalled();
    });


});
import { HttpClient } from '@actions/http-client';
import PsqlToolRunner from "../../Utils/PsqlUtils/PsqlToolRunner";
import PsqlUtils, { IPResponse } from "../../Utils/PsqlUtils/PsqlUtils";

jest.mock('../../Utils/PsqlUtils/PsqlToolRunner');
jest.mock('@actions/http-client');

describe('Testing PsqlUtils', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('detectIPAddress should return ip address', async () => {
        const psqlError: string = `psql: error: could not connect to server: FATAL:  no pg_hba.conf entry for host "1.2.3.4", user "<user>", database "<db>"`;
    
        jest.spyOn(PsqlToolRunner, 'executePsqlCommand').mockImplementation(async (_connectionString: string, _command: string, options: any = {}) => {
            options.listeners.stderr(Buffer.from(psqlError));
            throw new Error(psqlError);
        });
        jest.spyOn(HttpClient.prototype, 'getJson').mockResolvedValue({
            statusCode: 200,
            result: {
                ip: '1.2.3.4',
            },
            headers: {},
        });

        return PsqlUtils.detectIPAddress("").then(ipAddress => expect(ipAddress).toEqual("1.2.3.4"));
    });

    test('detectIPAddress should return empty string', async () => {
        return PsqlUtils.detectIPAddress("").then(ipAddress => expect(ipAddress).toEqual(""));
    })

});
import { PsqlConstants } from "../../Constants";
import PsqlToolRunner from "./PsqlToolRunner";
import { HttpClient } from '@actions/http-client';

export default class PsqlUtils {
    static async detectIPAddress(connectionString: string): Promise<string> {
        let psqlError: string = '';
        let ipAddress = '';
        const options: any = {
            listeners: {
                stderr: (data: Buffer) => {
                    psqlError += data.toString();
                }
            }, 
            silent: true
        };

        // "SELECT 1" psql command is run to check if psql client is able to connect to DB using the connectionString
        try {
            await PsqlToolRunner.init();
            await PsqlToolRunner.executePsqlCommand(`${connectionString} connect_timeout=10`, PsqlConstants.SELECT_1, options);
        } catch {
            if (psqlError) {
                const http = new HttpClient();
                try {
                    const ipv4 = await http.getJson<IPResponse>('https://api.ipify.org?format=json');
                    ipAddress = ipv4.result?.ip || '';
                } catch(err) {
                    throw new Error(`Unable to detect client IP Address: ${err.message}`);
                }
            }
        }
        return ipAddress;
    }
}

export interface IPResponse {
    ip: string;
}
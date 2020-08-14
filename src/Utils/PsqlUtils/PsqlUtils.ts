import PsqlConstants from "../../Constants/PsqlConstants";
import FirewallConstants from "../../Constants/FirewallConstants";
import PsqlToolRunner from "./PsqlToolRunner";

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
            await PsqlToolRunner.executePsqlCommand(connectionString, PsqlConstants.SELECT_1, options);
        } catch(err) {
            if (psqlError) {
                const ipAddresses = psqlError.match(FirewallConstants.ipv4MatchPattern);
                if (ipAddresses) {
                    ipAddress = ipAddresses[0];
                } else {
                    throw new Error(`Unable to detect client IP Address: ${psqlError}`);
                }
            }
        }
        return ipAddress;
    }

}
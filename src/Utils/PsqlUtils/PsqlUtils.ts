import PsqlCommands from "../../Constants/PsqlCommands";
import FirewallConstants from "../../Constants/FirewallConstants";
import PsqlToolRunner from "./PsqlToolRunner";

export default class PsqlUtils {
    static async connectToPostgresDB(connectionString: string): Promise<string> {
        let error: string = "";
        const options: any = {
            listeners: {
                stderr: (data: Buffer) => {
                    error += data.toString();
                }
            }
        };
        // "SELECT 1" psql command is run to check if psql client is able to connect to DB using the connectionString
        await PsqlToolRunner.init();
        await PsqlToolRunner.executePsqlCommand(connectionString, PsqlCommands.SELECT_1, options);
        return error;
    }

    static async connectsToDB(connectionString: string): Promise<boolean> {
        const error = await this.connectToPostgresDB(connectionString);
        if (error) {
            if (error.match(FirewallConstants.ipv4MatchPattern)) {
                return false;
            }
            throw new Error(`Error while running checking psql connectivity: ${error}`);
        }
        return true;
    }

}
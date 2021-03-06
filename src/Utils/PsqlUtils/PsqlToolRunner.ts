import * as core from "@actions/core";
import * as exec from "@actions/exec";
import PsqlClientFinder from "./PsqlClientFinder";

export default class PsqlToolRunner {
    static psqlPath: string;

    public static async init() {
        if (!this.psqlPath) {
            this.psqlPath = await PsqlClientFinder.getPsqlClientPath();
        }
    }

    public static async executePsqlCommand(connectionString:string, command: string, options: any = {}) {
        core.debug(`Executing psql command`);
        await exec.exec(`"${this.psqlPath}" -c "${command}" "${connectionString}"`, [], options);
    }

    public static async executePsqlFile(connectionString:string, fileName: string, args: any = {}, options: any = {}) {
        core.debug(`Executing psql file`);
        await exec.exec(`"${this.psqlPath}" -f ${fileName} ${args} "${connectionString}"`, [], options);
    }

}

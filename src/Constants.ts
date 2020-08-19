export class FileConstants {
    static readonly singleParentDirRegex = /^((?!\*\/).)*(\.sql)$/g;
}

export class FirewallConstants {
    static readonly ipv4MatchPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
}

export class PsqlConstants {
    static readonly SELECT_1 = "SELECT 1";
    static readonly connectionStringTestRegex = /^(?=.*host(\s)*=(\s)*.+)(?=.*port(\s)*=(\s)*.+)(?=.*dbname(\s)*=(\s)*.+)(?=.*user(\s)*=(\s)*.+)(?=.*password(\s)*=(\s)*.+).+/g;
    static readonly extractPasswordRegex = /(?<key>password)\s*=\s*(?<val>[^\s]*)/g;
}
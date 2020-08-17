export class FileConstants {
    static readonly singleParentDirRegex = /.*(\.sql){1}$/g;
}

export class FirewallConstants {
    static readonly ipv4MatchPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
}

export class PsqlConstants {
    static readonly SELECT_1 = "SELECT 1";
    static readonly extractPasswordRegex = /(?<key>password)=(?<val>[^\s]*)/g;
}
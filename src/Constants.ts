export class FileConstants {
    // regex checks that string should end with .sql and if folderPath is present, * should not be included in folderPath
    static readonly singleParentDirRegex = /^((?!\*\/).)*(\.sql)$/g;
}

export class PsqlConstants {
    static readonly SELECT_1 = "SELECT 1";
    // host, port, dbname, user, password must be present in connection string in any order.
    static readonly connectionStringTestRegex = /^(?=.*host(\s)*=(\s)*.+)(?=.*port(\s)*=(\s)*.+)(?=.*dbname(\s)*=(\s)*.+)(?=.*user(\s)*=(\s)*.+)(?=.*password(\s)*=(\s)*.+).+/g;
    // extracting password from connection string
    static readonly extractPasswordRegex = /(?<key>password)\s*=\s*(?<val>[^\s]*)/g;
}
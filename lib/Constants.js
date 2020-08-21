"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsqlConstants = exports.FirewallConstants = exports.FileConstants = void 0;
class FileConstants {
}
exports.FileConstants = FileConstants;
// regex checks that string should end with .sql and if folderPath is present, * should not be included in folderPath
FileConstants.singleParentDirRegex = /^((?!\*\/).)*(\.sql)$/g;
class FirewallConstants {
}
exports.FirewallConstants = FirewallConstants;
FirewallConstants.ipv4MatchPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
class PsqlConstants {
}
exports.PsqlConstants = PsqlConstants;
PsqlConstants.SELECT_1 = "SELECT 1";
// host, port, dbname, user, password must be present in connection string in any order.
PsqlConstants.connectionStringTestRegex = /^(?=.*host(\s)*=(\s)*.+)(?=.*port(\s)*=(\s)*.+)(?=.*dbname(\s)*=(\s)*.+)(?=.*user(\s)*=(\s)*.+)(?=.*password(\s)*=(\s)*.+).+/g;
// extracting password from connection string
PsqlConstants.extractPasswordRegex = /(?<key>password)\s*=\s*(?<val>[^\s]*)/g;

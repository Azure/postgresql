"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsqlConstants = exports.FirewallConstants = exports.FileConstants = void 0;
class FileConstants {
}
exports.FileConstants = FileConstants;
FileConstants.singleParentDirRegex = /.*(\.sql){1}$/g;
class FirewallConstants {
}
exports.FirewallConstants = FirewallConstants;
FirewallConstants.ipv4MatchPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
class PsqlConstants {
}
exports.PsqlConstants = PsqlConstants;
PsqlConstants.SELECT_1 = "SELECT 1";
PsqlConstants.connectionStringRegex = /^.*host=.+port=.+dbname=.+user=.+password=.+.*$/g;
PsqlConstants.extractPasswordRegex = /(?<key>password)=(?<val>[^\s]*)/g;

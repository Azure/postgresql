"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../../Constants");
const PsqlToolRunner_1 = __importDefault(require("./PsqlToolRunner"));
const http_client_1 = require("@actions/http-client");
class PsqlUtils {
    static detectIPAddress(connectionString) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let psqlError = '';
            let ipAddress = '';
            const options = {
                listeners: {
                    stderr: (data) => {
                        psqlError += data.toString();
                    }
                },
                silent: true
            };
            // "SELECT 1" psql command is run to check if psql client is able to connect to DB using the connectionString
            try {
                yield PsqlToolRunner_1.default.init();
                yield PsqlToolRunner_1.default.executePsqlCommand(connectionString, Constants_1.PsqlConstants.SELECT_1, options);
            }
            catch (_b) {
                if (psqlError) {
                    const http = new http_client_1.HttpClient();
                    try {
                        const ipv4 = yield http.getJson('https://api.ipify.org?format=json');
                        ipAddress = ((_a = ipv4.result) === null || _a === void 0 ? void 0 : _a.ip) || '';
                    }
                    catch (err) {
                        throw new Error(`Unable to detect client IP Address: ${err.message}`);
                    }
                }
            }
            return ipAddress;
        });
    }
}
exports.default = PsqlUtils;

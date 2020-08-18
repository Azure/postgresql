"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const winreg_1 = __importDefault(require("winreg"));
const semver = __importStar(require("semver"));
class PsqlClientFinder {
    static getPsqlClientPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.psqlClientPath) {
                core.debug(`Getting location of PSQL client on ${os.hostname()}`);
                const IS_WINDOWS = process.platform === 'win32';
                if (IS_WINDOWS) {
                    this.psqlClientPath = yield this._getPsqlClientOnWindows();
                }
                else {
                    this.psqlClientPath = yield this._getPsqlClientOnLinux();
                }
            }
            return this.psqlClientPath;
        });
    }
    static _getPsqlClientOnWindows() {
        return __awaiter(this, void 0, void 0, function* () {
            const psqlClientRegistryKey = path.join('\\', 'Software', 'PostgreSQL', 'Installations');
            let psqlClientPath = '';
            if (yield PsqlClientFinder.registryKeyExists(psqlClientRegistryKey)) {
                psqlClientPath = yield this._getpsqlClientPathFromRegistry(psqlClientRegistryKey);
            }
            if (!psqlClientPath) {
                core.debug(`Unable to find PSQL client executable on ${os.hostname()} from registry.`);
                core.debug(`Getting location of psql.exe from PATH environment variable.`);
                psqlClientPath = yield io.which('psql', false);
            }
            if (psqlClientPath) {
                core.debug(`PSQL client found at path ${psqlClientPath}`);
                return psqlClientPath;
            }
            else {
                throw new Error(`Unable to find PSQL client executable on ${os.hostname()}.`);
            }
        });
    }
    static registryKeyExists(path) {
        core.debug(`Checking if registry key 'HKLM:${path}' exists.`);
        return new Promise((resolve) => {
            const regKey = new winreg_1.default({
                hive: winreg_1.default.HKLM,
                key: path
            });
            regKey.keyExists((error, result) => {
                resolve(!!error ? false : result);
            });
        });
    }
    static _getpsqlClientPathFromRegistry(registryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            core.debug(`Getting location of psql.exe from registryPath HKLM:${registryPath}`);
            const registrySubKeys = yield PsqlClientFinder.getRegistrySubKeys(registryPath);
            let latestVersionKey = registrySubKeys[0].key;
            let latestVersion = 0.0;
            for (const subKey of registrySubKeys) {
                const splitArray = subKey.key.split('-');
                const version = parseFloat(splitArray[splitArray.length - 1]);
                let _version = semver.coerce(version) || '';
                let _latestVersion = semver.coerce(latestVersion) || '';
                if (semver.gt(_version, _latestVersion)) {
                    latestVersionKey = subKey.key;
                    latestVersion = version;
                }
            }
            const splitLatest = latestVersionKey.split('\\');
            const latestPsqlInstallation = splitLatest[splitLatest.length - 1];
            core.debug(`Latest version of PSQL found is: ${latestPsqlInstallation}`);
            for (const registryKey of registrySubKeys) {
                if (registryKey.key.match(latestPsqlInstallation)) {
                    const psqlServerPath = yield PsqlClientFinder.getRegistryValue(registryKey, 'Base Directory');
                    if (psqlServerPath) {
                        const psqlClientExecutablePath = path.join(psqlServerPath, 'bin', 'psql.exe');
                        if (fs.existsSync(psqlClientExecutablePath)) {
                            core.debug(`PSQL client executable found at path ${psqlClientExecutablePath}`);
                            return psqlClientExecutablePath;
                        }
                    }
                }
            }
            return '';
        });
    }
    static getRegistrySubKeys(path) {
        return new Promise((resolve) => {
            core.debug(`Getting sub-keys at registry path: HKLM:${path}`);
            const regKey = new winreg_1.default({
                hive: winreg_1.default.HKLM,
                key: path
            });
            regKey.keys((error, result) => {
                return !!error ? '' : resolve(result);
            });
        });
    }
    static getRegistryValue(registryKey, name) {
        return new Promise((resolve) => {
            core.debug(`Getting registry value ${name} at path: HKLM:${registryKey.key}`);
            registryKey.get(name, (error, result) => {
                resolve(!!error ? '' : result.value);
            });
        });
    }
    static _getPsqlClientOnLinux() {
        return __awaiter(this, void 0, void 0, function* () {
            const psqlClientPath = yield io.which('psql', true);
            core.debug(`PSQL client found at path ${psqlClientPath}`);
            return psqlClientPath;
        });
    }
}
exports.default = PsqlClientFinder;

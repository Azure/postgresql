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
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const crypto = __importStar(require("crypto"));
const AuthorizerFactory_1 = require("azure-actions-webclient/AuthorizerFactory");
const PsqlFilesExecutor_1 = __importDefault(require("./PsqlFilesExecutor"));
const ResourceManager_1 = __importDefault(require("./Utils/FirewallUtils/ResourceManager"));
const FirewallManager_1 = __importDefault(require("./Utils/FirewallUtils/FirewallManager"));
const PsqlUtils_1 = __importDefault(require("./Utils/PsqlUtils/PsqlUtils"));
const ActionInputs_1 = require("./Utils/ActionInputs");
let firewallManager;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const userAgentPrefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
        try {
            // Set user agent variable
            const usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
            const actionName = 'AzurePSQLAction';
            const userAgentString = (!!userAgentPrefix ? `${userAgentPrefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
            core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
            const actionInputs = ActionInputs_1.ActionInputs.getActionInputs();
            const runnerIPAddress = yield PsqlUtils_1.default.detectIPAddress(actionInputs.connectionString);
            if (runnerIPAddress) {
                console.log(`Adding firewall rule`);
                const azureResourceAuthorizer = yield AuthorizerFactory_1.AuthorizerFactory.getAuthorizer();
                const azurePsqlResourceManager = yield ResourceManager_1.default.getResourceManager(actionInputs.serverName, azureResourceAuthorizer);
                firewallManager = new FirewallManager_1.default(azurePsqlResourceManager);
                yield firewallManager.addFirewallRule(runnerIPAddress);
            }
            console.log(`Executing sql files`);
            const psqlFilesExecutor = PsqlFilesExecutor_1.default.getPsqlFilesExecutor(actionInputs.connectionString, actionInputs.plsqlFile, actionInputs.args);
            yield psqlFilesExecutor.execute();
        }
        catch (error) {
            core.setFailed(`Error occurred while running action:\n${error}`);
        }
        finally {
            if (firewallManager) {
                yield firewallManager.removeFirewallRule();
            }
            // Reset AZURE_HTTP_USER_AGENT
            core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentPrefix);
        }
    });
}
exports.run = run;
run();

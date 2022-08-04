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
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const AzureRestClient_1 = require("azure-actions-webclient/AzureRestClient");
class AzurePSQLResourceManager {
    constructor(resourceAuthorizer) {
        // making the constructor private, so that object initialization can only be done by the class factory GetResourceManager
        this._restClient = new AzureRestClient_1.ServiceClient(resourceAuthorizer);
    }
    static getResourceManager(serverName, resourceAuthorizer) {
        return __awaiter(this, void 0, void 0, function* () {
            // a factory method to return asynchronously created object
            const resourceManager = new AzurePSQLResourceManager(resourceAuthorizer);
            yield resourceManager._populatePSQLServerData(serverName);
            return resourceManager;
        });
    }
    getPSQLServer() {
        return this._resource;
    }
    _getPSQLServer(serverType, apiVersion, serverName) {
        return __awaiter(this, void 0, void 0, function* () {
            const httpRequest = {
                method: 'GET',
                uri: this._restClient.getRequestUri(`//subscriptions/{subscriptionId}/providers/Microsoft.DBforPostgreSQL/${serverType}`, {}, [], apiVersion)
            };
            core.debug(`Get '${serverName}' for PSQL ${serverType} details`);
            try {
                const httpResponse = yield this._restClient.beginRequest(httpRequest);
                if (httpResponse.statusCode !== 200) {
                    throw AzureRestClient_1.ToError(httpResponse);
                }
                const sqlServers = ((httpResponse.body && httpResponse.body.value) || []);
                const sqlServer = sqlServers.find((sqlResource) => sqlResource.name.toLowerCase() === serverName.toLowerCase());
                if (sqlServer) {
                    this._serverType = serverType;
                    this._apiVersion = apiVersion;
                    this._resource = sqlServer;
                    return true;
                }
                return false;
            }
            catch (error) {
                if (error instanceof AzureRestClient_1.AzureError) {
                    throw new Error(JSON.stringify(error));
                }
                throw error;
            }
        });
    }
    _populatePSQLServerData(serverName) {
        return __awaiter(this, void 0, void 0, function* () {
            // trim the cloud hostname suffix from servername
            serverName = serverName.split('.')[0];
            (yield this._getPSQLServer('servers', '2017-12-01', serverName)) || (yield this._getPSQLServer('flexibleServers', '2021-06-01', serverName));
            if (!this._resource) {
                throw new Error(`Unable to get details of PSQL server ${serverName}. PSQL server '${serverName}' was not found in the subscription.`);
            }
        });
    }
    addFirewallRule(startIpAddress, endIpAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const firewallRuleName = `ClientIPAddress_${Date.now()}`;
            const httpRequest = {
                method: 'PUT',
                uri: this._restClient.getRequestUri(`/${this._resource.id}/firewallRules/${firewallRuleName}`, {}, [], this._apiVersion),
                body: JSON.stringify({
                    'properties': {
                        'startIpAddress': startIpAddress,
                        'endIpAddress': endIpAddress
                    }
                })
            };
            try {
                const httpResponse = yield this._restClient.beginRequest(httpRequest);
                if (httpResponse.statusCode === 202) {
                    const asyncOperationResponse = yield this._getLongRunningOperationResult(httpResponse);
                    if (asyncOperationResponse.statusCode === 200 && asyncOperationResponse.body.status && asyncOperationResponse.body.status.toLowerCase() === 'succeeded') {
                        core.debug(JSON.stringify(asyncOperationResponse.body));
                        return this.getFirewallRule(firewallRuleName);
                    }
                    else {
                        throw AzureRestClient_1.ToError(asyncOperationResponse);
                    }
                }
                else if (httpResponse.statusCode === 200 || httpResponse.statusCode === 201) {
                    return httpResponse.body;
                }
                throw AzureRestClient_1.ToError(httpResponse);
            }
            catch (error) {
                if (error instanceof AzureRestClient_1.AzureError) {
                    throw new Error(JSON.stringify(error));
                }
                throw error;
            }
        });
    }
    getFirewallRule(ruleName) {
        return __awaiter(this, void 0, void 0, function* () {
            const httpRequest = {
                method: 'GET',
                uri: this._restClient.getRequestUri(`/${this._resource.id}/firewallRules/${ruleName}`, {}, [], this._apiVersion)
            };
            try {
                const httpResponse = yield this._restClient.beginRequest(httpRequest);
                if (httpResponse.statusCode !== 200) {
                    throw AzureRestClient_1.ToError(httpResponse);
                }
                return httpResponse.body;
            }
            catch (error) {
                if (error instanceof AzureRestClient_1.AzureError) {
                    throw new Error(JSON.stringify(error));
                }
                throw error;
            }
        });
    }
    removeFirewallRule(firewallRule) {
        return __awaiter(this, void 0, void 0, function* () {
            const httpRequest = {
                method: 'DELETE',
                uri: this._restClient.getRequestUri(`/${this._resource.id}/firewallRules/${firewallRule.name}`, {}, [], this._apiVersion)
            };
            try {
                const httpResponse = yield this._restClient.beginRequest(httpRequest);
                if (httpResponse.statusCode === 202) {
                    const asyncOperationResponse = yield this._getLongRunningOperationResult(httpResponse);
                    if (asyncOperationResponse.statusCode === 200 && asyncOperationResponse.body.status && asyncOperationResponse.body.status.toLowerCase() === 'succeeded') {
                        core.debug(JSON.stringify(asyncOperationResponse.body));
                    }
                    else {
                        throw AzureRestClient_1.ToError(asyncOperationResponse);
                    }
                }
                else if (httpResponse.statusCode !== 200 && httpResponse.statusCode !== 204) {
                    throw AzureRestClient_1.ToError(httpResponse);
                }
            }
            catch (error) {
                if (error instanceof AzureRestClient_1.AzureError) {
                    throw new Error(JSON.stringify(error));
                }
                throw error;
            }
        });
    }
    _getLongRunningOperationResult(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeoutInMinutes = 2;
            const timeout = new Date().getTime() + timeoutInMinutes * 60 * 1000;
            const request = {
                method: 'GET',
                uri: response.headers['azure-asyncoperation'] || response.headers.location
            };
            if (!request.uri) {
                throw new Error('Unable to find the Azure-Async operation polling URI.');
            }
            while (true) {
                response = yield this._restClient.beginRequest(request);
                if (response.statusCode === 202 || (response.body && (response.body.status === 'Accepted' || response.body.status === 'Running' || response.body.status === 'InProgress'))) {
                    if (timeout < new Date().getTime()) {
                        throw new Error(`Async polling request timed out. URI: ${request.uri}`);
                    }
                    const retryAfterInterval = response.headers['retry-after'] && parseInt(response.headers['retry-after']) || 15;
                    yield this._sleep(retryAfterInterval);
                }
                else {
                    break;
                }
            }
            return response;
        });
    }
    _sleep(sleepDurationInSeconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, sleepDurationInSeconds * 1000);
        });
    }
}
exports.default = AzurePSQLResourceManager;

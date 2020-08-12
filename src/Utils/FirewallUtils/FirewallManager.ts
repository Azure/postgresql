import * as core from '@actions/core';
import AzurePSQLResourceManager from './ResourceManager';
import FirewallConstants from '../../Constants/FirewallConstants';
import PsqlUtils from '../PsqlUtils/PsqlUtils';

export default class FirewallManager {
    private _firewallRule: any;
    private _resourceManager: AzurePSQLResourceManager;

    constructor(azurePsqlResourceManager: AzurePSQLResourceManager) {
        this._resourceManager = azurePsqlResourceManager;
    }

    public async addFirewallRule(serverName: string, connectionString: any): Promise<void> {
        const ipAddress = await this._detectIPAddress(serverName, connectionString);
        if (!ipAddress) {
            core.debug(`Client has access to PSQL server. Skip adding firewall exception.`);
            return;
        }
        console.log(`Client does not have access to PSQL server. Adding firewall exception for client's IP address.`)
        this._firewallRule = await this._resourceManager.addFirewallRule(ipAddress, ipAddress);
        core.debug(JSON.stringify(this._firewallRule));
        console.log(`Successfully added firewall rule ${this._firewallRule.name}.`);
    }

    public async removeFirewallRule(): Promise<void> {
        if (this._firewallRule) {
            console.log(`Removing firewall rule '${this._firewallRule.name}'.`);
            await this._resourceManager.removeFirewallRule(this._firewallRule);
            console.log('Successfully removed firewall rule.');
        }
        else {
            core.debug('No firewall exception was added.')
        }
    }

    private async _detectIPAddress(serverName: string, connectionString: any): Promise<string> {
        core.debug(`Validating if client has access to PSQL Server '${serverName}'.`);
        let ipAddress = '';
        const error = await PsqlUtils.connectToPostgresDB(connectionString);
        if (error) {
            core.debug(error);
            const ipAddresses = error.match(FirewallConstants.ipv4MatchPattern);
            if (ipAddresses) {
                ipAddress = ipAddresses[0];
            }
            else {
                throw new Error(`Failed to add firewall rule. Unable to detect client IP Address. ${error} ${error}`)
            }
        }
        // ipAddress will be an empty string if client has access to SQL server
        return ipAddress;
    }

}
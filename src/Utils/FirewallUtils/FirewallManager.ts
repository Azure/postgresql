import * as core from '@actions/core';
import AzurePSQLResourceManager from './ResourceManager';
import PsqlUtils from '../PsqlUtils/PsqlUtils';

export default class FirewallManager {
    private _firewallRule: any;
    private _resourceManager: AzurePSQLResourceManager;

    constructor(azurePsqlResourceManager: AzurePSQLResourceManager) {
        this._resourceManager = azurePsqlResourceManager;
    }
    
    public get resourceManager() {
        return this._resourceManager;
    }

    public async addFirewallRule(ipAddress: string): Promise<void> {
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
  
}
import * as core from '@actions/core';
import * as crypto from 'crypto';

import { AuthorizerFactory } from 'azure-actions-webclient/AuthorizerFactory';
import PsqlFilesExecutor from './PsqlFilesExecutor';
import AzurePSQLResourceManager from './Utils/FirewallUtils/ResourceManager';
import FirewallManager from './Utils/FirewallUtils/FirewallManager';
import PsqlUtils from './Utils/PsqlUtils/PsqlUtils';
import { ActionInputs } from './Utils/ActionInputs';

let firewallManager: FirewallManager;
async function run() {
    const userAgentPrefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
    
    try {
        // Set user agent variable
        const usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        const actionName = 'AzurePSQLAction';
        const userAgentString = (!!userAgentPrefix ? `${userAgentPrefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);

        const actionInputs: ActionInputs = ActionInputs.getActionInputs();
        const runnerIPAddress = await PsqlUtils.detectIPAddress(actionInputs.connectionString);
        if (runnerIPAddress) {
            console.log(`Adding firewall rule`);
            const azureResourceAuthorizer = await AuthorizerFactory.getAuthorizer();
            const azurePsqlResourceManager = await AzurePSQLResourceManager.getResourceManager(actionInputs.serverName, azureResourceAuthorizer);
            firewallManager = new FirewallManager(azurePsqlResourceManager);
            await firewallManager.addFirewallRule(actionInputs.connectionString);
        }
        console.log(`Executing sql files`);
        const psqlFilesExecutor = PsqlFilesExecutor.getPsqlFilesExecutor(actionInputs.connectionString, actionInputs.plsqlFile, actionInputs.args)
        await psqlFilesExecutor.execute();
    }
    catch(error) {
        core.setFailed(`Error occurred while running action:\n${error}`);
    }
    finally {
        if (firewallManager) {
            await firewallManager.removeFirewallRule();
        }
        // Reset AZURE_HTTP_USER_AGENT
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentPrefix);
    }
}

run();
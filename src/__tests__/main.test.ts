import { run } from "../main";
import { ActionInputs } from "../Utils/ActionInputs";
import PsqlUtils from "../Utils/PsqlUtils/PsqlUtils";
import { AuthorizerFactory } from "azure-actions-webclient/AuthorizerFactory";
import AzurePSQLResourceManager from "../Utils/FirewallUtils/ResourceManager";
import FirewallManager from "../Utils/FirewallUtils/FirewallManager";
import PsqlFilesExecutor from "../PsqlFilesExecutor";

jest.mock('@actions/core');
jest.mock('../Utils/PsqlUtils/PsqlToolRunner');
jest.mock('../FileListCreator/FileListCreator');
jest.mock('azure-actions-webclient/AuthorizerFactory');
jest.mock('../Utils/FirewallUtils/ResourceManager');
jest.mock('../Utils/FirewallUtils/FirewallManager');

describe('Testing main', () => {
    afterEach(() => {
        jest.clearAllMocks()
    });

    let getAuthorizerSpy : any;
    let getResourceManagerSpy: any;
    let addFirewallRuleSpy: any;
    let removeFirewallRuleSpy: any;
    let getActionInputsSpy: any;
    let detectIPAddressSpy: any;
    let executeSpy: any;

    beforeAll(() => {
        getAuthorizerSpy = jest.spyOn(AuthorizerFactory, 'getAuthorizer');
        getResourceManagerSpy = jest.spyOn(AzurePSQLResourceManager, 'getResourceManager');
        addFirewallRuleSpy = jest.spyOn(FirewallManager.prototype, 'addFirewallRule');
        removeFirewallRuleSpy = jest.spyOn(FirewallManager.prototype, 'removeFirewallRule');
        getActionInputsSpy = ActionInputs.getActionInputs = jest.fn().mockImplementation( () => {
            return {    
                serverName: 'ak-db.postgres.database.azure.com',
                connectionString: 'host=h dbname=d user=u password=p sslmode=require',
                plsqlFile: '1.sql',
                arguments: ''
            }
        });
        executeSpy = jest.spyOn(PsqlFilesExecutor.prototype, 'execute');
    });

    test('firewall configured in db', async () => {
        detectIPAddressSpy = PsqlUtils.detectIPAddress = jest.fn().mockImplementation( (_connString) => {
            return '';
        });

        try {
            await run();
        } catch(error) {
            console.log(error);
        }

        expect(getActionInputsSpy).toHaveBeenCalled();
        expect(detectIPAddressSpy).toHaveBeenCalled();
        expect(getAuthorizerSpy).not.toHaveBeenCalled();
        expect(getResourceManagerSpy).not.toHaveBeenCalled();
        expect(addFirewallRuleSpy).not.toHaveBeenCalled();
        expect(removeFirewallRuleSpy).not.toHaveBeenCalled();
        expect(executeSpy).toHaveBeenCalled();
        
    });

    test('firewall must be added to db', async () => {
        detectIPAddressSpy = PsqlUtils.detectIPAddress = jest.fn().mockImplementation( (_connString) => {
            return 'runnerIP';
        });
        try {
            await run();
        } catch(error) {
            console.log(error);
        }

        expect(getActionInputsSpy).toHaveBeenCalled();
        expect(detectIPAddressSpy).toHaveBeenCalled();
        expect(getAuthorizerSpy).toHaveBeenCalled();
        expect(getResourceManagerSpy).toHaveBeenCalled();
        expect(addFirewallRuleSpy).toHaveBeenCalled();
        expect(removeFirewallRuleSpy).toHaveBeenCalled();
        expect(executeSpy).toHaveBeenCalled();

    });

});
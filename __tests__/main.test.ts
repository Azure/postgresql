import { run } from "../src/main";
import { ActionInputs } from "../src/Utils/ActionInputs";
import PsqlUtils from "../src/Utils/PsqlUtils/PsqlUtils";
import { AuthorizerFactory } from "azure-actions-webclient/AuthorizerFactory";
import AzurePSQLResourceManager from "../src/Utils/FirewallUtils/ResourceManager";
import FirewallManager from "../src/Utils/FirewallUtils/FirewallManager";
import PsqlFilesExecutor from "../src/PsqlFilesExecutor";

jest.mock('@actions/core');
jest.mock('../src/Utils/PsqlUtils/PsqlToolRunner');
jest.mock('../src/FileListCreator/FileListCreator');
jest.mock('azure-actions-webclient/AuthorizerFactory');
jest.mock('../src/Utils/FirewallUtils/ResourceManager');
jest.mock('../src/Utils/FirewallUtils/FirewallManager');

describe('Testing main', () => {
    afterEach(() => {
        jest.clearAllMocks()
    });

    let getAuthorizerSpy;
    let getResourceManagerSpy;
    let addFirewallRuleSpy;
    let removeFirewallRuleSpy;
    let getActionInputsSpy;
    let detectIPAddressSpy;
    let executeSpy;

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
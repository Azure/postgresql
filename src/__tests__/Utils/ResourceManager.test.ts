import { IAuthorizer } from 'azure-actions-webclient/Authorizer/IAuthorizer';
import { ServiceClient as AzureRestClient } from 'azure-actions-webclient/AzureRestClient';
import AzurePSQLResourceManager, { FirewallRule } from '../../Utils/FirewallUtils/ResourceManager';

jest.mock('azure-actions-webclient/AzureRestClient');

describe('Testing ResourceManager', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('Initializes resource manager correctly for single server', async () => {
        let getRequestUrlSpy = jest.spyOn(AzureRestClient.prototype, 'getRequestUri').mockReturnValue('https://randomUrl/');
        let beginRequestSpy = jest.spyOn(AzureRestClient.prototype, 'beginRequest').mockResolvedValue({
            statusCode: 200,
            body: {
                value: [
                    {
                        name: 'testServer1',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer1'
                    },
                    {
                        name: 'testServer2',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer2'
                    }
                ]
            },
            statusMessage: 'OK',
            headers: []
        });

        let resourceManager = await AzurePSQLResourceManager.getResourceManager('testServer1', {} as IAuthorizer);
        let server = resourceManager.getPSQLServer();

        expect(server!.name).toEqual('testServer1');
        expect(server!.id).toEqual('/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer1');
        expect(getRequestUrlSpy).toHaveBeenCalledTimes(1);
        expect(beginRequestSpy).toHaveBeenCalledTimes(1);
    });

    it('Initializes resource manager correctly for flexible server', async () => {
        let getRequestUrlSpy = jest.spyOn(AzureRestClient.prototype, 'getRequestUri').mockReturnValue('https://randomUrl/');
        let beginRequestSpy = jest.spyOn(AzureRestClient.prototype, 'beginRequest').mockResolvedValueOnce({
            statusCode: 200,
            body: {
                value: [
                    {
                        name: 'testServer1',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer1'
                    },
                    {
                        name: 'testServer2',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer2'
                    }
                ]
            },
            statusMessage: 'OK',
            headers: []
        }).mockResolvedValueOnce({
            statusCode: 200,
            body: {
                value: [
                    {
                        name: 'testServer3',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/flexibleServers/testServer3'
                    },
                    {
                        name: 'testServer4',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/flexibleServers/testServer4'
                    }
                ]
            },
            statusMessage: 'OK',
            headers: []
        });

        let resourceManager = await AzurePSQLResourceManager.getResourceManager('testServer4', {} as IAuthorizer);
        let server = resourceManager.getPSQLServer();

        expect(server!.name).toEqual('testServer4');
        expect(server!.id).toEqual('/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/flexibleServers/testServer4');
        expect(getRequestUrlSpy).toHaveBeenCalledTimes(2);
        expect(beginRequestSpy).toHaveBeenCalledTimes(2);
    });

    it('Throws if the server does not exist', async () => {
        let getRequestUrlSpy = jest.spyOn(AzureRestClient.prototype, 'getRequestUri').mockReturnValue('https://randomUrl/');
        let beginRequestSpy = jest.spyOn(AzureRestClient.prototype, 'beginRequest').mockResolvedValueOnce({
            statusCode: 200,
            body: {
                value: [
                    {
                        name: 'testServer1',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer1'
                    },
                    {
                        name: 'testServer2',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer2'
                    }
                ]
            },
            statusMessage: 'OK',
            headers: []
        }).mockResolvedValueOnce({
            statusCode: 200,
            body: {
                value: [
                    {
                        name: 'testServer3',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/flexibleServers/testServer3'
                    },
                    {
                        name: 'testServer4',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/flexibleServers/testServer4'
                    }
                ]
            },
            statusMessage: 'OK',
            headers: []
        });

        let expectedError = `Unable to get details of PSQL server testServer5. PSQL server 'testServer5' was not found in the subscription.`;
        try {
            await AzurePSQLResourceManager.getResourceManager('testServer5', {} as IAuthorizer);
        } catch(error) {
            expect(error.message).toEqual(expectedError);
        }
        expect(getRequestUrlSpy).toHaveBeenCalledTimes(2);
        expect(beginRequestSpy).toHaveBeenCalledTimes(2);
    });

    it('Adds firewall rule successfully', async () => {
        let getRequestUrlSpy = jest.spyOn(AzureRestClient.prototype, 'getRequestUri').mockReturnValue('https://randomUrl/');
        let beginRequestSpy = jest.spyOn(AzureRestClient.prototype, 'beginRequest').mockResolvedValueOnce({
            statusCode: 200,
            body: {
                value: [
                    {
                        name: 'testServer1',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer1'
                    }
                ]
            },
            statusMessage: 'OK',
            headers: []
        }).mockResolvedValueOnce({
            statusCode: 202,
            body: {},
            statusMessage: 'OK',
            headers: {
                'azure-asyncoperation': 'http://asyncRedirectionURI'
            }
        }).mockResolvedValueOnce({
            statusCode: 200,
            body: {
                'status': 'Succeeded'
            },
            statusMessage: 'OK',
            headers: {}
        }).mockResolvedValueOnce({
            statusCode: 200,
            body: {
                name: 'FirewallRule'
            },
            statusMessage: 'OK',
            headers: {}
        });
        
        let resourceManager = await AzurePSQLResourceManager.getResourceManager('testServer1', {} as IAuthorizer);
        let firewallRule = await resourceManager.addFirewallRule('0.0.0.0', '1.1.1.1');

        expect(firewallRule.name).toEqual('FirewallRule');
        expect(getRequestUrlSpy).toHaveBeenCalledTimes(3);
        expect(beginRequestSpy).toHaveBeenCalledTimes(4);
    });

    it('Removes firewall rule successfully', async () => {
        let getRequestUrlSpy = jest.spyOn(AzureRestClient.prototype, 'getRequestUri').mockReturnValue('https://randomUrl/');
        let beginRequestSpy = jest.spyOn(AzureRestClient.prototype, 'beginRequest').mockResolvedValueOnce({
            statusCode: 200,
            body: {
                value: [
                    {
                        name: 'testServer1',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/servers/testServer1'
                    }
                ]
            },
            statusMessage: 'OK',
            headers: []
        }).mockResolvedValueOnce({
            statusCode: 200,
            body: {
                value: [
                    {
                        name: 'testServer3',
                        id: '/subscriptions/SubscriptionId/resourceGroups/testrg/providers/Microsoft.DBforPostgreSQL/flexibleServers/testServer3'
                    }
                ]
            },
            statusMessage: 'OK',
            headers: []
        }).mockResolvedValueOnce({
            statusCode: 202,
            body: {},
            statusMessage: 'OK',
            headers: {
                'azure-asyncoperation': 'http://asyncRedirectionURI'
            }
        }).mockResolvedValueOnce({
            statusCode: 200,
            body: {
                'status': 'Succeeded'
            },
            statusMessage: 'OK',
            headers: {}
        });

        let resourceManager = await AzurePSQLResourceManager.getResourceManager('testServer3', {} as IAuthorizer);
        await resourceManager.removeFirewallRule({ name: 'FirewallRule' } as FirewallRule);

        expect(getRequestUrlSpy).toHaveBeenCalledTimes(3);
        expect(beginRequestSpy).toHaveBeenCalledTimes(4);
    })
});
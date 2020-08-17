import PsqlUtils from "../../Utils/PsqlUtils/PsqlUtils";
import { FirewallConstants } from "../../Constants";

jest.mock('../../Utils/PsqlUtils/PsqlToolRunner');
const CONFIGURED = "configured";

describe('Testing PsqlUtils', () => {
    afterEach(() => {
        jest.clearAllMocks()
    });

    let detectIPAddressSpy: any;
    beforeAll(() => {
        detectIPAddressSpy = PsqlUtils.detectIPAddress = jest.fn().mockImplementation( (connString: string) => {
            let psqlError;
            if (connString != CONFIGURED) {
                psqlError = `psql: error: could not connect to server: FATAL:  no pg_hba.conf entry for host "1.2.3.4", user "<user>", database "<db>"`;
            }
            let ipAddress = '';
            if (psqlError) {
                const ipAddresses = psqlError.match(FirewallConstants.ipv4MatchPattern);
                if (ipAddresses) {
                    ipAddress = ipAddresses[0];
                } else {
                    throw new Error(`Unable to detect client IP Address: ${psqlError}`);
                }
            }
            return ipAddress;
        });
    });

    test('detectIPAddress should return ip address', async () => {
        await PsqlUtils.detectIPAddress("");
        expect(detectIPAddressSpy).toReturnWith("1.2.3.4");
    });

    test('detectIPAddress should return empty string', async () => {
        await PsqlUtils.detectIPAddress(CONFIGURED);
        expect(detectIPAddressSpy).toReturnWith("");
    })

});
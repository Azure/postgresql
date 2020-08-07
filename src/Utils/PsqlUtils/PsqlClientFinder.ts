import * as core from '@actions/core';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as winreg from 'winreg';
import * as semver from 'semver';
import { SemVer } from 'semver';

export default class PsqlClientFinder {
    static psqlClientPath: string;

    public static async getPsqlClientPath(): Promise<string> {
        if (!this.psqlClientPath) {
            core.debug(`Getting location of PSQL client on ${os.hostname()}`);
            const IS_WINDOWS = process.platform === 'win32';
            if (IS_WINDOWS) {
                this.psqlClientPath = await this._getPsqlClientOnWindows();
            }
            else {
                this.psqlClientPath = await this._getPsqlClientOnLinux();
            }
        }
        return this.psqlClientPath;
    }

    private static async _getPsqlClientOnWindows(): Promise<string> {
        const psqlClientRegistryKey = path.join('\\', 'Software', 'PostgreSQL', 'Installations');
        let psqlClientPath = '';
        if (await PsqlClientFinder.registryKeyExists(psqlClientRegistryKey)) {
            psqlClientPath = await this._getpsqlClientPathFromRegistry(psqlClientRegistryKey);
        }

        if (!psqlClientPath) {
            core.debug(`Unable to find PSQL client executable on ${os.hostname()} from registry.`);
            core.debug(`Getting location of psql.exe from PATH environment variable.`);
            psqlClientPath = await io.which('psql', false);
        }

        if (psqlClientPath) {
            core.debug(`PSQL client found at path ${psqlClientPath}`);
            return psqlClientPath;
        }
        else {
            throw new Error(`Unable to find PSQL client executable on ${os.hostname()}.`);
        }
    }

    private static registryKeyExists(path: string): Promise<boolean> {
        core.debug(`Checking if registry key 'HKLM:${path}' exists.`);
        return new Promise((resolve) => {
            const regKey = new winreg({
                hive: winreg.HKLM,
                key: path
            });

            regKey.keyExists((error, result: boolean) => {
                resolve(!!error ? false : result);
            })
        });
    }

    private static async _getpsqlClientPathFromRegistry(registryPath: string): Promise<string> {
        core.debug(`Getting location of psql.exe from registryPath HKLM:${registryPath}`);
        const registrySubKeys = await PsqlClientFinder.getRegistrySubKeys(registryPath);

        let latestVersionKey = registrySubKeys[0].key;
        let latestVersion = 0.0;
        for(const subKey of registrySubKeys)
        {
            const splitArray = subKey.key.split('-');
            const version = parseFloat(splitArray[splitArray.length - 1]);

            if(semver.gt(semver.coerce(version), semver.coerce(latestVersion)))
            {
                latestVersionKey = subKey.key;
                latestVersion = version;
            }
        }
        const splitLatest = latestVersionKey.split('\\');
        const latestPsqlInstallation = splitLatest[splitLatest.length - 1];
        core.debug(`Latest version of PSQL found is: ${latestPsqlInstallation}`);

        for (const registryKey of registrySubKeys) {
            if (registryKey.key.match(latestPsqlInstallation)) {
                const psqlServerPath = await PsqlClientFinder.getRegistryValue(registryKey, 'Base Directory');
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
    }

    private static getRegistrySubKeys(path: string): Promise<winreg.Registry[]> {
        return new Promise((resolve) => {
            core.debug(`Getting sub-keys at registry path: HKLM:${path}`);
            const regKey = new winreg({
                hive: winreg.HKLM,
                key: path
            });

            regKey.keys((error, result) => {
                return !!error ? '' : resolve(result);
            })
        });
    }

    private static getRegistryValue(registryKey: winreg.Registry, name: string): Promise<string> {
        return new Promise((resolve) => {
            core.debug(`Getting registry value ${name} at path: HKLM:${registryKey.key}`);
            registryKey.get(name, (error, result: winreg.RegistryItem) => {
                resolve(!!error ? '' : result.value);
            });
        });
    }

    private static async _getPsqlClientOnLinux(): Promise<string> {
        const  psqlClientPath = await io.which('psql', true);
        core.debug(`PSQL client found at path ${psqlClientPath}`);
        return psqlClientPath;
    }

}
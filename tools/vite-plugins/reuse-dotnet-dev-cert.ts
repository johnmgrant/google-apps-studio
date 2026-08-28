import {join} from 'path';
import {userInfo} from 'os';
import type {UserConfig, Plugin} from 'vite';
import {execSync} from 'child_process';
import {createSecureContext} from 'tls';
import {existsSync, readFileSync} from 'fs';
import {env} from 'process';

const DEBUG = 'true' === env.VITE_PLUGIN_DEBUG?.toLowerCase() || false;

const ASPNET_GLOBAL_BASE_PATH =
  env.ASPNET_GLOBAL_BASE_PATH || '.aspnet/dev-certs/https';
const ASPNET_GLOBAL_CERTS_PATH =
  env.ASPNET_GLOBAL_CERTS_PATH ||
  join(userInfo().homedir, ASPNET_GLOBAL_BASE_PATH);
const ASPNET_CERT_FILENAME =
  env.ASPNET_CERT_FILENAME || 'aspnetapp-localhost.pfx';
const ASPNET_CERT_PASS = env.ASPNET_CERT_PASS || '';
const ASPNET_CERT_PATH =
  env.ASPNET_CERT_PATH || join(ASPNET_GLOBAL_CERTS_PATH, ASPNET_CERT_FILENAME);

const logDebug = DEBUG ? console.debug : () => {};
const stdio = DEBUG ? 'inherit' : 'ignore';

/**
 * Checks if a command exists in the system.
 * @param {string} cmd - The command to check.
 * @returns {boolean} - True if the command exists, false otherwise.
 */
function commandExists(cmd: string): boolean {
  try {
    let command = '';
    if (process.platform === 'darwin') {
      command = `command -v ${cmd}`;
    } else if (process.platform === 'win32') {
      command = `where ${cmd}`;
    } else {
      command = `which ${cmd}`;
    }
    execSync(command, {stdio});
    return true;
  } catch {
    return false;
  }
}

/**
 * Empties the specified directory.
 * @param {string} directory - The directory to empty.
 * @returns {void}
 */
function emptyDirectory(directory: string): void {
  // return if the directory doesn't exist
  if (!existsSync(directory)) {
    logDebug(`Directory ${directory} does not exist.`);
    return;
  }

  logDebug(`Cleaning directory files in ${directory}...`);
  let command = '';
  if (process.platform === 'win32') {
    command = `del /Q ${directory}\\*`;
  } else {
    command = `rm -rfv ${directory}/*`;
  }
  execSync(command, {stdio});
  logDebug('Directory cleaned up.');
}

/**
 * Generate a development certificate for HTTPS support.
 * @param {string} projectPfxPath - The path to the project PFX file.
 * @param {string} passphrase - The passphrase for the PFX file.
 */
function generateDevCert(projectPfxPath: string, passphrase: string): void {
  if (commandExists('dotnet')) {
    logDebug(`Generating certificate at ${projectPfxPath}...`);
    try {
      // Clear the active certificate from the system.
      execSync('dotnet dev-certs https --clean', {stdio});

      // Ensure the certsDir is empty using fs library
      emptyDirectory(ASPNET_GLOBAL_CERTS_PATH);

      // Generate a new certificate.
      execSync(
        `dotnet dev-certs https -ep ${projectPfxPath} -p ${passphrase} --trust`,
        {stdio}
      );
    } catch (err) {
      throwError('Error generating certificate.', err as Error);
    }
  } else {
    throwError(
      'Error: dotnet command does not exist. Please install .NET SDK.'
    );
  }
}

/**
 * Checks if the certificate is valid.
 * @returns {boolean} - True if the certificate is valid, false otherwise.
 */
function isCertValid(): boolean {
  try {
    createSecureContext({
      pfx: readFileSync(ASPNET_CERT_PATH),
      passphrase: ASPNET_CERT_PASS,
    });
    logDebug('Certificate is valid.');
    return true; // Loaded successfully
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message?.includes('verify failure') ||
        err.message?.includes('bad decrypt'))
    ) {
      return false;
    } else {
      throw err;
    }
  }
}

/**
 * Resolves the path to the ASP.NET development certificate.
 * @returns {string} - The path to the certificate.
 * @throws {Error} - If the certificate is not found or invalid.
 */
function resolveCertPath(): string {
  let shouldGenerate = false;
  if (!existsSync(ASPNET_CERT_PATH)) {
    shouldGenerate = true;
    logDebug(`PFX certificate not found at ${ASPNET_CERT_PATH}.`);
  }

  if (shouldGenerate || (!!ASPNET_CERT_PATH && !isCertValid())) {
    generateDevCert(ASPNET_CERT_PATH, ASPNET_CERT_PASS);
  }

  if (!existsSync(ASPNET_CERT_PATH)) {
    throwError(
      `Certificate file was not found at ${ASPNET_CERT_PATH}. Please check your setup.`
    );
  } else {
    logDebug(`Certificate file found at ${ASPNET_CERT_PATH}.`);
  }

  return ASPNET_CERT_PATH;
}

/**
 * Throws an error with a message and optional error object.
 * @param {string} msg - The error message.
 * @param {Error} [err] - Optional error object.
 * @throws {Error} - Throws an error with the provided message and optional error.
 */
function throwError(msg: string, err?: Error) {
  const message = err ? [msg, err] : msg;
  logDebug(message);

  const error = err ? err : new Error(msg);
  throw error;
}

/**
 * Gets the server configuration for Vite.
 * @returns {UserConfig['server']} - The server configuration for Vite.
 */
function getServerConfig(): UserConfig['server'] {
  const certPath = resolveCertPath();
  if (!existsSync(certPath)) {
    throwError(
      `Certificate file was not found at ${certPath}. Please check your setup.`
    );
  }

  return {
    https: {
      pfx: certPath,
      passphrase: ASPNET_CERT_PASS,
    },
  };
}

export default {
  name: 'reuse-dotnet-dev-cert',
  apply: 'serve',
  enforce: 'pre',
  config: (config) => {
    let serverConfig: UserConfig['server'];

    try {
      serverConfig = getServerConfig();
    } catch (error) {
      console.info(
        'Certificate not found or invalid. Skipping HTTPS setup.',
        error
      );
    }

    config.server = {
      ...config.server,
      ...(serverConfig || {}),
      cors: {
        origin: '*', // Allow all origins for development
      },
    };
  },
} as Plugin;

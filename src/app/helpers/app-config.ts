import * as process from 'process';

const PUBLIC_FOLDER = 'public';

/**
 * @TODO These configs should be overridable with a JSON file placed in the app's root
 */
export const appConfig = {
  DEFAULT_PORT: 3000,

  DB_DEFAULT_URL: 'mongodb://localhost/uv-package-manager',
  DB_TEST_URL: 'mongodb://localhost/uv-package-manager-test',

  PUBLIC_FOLDER,
  FILE_FOLDER: 'files',
  FILE_FOLDER_TEST: 'tmp-files',

  ROOT_URL: 'http://uvpm.com',
  ROOT_URL_TEST: 'http://localhost:3000',

  /**
   * Check if this is the testing environment
   */
  isEnvTest () {
    return process.env.TEST === 'true';
  },

  /**
   * Check if this is the production environment
   */
  isEnvProcution () {
    return process.env.NODE_ENV === 'production';
  },

  getFileFolder () {
    if (this.isEnvTest()) {
      return this.FILE_FOLDER_TEST;
    }

    return this.FILE_FOLDER;
  },

  getRootUrl () {
    if (this.isEnvProcution()) {
      return this.ROOT_URL;
    }

    return this.ROOT_URL_TEST;
  },
};

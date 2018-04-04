import * as process from 'process';

/**
 * @TODO These configs should be overridable with a JSON file placed in the app's root
 */
class AppConfig {
  // Max file size in megabytes
  public MAX_FILE_SIZE_MB = 5;

  public DEFAULT_PORT = 3000;

  public DB_DEFAULT_URL = 'mongodb://localhost/uv-package-manager';
  public DB_TEST_URL = 'mongodb://localhost/uv-package-manager-test';

  public PUBLIC_FOLDER = 'public';
  public FILE_FOLDER = 'files';
  public FILE_FOLDER_TEST = 'tmp-files';

  // @TODO Strip all references to root URL
  public ROOT_URL = 'http://localhost:3000';
  public ROOT_URL_TEST = 'http://localhost:3000';

  public ELASTIC_SEARCH_URL = 'http://localhost:9200';

  /**
   * Dynamically retrieve the current database URL based on the environment
   * @returns {string}
   */
  public get dbUrl () {
    if (this.isEnvTest()) {
      return appConfig.DB_TEST_URL;
    } else {
      return process.env.DB_URL || appConfig.DB_DEFAULT_URL;
    }
  }

  /**
   * Check if this is the testing environment
   */
  public isEnvTest () {
    return process.env.TEST === 'true';
  }

  /**
   * Check if this is the production environment
   */
  public isEnvProdution () {
    return process.env.NODE_ENV === 'production';
  }

  public get fileFolder () {
    if (this.isEnvTest()) {
      return `${this.FILE_FOLDER_TEST}`;
    }

    return `${this.FILE_FOLDER}`;
  }

  public getRootUrl () {
    // istanbul ignore if
    if (this.isEnvProdution()) {
      return this.ROOT_URL;
    }

    return this.ROOT_URL_TEST;
  }
}

export const appConfig = new AppConfig();

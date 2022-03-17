import fs from 'fs';
import path from 'path';
import { config as dotEnvConfig } from 'dotenv';

const NETWORK = process.env.NETWORK || 'hardhat';
const envPath = path.resolve(__dirname, '.env');

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [`${envPath}.${NETWORK}.local`, `${envPath}.${NETWORK}`, envPath].filter(Boolean) as string[];

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    dotEnvConfig({
      path: dotenvFile,
    });
  }
});

const {
  INFURA_API_KEY = '',
  ETHERSCAN_API_KEY = '',
  PRIVATE_KEY = '',
  // Registry authentication delay period
  DELAY_PERIOD = '0',
} = process.env;

// api keys
export { PRIVATE_KEY, INFURA_API_KEY, ETHERSCAN_API_KEY };

export { DELAY_PERIOD };

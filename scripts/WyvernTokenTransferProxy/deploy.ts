import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import { BigNumber } from 'ethers';
import fs from 'fs';
import { task } from 'hardhat/config';
import path from 'path';
import { deployContract } from '../../procedures';

task('deploy-token-transfer-proxy', 'Deploys Wyvern Token Transfer Proxy')
  .addParam('input', 'Deploy input file')
  .addParam('gasprice', 'The gas price for deployment, in gweis, example: 10 for 10 gweis')
  .setAction(async (taskArgs, hre) => {
    const registryAddress = fs.readFileSync(
      path.join(__dirname, '../WyvernProxyRegistry/deploy_rinkeby_output.json'),
      'utf-8',
    );
    const { contractAddress: wyvernProxyRegistryAddress } = JSON.parse(registryAddress);
    if (!wyvernProxyRegistryAddress) {
      throw new Error('Wyvern Proxy Registry Address not found');
    }
    await deployContract({
      hre,
      deployInputFilePath: path.join(__dirname, `./${taskArgs.input}`),
      contractName: 'WyvernTokenTransferProxy',
      gasPrice: BigNumber.from(taskArgs.gasprice).mul(BigNumber.from(10).pow(9)),
      constructorArgs: [wyvernProxyRegistryAddress],
      exportPath: __dirname,
    });
  });

export {};

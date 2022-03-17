import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import { BigNumber } from 'ethers';
import { task } from 'hardhat/config';
import path from 'path';
import { deployContract } from '../../procedures';

task('deploy-proxy-registry', 'Deploys Wyvern Proxy Registry')
  .addParam('input', 'Deploy input file')
  .addParam('gasprice', 'The gas price for deployment, in gweis, example: 10 for 10 gweis')
  .setAction(async (taskArgs, hre) => {
    await deployContract({
      hre,
      deployInputFilePath: path.join(__dirname, `./${taskArgs.input}`),
      contractName: 'WyvernProxyRegistry',
      constructorArgs: [],
      gasPrice: BigNumber.from(taskArgs.gasprice).mul(BigNumber.from(10).pow(9)),
      exportPath: __dirname,
    });
  });

export {};

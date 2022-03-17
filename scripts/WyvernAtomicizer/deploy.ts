import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import { BigNumber } from 'ethers';
import { task } from 'hardhat/config';
import path from 'path';
import { deployContract } from '../../procedures';

task('deploy-atomicizer', 'Deploys Wyvern Atomicizer')
  .addParam('input', 'Deploy input file')
  .addParam('gasprice', 'The gas price for deployment, in gweis, example: 10 for 10 gweis')
  .setAction(async (taskArgs, hre) => {
    await deployContract({
      hre,
      deployInputFilePath: path.join(__dirname, `./${taskArgs.input}`),
      contractName: 'WyvernAtomicizer',
      gasPrice: BigNumber.from(taskArgs.gasprice).pow(9),
      constructorArgs: [],
      exportPath: __dirname,
    });
  });

export {};

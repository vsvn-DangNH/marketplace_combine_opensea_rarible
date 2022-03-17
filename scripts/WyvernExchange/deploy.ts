import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import { task } from 'hardhat/config';
import path from 'path';
import fs from 'fs';
import { deployContract, deployUpgradeableContract } from '../../procedures';
import { BigNumber } from 'ethers';

task('deploy-exchange', 'Deploys Wyvern Exchange')
  .addParam('input', 'Deploy input file')
  .addParam('gasprice', 'The gas price for deployment, in gweis, example: 10 for 10 gweis')
  .setAction(async (taskArgs, hre) => {
    const registryOutput = fs.readFileSync(
      path.join(__dirname, '../WyvernProxyRegistry/deploy_rinkeby_output.json'),
      'utf-8',
    );
    const { contractAddress: wyvernProxyRegistryAddress } = JSON.parse(registryOutput);
    const tokenTransferProxyOutput = fs.readFileSync(
      path.join(__dirname, '../WyvernTokenTransferProxy/deploy_rinkeby_output.json'),
      'utf-8',
    );
    const { contractAddress: tokenTransferProxyAddress } = JSON.parse(tokenTransferProxyOutput);
    if (!wyvernProxyRegistryAddress || !tokenTransferProxyAddress) {
      throw new Error('Missing address input');
    }
    await deployContract({
      hre,
      deployInputFilePath: path.join(__dirname, `./${taskArgs.input}`),
      contractName: 'WyvernExchange',
      gasPrice: BigNumber.from(taskArgs.gasprice).mul(BigNumber.from(10).pow(9)),
      constructorArgs: [
        wyvernProxyRegistryAddress,
        tokenTransferProxyAddress,
        '0xB6B61613268921913A5c01dF94D21D4de34e84cE',
        '0xB6B61613268921913A5c01dF94D21D4de34e84cE',
      ],
      exportPath: __dirname,
    });
  });

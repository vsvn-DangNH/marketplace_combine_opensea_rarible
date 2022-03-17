import { Contract } from '@ethersproject/contracts';
import path from 'path';
import { exportContractAddress, parseDeployInputFile, verifyContract } from './utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

interface DeployContractInput {
  hre: HardhatRuntimeEnvironment;
  deployInputFilePath: string;
  contractName: string;
  constructorArgs: any[];
  initializer?: string;
  exportPath: string;
  debug?: boolean;
}

export const deployUpgradeableContract = async ({
  hre,
  deployInputFilePath,
  contractName,
  constructorArgs,
  initializer = 'initialize',
  exportPath,
  debug = true,
}: DeployContractInput) => {
  // eslint-disable-next-line prefer-const
  let { contractAddress, outputFileName } = await parseDeployInputFile(deployInputFilePath);
  const [deployer] = await hre.ethers.getSigners();

  const deployerAddress = await deployer.getAddress();

  if (debug) console.log(`Deploy upgradeable contract with address: ${deployerAddress}`);

  const contractFactory = await hre.ethers.getContractFactory(contractName);

  let contract: Contract;

  // only deploy contract only when contract isn't deployed yet
  if (typeof contractAddress !== 'string') {
    contract = await hre.upgrades.deployProxy(contractFactory, constructorArgs, {
      initializer,
    });
    await contract.deployed();
    contractAddress = contract.address;
  } else {
    contract = await hre.ethers.getContractAt(contractName, contractAddress);
  }

  if (debug) console.log(`${contractName} Contract Address: ${contract.address}`);

  const implementationContractAddress = await hre.upgrades.erc1967.getImplementationAddress(contract.address);
  console.log('Implementation Address:', implementationContractAddress);

  if (debug) console.log('Verify contracts...');

  await verifyContract({
    hre,
    contractAddress: implementationContractAddress,
    constructorArgs: [],
    contractUrl: `contracts/${contractName}.sol:${contractName}`,
  });

  // export contract address to a file
  exportContractAddress(path.join(exportPath, outputFileName), {
    contractAddress: contract.address,
    implementationContractAddress,
  });

  console.log('Setup completed!');
};

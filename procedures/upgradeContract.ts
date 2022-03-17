import path from "path"
import { exportContractAddress, parseDeployInputFile } from "./utils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

interface DeployContractInput {
    hre: HardhatRuntimeEnvironment
    deployInputFilePath: string
    contractName: string
    exportPath: string
    debug?: boolean
}

export const upgradeContract = async ({
    hre,
    deployInputFilePath,
    contractName,
    exportPath,
    debug = true,
}: DeployContractInput) => {
    let { contractAddress, outputFileName } = await parseDeployInputFile(deployInputFilePath)
    const [deployer] = await hre.ethers.getSigners()

    const deployerAddress = await deployer.getAddress()

    if (debug) console.log(`Upgrade contract with address: ${deployerAddress}`)

    const contractFactory = await hre.ethers.getContractFactory(contractName)

    if (typeof contractAddress !== "string")
        throw new Error("Contract address not found! Contract address is required when upgrading!")

    const upgradedContract = await hre.upgrades.upgradeProxy(contractAddress, contractFactory)
    if (debug) console.log(`${contractName} Contract Address: ${upgradedContract.address}`)

    // export contract address to a file
    exportContractAddress(path.join(exportPath, outputFileName), { contractAddress: upgradedContract.address })

    console.log("Setup completed!")
}

import { Contract } from "@ethersproject/contracts"
import path from "path"
import { exportContractAddress, parseDeployInputFile, verifyContract } from "./utils"
import { BigNumber } from "@ethersproject/bignumber"
import { HardhatRuntimeEnvironment } from "hardhat/types"

interface DeployContractInput {
    hre: HardhatRuntimeEnvironment
    deployInputFilePath: string

    /** The contract name you want to deploy */
    contractName: string

    /** Parameters to pass to the constructor */
    constructorArgs: any[]

    /** Set the gas price when deploy */
    gasPrice: BigNumber

    /** Path that export file will be exported to */
    exportPath: string

    /** For debugging: when true, there will be console log of deployment's info
     * @default true
     */
    debug?: boolean
}

export const deployContract = async ({
    hre,
    deployInputFilePath,
    contractName,
    constructorArgs,
    gasPrice,
    exportPath,
    debug = true,
}: DeployContractInput) => {
    let { contractAddress, outputFileName } = await parseDeployInputFile(deployInputFilePath)
    const [deployer] = await hre.ethers.getSigners()

    const deployerAddress = await deployer.getAddress()

    if (debug) console.log(`Deploy contracts with address: ${deployerAddress}, gasPrice: ${gasPrice.toString()}`)

    const contractFactory = await hre.ethers.getContractFactory(contractName)

    let contract: Contract

    // only deploy contract only when contract isn't deployed yet
    if (typeof contractAddress !== "string") {
        contract = await contractFactory.deploy(...constructorArgs, { gasPrice })
        await contract.deployed()
        contractAddress = contract.address
    } else {
        if (debug) console.log("Contract is already deployed")
        contract = await hre.ethers.getContractAt(contractName, contractAddress)
    }

    if (debug) console.log(`${contractName} Contract Address: ${contract.address}`)
    // export contract address to a file
    exportContractAddress(path.join(exportPath, outputFileName), { contractAddress: contract.address })

    if (debug) console.log("Verify contracts...")

    await verifyContract({
        hre,
        contractAddress: contract.address,
        constructorArgs,
        contractUrl: `contracts/${contractName}.sol:${contractName}`,
    })

    console.log("Setup completed!")
}

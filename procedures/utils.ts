import fs from "fs"
import { HardhatRuntimeEnvironment } from "hardhat/types"

export interface VerifyContractInput {
    hre: HardhatRuntimeEnvironment
    contractAddress: string
    constructorArgs: any[]
    contractUrl: string
}

export const verifyContract = async ({ hre, contractAddress, constructorArgs, contractUrl }: VerifyContractInput) => {
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: constructorArgs,
        contract: contractUrl,
    })
}

export const parseDeployInputFile = async (
    filePath: string
): Promise<{ contractAddress?: string; outputFileName: string }> => {
    const configParams = fs.readFileSync(filePath, "utf8")
    const parsed: Record<string, string> = JSON.parse(configParams)

    const contractAddress = parsed["contractAddress"]
    const outputFileName = parsed["outputFileName"]

    if (!outputFileName) console.log("WARNING: outputFileName not found.")

    return {
        contractAddress,
        outputFileName,
    }
}

export const exportContractAddress = (filePath: string, data: Record<string, any>) => {
    const json = JSON.stringify(data, null, 2)
    fs.writeFileSync(filePath, json)
}

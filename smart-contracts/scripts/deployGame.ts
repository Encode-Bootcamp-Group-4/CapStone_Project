import { ethers } from "hardhat";
import { Game, Game__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    let main: Game;

    // Step 1: Setup wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    console.log("Wallet address: ", wallet.address);

    // Step 2: Setup provider
    const options = {
        // The default provider will be used if no provider is specified
        alchemy: process.env.ALCHEMY_API_KEY,
        // infura: process.env.INFURA_API_KEY,
    };
    // console.log("options", options);

    const provider = ethers.getDefaultProvider("goerli", options);

    // Step 3: Setup up a signer
    const signer = wallet.connect(provider);

    // Printe wallet info
    const balanceBN = await provider.getBalance(signer.getAddress());
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log("Balance: ", balance);
    if (balance < 0.01) {
        throw Error("Not enough funds");
    }
    const mainFactory = new Game__factory(signer);

    // Step 4: Deploy contract
    main = await mainFactory.deploy(
        ethers.utils.parseEther("0.01"),
    );
    const deployment = await main.deployed();
    console.log("Contract address: ", deployment.address);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
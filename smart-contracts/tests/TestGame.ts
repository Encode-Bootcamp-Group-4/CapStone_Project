// FINISH THIS ON MONDAY OR TUESDAY

import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from 'hardhat';
import { Game } from "../typechain-types";
import { BigNumber } from "ethers";

describe("Game", () => {
    let gameContract: Game;
    let deployer: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;

    beforeEach(async function () {
        [deployer, acc1, acc2] = await ethers.getSigners();
        const GameFactory = await ethers.getContractFactory("GameFactory");
        gameContract = await GameFactory.deploy(ethers.utils.parseEther("0.01")) as Game;
        await gameContract.deployed();
    });

    describe("user creates a game", function () {
        const betAmount = ethers.utils.parseEther("0.01");
        let balanceBeforeBn: BigNumber;
        let purchaseGasCosts: BigNumber;

        beforeEach(async () => {
            balanceBeforeBn = await acc1.getBalance();
            console.log("balance before: ", balanceBeforeBn.toString());
            const userCreatesGame = await gameContract.connect(acc1).createGame({value: betAmount});
            const userCreatesGameTx = await userCreatesGame.wait();
            console.log("userCreatesGameTx", userCreatesGameTx);    
            const gasUnitsUsed = userCreatesGameTx.gasUsed;
            const gasPrice = userCreatesGameTx.effectiveGasPrice;
            purchaseGasCosts = gasUnitsUsed.mul(gasPrice);
        });

        it("acc1 should have a balance of 0.01 ETH less than before", async () => {
            const balanceAfterBn = await acc1.getBalance();
            const amountSpentBn = balanceBeforeBn.sub(balanceAfterBn);
            const expectedDiff = betAmount.add(purchaseGasCosts);
            const error = amountSpentBn.sub(expectedDiff);
            expect(error).to.equal(0);
        });
    });

});
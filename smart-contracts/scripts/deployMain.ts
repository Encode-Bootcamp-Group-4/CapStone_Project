import {Game} from "../typechain-types";
import { ethers } from "hardhat";
import { Stats } from "fs";

const betSize = .1
const feeBps = 1

async function main() {
  const address = await ethers.getSigners();
    const gameFactory = await ethers.getContractFactory("Game");
    const gameContract = await gameFactory.deploy(
      ethers.utils.parseUnits(String(betSize),"ether"),
      feeBps
    );
  const txReceipt = await gameContract.deployed();
  //console.log(txReceipt.deployTransaction.from);

  //console.log("game Data:", await gameContract.stats());

  //console.log("Dev Data:", await gameContract.viewDev());

  console.log("game Data:", await gameContract.stats());

  console.log("Playing:", await gameContract.playing());

  await gameContract.bet({value: ethers.utils.parseEther(".1")});

  console.log("Playing:", await gameContract.playing());


  await gameContract.saveScore(address[0].address, 1);

  console.log("game Data:", await gameContract.stats());

  await gameContract.saveScore(address[1].address, 2);

  console.log("game Data:", await gameContract.stats());




}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

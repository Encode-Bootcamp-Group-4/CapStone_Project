import { Injectable } from "@nestjs/common";
import { ethers } from "ethers";
import * as GameJSON from "./assets/Game.json";

const GAME_ADDRESS = "0x8bb90cf33a12cc2bb573705cabf66444ce99cc14";
const GAME_ABI = GameJSON.abi; // Game contract ABI
require("dotenv").config()

@Injectable()
export class AppService {
  // init
  provider: ethers.providers.Provider;
  gameContract: ethers.Contract;
  gameContractConnect: ethers.Contract;

  constructor() {
    this.provider = ethers.getDefaultProvider("goerli");
    this.gameContract = new ethers.Contract(
      GAME_ADDRESS,
      GAME_ABI,
      this.provider
    );
    const pkey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(pkey, this.provider);
    const signer = wallet.connect(this.provider);
    this.gameContractConnect = this.gameContract.connect(signer);
  }

  async setGameScore(
    _gameId: number,
    _score: number,
    _address: string
  ): Promise<string> {
    if (_score > 625) {
      _score = 1;
    }
    const tx = await this.gameContractConnect.setGameScore(
      _gameId,
      _score,
      _address
    );
    return tx;
  }

  async closeChallenge(
    _gameId: number,
    _score: number,
    _address: string
  ): Promise<string> {
    if (_score > 625) {
      _score = 1;
    }
    const tx = await this.gameContractConnect.closeChallenge(
      _gameId,
      _score,
      _address
    );
    return tx;
  }
}

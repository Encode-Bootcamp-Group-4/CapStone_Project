import { Injectable } from "@nestjs/common";
import { ethers, Signer } from "ethers";
require("dotenv").config();

@Injectable()
export class AppService {
  // init
  provider: ethers.providers.Provider;
  signer: Signer;
  timeout: { [address: string]: number } = {};

  constructor() {
    // 2. Define network configurations
    const providerRPC = {
      shardeum: {
        name: process.env.RPC_NAME,
        rpc: process.env.RPC_URL, // Insert your RPC URL here
        chainId: parseInt(process.env.RPC_CHAIN_ID, 16), // 0x504 in hex,
      },
    };

    // 3. Create ethers provider
    this.provider = new ethers.providers.StaticJsonRpcProvider(
      providerRPC.shardeum.rpc,
      {
        chainId: providerRPC.shardeum.chainId,
        name: providerRPC.shardeum.name,
      }
    );

    const pkey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(pkey, this.provider);
    this.signer = wallet.connect(this.provider);
  }

  async sendSHM(_address: string): Promise<string> {
    if (!_address) {
      throw new Error("Address is required");
    }

    if (!ethers.utils.isAddress(_address)) {
      throw new Error("Invalid address");
    }

    if (this.timeout.address && this.timeout.address > Date.now().valueOf()) {
      throw new Error("Faucet is on cooldown");
    }

    await this.signer.getBalance();

    if ((await this.signer.getBalance()).toNumber() < 1) {
      throw new Error("Faucet has insufficient balance");
    }

    let res = await this.signer
      .sendTransaction({
        to: _address,
        value: ethers.utils.parseEther("1"),
      })
      .then((tx) => {
        let time_ = (Date.now() as number) + 60000000;
        this.timeout[_address] = time_;
        return tx.hash;
      })
      .catch((err) => {
        throw new Error(err);
      });

    return res;
  }
}

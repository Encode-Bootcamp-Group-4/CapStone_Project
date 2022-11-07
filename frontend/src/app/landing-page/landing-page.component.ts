import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { ethers } from 'ethers';
import web3 from 'web3';
import { GAME_ADDRESS } from '../vars/contractAddress';
import { GAME_ABI } from '../vars/contractABI';
import { Router } from '@angular/router';

const gameContract = GAME_ADDRESS;
const gameABI = GAME_ABI;
const iface = new ethers.utils.Interface(gameABI);

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  walletId: string = "";
  provider: any;
  signer: any;
  user: any;
  gameContract: any;
  gameABI: any;
  gameCatalog: any;
  gameDataArr: any;
  public ethereum

  constructor(private router: Router, private walletService: WalletService) {
    this.ethereum = (window as any).ethereum;
    this.provider = new ethers.providers.Web3Provider(this.ethereum);
    this.signer = this.provider.getSigner();
    this.user = this.signer.getAddress();
   }

  ngOnInit(): void {
    this.walletService
    .checkWalletConnected()
    .then((accounts) => (this.walletId = accounts[0]));
    let etherscanProvider = new ethers.providers.EtherscanProvider(
      5,
      "5J4HFGNWQQN49RI7JMWWYDAJ5ZV6VAQ6M9"
    );
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    console.log(game.filters.OpenGame().topics);
    let topic = game.filters.OpenGame().topics ? null;
    // let topic = ethers.utils.id("SetGameScore(uint256, uint16, address)");
    let filter = {
      address: gameContract,
      fromBlock: 7905426 - 10,
      toBlock:  7907307 + 10, 
      topics: [ topic[0] ]
    };
    etherscanProvider.getLogs(filter).then((result) => {
      console.log(result);
    });
    
  }

  _bet = new FormControl("0.01");
  async submitGame(bet: any) {
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const options = {value: ethers.utils.parseEther(bet)};
    const createGameTx = await game['createGame'](options);
    await createGameTx.wait();
    this.router.navigate(['/game-board']);
  };

}

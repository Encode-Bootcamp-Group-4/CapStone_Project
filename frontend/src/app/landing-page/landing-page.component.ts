import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { ethers } from 'ethers';
import { GAME_ADDRESS } from '../vars/contractAddress';
import { GAME_ABI } from '../vars/contractABI';
import { Router } from '@angular/router';

const gameContract = GAME_ADDRESS;
const gameABI = GAME_ABI;
const iface = new ethers.utils.Interface(gameABI);

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  walletId: string = '';
  provider: any;
  signer: any;
  user: any;
  game: any;
  gameContract: any;
  gameABI: any;
  gameCatalog: any;
  gameDataArr: any;
  topic: any;
  public ethereum;

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
      '5J4HFGNWQQN49RI7JMWWYDAJ5ZV6VAQ6M9'
    );
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    this.topic = game.filters.OpenGame().topics;
    // console.log(topic);
    let filter = {
      address: gameContract,
      topics: [this.topic[0]],
    };
    etherscanProvider.getLogs(filter).then((result) => {
      this.gameCatalog = result;
      this.gameDataArr = this.gameCatalog.map(
        (game: { topics: string[]; data: string }) => {
          const parsed = iface.parseLog(game);
          return parsed.args;
        }
      );
      // console.log(this.gameDataArr);
    });
  }

  _bet = new FormControl('0.01');
  async submitGame(bet: any) {
    // console.log(bet);
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const options = { value: ethers.utils.parseEther(bet) };
    const createGameTx = await game['createGame'](options);
    await createGameTx.wait();
    this.router.navigate(['/game-board']);
  }

  async challengeGame(gameId: any, bet: any) {
    // console.log(gameId);
    // console.log(bet);
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const options = { value: bet };
    const challengeGameTx = await game['startChallenge'](gameId, options);
    await challengeGameTx.wait();
    this.router.navigate(['/game-board-challenge'], {
      queryParams: { id: gameId },
    });
  }

  async withdrawWinnings() {
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const amount = await game['balances'](this.user);
    // console.log(amount);
    const withdrawWinningsTx = await game['prizeWithdraw'](amount);
    await withdrawWinningsTx.wait();
    window.alert(
      `You have withdrawn your winnings! ${amount} WEI should appear in your wallet shortly.`
    );
  }

  async test() {}
}

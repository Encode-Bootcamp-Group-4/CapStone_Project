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
  opengame: any;
  gameContract: any;
  gameABI: any;
  gameCatalog: any;
  openGameCatalog: any;
  gameDataArr: any;
  topic: any;
  topic2: any;
  public ethereum
  isLoading = false;

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
    // console.log(this.topic);
    let filter = {
      address: gameContract,
      topics: [this.topic[0]],
    };
    // console.log(filter);
    etherscanProvider.getLogs(filter).then((result) => {
      this.gameCatalog = result;
      this.gameDataArr = this.gameCatalog.map(
        (game: { topics: string[]; data: string }) => {
          const parsed = iface.parseLog(game);
          return parsed.args;
        }
      );
      // console.log(this.gameDataArr);
      this.topic2 = game.filters.CloseChallenge().topics;
      let filter2 = {
        address: gameContract,
        topics: [this.topic2[0]],
      };
      etherscanProvider.getLogs(filter2).then((result) => {
        this.opengame = result;
        this.openGameCatalog = this.opengame.map(
          (game: { topics: string[]; data: string }) => {
            const parsed = iface.parseLog(game);
            return parsed.args;
          }
        );
      });
      
      // this.openGameCatalog = this.gameDataArr.filter(
      //   (game: { score: number }) => game.score != 0
      // );
      // console.log(this.openGameCatalog);
    });
  }

  toggleLoading = () => {
    // console.log('toggle loading');
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      }, 100000);
  }

  _bet = new FormControl("0.01");
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

  async checkBalance() {
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const amount = await game['balances'](this.user);
    window.alert(
      `You have ${amount/1000000000000000000} ETH in winnings! Click button below to withdraw!`
    );
  }

  async withdrawWinnings() {
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const amount = await game['balances'](this.user);
    // console.log(amount);
    window.alert(
      `You have ${amount/1000000000000000000} ETH in winnings! Click confirm button in wallet to withdraw!`
    );
    const withdrawWinningsTx = await game['prizeWithdraw'](amount);
    await withdrawWinningsTx.wait();
    window.alert(
      `You have withdrawn your winnings! ${amount/1000000000000000000} ETH should appear in your wallet shortly.`
    );
  }

  async test() {}
}


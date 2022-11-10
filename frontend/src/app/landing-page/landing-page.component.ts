import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { ethers } from 'ethers';
import { GAME_ADDRESS } from '../vars/contractAddress';
import { GAME_ABI } from '../vars/contractABI';
import { Router } from '@angular/router';
import * as _ from 'lodash';

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
  openGame: any;
  gameContract: any;
  gameABI: any;
  gameCatalog: any;
  challengeGameCatalog: any;
  openGameCatalog: any;
  gameDataArr: any;
  topic: any;
  topic2: any;
  filters: any;
  public ethereum
  toggleLayer = false;

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
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    this.topic = game.filters.OpenGame().topics;
    this.topic2 = game.filters.CloseChallenge().topics;
    // console.log(this.topic);
    this.filters = [
      {
        address: gameContract,
        topics: [this.topic[0]],
      },
      {
        address: gameContract,
        topics: [this.topic2[0]],
      },
    ];
  }

  ngAfterViewInit(): void {
    let etherscanProvider = new ethers.providers.EtherscanProvider(
      5,
      '5J4HFGNWQQN49RI7JMWWYDAJ5ZV6VAQ6M9'
    );
    etherscanProvider.getLogs(this.filters[0]).then((result) => {
      this.gameCatalog = result;
      this.gameDataArr = this.gameCatalog.map(
        (game: { topics: string[]; data: string }) => {
          const parsed = iface.parseLog(game);
          return parsed.args;
        }
      );
      // console.log(this.gameDataArr);
      etherscanProvider.getLogs(this.filters[1]).then((result) => {
        this.challengeGameCatalog = result;
        this.challengeGameCatalog = this.challengeGameCatalog.map(
          (game: { topics: string[]; data: string }) => {
            const parsed = iface.parseLog(game);
            return parsed.args;
          }
        );
        let c: { gameId: any; }[] = [];
        this.challengeGameCatalog.forEach((game: any) => {
          if(game['score'] == 0) {
            c.push(game['gameId']);
          }
        });
        // console.log(c);
        let d: { gameId: any; }[] = [];
        this.gameDataArr.forEach((game: any) => {
          d.push(game['gameId']);
        });
        // console.log(d);
        let e = _.differenceWith(d, c, _.isEqual);
        // console.log(e);
        this.openGameCatalog = this.gameDataArr.filter((game: { gameId: any; }) => e.includes(game['gameId']));
        console.log(this.openGameCatalog);
      });
    });
  }

  toggle() {
    this.toggleLayer = true;
  }

  _bet = new FormControl("0.01");
  async submitGame(bet: any) {
    // console.log(bet);
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const options = { value: ethers.utils.parseEther(bet) };
    try {
      const createGameTx = await game['createGame'](options);
      await createGameTx.wait();
      this.router.navigate(['/game-board']);
    } catch (err) {
      
      window.location.reload();
    }
  }

  async challengeGame(gameId: any, bet: any) {
    // console.log(gameId);
    // console.log(bet);
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const options = { value: bet };
    try {
      const challengeGameTx = await game['startChallenge'](gameId, options);
      await challengeGameTx.wait();
      this.router.navigate(['/game-board-challenge'], {
        queryParams: { id: gameId },
      });
    } catch (err) {
      window.alert(err);
      window.location.reload();
    }
  }

  async checkBalance() {
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    try {
      const amount = await game['balances'](this.user);
      window.alert(
        `You have ${amount/1000000000000000000} ETH in winnings! Click button below to withdraw!`
      );
      window.location.reload();
    } catch (err) {
      window.alert(err);
      window.location.reload();
    }
  }

  async withdrawWinnings() {
    const game = new ethers.Contract(gameContract, gameABI, this.signer);
    const amount = await game['balances'](this.user);
    // console.log(amount);
    try {
      if (amount > 0) {
        window.alert(
          `You have ${amount/1000000000000000000} ETH in winnings! Click confirm button in wallet to withdraw!`
        );
        const withdrawTx = await game['prizeWithdraw'](amount);
        await withdrawTx.wait();
        window.alert(`Withdraw successful! ${amount/1000000000000000000} ETH should appear in your wallet shortly!`);
        window.location.reload();
      } else {
        window.alert('You have no winnings to withdraw!');
        window.location.reload();
      }
    } catch (err) {
      window.alert(err);
      window.location.reload();
    }
  }

}


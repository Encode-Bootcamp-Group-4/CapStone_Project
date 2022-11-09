import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Food } from '../game-engine/food';
import { outsideGrid } from '../game-engine/gameboard-grid.util';
import { Snake } from '../game-engine/snake';
import { WalletService } from '../services/wallet.service';
import { ethers } from 'ethers';
import { GAME_ADDRESS } from '../vars/contractAddress';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit, AfterViewInit {

  lastRenderTime = 0
  gameOver = false
  gameBoard: any;
  SNAKE_SPEED = 1;
  snake = new Snake();
  food = new Food(this.snake);
  walletId: string = '';
  provider: any;
  signer: any;
  user: any;
  gameId: any;
  public ethereum;

  constructor(private walletService: WalletService, private apiService: ApiService, private router: Router) { 
    this.ethereum = (window as any).ethereum;
    this.provider = new ethers.providers.Web3Provider(this.ethereum);
    this.signer = this.provider.getSigner();
    this.user = this.signer.getAddress();
  }

  ngOnInit(): void {
    this.apiService.setGameScore
    this.walletService
    .checkWalletConnected()
    .then((accounts) => (this.walletId = accounts[0]));
    this.snake.listenToInputs();
    let etherscanProvider = new ethers.providers.EtherscanProvider(
      5,
      "5J4HFGNWQQN49RI7JMWWYDAJ5ZV6VAQ6M9"
    );
    etherscanProvider.getHistory(GAME_ADDRESS).then((history) => {
      // console.log(history);
      this.gameId = history.filter(tx => {
        if (tx.data == '0x7255d729' ) {
          return true;
        }
        return false;
      }).length;
      console.log(this.gameId);
    }
    );
  }

  ngAfterViewInit(){
    this.gameBoard = document.querySelector('.game-board');
    window.requestAnimationFrame(this.start.bind(this));
  }

  start(currentTime: any) {
    if (this.gameOver) {
      this.submitScore();
      return console.log('Game Over');
    }

    window.requestAnimationFrame(this.start.bind(this));
    const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / this.snakeSpeed) return;
    this.lastRenderTime = currentTime;
    // console.log("rendering");
    this.update();
    this.draw();
  }

  get snakeSpeed() {
    let score = this.food.currentScore;
    return score+10;
  }

  dpadMovement(direction: string) {
    this.snake.input.setDirection(direction);
  }

  update() {
    this.snake.update();
    this.food.update();
    this.checkDeath();
  }

  draw() {
    this.gameBoard.innerHTML = '';
    this.snake.draw(this.gameBoard);
    this.food.draw(this.gameBoard);
  }

  checkDeath() {
    this.gameOver = outsideGrid(this.snake.getSnakeHead()) || this.snake.snakeIntersection();
    if(!this.gameOver) return;
    this.gameBoard.classList.add("blur");
  }

  async submitScore() {
    console.log("Submitting score");
    // console.log("GameId: " + this.gameId);
    // console.log("Score: " + this.food.currentScore);
    let user = await this.signer.getAddress();
    // console.log("User: " + user);
    this.apiService.
    setGameScore(this.gameId, this.food.currentScore, user)
    .subscribe((resr) => {
      console.log(resr);
    });
    console.log("Score submitted");
    window.alert("You have submitted your score and should appear in the game catalog soon (~1-2 mins.)!")
    this.router.navigate(['/landing-page']);
  }

}

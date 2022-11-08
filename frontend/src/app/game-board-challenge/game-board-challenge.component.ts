import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Food } from '../game-engine/food';
import { outsideGrid } from '../game-engine/gameboard-grid.util';
import { Snake } from '../game-engine/snake';
import { WalletService } from '../services/wallet.service';
import { ethers } from 'ethers';
import { GAME_ADDRESS } from '../vars/contractAddress';
import { ApiService } from '../api.service';
import { ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-game-board-challenge',
  templateUrl: './game-board-challenge.component.html',
  styleUrls: ['./game-board-challenge.component.scss']
})
export class GameBoardChallengeComponent implements OnInit {
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
  id: any;

  constructor(private walletService: WalletService, private apiService: ApiService, private route: ActivatedRoute, private router: Router) { 
    this.ethereum = (window as any).ethereum;
    this.provider = new ethers.providers.Web3Provider(this.ethereum);
    this.signer = this.provider.getSigner();
    this.user = this.signer.getAddress();
  }

  ngOnInit(): void {
    this.apiService.closeChallenge
    this.walletService
    .checkWalletConnected()
    .then((accounts) => (this.walletId = accounts[0]));
    this.snake.listenToInputs();
    this.route.queryParams
      .subscribe((params => {
        // console.log(params);
        this.gameId = params.id;
        console.log(this.gameId);
      }
    ));
  }

  ngAfterViewInit(){
    this.gameBoard = document.querySelector('.game-board');
    window.requestAnimationFrame(this.start.bind(this));
  }

  start(currentTime: any) {
    if(this.gameOver) {
      this.closeChallenge();
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
    //return score;
    // console.log("Score: " + (score));
    // console.log("Score Stype: " + typeof(score));
    // console.log("Normal num type: " + typeof(15));
    return score+10;
    // if(score < 10) return 4;
    // if(score > 10 &&  score < 15 ) return 5;
    // if(score > 15 && score < 20 ) return 6;
    // return 7;
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

  async closeChallenge() {
    console.log("Closing challenge");
    console.log("GameId: " + this.gameId);
    console.log("Score: " + this.food.currentScore);
    let user = await this.signer.getAddress();
    console.log("User: " + user);
    this.apiService.closeChallenge(this.gameId, this.food.currentScore, user).subscribe((res) => {
      console.log(res);
    });
    console.log("Challenge closed");
    window.alert("Challenge closed");
    this.router.navigate(['/landing-page']);
  }
}

import { Controller, Post, Query } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("set_game_score")
  setGameScore(
    @Query("gameId") _gameId: number,
    @Query("score") _score: number,
    @Query("address") _address: string
  ): Promise<string> {
    return this.appService.setGameScore(_gameId, _score, _address);
  }

  @Post("close_challenge")
  closeChallenge(
    @Query("gameId") _gameId: number,
    @Query("score") _score: number,
    @Query("address") _address: string
  ): Promise<string> {
    return this.appService.closeChallenge(_gameId, _score, _address);
  }
}

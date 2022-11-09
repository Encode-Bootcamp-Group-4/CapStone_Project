import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  setGameScore(
    gameId: number,
    score: number,
    address: string
  ): Observable<any> {
    return this.http.post(
      'http://194.233.174.186:3000/set_game_score?gameId=' +
        gameId +
        '&score=' +
        score +
        '&address=' +
        address,
      {}
    );
  }

  closeChallenge(
    gameId: number,
    score: number,
    address: string
  ): Observable<any> {
    return this.http.post(
      'http://194.233.174.186:3000/close_challenge?gameId=' +
        gameId +
        '&score=' +
        score +
        '&address=' +
        address,
      {}
    );
  }
}

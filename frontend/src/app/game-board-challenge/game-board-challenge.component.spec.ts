import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBoardChallengeComponent } from './game-board-challenge.component';

describe('GameBoardChallengeComponent', () => {
  let component: GameBoardChallengeComponent;
  let fixture: ComponentFixture<GameBoardChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameBoardChallengeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameBoardChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

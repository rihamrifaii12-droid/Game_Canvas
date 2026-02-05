import Player from "../entities/Player.js";

export default class PlayingState {
  constructor() {
    this.player = new Player(100, 300);
  }

  setCharacter(character) {
    this.character = character;
    this.player.setColor(character.color); 
  }

  update(dt, input) {
    this.player.update(dt, input);
  }

  draw(ctx) {
    this.player.draw(ctx);
  }
}

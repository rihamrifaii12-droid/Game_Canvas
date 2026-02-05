import Player from "../entities/Player.js";

export default class PlayingState {
    constructor() {
        this.player = new Player(100, 300);
    }

    update(dt, input) {
        this.player.update(dt, input);
    }

    draw(ctx) {
        this.player.draw(ctx);
    }
}

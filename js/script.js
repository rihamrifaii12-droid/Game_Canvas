import InputManager from "./core/InputManager.js";
import PlayingState from "./states/PlayingState.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new InputManager();
const playing = new PlayingState();

let lastTime = 0;

function loop(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    playing.update(dt, input);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    playing.draw(ctx);

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

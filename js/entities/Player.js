export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 40;
        this.h = 60;
        this.vy = 0;
        this.onGround = true;
    }

    update(dt, input) {
        if (input.isDown("ArrowRight")) {
            this.x += 200 * dt;
        }
        if (input.isDown("ArrowLeft")) {
            this.x -= 200 * dt;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "dodgerblue";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

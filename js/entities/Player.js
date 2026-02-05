export default class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.w = 40;
    this.h = 60;

    this.color = "dodgerblue";

    // Mouvement
    this.speed = 200;

    // Saut / physique
    this.vy = 0;
    this.gravity = 1200;
    this.jumpForce = -450;
    this.onGround = true;

    // Sol
    this.groundY = y;
  }

  update(dt, input) {
    // Gauche / droite
    if (input.isDown("ArrowRight")) {
      this.x += this.speed * dt;
    }
    if (input.isDown("ArrowLeft")) {
      this.x -= this.speed * dt;
    }

    // ⬆️ SAUT
    if (input.isDown("ArrowUp") && this.onGround) {
      this.vy = this.jumpForce;
      this.onGround = false;
    }

    // Gravité
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;

    // Collision sol
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    }
  }

  setColor(color) {
    this.color = color;
    }


  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

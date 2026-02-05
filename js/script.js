import InputManager from "./core/InputManager.js";
import PlayingState from "./states/PlayingState.js";

// ======================
// Canvas
// ======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ======================
// Game States
// ======================
const GameState = {
  MENU: "MENU",
  PLAYING: "PLAYING",
};

let currentState = GameState.MENU;

// ======================
// UI
// ======================
const UI = {
  bg: "#1c1c1c",
  text: "#ffffff",

  titleFont: "56px Arial",
  hintFont: "18px Arial",
  nameFont: "18px Arial",

  cardW: 180,
  cardH: 230,
  spacing: 250,
  cardsY: 320,

  backBtn: { x: 30, y: 25, w: 120, h: 45 },
};

// ======================
// Mouse (menu)
// ======================
const mouse = {
  x: 0,
  y: 0,
  clicked: false,
};

canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});

canvas.addEventListener("click", () => {
  mouse.clicked = true;
});

// ======================
// Characters
// ======================
const characters = [
  { name: "Bugs Bunny", color: "#ff9f43" },
  { name: "Daffy Duck", color: "#54a0ff" },
  { name: "Sylvester", color: "#ff6b6b" },
];

let selectedIndex = -1;
let selectedCharacter = null;

// ======================
// Playing State
// ======================
const input = new InputManager();
const playing = new PlayingState();

// ======================
// Time
// ======================
let lastTime = 0;

// ======================
// Main Loop
// ======================
function loop(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentState === GameState.MENU) {
    updateMenu();
    drawMenu();
  } else {
    playing.update(dt, input);
    playing.draw(ctx);
    drawBackButton();
  }

  mouse.clicked = false;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// ======================
// MENU
// ======================
function updateMenu() {
  selectedIndex = -1;
  selectedCharacter = null;

  const cx = canvas.width / 2;

  for (let i = 0; i < characters.length; i++) {
    const x = cx + (i - 1) * UI.spacing;
    const rect = {
      x: x - UI.cardW / 2,
      y: UI.cardsY - UI.cardH / 2,
      w: UI.cardW,
      h: UI.cardH,
    };

    if (pointInRect(mouse.x, mouse.y, rect)) {
      selectedIndex = i;
      selectedCharacter = characters[i];

      if (mouse.clicked) {
        playing.setCharacter(selectedCharacter);
        currentState = GameState.PLAYING;
      }
    }
  }
}

function drawMenu() {
  ctx.fillStyle = UI.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = UI.text;
  ctx.font = UI.titleFont;
  ctx.fillText("Choisis ton personnage", 180, 120);

  ctx.font = UI.hintFont;
  ctx.fillText("Survole puis clique", 350, 165);

  const cx = canvas.width / 2;

  for (let i = 0; i < characters.length; i++) {
    drawCard(
      cx + (i - 1) * UI.spacing,
      UI.cardsY,
      characters[i],
      i === selectedIndex
    );
  }
}

// ======================
// PLAYING UI
// ======================
function drawBackButton() {
  const b = UI.backBtn;

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(b.x, b.y, b.w, b.h);

  if (mouse.clicked && pointInRect(mouse.x, mouse.y, b)) {
    currentState = GameState.MENU;
  }

  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("← Back", b.x + 26, b.y + 29);
}

// ======================
// Card
// ======================
function drawCard(x, y, char, hover) {
  const l = x - UI.cardW / 2;
  const t = y - UI.cardH / 2;

  ctx.save();
  ctx.fillStyle = hover ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)";
  ctx.fillRect(l, t, UI.cardW, UI.cardH);

  ctx.fillStyle = char.color;
  ctx.fillRect(l + 20, t + 20, UI.cardW - 40, UI.cardH - 80);

  ctx.fillStyle = "#fff";
  ctx.font = UI.nameFont;
  ctx.fillText(char.name, l + 20, t + UI.cardH - 20);
  ctx.restore();
}

// ======================
// Utils
// ======================
function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

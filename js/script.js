// ======================
// Canvas + Context
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

let gameState = GameState.MENU;

// ======================
// UI config (centralisé)
// ======================
const UI = {
  bg: "#1c1c1c",
  titleColor: "#ffffff",
  textColor: "#ffffff",

  titleFont: "56px Arial",
  hintFont: "18px Arial",
  nameFont: "18px Arial",

  cardW: 180,
  cardH: 230,
  cardBg: "rgba(255,255,255,0.06)",
  cardHoverBg: "rgba(255,255,255,0.12)",
  cardPadding: 20,

  spacing: 250,
  cardsY: 320,

  // Back button
  backBtn: { x: 30, y: 25, w: 120, h: 45 },
  backBtnBg: "rgba(255,255,255,0.12)",
  backBtnText: "#ffffff",
  backBtnFont: "18px Arial",
};

// ======================
// Mouse (centralisé)
// ======================
const mouse = {
  x: 0,
  y: 0,
  clicked: false,
};

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
  mouse.clicked = true;
});

// ======================
// Characters (placeholders)
// ======================
const characters = [
  { name: "Bugs Bunny", color: "#ff9f43" },
  { name: "Daffy Duck", color: "#54a0ff" },
  { name: "Sylvester", color: "#ff6b6b" },
];

let selectedIndex = -1;
let selectedCharacter = null;

// ======================
// Main Loop (RAF)
// ======================
function loop() {
  // UPDATE
  if (gameState === GameState.MENU) updateMenu();
  if (gameState === GameState.PLAYING) updatePlaying();

  // DRAW
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === GameState.MENU) drawMenu();
  if (gameState === GameState.PLAYING) drawPlaying();

  // Reset one-frame flags
  mouse.clicked = false;

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// ======================
// MENU
// ======================
function updateMenu() {
  const centerX = canvas.width / 2;
  const y = UI.cardsY;

  selectedIndex = -1;
  selectedCharacter = null;

  for (let i = 0; i < characters.length; i++) {
    // positions : gauche, centre, droite
    const x = centerX + (i - 1) * UI.spacing;

    const rect = {
      x: x - UI.cardW / 2,
      y: y - UI.cardH / 2,
      w: UI.cardW,
      h: UI.cardH,
    };

    const isHover = pointInRect(mouse.x, mouse.y, rect);
    if (isHover) {
      selectedIndex = i;
      selectedCharacter = characters[i];

      // Click -> start
      if (mouse.clicked) {
        gameState = GameState.PLAYING;
      }
    }
  }
}

function drawMenu() {
  // background
  ctx.fillStyle = UI.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // title
  ctx.fillStyle = UI.titleColor;
  ctx.font = UI.titleFont;
  ctx.fillText("Choisis ton personnage", 210, 120);

  // hint
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = UI.hintFont;
  ctx.fillText("Survole un personnage puis clique pour commencer", 270, 165);

  // draw cards
  const centerX = canvas.width / 2;
  const y = UI.cardsY;

  for (let i = 0; i < characters.length; i++) {
    const x = centerX + (i - 1) * UI.spacing;
    const isHover = i === selectedIndex;
    drawCharacterCard(x, y, UI.cardW, UI.cardH, characters[i], isHover);
  }

  // selected label
  ctx.fillStyle = UI.textColor;
  ctx.font = "22px Arial";
  const label = selectedCharacter ? `Sélection : ${selectedCharacter.name}` : "Sélection : (survole une carte)";
  ctx.fillText(label, 320, 520);
}

// ======================
// PLAYING
// ======================
function updatePlaying() {
  // Back button click
  if (mouse.clicked && pointInRect(mouse.x, mouse.y, UI.backBtn)) {
    gameState = GameState.MENU;
  }
}

function drawPlaying() {
  // background
  ctx.fillStyle = UI.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Back button
  drawBackButton();

  // Text
  ctx.fillStyle = UI.textColor;
  ctx.font = "bold 34px Arial";
  ctx.fillText("GAME STARTED", 340, 230);

  ctx.font = "22px Arial";
  const name = selectedCharacter ? selectedCharacter.name : "(aucun)";
  ctx.fillText(`Personnage : ${name}`, 345, 280);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "16px Arial";
}

function drawBackButton() {
  ctx.save();
  ctx.fillStyle = UI.backBtnBg;
  ctx.fillRect(UI.backBtn.x, UI.backBtn.y, UI.backBtn.w, UI.backBtn.h);

  // hover effect
  const isHover = pointInRect(mouse.x, mouse.y, UI.backBtn);
  if (isHover) {
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(UI.backBtn.x, UI.backBtn.y, UI.backBtn.w, UI.backBtn.h);
  }

  ctx.fillStyle = UI.backBtnText;
  ctx.font = UI.backBtnFont;
  ctx.fillText("← Back", UI.backBtn.x + 26, UI.backBtn.y + 29);

  ctx.restore();
}

// ======================
// Drawing helpers
// ======================
function drawCharacterCard(x, y, w, h, character, hover) {
  const left = x - w / 2;
  const top = y - h / 2;

  ctx.save();

  // shadow/glow
  if (hover) {
    ctx.shadowColor = "rgba(255,255,255,0.35)";
    ctx.shadowBlur = 18;
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 10;
  }

  // card background
  ctx.fillStyle = hover ? UI.cardHoverBg : UI.cardBg;
  ctx.fillRect(left, top, w, h);

  // placeholder "image"
  ctx.shadowBlur = 0;
  ctx.fillStyle = character.color;
  ctx.fillRect(
    left + UI.cardPadding,
    top + UI.cardPadding,
    w - UI.cardPadding * 2,
    h - UI.cardPadding * 2 - 40
  );

  // name
  ctx.fillStyle = UI.textColor;
  ctx.font = UI.nameFont;
  ctx.fillText(character.name, left + UI.cardPadding, top + h - 18);

  ctx.restore();
}

// ======================
// Utils
// ======================
function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}
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

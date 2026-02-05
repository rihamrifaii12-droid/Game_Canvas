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
  text: "#ffffff",
  titleFont: "56px Arial",
  hintFont: "18px Arial",
  nameFont: "20px Arial",
  storyFont: "18px Arial",

  // placements libres (PAS alignés)
  cards: [
    { x: 230, y: 330, w: 220, h: 260, rot: -0.06 }, // Bugs (gauche)
    { x: 620, y: 260, w: 220, h: 260, rot: 0.05 },  // Daffy (haut droite)
    { x: 760, y: 380, w: 220, h: 260, rot: -0.03 }, // Sylvester (bas droite)
  ],

  // zone story
  storyBox: { x: 120, y: 470, w: 720, h: 90 },

  backBtn: { x: 30, y: 25, w: 120, h: 45 },
};


// ======================
// Mouse (menu + back)
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
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const characters = [
  {
    name: "Bugs Bunny",
    img: loadImage("./assets/images/bugsbunny.png"),
    story: "Évasion de prison. Il a volé la carotte sacrée d’ACME… Taz est lancé à ses trousses."
  },
  {
    name: "Daffy Duck",
    img: loadImage("./assets/images/daffy.png"),
    story: "Il veut devenir la star du cartoon. Il a “emprunté” un plan secret… et maintenant il doit courir."
  },
  {
    name: "Sylvester",
    img: loadImage("./assets/images/sylvester.png"),
    story: "Il cherchait Tweety… mais Taz le confond avec une peluche. Mauvaise journée pour être un chat."
  },
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
    // gameplay (géré par ton binôme)
    playing.update(dt, input);
    playing.draw(ctx);

    // UI back au-dessus
    updateBackButton();
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

  for (let i = 0; i < characters.length; i++) {
    const c = UI.cards[i];

    // hitbox simple (rect non-rotaté pour rester facile)
    const rect = { x: c.x - c.w/2, y: c.y - c.h/2, w: c.w, h: c.h };

    if (pointInRect(mouse.x, mouse.y, rect)) {
      selectedIndex = i;
      selectedCharacter = characters[i];

      if (mouse.clicked) {
        if (playing.setCharacter) playing.setCharacter(selectedCharacter);
        currentState = GameState.PLAYING;
      }
    }
  }
}

function drawMenu() {
  // IMPORTANT : on ne remplit pas le fond -> canvas transparent
  // ctx.clearRect est déjà fait dans la loop

  ctx.fillStyle = UI.text;
  ctx.font = UI.titleFont;
  ctx.fillText("Choisis ton personnage", 160, 120);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = UI.hintFont;
  ctx.fillText("Survole pour lire l'histoire • Clique pour commencer", 210, 165);

  // draw posters (collage)
  for (let i = 0; i < characters.length; i++) {
    drawPoster(characters[i], UI.cards[i], i === selectedIndex);
  }

  // story panel
  drawStoryPanel();
}

function drawImageContain(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.min(w / iw, h / ih);
  const nw = iw * scale;
  const nh = ih * scale;

  const nx = x + (w - nw) / 2;
  const ny = y + (h - nh) / 2;

  ctx.drawImage(img, nx, ny, nw, nh);
}

function drawPoster(char, pos, hover) {
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(pos.rot);

  // ombre douce au hover
  if (hover) {
    ctx.shadowColor = "rgba(255,255,255,0.35)";
    ctx.shadowBlur = 18;
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
  }

  // cadre poster (transparent / léger)
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(-pos.w/2, -pos.h/2, pos.w, pos.h);

  // zone image
  const pad = 18;
  const imgX = -pos.w/2 + pad;
  const imgY = -pos.h/2 + pad;
  const imgW = pos.w - pad*2;
  const imgH = pos.h - pad*2 - 42;

  if (char.img && char.img.complete && char.img.naturalWidth > 0) {
    ctx.drawImage(char.img, imgX, imgY, imgW, imgH);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText("Loading...", imgX + 10, imgY + imgH / 2);
  }

  // nom
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = UI.nameFont;
  ctx.fillText(char.name, -pos.w/2 + pad, pos.h/2 - 16);

  // contour hover
  if (hover) {
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(-pos.w/2, -pos.h/2, pos.w, pos.h);
  }

  ctx.restore();
}

function drawStoryPanel() {
  const b = UI.storyBox;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(b.x, b.y, b.w, b.h);

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px Arial";
  ctx.fillText("Histoire", b.x + 16, b.y + 26);

  ctx.font = UI.storyFont;
  ctx.fillStyle = "rgba(255,255,255,0.85)";

  const text = selectedCharacter
    ? selectedCharacter.story
    : "Survole un personnage pour voir son histoire.";

  wrapText(ctx, text, b.x + 16, b.y + 52, b.w - 32, 22);

  ctx.restore();
}

// petit wrap text (pour que ça ne dépasse pas)
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// ======================
// BACK button (PLAYING)
// ======================
function updateBackButton() {
  if (mouse.clicked && pointInRect(mouse.x, mouse.y, UI.backBtn)) {
    currentState = GameState.MENU;
  }
}

function drawBackButton() {
  const b = UI.backBtn;

  ctx.save();

  const hover = pointInRect(mouse.x, mouse.y, b);

  ctx.fillStyle = hover ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.15)";
  ctx.fillRect(b.x, b.y, b.w, b.h);

  if (hover) {
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  }

  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("← Back", b.x + 26, b.y + 29);

  ctx.restore();
}

// ======================
// Card (image + fallback)
// ======================
function drawCard(x, y, char, hover) {
  const l = x - UI.cardW / 2;
  const t = y - UI.cardH / 2;

  ctx.save();

// uniquement un glow quand hover
if (hover) {
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.strokeRect(l, t, UI.cardW, UI.cardH);
}


  // zone image
  const imgX = l + UI.pad;
  const imgY = t + UI.pad;
  const imgW = UI.cardW - UI.pad * 2;
  const imgH = UI.cardH - UI.pad * 2 - 40;

  // image si chargée
  if (char.img && char.img.complete && char.img.naturalWidth > 0) {
    ctx.drawImage(char.img, imgX, imgY, imgW, imgH);
  } else {
    // placeholder si image pas prête
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(imgX, imgY, imgW, imgH);

    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText("Loading...", imgX + 12, imgY + imgH / 2);
  }

  // nom
  ctx.fillStyle = "#fff";
  ctx.font = UI.nameFont;
  ctx.fillText(char.name, l + UI.pad, t + UI.cardH - 20);

  ctx.restore();
}

// ======================
// Utils
// ======================
function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

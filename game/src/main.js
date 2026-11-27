// Boot and game loop: states (title -> playing -> caught/escaped), the
// fixed-step simulation, event -> sound mapping, and the debug state the
// playtest harness reads from the page.
import { VIEW, GOAL_DISTANCE } from './config.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { makeWorld, stepWorld } from './world.js';
import { drawFrame } from './render.js';
import { applyShot, autopilot } from './shots.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || 7);

export const game = {
  state: 'title',
  world: makeWorld(seed),
  sound: new SoundBank(),
  input: new Input(canvas),
  shot: params.get('shot') || null,
  auto: params.get('auto') === '1',
  lastTime: 0,
  statusEl,
};

function startRun() {
  const best = game.world.best;
  game.world = makeWorld(seed + Math.floor(Math.random() * 1000));
  game.world.best = best;
  game.state = 'playing';
  game.sound.ensure();
  game.sound.startMusic();
  game.sound.gobble();
}

function endRun(kind) {
  game.state = kind;
  game.world.best = Math.max(game.world.best, game.world.score);
  game.sound.stopMusic();
  if (kind === 'escaped') game.sound.escaped();
  else game.sound.caught();
}

function handleEvent(event) {
  if (!event) return;
  if (event === 'jump') game.sound.jump();
  else if (event === 'dash') game.sound.dash();
  else if (event === 'corn') game.sound.corn();
  else if (event === 'feather') game.sound.feather();
  else if (event === 'stumble') { game.sound.thud(); game.world.turkey.gobbleT = 0.8; }
  else if (event === 'hide') game.sound.click();
  else if (event === 'spotted') game.sound.spotted();
  else if (event === 'stage') game.sound.feather();
}

function update(dt) {
  const input = game.input;
  if (input.mutePressed()) game.sound.toggleMute();

  if (game.state === 'title') {
    game.world.time += dt;
    if (input.confirmPressed()) { game.sound.click(); startRun(); }
  } else if (game.state === 'playing') {
    if (input.pausePressed()) { game.state = 'paused'; game.sound.stopMusic(); }
    else {
      if (game.auto) autopilot(game, dt);
      const event = stepWorld(game.world, input, dt);
      handleEvent(event);
      if (event === 'caught') endRun('caught');
      else if (event === 'escaped') endRun('escaped');
      if (input.restartPressed()) startRun();
    }
  } else if (game.state === 'paused') {
    if (input.pausePressed() || input.confirmPressed()) { game.state = 'playing'; game.sound.startMusic(); }
    else if (input.restartPressed()) startRun();
  } else { // caught / escaped
    game.world.time += dt;
    if (input.restartPressed() || input.confirmPressed()) { game.sound.click(); startRun(); }
  }

  // Clicking the canvas also confirms on title/end screens.
  if (input.pointer.clicked && (game.state === 'title' || game.state === 'caught' || game.state === 'escaped')) {
    input.clickConsumed();
    if (game.state === 'title') startRun();
    else startRun();
  }
  input.endFrame();
}

function frame(now) {
  const dt = Math.min(0.05, (now - game.lastTime) / 1000 || 0.016);
  game.lastTime = now;
  update(dt);
  drawFrame(ctx, game);
  // Machine-readable state for the playtest harness (and screen readers).
  const w = game.world;
  const state = {
    state: game.state, score: w.score, distance: Math.floor(w.distance),
    lives: w.lives, corn: w.corn, stage: w.stageIndex,
    farmerGap: Math.max(0, Math.round(w.turkey.x - w.farmer.x)),
    turkeyY: Math.round(w.turkey.y),
  };
  statusEl.textContent = JSON.stringify(state);
  window.__turkeyState = state;
  // Debug snapshot for the playtest harness: what the turkey is about to hit.
  const nextOb = w.obstacles.filter((o) => o.x > w.turkey.x - 20 && !o.passed && !o.hit).sort((a, b) => a.x - b.x)[0];
  window.__gameDebug = nextOb
    ? { next: nextOb.kind, nextDist: Math.round(nextOb.x - w.turkey.x), farmerState: w.farmer.state, hidden: w.turkey.hidden, lastStumble: w.lastStumble || null }
    : { next: 'none', nextDist: -1, farmerState: w.farmer.state, hidden: w.turkey.hidden, lastStumble: w.lastStumble || null };
  requestAnimationFrame(frame);
}

function resize() {
  const scale = Math.min(window.innerWidth / VIEW.w, window.innerHeight / VIEW.h);
  canvas.style.width = `${Math.floor(VIEW.w * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.h * scale)}px`;
}
canvas.width = VIEW.w;
canvas.height = VIEW.h;
window.addEventListener('resize', resize);
resize();

// Screenshot staging (?shot=start|play|kitchen|caught|escaped) sets the game
// into a real, rendered state of its own code — never a composite.
if (game.shot) applyShot(game, game.shot);
requestAnimationFrame(frame);

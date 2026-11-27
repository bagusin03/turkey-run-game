// The world: the turkey, the farmer who chases it, the obstacles, the corn
// and the three stages (farmyard -> barn -> kitchen). Pure simulation — no
// drawing here — so the loop can step it, test it and replay it.
import { VIEW, STAGES, GOAL_DISTANCE, START_LIVES, GRAVITY, JUMP_VELOCITY, DASH_TIME, DASH_SPEED, FARMER_CATCH_GAP, STUMBLE_PENALTY } from './config.js';
import { mulberry32, range, pick } from './random.js';

const TURKEY_X = 300; // the turkey stays near here; the world scrolls past it

export function makeTurkey() {
  return {
    x: TURKEY_X, y: VIEW.groundY, vy: 0, w: 74, h: 62,
    onGround: true, jumps: 0, dashT: 0, dashCooldown: 0,
    hidden: false, hideT: 0, stumbleT: 0, gobbleT: 0,
  };
}

export function makeFarmer() {
  return { x: -40, y: VIEW.groundY, w: 66, h: 108, state: 'chase', stateT: 0, speed: 0, searchT: 0, armSwing: 0 };
}

export function makeWorld(seed) {
  const rng = mulberry32(seed || 7);
  return {
    rng, seed: seed || 7,
    turkey: makeTurkey(),
    farmer: makeFarmer(),
    obstacles: [], pickups: [], particles: [], floaters: [],
    distance: 0, score: 0, corn: 0, lives: START_LIVES,
    stageIndex: 0, speed: STAGES[0].speed,
    spawnX: 900, time: 0, shake: 0, spotted: 0,
    message: '', messageT: 0, stageBanner: '', stageBannerT: 0,
    best: 0,
  };
}

function stageFor(distance) {
  for (let i = STAGES.length - 1; i >= 0; i--) if (distance >= STAGES[i].from) return i;
  return 0;
}

function spawnObstacle(world) {
  const rng = world.rng;
  const stage = STAGES[world.stageIndex];
  const x = world.spawnX + range(rng, 0, 260);
  const kinds = world.stageIndex === 0
    ? ['fence', 'fence', 'pumpkin', 'hay']
    : world.stageIndex === 1
      ? ['hay', 'crate', 'fence', 'pumpkin', 'hay']
      : ['oven', 'oven', 'knife', 'crate', 'knife'];
  const kind = pick(rng, kinds);
  const base = { kind, x, passed: false, hit: false, t: rng() * 10 };
  if (kind === 'fence') Object.assign(base, { w: 46, h: 74, y: VIEW.groundY });
  if (kind === 'pumpkin') Object.assign(base, { w: 52, h: 44, y: VIEW.groundY, rolling: true });
  if (kind === 'hay') Object.assign(base, { w: 96, h: 78, y: VIEW.groundY, hideable: true });
  if (kind === 'crate') Object.assign(base, { w: 70, h: 70, y: VIEW.groundY });
  if (kind === 'oven') Object.assign(base, { w: 110, h: 96, y: VIEW.groundY });
  if (kind === 'knife') Object.assign(base, { w: 34, h: 120, y: VIEW.groundY - 120, swing: 0 });
  world.obstacles.push(base);
  // Corn trail above low obstacles, a golden feather above tall ones.
  if (kind === 'fence' || kind === 'pumpkin' || kind === 'crate') {
    for (let i = 0; i < 3; i++) world.pickups.push({ kind: 'corn', x: x + i * 44 - 20, y: VIEW.groundY - 150, w: 30, h: 30, taken: false, bob: rng() * 6 });
  } else if (kind === 'oven' || kind === 'hay') {
    world.pickups.push({ kind: 'feather', x: x + 30, y: VIEW.groundY - 190, w: 34, h: 34, taken: false, bob: rng() * 6 });
  }
  const gap = range(rng, stage.spawnGap[0], stage.spawnGap[1]);
  world.spawnX = x + gap;
}

export function addFloater(world, x, y, text, color) {
  world.floaters.push({ x, y, text, color: color || '#fff3e0', t: 0 });
}

export function burst(world, x, y, color, n) {
  for (let i = 0; i < (n || 10); i++) {
    world.particles.push({ x, y, vx: (world.rng() - 0.5) * 420, vy: -world.rng() * 320, t: 0, life: 0.5 + world.rng() * 0.4, color, size: 3 + world.rng() * 5 });
  }
}

// One simulation step. Returns an event string the main loop turns into
// sound/feedback: 'jump' | 'dash' | 'corn' | 'feather' | 'stumble' | 'hide'
// | 'spotted' | 'caught' | 'escaped' | 'stage' | null.
export function stepWorld(world, input, dt) {
  const turkey = world.turkey;
  const farmer = world.farmer;
  world.time += dt;
  let event = null;

  // --- stage progression
  const si = stageFor(world.distance);
  if (si !== world.stageIndex) {
    world.stageIndex = si;
    world.stageBanner = STAGES[si].label;
    world.stageBannerT = 2.4;
    world.message = STAGES[si].hint;
    world.messageT = 3;
    event = 'stage';
  }
  world.speed = STAGES[world.stageIndex].speed + Math.min(60, world.distance * 0.02);

  // --- turkey: jump / double jump / dash / hide
  if (input.jumpPressed()) {
    if (turkey.onGround || turkey.jumps < 2) {
      turkey.vy = JUMP_VELOCITY;
      turkey.onGround = false;
      turkey.jumps++;
      event = 'jump';
      burst(world, turkey.x - 20, VIEW.groundY, '#d9a441', 6);
    }
  }
  if (input.dashPressed() && turkey.dashCooldown <= 0 && !turkey.hidden) {
    turkey.dashT = DASH_TIME;
    turkey.dashCooldown = 1.1;
    event = 'dash';
    burst(world, turkey.x - 30, turkey.y - 20, '#ffd166', 8);
  }
  if (turkey.dashCooldown > 0) turkey.dashCooldown -= dt;
  if (turkey.dashT > 0) turkey.dashT -= dt;

  // Hiding: hold DOWN inside a haystack and the farmer loses the trail.
  const nearHay = world.obstacles.find((o) => o.kind === 'hay' && Math.abs(o.x - turkey.x) < 90 && !o.hit);
  if (input.hideHeld() && nearHay && turkey.onGround) {
    if (!turkey.hidden) { event = 'hide'; world.message = 'HIDDEN! The farmer runs right past...'; world.messageT = 2; }
    turkey.hidden = true;
    turkey.hideT += dt;
  } else {
    turkey.hidden = false;
    turkey.hideT = 0;
  }

  // --- turkey physics
  turkey.vy += GRAVITY * dt;
  turkey.y += turkey.vy * dt;
  if (turkey.y >= VIEW.groundY) { turkey.y = VIEW.groundY; turkey.vy = 0; turkey.onGround = true; turkey.jumps = 0; }
  if (turkey.stumbleT > 0) turkey.stumbleT -= dt;
  if (turkey.gobbleT > 0) turkey.gobbleT -= dt;

  // --- scroll the world; distance and score tick up
  const runSpeed = turkey.dashT > 0 ? world.speed + DASH_SPEED : world.speed;
  const scroll = runSpeed * dt * (turkey.hidden ? 0.25 : 1);
  world.distance += (scroll / 32); // ~13 m/s at stage 1: a full escape takes ~2 minutes
  world.score += Math.floor(scroll / 10);
  world.spawnX -= scroll;
  while (world.spawnX < VIEW.w + 300) spawnObstacle(world);
  for (const o of world.obstacles) { o.x -= scroll; if (o.kind === 'knife') o.swing += dt * 3; if (o.kind === 'pumpkin' && o.rolling) o.t += dt * 6; }
  for (const p of world.pickups) p.x -= scroll;
  world.obstacles = world.obstacles.filter((o) => o.x > -220);
  world.pickups = world.pickups.filter((p) => p.x > -80 && !p.taken);

  // --- pickups
  for (const p of world.pickups) {
    if (p.taken || turkey.hidden) continue;
    const dx = Math.abs(p.x - turkey.x), dy = Math.abs((p.y + Math.sin(world.time * 3 + p.bob) * 6) - (turkey.y - 40));
    if (dx < 52 && dy < 62) {
      p.taken = true;
      if (p.kind === 'corn') { world.corn++; world.score += 50; addFloater(world, p.x, p.y - 20, '+50', '#ffd60a'); event = 'corn'; }
      else { world.score += 150; addFloater(world, p.x, p.y - 20, '+150 GOLDEN FEATHER!', '#ffe066'); event = 'feather'; }
    }
  }

  // --- obstacles: jump them, or stumble
  for (const o of world.obstacles) {
    if (o.hit || o.passed) continue;
    const overlapX = Math.abs(o.x - turkey.x) < (o.w + turkey.w) / 2 - 6;
    const turkeyFeet = turkey.y;
    const top = o.y - o.h;
    if (overlapX && !turkey.hidden) {
      if (turkeyFeet < top + 14 && turkey.vy >= 0) {
        // Landed on top of it: a clean hop, small bonus.
        o.passed = true;
        world.score += 25;
        addFloater(world, o.x, top - 10, '+25 HOP!', '#fff3e0');
      } else if (turkeyFeet > top + 26 && turkey.y - turkey.h < o.y - 6) {
        // The turkey's body overlaps the obstacle's box: stumble. (A hanging
        // carving knife hangs ABOVE the turkey's head, so running under it
        // is safe — only jumping into it hurts.)
        o.hit = true;
        world.lastStumble = { kind: o.kind, dist: Math.round(world.distance), turkeyY: Math.round(turkey.y), vy: Math.round(turkey.vy) };
        world.lives -= 1;
        turkey.stumbleT = 0.7;
        world.shake = 0.35;
        farmer.x += STUMBLE_PENALTY;
        burst(world, turkey.x, turkey.y - 30, '#e63946', 14);
        addFloater(world, turkey.x, turkey.y - 90, 'OUCH!', '#e63946');
        event = 'stumble';
        if (world.lives <= 0) return 'caught';
      }
    } else if (o.x + o.w / 2 < turkey.x - turkey.w / 2) {
      o.passed = true;
      world.score += 10;
    }
  }

  // --- the farmer: chase, search, sprint. He runs in the same world as
  // the turkey, so his SCREEN speed is his speed relative to the turkey's
  // run (rubber-banded: he creeps closer when far, eases off when near, and
  // only catches the turkey after stumbles or a sprint). He never teleports.
  farmer.stateT += dt;
  farmer.armSwing += dt * (farmer.state === 'sprint' ? 14 : 8);
  const gap = turkey.x - farmer.x;
  const runSpeedNow = turkey.dashT > 0 ? world.speed + DASH_SPEED : world.speed;
  if (farmer.state === 'chase') {
    // Rubber band around a 380px gap, stable: he gains when far behind,
    // falls back when too close, and hovers near the equilibrium. A dash
    // surges the turkey away from him.
    let rel = Math.max(-30, Math.min(50, (gap - 380) * 0.12));
    if (turkey.dashT > 0) rel -= 500;
    farmer.x += rel * dt;
    if (gap > 430 && farmer.stateT > 2) { farmer.state = 'search'; farmer.stateT = 0; }
    if (gap < 130) { farmer.state = 'sprint'; farmer.stateT = 0; event = 'spotted'; world.spotted = 1.2; world.message = 'SPOTTED! RUN!'; world.messageT = 1.4; }
  } else if (farmer.state === 'search') {
    // He stops, looks around, scratches his head — the turkey's chance.
    farmer.x -= 60 * dt;
    if (farmer.stateT > 1.6) { farmer.state = 'chase'; farmer.stateT = 0; }
  } else { // sprint
    farmer.x += 70 * dt;
    if (gap > 260) { farmer.state = 'chase'; farmer.stateT = 0; }
  }
  if (turkey.hidden) farmer.x -= 80 * dt; // hiding loses the trail fast
  if (world.spotted > 0) world.spotted -= dt;
  if (gap <= FARMER_CATCH_GAP) return 'caught';

  // --- particles, floaters, timers
  for (const p of world.particles) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; }
  world.particles = world.particles.filter((p) => p.t < p.life);
  for (const f of world.floaters) { f.t += dt; f.y -= 40 * dt; }
  world.floaters = world.floaters.filter((f) => f.t < 1.1);
  if (world.shake > 0) world.shake -= dt;
  if (world.messageT > 0) world.messageT -= dt;
  if (world.stageBannerT > 0) world.stageBannerT -= dt;

  // --- escape!
  if (world.distance >= GOAL_DISTANCE) return 'escaped';
  return event;
}

export function farmerGap(world) {
  return Math.max(0, world.turkey.x - world.farmer.x);
}

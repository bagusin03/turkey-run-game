// Screenshot staging and the autopilot. applyShot puts the real game into
// a chosen state (title, a farmyard chase, the kitchen, an end screen) so
// screenshots are true renders of the game's own code. autopilot plays the
// game like a decent player — jump the hazard, hide in the hay, dash when
// the farmer closes in — so a headless run can prove a full run is winnable.
import { VIEW, GOAL_DISTANCE } from './config.js';
import { makeWorld, stepWorld } from './world.js';

// Seed a world that already looks mid-chase: obstacles, corn and a farmer
// breathing down the turkey's neck, at the requested stage/distance.
function stagedWorld(game, distance, lives) {
  const world = makeWorld(7);
  world.distance = distance;
  world.lives = lives;
  world.best = 4230;
  // Walk the simulation forward a little so obstacles populate the screen.
  const fakeInput = { jumpPressed: () => false, dashPressed: () => false, hideHeld: () => false };
  for (let i = 0; i < 40; i++) stepWorld(world, fakeInput, 0.05);
  // The warm-up may have stumbled the turkey or tripped banners: a staged
  // scene starts clean, at exactly the requested distance and lives.
  world.distance = distance;
  world.lives = lives;
  world.score = 0;
  world.corn = 0;
  world.floaters = [];
  world.particles = [];
  world.message = '';
  world.messageT = 0;
  world.stageBanner = '';
  world.stageBannerT = 0;
  world.spotted = 0;
  world.turkey.stumbleT = 0;
  world.turkey.y = VIEW.groundY;
  world.turkey.vy = 0;
  world.turkey.onGround = true;
  return world;
}

export function applyShot(game, shot) {
  if (shot === 'start') {
    game.state = 'title';
    game.world = stagedWorld(game, 0, 3);
    game.world.best = 4230;
    game.world.farmer.x = -120; // off-screen behind the title panel
  } else if (shot === 'play') {
    game.state = 'playing';
    game.world = stagedWorld(game, 214, 3);
    game.world.score = 1280;
    game.world.corn = 6;
    game.world.farmer.x = 110; // close behind: the chase reads at a glance
    game.world.message = 'SPOTTED! RUN!';
    game.world.messageT = 99;
    game.world.spotted = 0; // message only, no red flash border
  } else if (shot === 'kitchen') {
    game.state = 'playing';
    game.world = stagedWorld(game, 1180, 2);
    game.world.score = 8640;
    game.world.corn = 21;
    game.world.stageIndex = 2;
    game.world.farmer.x = 150;
    game.world.stageBanner = 'Stage 3 — The Kitchen';
    game.world.stageBannerT = 99;
    // Guarantee the kitchen's signature hazards are in frame.
    game.world.obstacles.push({ kind: 'oven', x: 980, w: 110, h: 96, y: VIEW.groundY, passed: false, hit: false, t: 0 });
    game.world.obstacles.push({ kind: 'knife', x: 700, w: 34, h: 120, y: VIEW.groundY - 120, passed: false, hit: false, t: 0, swing: 0.4 });
  } else if (shot === 'caught') {
    game.state = 'caught';
    game.world = stagedWorld(game, 640, 0);
    game.world.score = 3420;
    game.world.corn = 11;
    game.world.farmer.x = game.world.turkey.x - 52; // caught red-handed
  } else if (shot === 'escaped') {
    game.state = 'escaped';
    game.world = stagedWorld(game, GOAL_DISTANCE, 2);
    game.world.score = 12480;
    game.world.corn = 26;
    game.world.farmer.x = -120; // left far behind
  }
  // Freeze the staged scene: the shot loop still draws, but the world does
  // not advance until the player starts (title/end) — for play/kitchen the
  // first frames keep running, which is what a live chase looks like.
  if (shot === 'play' || shot === 'kitchen') {
    game.world.time = 3.2;
  }
}

// The autopilot: look ahead for the next hazard and jump it, duck into hay
// when the farmer is close, dash to open a gap. Used with ?auto=1.
export function autopilot(game, dt) {
  const world = game.world;
  const turkey = world.turkey;
  const input = game.input;
  const next = world.obstacles
    .filter((o) => o.x > turkey.x - 20 && !o.passed && !o.hit)
    .sort((a, b) => a.x - b.x)[0];
  const gap = turkey.x - world.farmer.x;
  if (next) {
    const dist = next.x - turkey.x;
    // A hanging carving knife is dodged by running UNDER it — never jump.
    if (next.kind !== 'knife') {
      const jumpAt = next.kind === 'oven' ? 170 : 130;
      if (dist < jumpAt && dist > 0 && turkey.onGround) {
        input.pressed.add('Space');
      }
      // Double jump: if airborne, descending, and the next hazard is close.
      if (!turkey.onGround && turkey.vy > 0 && dist < 170 && dist > 0 && turkey.jumps < 2) {
        input.pressed.add('Space');
      }
    }
    if (next.kind === 'hay' && dist < 60 && gap < 220) {
      input.keys.add('ArrowDown');
    } else {
      input.keys.delete('ArrowDown');
    }
  }
  if (gap < 110 && turkey.dashCooldown <= 0) input.pressed.add('ShiftLeft');
  if (turkey.y < VIEW.groundY - 10 && next && next.x - turkey.x < 90 && turkey.jumps < 2) {
    input.pressed.add('Space');
  }
}

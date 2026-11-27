// Tuning numbers, stage definitions and the autumn palette for Gobble Dash.
// One job: every magic number the game balances on lives here, so tuning
// never means hunting through the render or world code.
export const VIEW = { w: 1280, h: 720, groundY: 600 };

export const PALETTE = {
  skyTop: '#f7b267', skyMid: '#f4845f', skyLow: '#f7ede2',
  sun: '#ffd166', cloud: '#fff3e0',
  hillFar: '#c97b4a', hillNear: '#8a5a2b',
  ground: '#b5772e', groundDark: '#8f5a1e', grass: '#d9a441',
  barnRed: '#a63d2f', barnDark: '#7e2c22', wood: '#6b4423',
  kitchenWall: '#e8c39e', kitchenTile: '#c96f4a', oven: '#3d3d4d',
  turkeyBody: '#8d5a2b', turkeyDark: '#5e3a17', turkeyFeather: '#c97b2d',
  turkeyTail: '#b5533c', turkeyHead: '#d97b6c', wattle: '#e63946',
  farmerShirt: '#4a7c59', farmerOveralls: '#3a5a8c', farmerHat: '#e9c46a',
  corn: '#ffd60a', featherGold: '#ffe066', knife: '#cfd8dc',
  hudBg: 'rgba(46, 24, 8, 0.72)', hudText: '#fff3e0', accent: '#ffb703',
  danger: '#e63946', ok: '#80b918',
};

export const STAGES = [
  { name: 'FARMYARD', from: 0, to: 500, speed: 330, spawnGap: [520, 820],
    label: 'Stage 1 — The Farmyard', hint: 'Jump the fences! Grab the corn!' },
  { name: 'BARN', from: 500, to: 1000, speed: 400, spawnGap: [460, 720],
    label: 'Stage 2 — The Barn', hint: 'Haystacks! Press DOWN to hide!' },
  { name: 'KITCHEN', from: 1000, to: 1500, speed: 470, spawnGap: [480, 740],
    label: 'Stage 3 — The Kitchen', hint: 'Dodge the oven and the carving knives!' },
];

export const GOAL_DISTANCE = 1500; // metres to the back door: escape!
export const START_LIVES = 3;
export const GRAVITY = 2400;
export const JUMP_VELOCITY = -880;
export const DASH_TIME = 0.28;
export const DASH_SPEED = 760;
export const FARMER_CATCH_GAP = 46; // px: farmer this close to the turkey = caught
export const STUMBLE_PENALTY = 150; // px the farmer gains when the turkey stumbles

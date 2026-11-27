// All canvas drawing: sky, farm, barn and kitchen backdrops, the turkey, the
// farmer, the hazards, the HUD and every screen. No art files — every pixel
// is drawn in code, in one coherent autumn palette.
import { VIEW, PALETTE, STAGES, GOAL_DISTANCE } from './config.js';
import { farmerGap } from './world.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// --- backdrops -------------------------------------------------------------
function drawSky(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.h);
  g.addColorStop(0, PALETTE.skyTop);
  g.addColorStop(0.45, PALETTE.skyMid);
  g.addColorStop(0.75, PALETTE.skyLow);
  g.addColorStop(1, '#e8b06a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  // Low autumn sun with rays.
  const sx = 1050, sy = 130;
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = PALETTE.sun;
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate((i / 12) * Math.PI * 2 + t * 0.05);
    ctx.fillRect(70, -4, 60, 8);
    ctx.restore();
  }
  ctx.restore();
  circle(ctx, sx, sy, 56, PALETTE.sun);
  circle(ctx, sx, sy, 44, '#ffe08a');
  // Drifting clouds.
  ctx.fillStyle = PALETTE.cloud;
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 340 + t * 12) % (VIEW.w + 260)) - 130;
    const cy = 70 + i * 42;
    ellipse(ctx, cx, cy, 62, 20, PALETTE.cloud);
    ellipse(ctx, cx + 44, cy + 8, 46, 16, PALETTE.cloud);
    ellipse(ctx, cx - 46, cy + 10, 40, 14, PALETTE.cloud);
  }
  // Rolling hills and a distant farmhouse.
  ctx.fillStyle = PALETTE.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(320, 380, 640, 460);
  ctx.quadraticCurveTo(960, 530, VIEW.w, 450);
  ctx.lineTo(VIEW.w, VIEW.h);
  ctx.lineTo(0, VIEW.h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.quadraticCurveTo(420, 450, 820, 520);
  ctx.quadraticCurveTo(1080, 560, VIEW.w, 510);
  ctx.lineTo(VIEW.w, VIEW.h);
  ctx.lineTo(0, VIEW.h);
  ctx.closePath();
  ctx.fill();
}

function drawFarmhouse(ctx) {
  // Little red barn on the horizon, with a painted sign.
  ctx.fillStyle = PALETTE.barnRed;
  ctx.fillRect(60, 380, 130, 90);
  ctx.beginPath();
  ctx.moveTo(45, 382); ctx.lineTo(125, 330); ctx.lineTo(205, 382); ctx.closePath();
  ctx.fillStyle = PALETTE.barnDark;
  ctx.fill();
  ctx.fillStyle = '#fff3e0';
  ctx.fillRect(108, 420, 34, 50);
  ctx.strokeStyle = '#fff3e0';
  ctx.lineWidth = 3;
  ctx.strokeRect(108, 420, 34, 50);
  ctx.fillStyle = '#2e1808';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HAPPY FARM', 125, 400);
}

function drawKitchenBackdrop(ctx, t) {
  // Stage 3: the kitchen — warm tiles, a window, a roasting pan, a clock
  // counting down to dinner. The ground becomes a checkered floor.
  ctx.fillStyle = PALETTE.kitchenWall;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = PALETTE.kitchenTile;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 11; x++) {
    if ((x + y) % 2 === 0) { ctx.fillStyle = '#d98a5f'; ctx.fillRect(x * 120, y * 70, 120, 70); }
    ctx.fillStyle = PALETTE.kitchenTile;
  }
  ctx.strokeStyle = 'rgba(120,60,20,0.35)';
  ctx.lineWidth = 2;
  for (let y = 0; y <= 9; y++) { ctx.beginPath(); ctx.moveTo(0, y * 70); ctx.lineTo(VIEW.w, y * 70); ctx.stroke(); }
  // Window with the farm outside (below the farmer meter, right of the banner).
  ctx.fillStyle = '#7ec8e3';
  rr(ctx, 980, 130, 220, 170, 10); ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(1085, 130, 10, 170); ctx.fillRect(980, 210, 220, 10);
  circle(ctx, 1040, 180, 24, '#ffd166');
  ctx.fillStyle = '#80b918';
  ctx.fillRect(980, 260, 220, 40);
  // Dinner clock (above the stage banner, clear of the HUD).
  circle(ctx, 830, 105, 44, '#fff3e0');
  ctx.strokeStyle = '#3d3d4d'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(830, 105, 44, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#3d3d4d';
  ctx.font = 'bold 12px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('DINNER', 830, 86);
  ctx.fillText('6:00', 830, 138);
  ctx.strokeStyle = '#e63946'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(830, 105); ctx.lineTo(830, 76); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(830, 105); ctx.lineTo(852, 112); ctx.stroke();
  // Hanging pot, tucked under the farmer meter on the right.
  ctx.strokeStyle = '#3d3d4d'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(1150, 104); ctx.lineTo(1150, 150); ctx.stroke();
  circle(ctx, 1150, 174, 26, '#5a5a6e');
  ctx.fillStyle = '#fff3e0';
  ctx.save(); ctx.translate(640, 90); ctx.rotate(-0.06); ctx.fillRect(-90, -34, 180, 68); ctx.restore();
  ctx.fillStyle = '#a63d2f';
  ctx.font = 'bold 22px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('ROAST TONIGHT!', 640, 100);
}

function drawGround(ctx, stageIndex, t, scrollX) {
  if (stageIndex === 2) {
    // Kitchen floor.
    ctx.fillStyle = '#c98d5f';
    ctx.fillRect(0, VIEW.groundY, VIEW.w, VIEW.h - VIEW.groundY);
    ctx.fillStyle = '#b5772e';
    for (let x = -((scrollX % 90)); x < VIEW.w; x += 90) ctx.fillRect(x, VIEW.groundY, 44, VIEW.h - VIEW.groundY);
    ctx.fillStyle = '#8f5a1e';
    ctx.fillRect(0, VIEW.groundY, VIEW.w, 6);
    return;
  }
  ctx.fillStyle = PALETTE.ground;
  ctx.fillRect(0, VIEW.groundY, VIEW.w, VIEW.h - VIEW.groundY);
  ctx.fillStyle = PALETTE.grass;
  ctx.fillRect(0, VIEW.groundY, VIEW.w, 14);
  ctx.fillStyle = PALETTE.groundDark;
  for (let x = -((scrollX % 70)); x < VIEW.w; x += 70) {
    ctx.beginPath(); ctx.ellipse(x, VIEW.groundY + 46, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
  }
  // A fence line scrolling past in the farmyard.
  if (stageIndex === 0) {
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(0, VIEW.groundY - 40, VIEW.w, 7);
    ctx.fillRect(0, VIEW.groundY - 18, VIEW.w, 7);
    for (let x = -((scrollX % 180)); x < VIEW.w; x += 180) {
      ctx.fillRect(x, VIEW.groundY - 46, 10, 46);
      ctx.fillRect(x - 4, VIEW.groundY - 50, 18, 8);
    }
  }
}

// --- characters -----------------------------------------------------------
export function drawTurkey(ctx, turkey, t, dashing) {
  const x = turkey.x, y = turkey.y;
  const bob = turkey.onGround ? Math.sin(t * 16) * 3 : 0;
  const squash = turkey.onGround ? 1 + Math.sin(t * 16) * 0.04 : 1;
  ctx.save();
  ctx.translate(x, y + bob);
  if (turkey.stumbleT > 0 && Math.floor(t * 20) % 2 === 0) ctx.globalAlpha = 0.55;
  if (turkey.hidden) ctx.globalAlpha = 0.35;
  ctx.scale(1, squash);
  // Tail fan.
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(-30, -34);
    ctx.rotate(i * 0.42 - 0.5);
    ctx.fillStyle = i % 2 === 0 ? PALETTE.turkeyTail : PALETTE.turkeyFeather;
    ctx.beginPath(); ctx.ellipse(0, -26, 11, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe066';
    ctx.beginPath(); ctx.ellipse(0, -46, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Legs (running).
  const legSwing = turkey.onGround ? Math.sin(t * 18) * 12 : 6;
  ctx.strokeStyle = '#e9a13b'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(-6 + legSwing, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(10 - legSwing, 0); ctx.stroke();
  // Body.
  ellipse(ctx, 0, -34, 38, 28, PALETTE.turkeyBody);
  ellipse(ctx, -6, -28, 26, 18, PALETTE.turkeyDark);
  // Wing.
  ctx.save(); ctx.translate(-4, -36); ctx.rotate(dashing ? -0.9 : -0.3 + Math.sin(t * 18) * 0.15);
  ellipse(ctx, 0, 0, 22, 12, PALETTE.turkeyFeather); ctx.restore();
  // Head + beak + wattle + eye.
  circle(ctx, 30, -58, 15, PALETTE.turkeyHead);
  ctx.fillStyle = '#ffb703';
  ctx.beginPath(); ctx.moveTo(42, -60); ctx.lineTo(58, -55); ctx.lineTo(42, -50); ctx.closePath(); ctx.fill();
  ellipse(ctx, 38, -44, 5, 9, PALETTE.wattle);
  circle(ctx, 34, -62, 3.4, '#2e1808');
  ctx.fillStyle = '#fff3e0';
  circle(ctx, 35, -63, 1.2, '#fff3e0');
  // Panic sweat when the farmer is close.
  if (turkey.gobbleT > 0) {
    ctx.fillStyle = '#7ec8e3';
    circle(ctx, 18, -78, 5, '#7ec8e3');
    ctx.fillStyle = '#fff3e0';
    ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'left';
    ctx.fillText('GOBBLE!', 44, -76);
  }
  ctx.restore();
}

export function drawFarmer(ctx, farmer, t) {
  const x = farmer.x, y = farmer.y;
  const run = Math.sin(farmer.armSwing) * 10;
  ctx.save();
  ctx.translate(x, y);
  // Legs.
  ctx.strokeStyle = PALETTE.farmerOveralls; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -52); ctx.lineTo(-4 + run, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -52); ctx.lineTo(10 - run, 0); ctx.stroke();
  // Body: overalls + shirt.
  ctx.fillStyle = PALETTE.farmerOveralls;
  rr(ctx, -16, -96, 40, 48, 8); ctx.fill();
  ctx.fillStyle = PALETTE.farmerShirt;
  rr(ctx, -18, -104, 44, 26, 8); ctx.fill();
  // Arms reaching forward, pitchfork in hand.
  ctx.strokeStyle = '#d9a05b'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(18, -92); ctx.lineTo(38 - run * 0.4, -70); ctx.stroke();
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(34, -118); ctx.lineTo(52, -52); ctx.stroke();
  ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 4;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(34 + i * 6, -118); ctx.lineTo(40 + i * 7, -134); ctx.stroke();
  }
  // Head, beard, angry eyes, straw hat.
  circle(ctx, 6, -116, 16, '#e8b88a');
  ctx.fillStyle = '#fff3e0';
  ctx.beginPath(); ctx.arc(6, -104, 12, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#2e1808';
  circle(ctx, 12, -120, 2.6, '#2e1808');
  ctx.strokeStyle = '#2e1808'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(6, -128); ctx.lineTo(18, -126); ctx.stroke();
  ctx.fillStyle = PALETTE.farmerHat;
  ctx.beginPath(); ctx.ellipse(6, -130, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-8, -152, 28, 22);
  // "!" when sprinting.
  if (farmer.state === 'sprint') {
    ctx.fillStyle = PALETTE.danger;
    ctx.font = 'bold 34px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('!', 6, -168);
  }
  if (farmer.state === 'search') {
    ctx.fillStyle = '#2e1808';
    ctx.font = 'bold 16px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('? ? ?', 6, -164);
  }
  ctx.restore();
}

// --- hazards & pickups ------------------------------------------------------
function drawObstacle(ctx, o, t) {
  ctx.save();
  if (o.kind === 'fence') {
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(o.x - 23, o.y - o.h, 8, o.h);
    ctx.fillRect(o.x + 15, o.y - o.h, 8, o.h);
    ctx.fillRect(o.x - 26, o.y - o.h + 12, 52, 8);
    ctx.fillRect(o.x - 26, o.y - o.h + 38, 52, 8);
  } else if (o.kind === 'pumpkin') {
    ctx.save(); ctx.translate(o.x, o.y - 22); ctx.rotate(o.t || 0);
    ellipse(ctx, 0, 0, 26, 22, '#e07b39');
    ctx.strokeStyle = '#b5533c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 20, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#4a7c59'; ctx.fillRect(-3, -26, 6, 10);
    ctx.restore();
    ctx.fillStyle = '#2e1808';
    ctx.font = 'bold 13px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('BOO!', o.x, o.y - 52);
  } else if (o.kind === 'hay') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.ellipse(o.x, o.y - 34, 50, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b5772e'; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(o.x + i * 16, o.y - 70); ctx.lineTo(o.x + i * 20, o.y - 6); ctx.stroke(); }
    ctx.fillStyle = '#2e1808';
    ctx.font = 'bold 13px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('HIDE HERE ↓', o.x, o.y - 84);
  } else if (o.kind === 'crate') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(o.x - 35, o.y - 70, 70, 70);
    ctx.strokeStyle = '#5e3a17'; ctx.lineWidth = 4;
    ctx.strokeRect(o.x - 35, o.y - 70, 70, 70);
    ctx.beginPath(); ctx.moveTo(o.x - 35, o.y - 70); ctx.lineTo(o.x + 35, o.y); ctx.moveTo(o.x + 35, o.y - 70); ctx.lineTo(o.x - 35, o.y); ctx.stroke();
  } else if (o.kind === 'oven') {
    ctx.fillStyle = PALETTE.oven;
    rr(ctx, o.x - 55, o.y - 96, 110, 96, 8); ctx.fill();
    ctx.fillStyle = '#ff9e00';
    rr(ctx, o.x - 42, o.y - 62, 84, 34, 6); ctx.fill();
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 3; i++) {
      const fx = o.x - 26 + i * 26 + Math.sin(t * 6 + i) * 3;
      ctx.beginPath(); ctx.ellipse(fx, o.y - 45, 8, 14, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fff3e0';
    ctx.font = 'bold 13px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('HOT!', o.x, o.y - 104);
  } else if (o.kind === 'knife') {
    const swing = Math.sin(o.swing || 0) * 0.5;
    const h = o.h || 120;
    ctx.save(); ctx.translate(o.x, o.y - h); ctx.rotate(swing);
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, h - 90); ctx.stroke();
    ctx.fillStyle = PALETTE.knife;
    ctx.beginPath(); ctx.moveTo(-12, h - 90); ctx.lineTo(12, h - 90); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2e1808';
    ctx.font = 'bold 12px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('CARVING KNIFE', 0, h - 96);
    ctx.restore();
  }
  ctx.restore();
}

function drawPickup(ctx, p, t) {
  const bobY = Math.sin(t * 3 + p.bob) * 6;
  if (p.kind === 'corn') {
    ctx.save(); ctx.translate(p.x, p.y + bobY); ctx.rotate(-0.3);
    ellipse(ctx, 0, 0, 12, 18, PALETTE.corn);
    ctx.strokeStyle = '#b5772e'; ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 6, -14); ctx.lineTo(i * 6, 14); ctx.stroke(); }
    ctx.fillStyle = '#80b918';
    ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(-10, 30); ctx.lineTo(10, 30); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(p.x, p.y + bobY);
    ctx.fillStyle = PALETTE.featherGold;
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 18, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3e0';
    ctx.beginPath(); ctx.ellipse(4, -12, 4, 7, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// --- HUD & screens ----------------------------------------------------------
function drawHUD(ctx, world, game) {
  const { score, corn, lives, distance } = world;
  ctx.fillStyle = PALETTE.hudBg;
  rr(ctx, 14, 12, 430, 92, 12); ctx.fill();
  ctx.fillStyle = PALETTE.hudText;
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`SCORE ${score.toLocaleString()}`, 28, 44);
  ctx.font = 'bold 19px Georgia, serif';
  ctx.fillText(`🌽 ${corn}   ${Math.floor(distance)}m / ${GOAL_DISTANCE}m`, 28, 74);
  ctx.fillStyle = PALETTE.accent;
  ctx.fillText(STAGES[world.stageIndex].name, 28, 96 - 2);
  // Hearts.
  for (let i = 0; i < 3; i++) {
    ctx.font = '26px Georgia, serif';
    ctx.fillText(i < lives ? '❤' : '♡', 330 + i * 34, 44);
  }
  // Distance progress bar to the back door.
  const barX = 470, barW = 560;
  ctx.fillStyle = PALETTE.hudBg;
  rr(ctx, barX, 18, barW, 26, 13); ctx.fill();
  ctx.fillStyle = PALETTE.ok;
  rr(ctx, barX + 3, 21, Math.max(8, (barW - 6) * Math.min(1, distance / GOAL_DISTANCE)), 20, 10); ctx.fill();
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('ESCAPE → BACK DOOR', barX + barW / 2, 36);
  ctx.textAlign = 'left';
  // Farmer proximity meter.
  const gap = farmerGap(world);
  ctx.fillStyle = PALETTE.hudBg;
  rr(ctx, 1050, 12, 216, 92, 12); ctx.fill();
  ctx.fillStyle = gap < 150 ? PALETTE.danger : PALETTE.hudText;
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText('FARMER', 1064, 38);
  ctx.fillStyle = gap < 150 ? PALETTE.danger : '#ffb703';
  const w = Math.max(10, Math.min(188, 188 * (1 - gap / 500)));
  rr(ctx, 1064, 48, w, 18, 9); ctx.fill();
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '15px Georgia, serif';
  ctx.fillText(gap < 150 ? 'HE IS RIGHT BEHIND YOU!' : gap < 300 ? 'Getting closer...' : 'Far behind', 1064, 88);
  // Stage banner + message.
  if (world.stageBannerT > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, world.stageBannerT);
    ctx.fillStyle = 'rgba(46,24,8,0.8)';
    rr(ctx, 340, 150, 600, 64, 14); ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 34px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText(world.stageBanner, 640, 194);
    ctx.restore();
  }
  if (world.messageT > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, world.messageT);
    ctx.fillStyle = world.message.includes('SPOTTED') ? PALETTE.danger : '#2e1808';
    ctx.font = 'bold 30px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText(world.message, 640, 260);
    ctx.restore();
  }
  if (world.spotted > 0) {
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.2 * Math.sin(world.time * 20);
    ctx.strokeStyle = PALETTE.danger; ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, VIEW.w - 14, VIEW.h - 14);
    ctx.restore();
  }
  // Mute + pause hints, bottom right.
  ctx.fillStyle = 'rgba(46,24,8,0.6)';
  ctx.font = '15px Georgia, serif'; ctx.textAlign = 'right';
  ctx.fillText(`M sound ${game.sound.muted ? 'OFF' : 'ON'}   •   P pause   •   R restart`, VIEW.w - 16, VIEW.h - 14);
  ctx.textAlign = 'left';
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(46, 24, 8, 0.88)';
  rr(ctx, x, y, w, h, 18); ctx.fill();
  ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 3;
  rr(ctx, x, y, w, h, 18); ctx.stroke();
}

export function drawTitle(ctx, t, best) {
  ctx.textAlign = 'center';
  panel(ctx, 290, 96, 700, 500);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('GOBBLE DASH', 640, 180);
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText('A Turkey Escape Game', 640, 222);
  ctx.font = '19px Georgia, serif';
  ctx.fillText('Thanksgiving dinner is at 6:00. You are the main course.', 640, 252);
  ctx.fillText('Outrun Farmer Bram, dodge the oven and the carving knives,', 640, 280);
  ctx.fillText('and reach the back door 1,500 m away — alive.', 640, 308);
  // The two rivals, drawn with the game's own art, facing off on the panel.
  ctx.save(); ctx.translate(500, 445); ctx.scale(0.8, 0.8); ctx.translate(-500, -445);
  drawTurkey(ctx, { x: 500, y: 445, onGround: true, jumps: 0, stumbleT: 0, hidden: false, gobbleT: 0 }, t, false);
  ctx.restore();
  ctx.save(); ctx.translate(790, 445); ctx.scale(0.8, 0.8); ctx.translate(-790, -445);
  drawFarmer(ctx, { x: 790, y: 445, state: 'chase', armSwing: t * 8 }, t);
  ctx.restore();
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 21px Georgia, serif';
  ctx.fillText('SPACE / ↑ jump  •  SHIFT dash  •  ↓ hide in hay', 640, 482);
  ctx.fillText('Click or ENTER to start  •  P pause  •  M sound  •  R restart', 640, 508);
  ctx.fillStyle = '#fff3e0';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Collect corn (+50) and golden feathers (+150). Three stumbles and you are dinner.', 640, 534);
  if (best > 0) {
    ctx.fillStyle = '#80b918';
    ctx.font = 'bold 19px Georgia, serif';
    ctx.fillText(`Best escape score so far: ${best.toLocaleString()}`, 640, 558);
  }
  if (Math.floor(t * 1.6) % 2 === 0) {
    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('▶  PRESS ENTER OR CLICK TO RUN  ◀', 640, 578);
  }
  ctx.textAlign = 'left';
}

export function drawEnd(ctx, kind, world, t) {
  ctx.textAlign = 'center';
  panel(ctx, 290, 110, 700, 470);
  if (kind === 'escaped') {
    ctx.fillStyle = '#80b918';
    ctx.font = 'bold 58px Georgia, serif';
    ctx.fillText('ESCAPED!', 640, 190);
    ctx.fillStyle = '#fff3e0';
    ctx.font = '21px Georgia, serif';
    ctx.fillText('You burst through the back door, feathers flying,', 640, 238);
    ctx.fillText('and vanished into the autumn woods. Dinner is cancelled.', 640, 268);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('🦃  The turkey lives to gobble another day!  🦃', 640, 316);
  } else {
    ctx.fillStyle = PALETTE.danger;
    ctx.font = 'bold 58px Georgia, serif';
    ctx.fillText('CAUGHT!', 640, 190);
    ctx.fillStyle = '#fff3e0';
    ctx.font = '21px Georgia, serif';
    ctx.fillText('Farmer Bram got you. The oven was already warm.', 640, 238);
    ctx.fillText('The carving knife never even had to come out.', 640, 268);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('🍗  Tonight, the turkey is dinner.  🍗', 640, 316);
  }
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`SCORE  ${world.score.toLocaleString()}`, 640, 372);
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`Distance ${Math.floor(world.distance)} m   •   Corn ${world.corn}   •   Stage ${STAGES[world.stageIndex].name}`, 640, 406);
  if (Math.floor(t * 1.6) % 2 === 0) {
    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('▶  PRESS R OR CLICK TO RUN AGAIN  ◀', 640, 470);
  }
  ctx.textAlign = 'left';
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20,10,4,0.55)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  panel(ctx, 440, 260, 400, 180);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 40px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('PAUSED', 640, 330);
  ctx.fillStyle = '#fff3e0';
  ctx.font = '19px Georgia, serif';
  ctx.fillText('P to resume  •  R to restart', 640, 380);
  ctx.textAlign = 'left';
}

// --- the frame --------------------------------------------------------------
export function drawFrame(ctx, game) {
  const { world, state } = game;
  const t = world.time;
  ctx.save();
  if (world.shake > 0) ctx.translate((Math.random() - 0.5) * world.shake * 30, (Math.random() - 0.5) * world.shake * 30);
  const scrollX = world.distance * 32; // px actually scrolled (see world.js)
  if (world.stageIndex === 2) drawKitchenBackdrop(ctx, t);
  else { drawSky(ctx, t); drawFarmhouse(ctx); }
  drawGround(ctx, world.stageIndex, t, scrollX);
  // World objects, far to near.
  for (const o of world.obstacles) drawObstacle(ctx, o, t);
  for (const p of world.pickups) if (!p.taken) drawPickup(ctx, p, t);
  // The farmer trails behind the turkey.
  drawFarmer(ctx, world.farmer, t);
  if (state !== 'title') drawTurkey(ctx, world.turkey, t, world.turkey.dashT > 0);
  // Particles and floating score text.
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    circle(ctx, p.x, p.y, p.size, p.color);
  }
  ctx.globalAlpha = 1;
  ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'center';
  for (const f of world.floaters) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (state === 'title') {
    drawTitle(ctx, t, world.best);
  } else {
    drawHUD(ctx, world, game);
  }
  if (state === 'caught') drawEnd(ctx, 'caught', world, t);
  if (state === 'escaped') drawEnd(ctx, 'escaped', world, t);
  if (state === 'paused') drawPaused(ctx);
}

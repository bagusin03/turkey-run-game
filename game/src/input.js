// Keyboard + mouse input, one job: turn raw events into named intents the
// game loop reads (jumpPressed, dashPressed, hideHeld, anyConfirm, ...).
// Also tracks the pointer so buttons and the turkey can be clicked.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set(); // edge-triggered: cleared once per frame
    this.pointer = { x: 0, y: 0, down: false, clicked: false };
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    const toGame = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
    };
    canvas.addEventListener('pointermove', (e) => { const p = toGame(e); this.pointer.x = p.x; this.pointer.y = p.y; });
    canvas.addEventListener('pointerdown', (e) => { const p = toGame(e); this.pointer.x = p.x; this.pointer.y = p.y; this.pointer.down = true; this.pointer.clicked = true; });
    window.addEventListener('pointerup', () => { this.pointer.down = false; });
  }

  jumpPressed() { return this.pressed.has('Space') || this.pressed.has('ArrowUp') || this.pressed.has('KeyW'); }
  dashPressed() { return this.pressed.has('ShiftLeft') || this.pressed.has('ShiftRight') || this.pressed.has('KeyX'); }
  hideHeld() { return this.keys.has('ArrowDown') || this.keys.has('KeyS'); }
  confirmPressed() { return this.pressed.has('Enter') || this.pressed.has('Space') || this.pointer.clicked; }
  restartPressed() { return this.pressed.has('KeyR'); }
  pausePressed() { return this.pressed.has('KeyP') || this.pressed.has('Escape'); }
  mutePressed() { return this.pressed.has('KeyM'); }
  clickConsumed() { const c = this.pointer.clicked; this.pointer.clicked = false; return c; }
  endFrame() { this.pressed.clear(); }
}

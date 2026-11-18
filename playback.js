// Call play() inside the tap handler; defer only seeking until metadata exists.
export class RangePlayback {
  constructor(player, onError) {
    this.player = player;
    this.onError = onError;
    this.generation = 0;
    player.addEventListener('timeupdate', () => this.checkEnd());
    player.addEventListener('play', () => {
      clearInterval(this.timer);
      this.timer = setInterval(() => this.checkEnd(), 25);
    });
    player.addEventListener('pause', () => clearInterval(this.timer));
    player.addEventListener('ended', () => this.cancel());
    player.addEventListener('error', () => {
      if (player.getAttribute('src')) { this.cancel(); onError(); }
    });
  }
  cancel() {
    this.generation++;
    clearInterval(this.timer);
    this.player.removeEventListener('loadedmetadata', this.seek);
    this.end = null;
    this.player.pause();
  }
  checkEnd() {
    if (this.end != null && this.player.currentTime >= this.end) this.cancel();
  }
  play(start, end = null) {
    this.cancel();
    const generation = this.generation;
    const p = this.player;
    this.end = end;
    this.seek = () => {
      if (generation !== this.generation) return;
      try {
        if (Number.isFinite(p.duration) && start >= p.duration) throw Error('Segment unavailable');
        p.currentTime = start;
      } catch { this.cancel(); this.onError(); }
    };
    if (p.readyState >= 1) this.seek();
    else p.addEventListener('loadedmetadata', this.seek, {once:true});
    if (generation !== this.generation) return;
    try {
      const promise = p.play();
      promise?.catch(() => {
        if (generation === this.generation) { this.cancel(); this.onError(); }
      });
    } catch { this.cancel(); this.onError(); }
  }
}

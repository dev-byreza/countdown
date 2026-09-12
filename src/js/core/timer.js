/**
 * Precision Drift-Free Countdown Engine
 * Uses Date timestamp deltas instead of naive setInterval
 */

export class CountdownTimer {
  constructor(options = {}) {
    this.targetDate = options.targetDate ? new Date(options.targetDate) : new Date();
    this.startDate = options.startDate ? new Date(options.startDate) : new Date();
    this.onTick = options.onTick || (() => {});
    this.onZero = options.onZero || (() => {});
    
    this.isRunning = false;
    this.isFinished = false;
    this.animationFrameId = null;
    this.lastSecond = null;
  }

  setTarget(targetDate, startDate = new Date()) {
    this.targetDate = new Date(targetDate);
    this.startDate = new Date(startDate);
    this.isFinished = false;
    this.lastSecond = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop = () => {
    if (!this.isRunning) return;

    const now = Date.now();
    const target = this.targetDate.getTime();
    const start = this.startDate.getTime();
    const diff = target - now;

    if (diff <= 0) {
      // Finished
      const timeData = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        millis: 0,
        totalSeconds: 0,
        progressPercent: 100,
        isZero: true,
        diff: 0
      };
      
      this.onTick(timeData, true);
      
      if (!this.isFinished) {
        this.isFinished = true;
        this.onZero();
      }
      
      this.animationFrameId = requestAnimationFrame(this.loop);
      return;
    }

    this.isFinished = false;

    // Calculate time units
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((diff % 1000) / 10); // 0-99

    // Calculate total duration progress
    const totalDuration = target - start;
    let progressPercent = 0;
    if (totalDuration > 0) {
      const elapsed = now - start;
      progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }

    const isSecondChanged = this.lastSecond !== seconds;
    if (isSecondChanged) {
      this.lastSecond = seconds;
    }

    const timeData = {
      days,
      hours,
      minutes,
      seconds,
      millis,
      totalSeconds,
      progressPercent,
      isZero: false,
      diff,
      isSecondChanged
    };

    this.onTick(timeData, isSecondChanged);
    this.animationFrameId = requestAnimationFrame(this.loop);
  };
}

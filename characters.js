// ========================
// SPRITE ANIMATION SYSTEM
// ========================

class Sprite {
	constructor(frames, frameRate = 3, loop = true) {
		this.frames = frames; // Array of p5.Image objects
		this.frameRate = frameRate; // Frames per second
		this.frameDuration = 1000 / frameRate; // ms per frame
		this.loop = loop; // Whether animation loops
		this.currentFrameIndex = 0;
		this.lastFrameTime = millis();
		this.isPlaying = true;
		this.hasFinished = false;
	}

	update() {
		if (!this.isPlaying) return;

		const now = millis();
		if (now - this.lastFrameTime >= this.frameDuration) {
			this.currentFrameIndex++;
			this.lastFrameTime = now;

			if (this.currentFrameIndex >= this.frames.length) {
				if (this.loop) {
					this.currentFrameIndex = 0;
				} else {
					this.currentFrameIndex = this.frames.length - 1;
					this.isPlaying = false;
					this.hasFinished = true;
				}
			}
		}
	}

	getCurrentFrame() {
		return this.frames[this.currentFrameIndex];
	}

	reset() {
		this.currentFrameIndex = 0;
		this.lastFrameTime = millis();
		this.isPlaying = true;
		this.hasFinished = false;
	}

	play() {
		this.isPlaying = true;
	}

	stop() {
		this.isPlaying = false;
	}
}

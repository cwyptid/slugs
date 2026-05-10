// A Game About Slugs - Sprite System & Character Initialization

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

// ========================
// SPRITE INITIALIZATION
// ========================

function initializeSprites() {
	// Initialize plant sprites (3 fps, looping)
	// Create both dry and watered sprites for each plant in section 1
	gardenState.section1Plants[0].drySprite = new Sprite(sprites.thymeDryFrames, 3, true);
	gardenState.section1Plants[0].wateredSprite = new Sprite(sprites.thymeWateredFrames, 3, true);
	gardenState.section1Plants[1].drySprite = new Sprite(sprites.rosemaryDryFrames, 3, true);
	gardenState.section1Plants[1].wateredSprite = new Sprite(sprites.rosemaryWateredFrames, 3, true);
	gardenState.section1Plants[2].drySprite = new Sprite(sprites.sunflowersDryFrames, 3, true);
	gardenState.section1Plants[2].wateredSprite = new Sprite(sprites.sunflowersWateredFrames, 3, true);
	gardenState.section1Plants[3].drySprite = new Sprite(sprites.tulipsDryFrames, 3, true);
	gardenState.section1Plants[3].wateredSprite = new Sprite(sprites.tulipsWateredFrames, 3, true);
	gardenState.section1Plants[4].drySprite = new Sprite(sprites.wildpatchDryFrames, 3, true);
	gardenState.section1Plants[4].wateredSprite = new Sprite(sprites.wildpatchWateredFrames, 3, true);

	// Rain sprites for section 1
	gardenState.section1Plants[0].rainSprite = new Sprite(sprites.thymeRainFrames, 3, true);
	gardenState.section1Plants[1].rainSprite = new Sprite(sprites.rosemaryRainFrames, 3, true);
	gardenState.section1Plants[2].rainSprite = new Sprite(sprites.sunflowersRainFrames, 3, true);
	gardenState.section1Plants[3].rainSprite = new Sprite(sprites.tulipsRainFrames, 3, true);
	gardenState.section1Plants[4].rainSprite = new Sprite(sprites.wildpatchRainFrames, 3, true);

	// Create both dry and watered sprites for each plant in section 2
	gardenState.section2Plants[0].drySprite = new Sprite(sprites.tomatoesDryFrames, 3, true);
	gardenState.section2Plants[0].wateredSprite = new Sprite(sprites.tomatoesWateredFrames, 3, true);
	gardenState.section2Plants[0].rainSprite = new Sprite(sprites.tomatoesRainFrames, 3, true);

	// Create both dry and watered sprites for each plant in section 3
	gardenState.section3Plants[0].drySprite = new Sprite(sprites.seedlingDryFrames, 3, true);
	gardenState.section3Plants[0].wateredSprite = new Sprite(sprites.seedlingWateredFrames, 3, true);
	gardenState.section3Plants[0].rainSprite = new Sprite(sprites.seedlingRainFrames, 3, true);

	// Rain sprites for shell and empty plot
	gardenState.shell.rainSprite = new Sprite(sprites.shellRainFrames, 3, true);
	gardenState.emptyPlot.rainSprite = new Sprite(sprites.emptyPlotRainFrames, 3, true);

	// Initialize Tony sprites
	gardenState.tonyState.tonyIdleSprite = new Sprite(sprites.tonyIdleFrames, 3, true);
	gardenState.tonyState.tonyActionSprite = new Sprite(sprites.tonyActionFrames, 3, false);
	gardenState.tonyState.tonyActionIdleSprite = new Sprite(sprites.tonyActionIdleFrames, 3, true);
	gardenState.tonyState.currentSprite = gardenState.tonyState.tonyIdleSprite;

	// Tony VN sprites (for dialogue scenes)
	gardenState.tonySmilingVNSprite = new Sprite(sprites.tonySmilingFrames, 3, true);
	gardenState.tonyExplainingVNSprite = new Sprite(sprites.tonyExplainingFrames, 3, true);
	gardenState.tonyAssuredVNSprite = new Sprite(sprites.tonyAssuredFrames, 3, true);
	gardenState.tonyPeacefulVNSprite = new Sprite(sprites.tonyPeacefulFrames, 3, true);
	gardenState.tonySadPeacefulVNSprite = new Sprite(sprites.tonySadPeacefulFrames, 3, true);
	gardenState.tonyShyVNSprite = new Sprite(sprites.tonyShyFrames, 3, true);
	gardenState.tonyContemplativeVNSprite = new Sprite(sprites.tonyContemplativeFrames, 3, true);
	gardenState.tonyDeterminedVNSprite = new Sprite(sprites.tonyDeterminedFrames, 3, true);
	gardenState.tonyAnxiousVNSprite = new Sprite(sprites.tonyAnxiousFrames, 3, true);
	gardenState.tonyConfidentVNSprite = new Sprite(sprites.tonyConfidentFrames, 3, true);
	gardenState.tonyHopefulVNSprite = new Sprite(sprites.tonyHopefulFrames, 3, true);
	gardenState.tonyRuefulVNSprite = new Sprite(sprites.tonyRuefulFrames, 3, true);
	gardenState.tonyHappyVNSprite = new Sprite(sprites.tonyHappyFrames, 3, true);
	gardenState.tonyWistfulVNSprite = new Sprite(sprites.tonyWistfulFrames, 3, true);
	gardenState.tonyWarmVNSprite = new Sprite(sprites.tonyWarmFrames, 3, true);

	// Create asset references for scene definitions
	assets.smiling_waving = gardenState.tonySmilingVNSprite;
	assets.explaining = gardenState.tonyExplainingVNSprite;
	assets.assured = gardenState.tonyAssuredVNSprite;
	assets.peaceful = gardenState.tonyPeacefulVNSprite;
	assets.sad_peaceful = gardenState.tonySadPeacefulVNSprite;
	assets.shy = gardenState.tonyShyVNSprite;
	assets.contemplative = gardenState.tonyContemplativeVNSprite;
	assets.determined = gardenState.tonyDeterminedVNSprite;
	assets.anxious = gardenState.tonyAnxiousVNSprite;
	assets.confident = gardenState.tonyConfidentVNSprite;
	assets.hopeful = gardenState.tonyHopefulVNSprite;
	assets.rueful = gardenState.tonyRuefulVNSprite;
	assets.happy = gardenState.tonyHappyVNSprite;
	assets.wistful = gardenState.tonyWistfulVNSprite;
	assets.warm = gardenState.tonyWarmVNSprite;

	// Cutscene sprites - cutscene 1 (3fps, looping)
	gardenState.cutsceneCallbackSprite1 = new Sprite(sprites.cutsceneCallback1Frames, 3, true);
	gardenState.cutsceneCallbackSprite2 = new Sprite(sprites.cutsceneCallback2Frames, 3, true);
	assets.cutscene_callback_1 = gardenState.cutsceneCallbackSprite1;
	assets.cutscene_callback_2 = gardenState.cutsceneCallbackSprite2;

	// Cutscene sprites - cutscenes 3-9 (3fps, looping)
	gardenState.cutsceneLeavingSprite = new Sprite(sprites.cutsceneLeavingFrames, 3, true);
	gardenState.cutsceneReturningSprite = new Sprite(sprites.cutsceneReturningFrames, 3, true);
	gardenState.cutsceneReturningShellSprite = new Sprite(sprites.cutsceneReturningShellFrames, 3, true);
	gardenState.cutsceneKneelingShellSprite = new Sprite(sprites.cutsceneKneelingShellFrames, 3, true);
	gardenState.cutsceneKneelingCloudsSprite = new Sprite(sprites.cutsceneKneelingCloudsFrames, 3, true);
	gardenState.cutsceneKneelingRainSprite = new Sprite(sprites.cutsceneKneelingRainFrames, 3, true);
	gardenState.cutsceneRainfallSprite = new Sprite(sprites.cutsceneRainfallFrames, 3, true);
	assets.cutscene_leaving = gardenState.cutsceneLeavingSprite;
	assets.cutscene_returning = gardenState.cutsceneReturningSprite;
	assets.cutscene_returning_shell = gardenState.cutsceneReturningShellSprite;
	assets.cutscene_kneeling_shell = gardenState.cutsceneKneelingShellSprite;
	assets.cutscene_kneeling_clouds = gardenState.cutsceneKneelingCloudsSprite;
	assets.cutscene_kneeling_rain = gardenState.cutsceneKneelingRainSprite;
	assets.cutscene_rainfall = gardenState.cutsceneRainfallSprite;

	// Cutscene sprites - cutscene 2 intro sequence (plays once, then loops)
	gardenState.cutsceneRemoveShellSprite = new Sprite(sprites.cutsceneRemoveShellFrames, 3, false);
	gardenState.cutsceneRemoveShellAfterSprite = new Sprite(sprites.cutsceneRemoveShellAfterFrames, 3, false);
	gardenState.cutsceneEarsSprite = new Sprite(sprites.cutsceneEarsFrames, 6, false);
	gardenState.cutsceneEarsAfterSprite = new Sprite(sprites.cutsceneEarsAfterFrames, 3, true);
	assets.cutscene_remove_shell = gardenState.cutsceneRemoveShellSprite;
	assets.cutscene_remove_shell_after = gardenState.cutsceneRemoveShellAfterSprite;
	assets.cutscene_ears = gardenState.cutsceneEarsSprite;
	assets.cutscene_ears_after = gardenState.cutsceneEarsAfterSprite;

	// Tony rain overworld sprite - PLACEHOLDER: uses tonyRainFrames (same as idle until rain variant)
	gardenState.tonyState.tonyRainSprite = new Sprite(sprites.tonyRainFrames, 3, true);

	// Tony intro animation sprites (for intro sequence)
	gardenState.tonyStartSprite = new Sprite(sprites.tonyStartFrames, 3, true); // 3fps, looping
	gardenState.tonySurprisedSprite = new Sprite(sprites.tonySurprisedFrames, 6, false); // 6fps, plays once
	gardenState.tonyStartIdleSprite = new Sprite(sprites.tonyStartIdleFrames, 3, true); // 3fps, looping

	// Initialize cursor sprite (5 fps for nice animation between 2 frames)
	if (sprites.cursorFrames && sprites.cursorFrames.length > 0) {
		cursorSprite = new Sprite(sprites.cursorFrames, 5, true);
	}

	// Initialize cursor question sprite (for interactive areas)
	if (sprites.cursorQuestionFrames && sprites.cursorQuestionFrames.length > 0) {
		cursorQuestionSprite = new Sprite(sprites.cursorQuestionFrames, 5, true);
	}
	if (sprites.cursorQuestionRainFrames && sprites.cursorQuestionRainFrames.length > 0) {
		cursorQuestionRainSprite = new Sprite(sprites.cursorQuestionRainFrames, 5, true);
	}

	// Initialize empty plot sprite (3 fps, looping)
	if (sprites.emptyPlotFrames && sprites.emptyPlotFrames.length > 0) {
		gardenState.emptyPlot.sprite = new Sprite(sprites.emptyPlotFrames, 3, true);
	}

	if (sprites.shellFrames && sprites.shellFrames.length > 0) {
		gardenState.shell.sprite = new Sprite(sprites.shellFrames, 3, true);
	}

	// Initialize shell ready sprite (for when all plants are watered)
	if (sprites.shellReadyFrames && sprites.shellReadyFrames.length > 0) {
		gardenState.shell.readySprite = new Sprite(sprites.shellReadyFrames, 3, true);
	}

	// Scale plant positions and sizes based on canvas scale
	for (let plant of gardenState.section1Plants) {
		plant.x *= canvasScale;
		plant.y *= canvasScale;
		plant.width *= canvasScale;
		plant.height *= canvasScale;
	}
	for (let plant of gardenState.section2Plants) {
		plant.x *= canvasScale;
		plant.y *= canvasScale;
		plant.width *= canvasScale;
		plant.height *= canvasScale;
	}
	for (let plant of gardenState.section3Plants) {
		plant.x *= canvasScale;
		plant.y *= canvasScale;
		plant.width *= canvasScale;
		plant.height *= canvasScale;
	}

	// Scale interactive areas
	gardenState.emptyPlot.x *= canvasScale;
	gardenState.emptyPlot.y *= canvasScale;
	gardenState.emptyPlot.width *= canvasScale;
	gardenState.emptyPlot.height *= canvasScale;

	gardenState.shell.x *= canvasScale;
	gardenState.shell.y *= canvasScale;
	gardenState.shell.width *= canvasScale;
	gardenState.shell.height *= canvasScale;
}

// ========================
// SPRITE UPDATE
// ========================

function updateAllSprites() {
	// Only update sprites that are visible in current game mode
	if (gameMode === 'vn') {
		// In VN mode, update all VN portrait sprites - pause all other animations for performance
		if (gardenState.tonySmilingVNSprite) {
			gardenState.tonySmilingVNSprite.update();
		}
		if (gardenState.tonyExplainingVNSprite) {
			gardenState.tonyExplainingVNSprite.update();
		}
		if (gardenState.tonyAssuredVNSprite) {
			gardenState.tonyAssuredVNSprite.update();
		}
		if (gardenState.tonyPeacefulVNSprite) {
			gardenState.tonyPeacefulVNSprite.update();
		}
		if (gardenState.tonySadPeacefulVNSprite) {
			gardenState.tonySadPeacefulVNSprite.update();
		}
		if (gardenState.tonyShyVNSprite) {
			gardenState.tonyShyVNSprite.update();
		}
		if (gardenState.tonyContemplativeVNSprite) {
			gardenState.tonyContemplativeVNSprite.update();
		}
		if (gardenState.tonyDeterminedVNSprite) {
			gardenState.tonyDeterminedVNSprite.update();
		}
		if (gardenState.tonyAnxiousVNSprite) {
			gardenState.tonyAnxiousVNSprite.update();
		}
		if (gardenState.tonyConfidentVNSprite) {
			gardenState.tonyConfidentVNSprite.update();
		}
		if (gardenState.tonyHopefulVNSprite) {
			gardenState.tonyHopefulVNSprite.update();
		}
		if (gardenState.tonyRuefulVNSprite) {
			gardenState.tonyRuefulVNSprite.update();
		}
		if (gardenState.tonyHappyVNSprite) {
			gardenState.tonyHappyVNSprite.update();
		}
		if (gardenState.tonyWistfulVNSprite) {
			gardenState.tonyWistfulVNSprite.update();
		}
		if (gardenState.tonyWarmVNSprite) {
			gardenState.tonyWarmVNSprite.update();
		}
		// All other sprites are paused during VN mode for better performance
	} else if (gameMode === 'intro') {
		// In intro mode, update the appropriate Tony sprite based on phase
		if (introPhase === 'none') {
			// Waiting for click - animate tony_start and plants
			if (gardenState.tonyStartSprite) {
				gardenState.tonyStartSprite.update();
			}
			// Also update plant animations while waiting
			for (let plant of frameCachedPlants) {
				if (plant.watered) {
					if (plant.wateredSprite) plant.wateredSprite.update();
				} else {
					if (plant.drySprite) plant.drySprite.update();
				}
			}
			// Update shell and empty plot animations in intro mode
			if (currentSection === 2) {
				if (gardenState.shell.sprite) {
					gardenState.shell.sprite.update();
				}
				if (gardenState.shell.readySprite) {
					gardenState.shell.readySprite.update();
				}
			}
			if (currentSection === 3 && gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		} else if (introPhase === 'tony_start') {
			// During tony_start phase, animate both Tony and plants
			if (gardenState.tonyStartSprite) {
				gardenState.tonyStartSprite.update();
			}
			// Also update plant animations during tony_start
			for (let plant of frameCachedPlants) {
				if (plant.watered) {
					if (plant.wateredSprite) plant.wateredSprite.update();
				} else {
					if (plant.drySprite) plant.drySprite.update();
				}
			}
			// Update shell and empty plot animations in intro mode
			if (currentSection === 2) {
				if (gardenState.shell.sprite) {
					gardenState.shell.sprite.update();
				}
				if (gardenState.shell.readySprite) {
					gardenState.shell.readySprite.update();
				}
			}
			if (currentSection === 3 && gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		} else if (introPhase === 'tony_surprised') {
			if (gardenState.tonySurprisedSprite) {
				gardenState.tonySurprisedSprite.update();
			}
			// Update shell and empty plot animations
			if (currentSection === 2) {
				if (gardenState.shell.sprite) {
					gardenState.shell.sprite.update();
				}
				if (gardenState.shell.readySprite) {
					gardenState.shell.readySprite.update();
				}
			}
			if (currentSection === 3 && gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		} else if (introPhase === 'tony_start_idle') {
			if (gardenState.tonyStartIdleSprite) {
				gardenState.tonyStartIdleSprite.update();
			}
			// Update shell and empty plot animations
			if (currentSection === 2) {
				if (gardenState.shell.sprite) {
					gardenState.shell.sprite.update();
				}
				if (gardenState.shell.readySprite) {
					gardenState.shell.readySprite.update();
				}
			}
			if (currentSection === 3 && gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		}
		// Always update cursor sprites during intro (for question mark animation)
		if (cursorQuestionSprite) cursorQuestionSprite.update();
		if (cursorQuestionRainSprite) cursorQuestionRainSprite.update();
	} else if (gameMode === 'cutscene') {
		if (cutsceneIntroStep >= 0 && cutsceneIntroSequence.length > 0) {
			// Update only the currently active intro sprite
			cutsceneIntroSequence[cutsceneIntroStep].update();
		} else if (scenes[currentScene] && scenes[currentScene].cutsceneSprite) {
			// Update the dialogue-phase sprite
			scenes[currentScene].cutsceneSprite.update();
		}
	} else if (gameMode === 'transitioning') {
		// During section transitions, pause plant animations (they're hidden by fade overlay)
		// Only update Tony's animation since it's still visible
		if (gardenState.tonyState.currentSprite) {
			gardenState.tonyState.currentSprite.update();

			// If action animation finished, switch to action_idle loop
			if (gardenState.tonyState.currentSprite === gardenState.tonyState.tonyActionSprite &&
				gardenState.tonyState.tonyActionSprite.hasFinished) {
				gardenState.tonyState.tonyActionIdleSprite.reset();
				gardenState.tonyState.currentSprite = gardenState.tonyState.tonyActionIdleSprite;
				actionIdleStartTime = millis(); // Track when action_idle starts
			}
		}
	} else {
		// In garden mode, update all visible sprites
		for (let plant of frameCachedPlants) {
			if (isRaining) {
				if (plant.rainSprite) plant.rainSprite.update();
			} else if (plant.watered) {
				if (plant.wateredSprite) plant.wateredSprite.update();
			} else {
				if (plant.drySprite) plant.drySprite.update();
			}
		}

		// Update Tony overworld sprites
		if (gardenState.tonyState.currentSprite) {
			gardenState.tonyState.currentSprite.update();

			// If action animation finished, switch to action_idle loop
			if (gardenState.tonyState.currentSprite === gardenState.tonyState.tonyActionSprite &&
				gardenState.tonyState.tonyActionSprite.hasFinished) {
				gardenState.tonyState.tonyActionIdleSprite.reset();
				gardenState.tonyState.currentSprite = gardenState.tonyState.tonyActionIdleSprite;
				actionIdleStartTime = millis(); // Track when action_idle starts
			}
		}

		// Update Tony rain sprite when raining
		if (isRaining && gardenState.tonyState.tonyRainSprite) {
			gardenState.tonyState.tonyRainSprite.update();
		}

		// Update cursor sprites (only in garden mode)
		if (cursorSprite) {
			cursorSprite.update();
		}
		if (cursorQuestionSprite) cursorQuestionSprite.update();
		if (cursorQuestionRainSprite) cursorQuestionRainSprite.update();

		// Update empty plot sprite (only in section 3)
		if (currentSection === 3) {
			if (isRaining && gardenState.emptyPlot.rainSprite) {
				gardenState.emptyPlot.rainSprite.update();
			} else if (gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		}

		// Update shell sprite (only in section 2)
		if (currentSection === 2) {
			if (isRaining && gardenState.shell.rainSprite) {
				gardenState.shell.rainSprite.update();
			} else {
				if (gardenState.shell.sprite) gardenState.shell.sprite.update();
				if (gardenState.shell.readySprite) gardenState.shell.readySprite.update();
			}
		}
	}
}

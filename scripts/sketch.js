// A Game About Slugs - Entry Point

function preload() {
	loadGameAssets();
}

function setup() {
	let canvasWidth = 1280;
	let canvasHeight = 720;

	if (windowWidth < 1300) {
		canvasScale = (windowWidth - 20) / 1280;
		canvasWidth = windowWidth - 20;
		canvasHeight = 720 * canvasScale;
	}

	createCanvas(canvasWidth, canvasHeight);
	let p5Container = document.getElementById('p5-container');
	if (p5Container && canvas.parentNode !== p5Container) {
		p5Container.appendChild(canvas);
	}

	textFont(myFont);
	fill(255, 253, 191);
	textSize(24);
	rectMode(CORNER);

	inp = createInput("");
	inp.hide();

	initializeNameInputButtons();
	gardenState.backgroundImage = gardenAssets.section1Background;
	initializeSprites();
	setupScenes();

	if (DEBUG_CUTSCENE) {
		playerName = "Debug";
		gameMode = 'cutscene';
		currentScene = 1100;
		vnEntryTime = millis();
		resetTypewriter();
	}

	if (DEBUG_ENDING) {
		playerName = "Debug";
		for (let plant of [...gardenState.section1Plants, ...gardenState.section2Plants, ...gardenState.section3Plants]) {
			plant.watered = true;
		}
		gardenState.emptyPlot.visited = true;
		isRaining = true;
		initRainParticles();
		document.body.classList.add('rain-active');
		currentScene = 1605;
		gameMode = 'vn';
		currentSection = 2;
		gardenState.backgroundImage = gardenAssets.section2RainBackground || gardenAssets.section2Background;
		vnEntryTime = millis() - (vnEntryDuration + 100);
		resetTypewriter();
	}
}

function draw() {
	// Reset click flag at start of frame to allow one click per frame
	clickProcessedThisFrame = false;

	// Cache current time to avoid calling millis() multiple times per frame
	const currentTime = millis();

	// Cache plants for this frame to avoid multiple getPlantsForSection() calls
	frameCachedPlants = getPlantsForSection(currentSection);

	// Update all sprites
	updateAllSprites();

	// Update rain particles each frame when raining
	if (isRaining) updateRainParticles();

	// Handle intro sequence - display sprite for a moment then start dialogue
	if (gameMode === 'intro') {
		drawGardenMode(currentTime); // Draw garden with start sprite

		const timeInPhase = currentTime - introPhaseStartTime;

		if (introPhase === 'waiting') {
			// Waiting for player to click Tony to start the sequence
			// Do nothing, just display Tony with tony_start sprite (handled in rendering)
		} else if (introPhase === 'tony_start') {
			// Loop tony_start for 1.5 seconds
			if (timeInPhase >= tonyStartDuration) {
				introPhase = 'tony_surprised';
				introPhaseStartTime = currentTime;
				gardenState.tonySurprisedSprite.reset();
				// Calculate duration based on frames and fps: 3 frames at 6fps = ~500ms
				tonySurprisedDuration = (sprites.tonySurprisedFrames.length / 6) * 1000;
			}
		} else if (introPhase === 'tony_surprised') {
			// Play tony_surprised once (no loop)
			if (timeInPhase >= tonySurprisedDuration) {
				introPhase = 'tony_start_idle';
				introPhaseStartTime = currentTime;
				gardenState.tonyStartIdleSprite.reset();
			}
		} else if (introPhase === 'tony_start_idle') {
			// Loop tony_start_idle for 0.5 seconds
			if (timeInPhase >= tonyStartIdleDuration) {
				// Transition to VN mode for opening dialogue
				gameMode = 'vn';
				currentScene = 1000; // Start at opening dialogue scene
				vnEntryTime = currentTime;
				isIntroSequenceVN = true; // Use longer fade for intro sequence
				resetTypewriter();
				lastClickTime = 0; // Reset click cooldown when entering VN mode
				lastProcessedScene = -1; // Reset scene tracker to allow first click

				// Set background based on current section before entering VN mode
				if (currentSection === 1) {
					gardenState.backgroundImage = gardenAssets.section1Background;
				} else if (currentSection === 2) {
					gardenState.backgroundImage = gardenAssets.section2Background;
				} else if (currentSection === 3) {
					gardenState.backgroundImage = gardenAssets.section3Background;
				}
			}
		}

		// Draw fade in effect from name input
		if (fadingIntoIntro) {
			const elapsedFade = currentTime - fadeIntoIntroStartTime;
			if (elapsedFade >= fadeIntoIntroDuration) {
				fadingIntoIntro = false; // Fade is complete
			} else {
				// Draw black overlay that fades out
				const fadeProgress = elapsedFade / fadeIntoIntroDuration; // 0 to 1
				const fadeAlpha = (1 - fadeProgress) * 255; // Start opaque, fade to transparent
				fill(0, fadeAlpha);
				noStroke();
				rect(0, 0, width, height);
			}
		}
	} else if (gameMode === 'transitioning') {
		drawGardenMode(currentTime); // Show garden with watered plants and Tony's action animations

		// Wait for action_idle to start, then wait vnTransitionDelay before transitioning
		const isInActionIdle = gardenState.tonyState.currentSprite === gardenState.tonyState.tonyActionIdleSprite;
		const timeSinceActionIdleStart = isInActionIdle ? currentTime - actionIdleStartTime : 0;

		// Only transition after action_idle has been looping for vnTransitionDelay
		if (isInActionIdle && timeSinceActionIdleStart >= vnTransitionDelay) {
			// Reset cursor states before entering VN mode
			isCurrentlyHoveringPlant = false;
			isHoveringInteractiveArea = false;
			gameMode = 'vn'; // Enter VN mode after delay
			vnEntryTime = currentTime; // Start entry animation timer
			resetTypewriter(); // Start typewriter effect for current scene
			lastClickTime = 0; // Reset click cooldown when entering VN mode
			lastProcessedScene = -1; // Reset scene tracker to allow first click
		}
	} else {
		// Route to appropriate draw function based on game mode
		switch (gameMode) {
			case 'title':
				drawTitleScreen();
				break;
			case 'nameInput':
				drawNameInputScreen();
				// Draw fade in effect from title screen
				if (fadingIntoNameInput) {
					const elapsedFade = currentTime - fadeIntoNameInputStartTime;
					if (elapsedFade >= fadeIntoNameInputDuration) {
						fadingIntoNameInput = false; // Fade is complete
					} else {
						// Draw black overlay that fades out
						const fadeProgress = elapsedFade / fadeIntoNameInputDuration; // 0 to 1
						const fadeAlpha = (1 - fadeProgress) * 255; // Start opaque, fade to transparent
						fill(0, fadeAlpha);
						noStroke();
						rect(0, 0, width, height);
					}
				}
				break;
			case 'storyTransition':
				drawStoryTransitionScreen(currentTime);
				break;
			case 'garden':
				drawGardenMode(currentTime);
				break;
			case 'vn':
				drawVNMode(currentTime);
				break;
			case 'cutscene':
				drawCutsceneMode(currentTime);
				break;
			case 'storyEnding':
				drawStoryEndingMode(currentTime);
				break;
			case 'rain_ending':
				drawGardenMode(currentTime);
				if (showESCOverlay) drawESCOverlay();
				// Fade to title when triggered from rain_ending
				if (fadingToTitleFromEnding) {
					const elapsed = currentTime - fadeToTitleFromEndingStartTime;
					const progress = Math.min(elapsed / fadeToTitleFromEndingDuration, 1);
					push();
					fill(0, 0, 0, progress * 255);
					noStroke();
					rect(0, 0, width, height);
					pop();
					if (progress >= 1) {
						fadingToTitleFromEnding = false;
						resetGame();
						gameMode = 'title';
					}
				}
				break;
		}
	}

	// Handle input visibility
	checkTextBoxVisibility();
}

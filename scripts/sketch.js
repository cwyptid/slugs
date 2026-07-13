// Entry Point
"use strict";

function preload() {
  loadGameAssets();
}

function initializeLayout() {
  // Scale plant positions and sizes based on canvas scale (baked in once at setup)
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

function setup() {
  let canvasWidth = 1280;
  let canvasHeight = 720;

  // Shrink to fit smaller windows, but never scale up past native 1280x720
  if (windowWidth < 1300) {
    canvasScale = (windowWidth - 20) / 1280;
    canvasWidth = windowWidth - 20;
    canvasHeight = 720 * canvasScale;
  }

  createCanvas(canvasWidth, canvasHeight);
  let p5Container = document.getElementById("p5-container");
  if (p5Container && canvas.parentNode !== p5Container) {
    p5Container.appendChild(canvas);
  }

  textFont(assets.myFont);
  fill(255, 253, 191);
  textSize(24 * canvasScale);
  rectMode(CORNER);

  assets.titleMusic.setVolume(0.12);
  if (!DEBUG_CUTSCENE && !DEBUG_ENDING) assets.titleMusic.loop();

  initializeNameInputButtons();
  gardenState.backgroundImage = gardenAssets.section1Background;
  initializeSprites();
  initializeLayout();
  setupScenes();

  if (DEBUG_CUTSCENE) {
    playerName = "TUGGITS";
    for (let plant of [
      ...gardenState.section1Plants,
      ...gardenState.section2Plants,
      ...gardenState.section3Plants,
    ]) {
      plant.watered = true;
    }
    gardenState.emptyPlot.visited = true;
    gameMode = "cutscene";
    currentScene = 1611;
    skipCutsceneTextboxFade = true;
    resetTypewriter();
  }

  gameLoaded = true;

  if (DEBUG_ENDING) {
    playerName = "TUGGITS";
    for (let plant of [
      ...gardenState.section1Plants,
      ...gardenState.section2Plants,
      ...gardenState.section3Plants,
    ]) {
      plant.watered = true;
    }
    gardenState.emptyPlot.visited = true;
    isRaining = true;
    initRainParticles();
    document.body.classList.add("rain-active");
    currentScene = 2016;
    gameMode = "vn";
    currentSection = 2;
    gardenState.backgroundImage =
      gardenAssets.section2RainBackground || gardenAssets.section2Background;
    fades.toVNMode.startTime = millis() - (fades.toVNMode.duration + 100);
    resetTypewriter();
  }
}

function draw() {
  // Reset click flag at start of frame to allow one click per frame
  clickProcessedThisFrame = false;

  // Cache current time to avoid calling millis() multiple times per frame
  const currentTime = millis();

  // Cache plants for this frame to avoid multiple getPlantsForSection() calls
  cachedCurrentSectionPlants = getPlantsForSection(currentSection);

  // Update all sprites
  updateAllSprites();

  // Update rain particles each frame when raining
  if (isRaining) updateRainParticles();

  // Handle intro sequence - display sprite for a moment then start dialogue
  if (gameMode === "intro") {
    drawGardenMode(currentTime); // Draw garden with start sprite

    const timeInPhase = currentTime - introPhaseStartTime;

    if (introPhase === "none") {
      // Waiting for player to click Tony to start the sequence
    } else if (introPhase === "tony_surprised") {
      // Play tony_surprised once (no loop)
      if (timeInPhase >= tonySurprisedDuration) {
        introPhase = "tony_start_idle";
        introPhaseStartTime = currentTime;
        gardenState.tonyStartIdleSprite.reset();
      }
    } else if (introPhase === "tony_start_idle") {
      // Loop tony_start_idle for 0.5 seconds
      if (timeInPhase >= tonyStartIdleDuration) {
        // Transition to VN mode for opening dialogue
        gameMode = "vn";
        currentScene = 1000; // Start at opening dialogue scene
        fades.toVNMode.startTime = currentTime;
        toIntroVN = true; // Use longer fade for intro sequence
        if (!mainTuneStarted && assets.mainTune) {
          mainTuneStarted = true;
          assets.mainTune.setVolume(0);
          assets.mainTune.loop();
          assets.mainTune.setVolume(0.05, 2);
        }
        resetTypewriter();
        lastClickTime = 0; // Reset click cooldown when entering VN mode

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
    if (fades.toIntro.fading) {
      const elapsedFade = currentTime - fades.toIntro.startTime;
      if (elapsedFade >= fades.toIntro.duration) {
        fades.toIntro.fading = false; // Fade is complete
      } else {
        // Draw black overlay that fades out
        const fadeProgress = elapsedFade / fades.toIntro.duration; // 0 to 1
        const fadeAlpha = (1 - fadeProgress) * 255; // Start opaque, fade to transparent
        fill(0, fadeAlpha);
        noStroke();
        rect(0, 0, width, height);
      }
    }
  } else if (gameMode === "transitioning") {
    drawGardenMode(currentTime); // Show garden with watered plants and Tony's action animations

    // Wait for action_idle to start, then wait vnTransitionDelay before transitioning
    const isInActionIdle =
      gardenState.tonyState.currentSprite ===
      gardenState.tonyState.tonyActionIdleSprite;
    const timeSinceActionIdleStart = isInActionIdle
      ? currentTime - actionIdleStartTime
      : 0;

    // Only transition after action_idle has been looping for vnTransitionDelay
    if (isInActionIdle && timeSinceActionIdleStart >= vnTransitionDelay) {
      // Reset cursor states before entering VN mode
      isHoveringPlant = false;
      isHoveringInteractiveArea = false;
      gameMode = "vn"; // Enter VN mode after delay
      fades.toVNMode.startTime = currentTime; // Start entry animation timer
      resetTypewriter(); // Start typewriter effect for current scene
      lastClickTime = 0; // Reset click cooldown when entering VN mode
    }
  } else {
    // Route to appropriate draw function based on game mode
    switch (gameMode) {
      case "title":
        drawTitleScreen();
        break;
      case "nameInput":
        drawNameInputScreen();
        // Draw fade in effect from title screen
        if (fades.toNameInput.fading) {
          const elapsedFade = currentTime - fades.toNameInput.startTime;
          if (elapsedFade >= fades.toNameInput.duration) {
            fades.toNameInput.fading = false; // Fade is complete
          } else {
            // Draw black overlay that fades out
            const fadeProgress = elapsedFade / fades.toNameInput.duration; // 0 to 1
            const fadeAlpha = (1 - fadeProgress) * 255; // Start opaque, fade to transparent
            fill(0, fadeAlpha);
            noStroke();
            rect(0, 0, width, height);
          }
        }
        break;
      case "storyTransition":
        drawStoryTransitionScreen(currentTime);
        break;
      case "garden":
        drawGardenMode(currentTime);
        break;
      case "vn":
        drawVNMode(currentTime);
        break;
      case "cutscene":
        drawCutsceneMode(currentTime);
        break;
      case "storyEnding":
        drawStoryEndingMode(currentTime);
        break;
      case "rain_ending":
        drawGardenMode(currentTime);
        if (showESCOverlay) drawESCOverlay();
        // Fade to title when triggered from rain_ending
        if (fades.toTitleFromEnding.fading) {
          const elapsed = currentTime - fades.toTitleFromEnding.startTime;
          const progress = Math.min(
            elapsed / fades.toTitleFromEnding.duration,
            1,
          );
          push();
          fill(0, 0, 0, progress * 255);
          noStroke();
          rect(0, 0, width, height);
          pop();
          if (progress >= 1) {
            fades.toTitleFromEnding.fading = false;
            resetGame();
            gameMode = "title";
          }
        }
        break;
    }
  }
}

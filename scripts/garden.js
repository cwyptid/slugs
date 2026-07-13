// Garden Mode - Rendering, Rain, Watering
"use strict";

// ========================
// RAIN PARTICLE SYSTEM
// ========================

function initRainParticles() {
  const counts = [8, 10, 8];
  rainParticles = [[], [], []];
  for (let b = 0; b < 3; b++) {
    for (let i = 0; i < counts[b]; i++) {
      rainParticles[b].push({
        x: random(-width * 0.5, width),
        y: random(-height, height * 0.3),
        speed: random(20, 28),
        state: "falling",
        collisionFrame: 0,
        collisionTimer: 0,
        collisionY: random(height * 0.3, height * 0.8),
      });
    }
  }
}
function updateRainParticles() {
  for (let bucket of rainParticles) {
    for (let p of bucket) {
      if (p.state === "collision") {
        p.collisionTimer++;
        if (p.collisionTimer >= 6) {
          p.collisionTimer = 0;
          p.collisionFrame++;
          if (p.collisionFrame >= 3) {
            p.x = random(-width * 0.5, width);
            p.y = random(-height, 0);
            p.speed = random(20, 28);
            p.collisionY = random(height * 0.3, height * 0.8);
            p.state = "falling";
            p.collisionFrame = 0;
          }
        }
      } else {
        p.x += p.speed * 0.6;
        p.y += p.speed;
        if (p.y >= p.collisionY) {
          p.state = "collision";
          p.collisionFrame = 0;
          p.collisionTimer = 0;
        } else if (p.x > width + 48) {
          p.x = random(-width * 0.5, 0);
          p.y = random(-height, height * 0.3);
        }
      }
    }
  }
}
function drawRainParticles() {
  const ctx = drawingContext;
  const opacities = [0.4, 0.62, 0.82];
  const sprite = gardenAssets.rainSprite?.canvas;
  const collision = gardenAssets.rainCollisionSprite?.canvas;
  for (let b = 0; b < 3; b++) {
    ctx.globalAlpha = opacities[b];
    for (let p of rainParticles[b]) {
      if (p.state === "collision" && collision) {
        ctx.drawImage(
          collision,
          p.collisionFrame * 16,
          0,
          16,
          16,
          p.x,
          p.collisionY,
          48 * canvasScale,
          48 * canvasScale,
        );
      } else if (sprite) {
        ctx.drawImage(sprite, p.x, p.y, 48 * canvasScale, 48 * canvasScale);
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ========================
// NAVIGATION ARROWS
// ========================

// Shared geometry for the left/right section-navigation arrows, used by
// drawGardenMode for rendering and by mousePressed for click hit-testing.
function getNavArrowGeometry() {
  const arrowSize = 40 * 1.5 * canvasScale;
  const arrowBaseY = 20 * canvasScale; // Top corner
  const bobAmount = 1 * canvasScale; // Barely moves
  const arrowLeftX = 20 * canvasScale;
  const arrowRightX = width - arrowSize - 20 * canvasScale;
  return { arrowSize, arrowBaseY, bobAmount, arrowLeftX, arrowRightX };
}

function isHoveringLeftArrow(geo) {
  return (
    mouseX > geo.arrowLeftX &&
    mouseX < geo.arrowLeftX + geo.arrowSize &&
    mouseY > geo.arrowBaseY - geo.bobAmount &&
    mouseY < geo.arrowBaseY + geo.arrowSize + geo.bobAmount
  );
}

function isHoveringRightArrow(geo) {
  return (
    mouseX > geo.arrowRightX &&
    mouseX < geo.arrowRightX + geo.arrowSize &&
    mouseY > geo.arrowBaseY - geo.bobAmount &&
    mouseY < geo.arrowBaseY + geo.arrowSize + geo.bobAmount
  );
}

// ========================
// GARDEN MODE
// ========================

function drawGardenMode(currentTime) {
  // Use frame-cached plants for drawing
  let currentSectionPlants = cachedCurrentSectionPlants;

  // Draw appropriate background based on current section (rain variant when raining)
  if (currentSection === 1) {
    image(
      isRaining
        ? gardenAssets.section1RainBackground
        : gardenAssets.section1Background,
      0,
      0,
      width,
      height,
    );
  } else if (currentSection === 2) {
    image(
      isRaining
        ? gardenAssets.section2RainBackground
        : gardenAssets.section2Background,
      0,
      0,
      width,
      height,
    );
  } else if (currentSection === 3) {
    image(
      isRaining
        ? gardenAssets.section3RainBackground
        : gardenAssets.section3Background,
      0,
      0,
      width,
      height,
    );
  }

  // Draw all plants with sprite animations - rain sprite takes priority when raining
  for (let plant of currentSectionPlants) {
    let frame = null;
    if (isRaining && plant.rainSprite) {
      frame = plant.rainSprite.getCurrentFrame();
    } else if (plant.watered) {
      frame = plant.wateredSprite
        ? plant.wateredSprite.getCurrentFrame()
        : null;
    } else {
      frame = plant.drySprite ? plant.drySprite.getCurrentFrame() : null;
    }
    if (frame) image(frame, plant.x, plant.y, plant.width, plant.height);
  }

  // Draw empty plot sprite (only in section 3)
  if (currentSection === 3) {
    const epSprite = isRaining
      ? gardenState.emptyPlot.rainSprite
      : gardenState.emptyPlot.sprite;
    if (epSprite) {
      let epFrame = epSprite.getCurrentFrame();
      if (epFrame)
        image(
          epFrame,
          gardenState.emptyPlot.x,
          gardenState.emptyPlot.y,
          gardenState.emptyPlot.width,
          gardenState.emptyPlot.height,
        );
    }
  }

  // Draw shell sprite (only in section 2)
  if (currentSection === 2) {
    let shellSpriteToUse;
    if (isRaining) {
      shellSpriteToUse = gardenState.shell.rainSprite;
    } else {
      const allPlantsWatered =
        checkAllPlantsWatered() &&
        gardenState.emptyPlot.visited &&
        gameMode !== "rain_ending";
      shellSpriteToUse = allPlantsWatered
        ? gardenState.shell.readySprite
        : gardenState.shell.sprite;
    }
    if (shellSpriteToUse) {
      let shellFrame = shellSpriteToUse.getCurrentFrame();
      if (shellFrame)
        image(
          shellFrame,
          gardenState.shell.x,
          gardenState.shell.y,
          gardenState.shell.width,
          gardenState.shell.height,
        );
    }
  }

  // Draw Tony's sprite animation (only when NOT in VN mode)
  // Tony is scaled to 0.6x and positions scale with viewport
  // In intro mode, only draw Tony in section 1
  if (
    gameMode === "garden" ||
    gameMode === "rain_ending" ||
    gameMode === "transitioning" ||
    (gameMode === "intro" && currentSection === 1) ||
    (toIntroVN && gameMode === "vn")
  ) {
    const tonyScale = 0.6;
    // Position Tony based on current section
    let tonyX, tonyY;
    if (currentSection === 1) {
      tonyX = 1000 * canvasScale; // Right side of section 1
      tonyY = 250 * canvasScale;
    } else if (currentSection === 2) {
      tonyX = 50 * canvasScale; // Left side for section 2
      tonyY = 250 * canvasScale;
    } else if (currentSection === 3) {
      tonyX = 0 * canvasScale; // Right side of section 3
      tonyY = 150 * canvasScale;
    }

    // In intro mode, use appropriate sprite based on phase
    let currentSprite;
    if (gameMode === "intro") {
      if (introPhase === "none") {
        currentSprite = gardenState.tonyStartSprite;
      } else if (introPhase === "tony_surprised") {
        currentSprite = gardenState.tonySurprisedSprite;
      } else if (introPhase === "tony_start_idle") {
        currentSprite = gardenState.tonyStartIdleSprite;
      }
    } else {
      currentSprite = gardenState.tonyState.currentSprite;
    }

    let tonyFrame = currentSprite ? currentSprite.getCurrentFrame() : null;

    if (tonyFrame) {
      // Maintain aspect ratio by scaling the frame's actual dimensions
      const tonyWidth = tonyFrame.width * tonyScale * canvasScale;
      const tonyHeight = tonyFrame.height * tonyScale * canvasScale;

      // Get the baseline sprite height (tony_start) for consistent positioning
      let baselineHeight = gardenState.tonyStartSprite
        ? gardenState.tonyStartSprite.getCurrentFrame().height *
          tonyScale *
          canvasScale
        : tonyHeight;

      // Adjust Y position so bottom of sprite stays consistent
      const adjustedTonyY = tonyY + (baselineHeight - tonyHeight);

      let tonyAlpha = 255;

      // Fade out when entering VN mode (both intro sequence and regular transitions)
      if (gameMode === "vn") {
        const elapsed = currentTime - fades.toVNMode.startTime;
        const fadeDuration = fades.toVNMode.duration;
        if (elapsed < fadeDuration) {
          const progress = elapsed / fadeDuration;
          tonyAlpha = (1 - progress) * 255; // Fade out
        } else {
          tonyAlpha = 0;
        }
      }

      push();
      tint(255, tonyAlpha);

      // Flip horizontally in section 2
      if (currentSection === 2) {
        translate(tonyX + tonyWidth / 2, adjustedTonyY);
        scale(-1, 1);
        image(tonyFrame, -tonyWidth / 2, 0, tonyWidth, tonyHeight);
      } else {
        image(tonyFrame, tonyX, adjustedTonyY, tonyWidth, tonyHeight);
      }

      pop();
    }
  }

  // Draw rain particles over garden (before arrows and UI)
  if (isRaining) drawRainParticles();

  // Draw navigation arrows with bobbing animation
  let isArrowHovered = false;
  const bobSpeed = 0.005; // Extremely slow bobbing
  const navArrows = getNavArrowGeometry();
  const bobY =
    navArrows.arrowBaseY +
    Math.sin(currentTime * bobSpeed) * navArrows.bobAmount;

  // Draw left arrow (go back to section 1) - only show on section 2+
  if (
    (gameMode === "garden" ||
      gameMode === "intro" ||
      gameMode === "rain_ending") &&
    currentSection > 1 &&
    gardenAssets.arrowLeft
  ) {
    let leftArrowHovered = isHoveringLeftArrow(navArrows);

    let arrowAlpha = leftArrowHovered ? 255 : 180;
    if (leftArrowHovered) {
      cursor(HAND);
      isArrowHovered = true;
    }

    push();
    tint(255, arrowAlpha);
    image(
      isRaining && gardenAssets.arrowLeftRain
        ? gardenAssets.arrowLeftRain
        : gardenAssets.arrowLeft,
      navArrows.arrowLeftX,
      bobY,
      navArrows.arrowSize,
      navArrows.arrowSize,
    );
    pop();
  }

  // Draw right arrow (navigate forward) - show on sections 1-2 only
  if (
    (gameMode === "garden" ||
      gameMode === "intro" ||
      gameMode === "rain_ending") &&
    currentSection < 3 &&
    gardenAssets.arrowRight
  ) {
    let rightArrowHovered = isHoveringRightArrow(navArrows);

    let arrowAlpha = rightArrowHovered ? 255 : 180;
    if (rightArrowHovered) {
      cursor(HAND);
      isArrowHovered = true;
    }

    push();
    tint(255, arrowAlpha);
    image(
      isRaining && gardenAssets.arrowRightRain
        ? gardenAssets.arrowRightRain
        : gardenAssets.arrowRight,
      navArrows.arrowRightX,
      bobY,
      navArrows.arrowSize,
      navArrows.arrowSize,
    );
    pop();
  }

  // Draw flavor text if active (shown when clicking plants/shell before meeting Tony)
  if (flavorText && currentTime < flavorTextTimer) {
    const elapsed = currentTime - (flavorTextTimer - FLAVOR_TEXT_DURATION);
    const fadeOut = Math.max(
      0,
      1 - (elapsed - FLAVOR_TEXT_DURATION * 0.7) / (FLAVOR_TEXT_DURATION * 0.3),
    );
    const alpha = Math.min(1, elapsed / 200) * fadeOut;
    if (assets.nameBoxImage) {
      const tbW = 500 * canvasScale;
      const tbH = 116 * canvasScale;
      const tbX = (width - tbW) / 2;
      const tbY = height - tbH - 10 * canvasScale;
      const activeNameBox =
        isRaining && assets.nameBoxRainImage
          ? assets.nameBoxRainImage
          : assets.nameBoxImage;
      push();
      tint(255, alpha * 255);
      image(activeNameBox, tbX, tbY, tbW, tbH);
      pop();
      push();
      textFont(assets.myFont);
      textSize(20 * canvasScale);
      textAlign(CENTER, CENTER);
      fill(
        isRaining
          ? color(152, 77, 123, alpha * 255)
          : color(78, 30, 51, alpha * 255),
      );
      noStroke();
      text(flavorText, tbX + tbW / 2, tbY + tbH / 2);
      pop();
    }
  } else if (flavorText && currentTime >= flavorTextTimer) {
    flavorText = "";
  }

  // Draw custom cursor when hovering plants or interactive areas (mouseMoved() tracks hover state)
  if (isHoveringPlant && cursorSprite) {
    cursor("none"); // Hide default cursor
    let cursorFrame = cursorSprite.getCurrentFrame();
    if (cursorFrame) {
      push();
      imageMode(CENTER);
      image(
        cursorFrame,
        mouseX + cursorOffsetX,
        mouseY + cursorOffsetY,
        cursorWidth * canvasScale,
        cursorHeight * canvasScale,
      );
      pop();
    }
  } else if (
    isHoveringInteractiveArea &&
    cursorQuestionSprite &&
    !(gameMode === "intro" && introStarted)
  ) {
    cursor("none"); // Hide default cursor
    const activeQuestionSprite =
      isRaining && cursorQuestionRainSprite
        ? cursorQuestionRainSprite
        : cursorQuestionSprite;
    let cursorFrame = activeQuestionSprite.getCurrentFrame();
    if (cursorFrame) {
      push();
      imageMode(CENTER);
      image(
        cursorFrame,
        mouseX + cursorOffsetX,
        mouseY + cursorOffsetY,
        cursorWidth * canvasScale,
        cursorHeight * canvasScale,
      );
      pop();
    }
  } else if (isArrowHovered) {
    cursor(HAND);
  } else {
    cursor("default");
  }

  // Draw section transition fade overlay
  if (fades.toNewSectionTransition.fading) {
    const elapsed = currentTime - fades.toNewSectionTransition.startTime;
    const progress = Math.min(
      elapsed / fades.toNewSectionTransition.duration,
      1,
    );

    // Fade out then in - goes from 0 -> 1 -> 0 alpha over the duration
    const fadeAlpha =
      progress < 0.5
        ? progress * 2 * 255 // First half: fade in (0 to 1)
        : (1 - progress) * 2 * 255; // Second half: fade out (1 to 0)

    push();
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
    pop();

    // When fade reaches midpoint, actually change the section
    if (
      progress >= 0.5 &&
      currentSection !== fades.toNewSectionTransition.nextSectionTarget
    ) {
      currentSection = fades.toNewSectionTransition.nextSectionTarget;
    }

    // Finish transition when complete
    if (progress >= 1) {
      fades.toNewSectionTransition.fading = false;
    }
  }
}

// ========================
// GARDEN MODE FUNCTIONS
// ========================

function startSectionTransition(targetSection) {
  assets.footstepSound.play();
  fades.toNewSectionTransition.fading = true;
  fades.toNewSectionTransition.nextSectionTarget = targetSection;
  fades.toNewSectionTransition.startTime = millis();
}
function waterPlant(plantId) {
  assets.waterSound.setVolume(0.3);
  assets.waterSound.play();
  setTimeout(() => {
    assets.sparkleSound.setVolume(0.2);
    assets.sparkleSound.play();
  }, assets.waterSound.duration() * 1000);
  // Find the clicked plant and its group in current section
  let currentSectionPlants = getPlantsForSection(currentSection);
  let clickedPlant = currentSectionPlants.find((p) => p.id === plantId);
  if (!clickedPlant) return;

  // Water all plants in the same group
  const groupId = clickedPlant.groupId;
  for (let plant of currentSectionPlants) {
    if (plant.groupId === groupId) {
      plant.watered = true;
    }
  }

  // Trigger Tony's action animation sequence
  // First play the action animation (plays once), then loop action_idle
  gardenState.tonyState.tonyActionSprite.reset();
  gardenState.tonyState.currentSprite = gardenState.tonyState.tonyActionSprite;

  // Start conversation with the group
  startPlantConversation(groupId);
}

// Menu Screens - Title, Name Input, Story Transition, Story Ending
"use strict";

// ========================
// NAME INPUT SCREEN
// ========================

function initializeNameInputButtons() {
  nameInputButtons = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const buttonSize = BUTTON_SIZE * canvasScale;
  const buttonSpacing = BUTTON_SPACING * canvasScale;
  const buttonRowsStartY = BUTTON_ROWS_START_Y * canvasScale;

  // Calculate centering for the letter buttons
  const totalLetterButtonsWidth =
    LETTERS_PER_ROW * buttonSize + (LETTERS_PER_ROW - 1) * buttonSpacing;
  const startX = (width - totalLetterButtonsWidth) / 2;

  // Create letter buttons (26 letters in 2 rows)
  for (let i = 0; i < alphabet.length; i++) {
    const row = Math.floor(i / LETTERS_PER_ROW);
    const col = i % LETTERS_PER_ROW;
    const x = startX + col * (buttonSize + buttonSpacing);
    const y = buttonRowsStartY + row * (buttonSize + buttonSpacing);

    nameInputButtons.push({
      label: alphabet[i],
      x: x,
      y: y,
      width: buttonSize,
      height: buttonSize,
      type: "letter",
    });
  }

  // Create action buttons (SPACE, DELETE, DONE) - centered at bottom
  const actionButtonWidth = 254 * canvasScale; // otherbox.png width
  const actionButtonHeight = 85 * canvasScale; // otherbox.png height
  const actionButtonY =
    buttonRowsStartY +
    LETTER_ROWS * (buttonSize + buttonSpacing) +
    40 * canvasScale;

  // Total width needed for 3 action buttons
  const totalActionButtonsWidth = 3 * actionButtonWidth + 2 * buttonSpacing;
  const actionStartX = (width - totalActionButtonsWidth) / 2;

  // SPACE button
  nameInputButtons.push({
    label: "SPACE",
    x: actionStartX,
    y: actionButtonY,
    width: actionButtonWidth,
    height: actionButtonHeight,
    type: "action",
  });

  // DELETE button
  nameInputButtons.push({
    label: "DELETE",
    x: actionStartX + actionButtonWidth + buttonSpacing,
    y: actionButtonY,
    width: actionButtonWidth,
    height: actionButtonHeight,
    type: "action",
  });

  // DONE button
  nameInputButtons.push({
    label: "DONE",
    x: actionStartX + 2 * (actionButtonWidth + buttonSpacing),
    y: actionButtonY,
    width: actionButtonWidth,
    height: actionButtonHeight,
    type: "action",
  });
}

// ========================
// TITLE SCREEN
// ========================

function drawTitleScreen() {
  // Draw title image
  image(assets.titleImage, 0, 0, width, height);
}

function drawNameInputScreen() {
  // Semi-transparent dark background
  background(39, 30, 50, 255);

  // Draw personable prompt at top in bigger text
  push();
  fill(255, 253, 191); // Game's text color
  textSize(40 * canvasScale);
  textAlign(CENTER);
  text("Your Name?", width / 2, 65 * canvasScale);
  pop();

  // Draw nameBox at center with current input and character count
  const nameBoxWidth = 500 * canvasScale;
  const nameBoxHeight = 116 * canvasScale;
  const nameBoxX = (width - nameBoxWidth) / 2;
  const nameBoxY = 110 * canvasScale;

  if (assets.nameBoxImage) {
    image(assets.nameBoxImage, nameBoxX, nameBoxY, nameBoxWidth, nameBoxHeight);
  }

  // Draw text: current name input + character count
  push();
  fill(78, 30, 51); // Black text
  textSize(32 * canvasScale);
  textAlign(CENTER, CENTER);

  let displayText = currentNameInput + ` (${currentNameInput.length}/12)`;
  text(
    displayText,
    nameBoxX + nameBoxWidth / 2,
    nameBoxY + nameBoxHeight / 2 - 4 * canvasScale,
  );
  pop();

  // Draw all buttons with hover effects
  let anyButtonHovered = false;
  for (let i = 0; i < nameInputButtons.length; i++) {
    const button = nameInputButtons[i];

    // Check if button is selected via keyboard
    const isSelected = i === selectedButtonIndex;

    // Check if button is hovered by mouse (always calculate, but only show raise if not keyboard selected)
    const isHovered =
      mouseX > button.x &&
      mouseX < button.x + button.width &&
      mouseY > button.y &&
      mouseY < button.y + button.height;

    push();

    // Apply hover/select bounce effect (move button up)
    // Only raise if: (hovering AND not keyboard selected) OR (keyboard selected)
    const bounceAmount =
      (isHovered && selectedButtonIndex === -1) || isSelected
        ? -12 * canvasScale
        : 0;
    translate(0, bounceAmount);

    // Draw button image or background
    if (button.type === "letter") {
      if (assets.textButtonImage) {
        image(
          assets.textButtonImage,
          button.x,
          button.y,
          button.width,
          button.height,
        );
      }
    } else {
      if (assets.otherBoxImage) {
        image(
          assets.otherBoxImage,
          button.x,
          button.y,
          button.width,
          button.height,
        );
      }
    }

    // Draw button text
    fill(78, 30, 51); // Black text
    textSize(32 * canvasScale);
    textAlign(CENTER, CENTER);

    let displayLabel = button.label;
    if (button.label === "SPACE") {
      displayLabel = "[SPACE]";
    } else if (button.label === "DELETE") {
      displayLabel = "[DEL]";
    }

    text(
      displayLabel,
      button.x + button.width / 2,
      button.y + button.height / 2 - 4 * canvasScale,
    );

    pop();

    // Change cursor to hand when hovering
    if (isHovered) {
      cursor(HAND);
      anyButtonHovered = true;
    }
  }

  if (!anyButtonHovered) {
    cursor("default");
  }
}
function handleNameInputClick() {
  // Check each button for click
  for (let button of nameInputButtons) {
    if (
      mouseX > button.x &&
      mouseX < button.x + button.width &&
      mouseY > button.y &&
      mouseY < button.y + button.height
    ) {
      if (button.label === "SPACE") {
        // Add space if under limit
        if (currentNameInput.length < NAME_MAX_LENGTH) {
          currentNameInput += " ";
        }
      } else if (button.label === "DELETE") {
        // Remove last character
        currentNameInput = currentNameInput.slice(0, -1);
      } else if (button.label === "DONE") {
        // Validate and transition to story transition screen
        if (
          currentNameInput.length > 0 &&
          currentNameInput.length <= NAME_MAX_LENGTH
        ) {
          assets.clickSound.play();
          assets.titleMusic.stop();
          playerName = currentNameInput; // Store name in global variable
          gameMode = "storyTransition"; // Transition to story transition screen
          fades.toStoryTransition.fading = true;
          fades.toStoryTransition.startTime = millis();
          storyTransition.startTime =
            millis() + fades.toStoryTransition.duration; // Delay text start by fade duration
          storyTransition.finished = false;

          // Reset name input for potential future use
          currentNameInput = "";
          // Keep panel-3 visible during story transition screen
        }
      } else {
        // Letter button
        if (currentNameInput.length < NAME_MAX_LENGTH) {
          currentNameInput += button.label;
        }
      }
      break;
    }
  }
}

// ========================
// STORY ENDING SCREEN
// ========================

// Shared geometry for the "Stay in garden / Return to title" two-button
// end screen (drawStoryEndingMode and the rain-ending ESC overlay both use
// this exact button placement).
function getEndScreenButtons() {
  const buttonW = 254 * canvasScale; // otherBoxImage's native width
  const buttonH = 85 * canvasScale; // otherBoxImage's native height
  const buttonY = height * 0.55;
  const gap = 40 * canvasScale;
  const leftBtnX = width / 2 - buttonW - gap / 2;
  const rightBtnX = width / 2 + gap / 2;
  return { buttonW, buttonH, buttonY, gap, leftBtnX, rightBtnX };
}

// Draws the two end-screen buttons (with hover bounce) and sets the cursor.
function drawEndScreenButtons(buttons) {
  const { buttonW, buttonH, buttonY, leftBtnX, rightBtnX } = buttons;

  const stayHovered =
    mouseX > leftBtnX &&
    mouseX < leftBtnX + buttonW &&
    mouseY > buttonY &&
    mouseY < buttonY + buttonH;
  const returnHovered =
    mouseX > rightBtnX &&
    mouseX < rightBtnX + buttonW &&
    mouseY > buttonY &&
    mouseY < buttonY + buttonH;

  const activeOtherBox =
    isRaining && assets.otherBoxRainImage
      ? assets.otherBoxRainImage
      : assets.otherBoxImage;
  const activeTextColor = isRaining ? color(30, 25, 83) : color(78, 30, 51);

  textFont(assets.myFont);
  textSize(24 * canvasScale);
  textAlign(CENTER, CENTER);

  // "Stay in garden" button
  push();
  translate(0, stayHovered ? -12 * canvasScale : 0);
  if (activeOtherBox)
    image(activeOtherBox, leftBtnX, buttonY, buttonW, buttonH);
  fill(activeTextColor);
  noStroke();
  text(
    "STAY IN GARDEN",
    leftBtnX + buttonW / 2,
    buttonY + buttonH / 2 - 4 * canvasScale,
  );
  pop();

  // "Return to title" button
  push();
  translate(0, returnHovered ? -12 * canvasScale : 0);
  if (activeOtherBox)
    image(activeOtherBox, rightBtnX, buttonY, buttonW, buttonH);
  fill(activeTextColor);
  noStroke();
  text(
    "RETURN TO TITLE",
    rightBtnX + buttonW / 2,
    buttonY + buttonH / 2 - 4 * canvasScale,
  );
  pop();

  if (stayHovered || returnHovered) cursor(HAND);
  else cursor("default");
}

// Tracks which end-screen button (if any) is hovered and plays the hover
// sound on change. Shared by mouseMoved's storyEnding and rain_ending/
// showESCOverlay branches.
function updateEndScreenHoverSound(buttons) {
  const { buttonW, buttonH, buttonY, leftBtnX, rightBtnX } = buttons;
  const nowHovered =
    mouseX > leftBtnX &&
    mouseX < leftBtnX + buttonW &&
    mouseY > buttonY &&
    mouseY < buttonY + buttonH
      ? "stay"
      : mouseX > rightBtnX &&
          mouseX < rightBtnX + buttonW &&
          mouseY > buttonY &&
          mouseY < buttonY + buttonH
        ? "return"
        : null;
  if (nowHovered !== lastESCHoveredButton) {
    lastESCHoveredButton = nowHovered;
    if (nowHovered && assets.hoverSound) {
      assets.hoverSound.setVolume(0.2);
      assets.hoverSound.play();
    }
  }
}

function drawStoryEndingMode(currentTime) {
  // Draw section 2 rain background
  const endBg =
    gardenAssets.section2RainBackground || gardenAssets.section2Background;
  if (endBg) image(endBg, 0, 0, width, height);

  // Draw section 2 rain plants
  for (let plant of gardenState.section2Plants) {
    const sprite = plant.rainSprite || plant.wateredSprite;
    if (sprite) {
      let frame = sprite.getCurrentFrame();
      if (frame) image(frame, plant.x, plant.y, plant.width, plant.height);
    }
  }

  // Draw shell rain sprite
  const endShell = gardenState.shell.rainSprite || gardenState.shell.sprite;
  if (endShell) {
    let shellFrame = endShell.getCurrentFrame();
    if (shellFrame)
      image(
        shellFrame,
        gardenState.shell.x,
        gardenState.shell.y,
        gardenState.shell.width,
        gardenState.shell.height,
      );
  }

  // Draw rain
  if (isRaining) drawRainParticles();

  // Fade to title when triggered
  if (fades.toTitleFromEnding.fading) {
    const elapsed = currentTime - fades.toTitleFromEnding.startTime;
    const progress = Math.min(elapsed / fades.toTitleFromEnding.duration, 1);
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
    return;
  }

  // Semi-transparent dark overlay
  push();
  fill(0, 0, 0, 90);
  noStroke();
  rect(0, 0, width, height);
  pop();

  drawEndScreenButtons(getEndScreenButtons());
}

function drawESCOverlay() {
  // Same layout as the story ending screen buttons
  push();
  fill(0, 0, 0, 90);
  noStroke();
  rect(0, 0, width, height);
  pop();

  drawEndScreenButtons(getEndScreenButtons());
}

// ========================
// STORY TRANSITION SCREEN
// ========================

function drawStoryTransitionScreen(currentTime) {
  // Draw name input screen background (same dark color)
  background(39, 30, 50); // #271e32

  // Draw main text with typewriter effect
  textFont(assets.myFont);
  textSize(32 * canvasScale);
  textAlign(CENTER, CENTER);
  fill(255, 253, 191); // Light cream color

  // Calculate typewriter progress with slower speed for story transition
  let elapsedTime = currentTime - storyTransition.startTime;
  let charsToShow = Math.floor(elapsedTime / storyTransitionTypewriterSpeed);

  // Combine the two lines
  let fullText = playerName + "...!\nThis path leads to a familiar place...";
  let allChars = fullText.length;

  // Show typewriter effect
  if (charsToShow >= allChars) {
    storyTransition.finished = true;
    // Auto-advance to intro after duration
    if (elapsedTime >= storyTransition.duration) {
      gameMode = "intro";
      currentSection = 2;
      fades.toIntro.fading = true;
      fades.toIntro.startTime = currentTime;
      introPhase = "none";
      introPhaseStartTime = currentTime + fades.toIntro.duration;
      introStarted = false;

      // Reset intro sprites
      gardenState.tonyStartSprite.reset();
      gardenState.tonySurprisedSprite.reset();
      gardenState.tonyStartIdleSprite.reset();

      // Hide panel-3 when entering intro
      document.body.classList.remove("nameInput-active");
    }
  }

  // Show typed text
  let displayText = fullText.substring(0, charsToShow);
  text(displayText, width / 2, height / 2);

  // Draw fade in effect from name input
  if (fades.toStoryTransition.fading) {
    const elapsedFade = currentTime - fades.toStoryTransition.startTime;
    if (elapsedFade >= fades.toStoryTransition.duration) {
      fades.toStoryTransition.fading = false; // Fade is complete
    } else {
      // Draw black overlay that fades out
      const fadeProgress = elapsedFade / fades.toStoryTransition.duration; // 0 to 1
      const fadeAlpha = (1 - fadeProgress) * 255; // Start opaque, fade to transparent
      fill(0, fadeAlpha);
      noStroke();
      rect(0, 0, width, height);
    }
  }

  // Allow clicking to skip to intro
  // (handled in mousePressed)
}

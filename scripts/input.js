// Input Handling - Keyboard & Mouse
"use strict";

// ========================
// INPUT HANDLING
// ========================

function keyPressed() {
  userStartAudio();

  // Debug shortcut: backtick jumps to cutscene 1 from any screen
  if (DEBUG_CUTSCENE && key === "`") {
    playerName = playerName || "Debug";
    fades.toCutscene.fading = false;
    isRaining = false;
    showESCOverlay = false;
    vnChoiceButtons = [];
    currentScene = 1100;
    gameMode = "cutscene";
    fades.toVNMode.startTime = millis();
    resetTypewriter();
    return false;
  }

  // Debug shortcut: ] jumps to ending VN (scene 2000) with rain from any screen
  if (DEBUG_ENDING && key === "]") {
    playerName = playerName || "Debug";
    fades.cutsceneToVN.fading = false;
    fades.toTitleFromEnding.fading = false;
    showESCOverlay = false;
    vnChoiceButtons = [];
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
    currentScene = 2000;
    gameMode = "vn";
    currentSection = 2;
    gardenState.backgroundImage =
      gardenAssets.section2RainBackground || gardenAssets.section2Background;
    fades.toVNMode.startTime = millis() - (fades.toVNMode.duration + 100);
    resetTypewriter();
    return false;
  }

  // Title screen - start game with any key
  if (gameMode === "title" && gameLoaded) {
    assets.clickSound.play();
    currentScene = 0;
    gameMode = "nameInput"; // Go to name input screen
    currentNameInput = "";
    fades.toNameInput.fading = true; // Start fade effect
    fades.toNameInput.startTime = millis();
    document.body.classList.add("nameInput-active"); // Show panel-3
    return false;
  }

  // Story transition screen - skip with Enter or Space
  if (gameMode === "storyTransition") {
    if (keyCode === ENTER || keyCode === 32) {
      // 32 is Space
      gameMode = "intro";
      currentSection = 2;
      fades.toIntro.fading = true;
      fades.toIntro.startTime = millis();
      introPhase = "none";
      introStarted = false;

      // Reset intro sprites
      gardenState.tonyStartSprite.reset();
      gardenState.tonySurprisedSprite.reset();
      gardenState.tonyStartIdleSprite.reset();

      // Hide panel-3 when entering intro
      document.body.classList.remove("nameInput-active");
      return false;
    }
  }

  // Name input screen - handle keyboard input
  if (gameMode === "nameInput") {
    // Enter to submit name (check FIRST before anything else)
    if (keyCode === ENTER) {
      if (
        currentNameInput.length > 0 &&
        currentNameInput.length <= NAME_MAX_LENGTH
      ) {
        assets.clickSound.play();
        assets.titleMusic.stop();
        playerName = currentNameInput;
        gameMode = "storyTransition";
        fades.toStoryTransition.fading = true;
        fades.toStoryTransition.startTime = millis();
        storyTransition.startTime = millis() + fades.toStoryTransition.duration; // Delay text start by fade duration
        storyTransition.finished = false;

        currentNameInput = "";
        selectedButtonIndex = 0; // Reset for next time
        // Keep panel-3 visible during story transition screen
      }
      return false;
    }
    // Backspace to delete
    if (keyCode === BACKSPACE) {
      currentNameInput = currentNameInput.slice(0, -1);
      return false;
    }
    // Block all control/special keys except arrow keys
    if (keyCode >= 16 && keyCode <= 20) return false; // Shift, Ctrl, Alt, Pause, CapsLock
    if (keyCode === 9) return false; // Tab
    if (keyCode >= 91 && keyCode <= 93) return false; // Windows keys, Menu
    if (keyCode >= 144 && keyCode <= 145) return false; // NumLock, ScrollLock
    // Arrow key navigation
    if (keyCode === LEFT_ARROW) {
      if (selectedButtonIndex === -1) selectedButtonIndex = 0;
      selectedButtonIndex =
        (selectedButtonIndex - 1 + nameInputButtons.length) %
        nameInputButtons.length;
      return false;
    }
    if (keyCode === RIGHT_ARROW) {
      if (selectedButtonIndex === -1) selectedButtonIndex = 0;
      selectedButtonIndex = (selectedButtonIndex + 1) % nameInputButtons.length;
      return false;
    }
    if (keyCode === UP_ARROW) {
      if (selectedButtonIndex === -1) selectedButtonIndex = 0;
      // Move up by LETTERS_PER_ROW buttons
      selectedButtonIndex =
        (selectedButtonIndex - LETTERS_PER_ROW + nameInputButtons.length) %
        nameInputButtons.length;
      return false;
    }
    if (keyCode === DOWN_ARROW) {
      if (selectedButtonIndex === -1) selectedButtonIndex = 0;
      // Move down by LETTERS_PER_ROW buttons
      selectedButtonIndex =
        (selectedButtonIndex + LETTERS_PER_ROW) % nameInputButtons.length;
      return false;
    }
    // Space to select current button (or add space if not navigating)
    if (key === " ") {
      if (selectedButtonIndex === -1) {
        // No button selected yet, just add space to name
        if (currentNameInput.length < NAME_MAX_LENGTH) {
          currentNameInput += " ";
        }
      } else {
        // Button is selected, trigger its action
        const button = nameInputButtons[selectedButtonIndex];
        if (button.label === "SPACE") {
          if (currentNameInput.length < NAME_MAX_LENGTH) {
            currentNameInput += " ";
          }
        } else if (button.label === "DELETE") {
          currentNameInput = currentNameInput.slice(0, -1);
        } else if (button.label === "DONE") {
          if (
            currentNameInput.length > 0 &&
            currentNameInput.length <= NAME_MAX_LENGTH
          ) {
            playerName = currentNameInput;
            gameMode = "garden";
            currentSection = 1;
            gardenState.tonyState.currentSprite =
              gardenState.tonyState.tonyIdleSprite;
            currentNameInput = "";
            selectedButtonIndex = 0; // Reset for next time
          }
        } else {
          // Letter button
          if (currentNameInput.length < NAME_MAX_LENGTH) {
            currentNameInput += button.label;
          }
        }
      }
      return false;
    }
    // Letter keys (A-Z) and lowercase for quick input
    if ((key >= "A" && key <= "Z") || (key >= "a" && key <= "z")) {
      if (currentNameInput.length < NAME_MAX_LENGTH) {
        currentNameInput += key.toUpperCase();
      }
      return false;
    }
    // Ignore all other keys (don't let them pass through)
    return false;
  }

  // Garden mode - no keyboard interaction yet
  if (gameMode === "garden") {
    return false;
  }

  // Story ending screen - block all key input while showing
  if (gameMode === "storyEnding") {
    return false;
  }

  // Rain ending - ESC toggles the "Return to title?" overlay
  if (gameMode === "rain_ending") {
    if (keyCode === ESCAPE) {
      showESCOverlay = !showESCOverlay;
      lastESCHoveredButton = null;
      if (assets.hoverSound) {
        assets.hoverSound.setVolume(0.2);
        assets.hoverSound.play();
      }
    }
    return false;
  }

  // VN / cutscene mode - input handling
  if (gameMode === "vn" || gameMode === "cutscene") {
    // Block all input while the pre-dialogue intro sequence is playing
    if (cutscenePreDialogueIndex >= 0) return false;
    // Safety check: ensure currentScene is valid
    if (!scenes[currentScene]) {
      return false;
    }

    // RULE 1: BLOCK ALL INPUT WHILE TYPEWRITER IS TYPING
    if (!typewriterFinished) {
      // ONLY exception: click to speed up typewriter (handled in mousePressed, not here)
      // For keyboard: block EVERYTHING
      return false;
    }

    // RULE 2: After typewriter finishes

    // If typewriter JUST finished this frame, block input
    if (typewriterJustFinishedThisFrame) {
      return false;
    }

    // Scene has choice buttons - ONLY accept choice keys (1, 2, 3, etc)
    if (scenes[currentScene].keys && scenes[currentScene].keys.length > 0) {
      // Only accept valid choice keys
      for (let i = 0; i < scenes[currentScene].keys.length; i++) {
        if (key === scenes[currentScene].keys[i]) {
          assets.conversationSound.play();
          handleVNChoice(i);
          return false;
        }
      }
      // Any other key is ignored (including ENTER/SPACE)
      return false;
    }

    // Scene has NO choices - only accept ENTER or SPACE to click Continue button
    if (keyCode === ENTER || keyCode === 32) {
      // ENTER or SPACE
      handleVNChoice(0);
      return false;
    }

    // All other keys are ignored
    return false;
  }

  return false;
}

function mousePressed() {
  userStartAudio();

  // Title screen - start game with click
  if (gameMode === "title" && gameLoaded) {
    assets.clickSound.play();
    currentScene = 0;
    gameMode = "nameInput"; // Go to name input screen
    currentNameInput = "";
    fades.toNameInput.fading = true; // Start fade effect
    fades.toNameInput.startTime = millis();
    document.body.classList.add("nameInput-active"); // Show panel-3
    return false;
  }

  // Name input screen - handle button clicks
  if (gameMode === "nameInput") {
    handleNameInputClick();
    return false;
  }

  // Story transition screen - click to skip to intro
  if (gameMode === "storyTransition") {
    gameMode = "intro";
    currentSection = 2;
    fades.toIntro.fading = true;
    fades.toIntro.startTime = millis();
    introPhase = "none";
    introPhaseStartTime = millis() + fades.toIntro.duration;
    introStarted = false;

    // Reset intro sprites
    gardenState.tonyStartSprite.reset();
    gardenState.tonySurprisedSprite.reset();
    gardenState.tonyStartIdleSprite.reset();

    // Hide panel-3 when entering intro
    document.body.classList.remove("nameInput-active");
    return false;
  }

  // Intro mode - check if clicked on Tony to start sequence or navigate sections
  if (gameMode === "intro") {
    // Allow section navigation with arrows before clicking Tony
    const navArrows = getNavArrowGeometry();

    // Check if clicked left arrow (go back one section)
    if (currentSection > 1 && isHoveringLeftArrow(navArrows)) {
      startSectionTransition(currentSection - 1);
      return false;
    }

    // Check if clicked right arrow (go forward one section)
    if (currentSection < 3 && isHoveringRightArrow(navArrows)) {
      startSectionTransition(currentSection + 1);
      return false;
    }

    // Check if clicked a plant before meeting Tony (show flavor text)
    for (let plant of cachedCurrentSectionPlants) {
      if (
        mouseX > plant.x &&
        mouseX < plant.x + plant.width &&
        mouseY > plant.y &&
        mouseY < plant.y + plant.height
      ) {
        flavorText = plantFlavor[plant.id];
        flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
        return false;
      }
    }

    // Check if clicked the shell before meeting Tony
    if (currentSection === 2) {
      const area = gardenState.shell;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        flavorText = plantFlavor[area.id];
        flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
        return false;
      }
    }

    // Empty plot click - flavor text
    if (currentSection === 3) {
      const area = gardenState.emptyPlot;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        flavorText = plantFlavor[area.id];
        flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
        return false;
      }
    }

    // Check if clicked on Tony to start sequence (ONLY in section 1 where she's drawn)
    if (introPhase === "none" && !introStarted && currentSection === 1) {
      // Check if click is on Tony (rough hitbox based on sprite bounds)
      // Tony is positioned at tonyX, tonyY with scale 0.6
      const tonyScale = 0.6;
      const tonyX = 1000 * canvasScale;
      const tonyY = 250 * canvasScale;

      let tonyFrame = gardenState.tonyStartSprite
        ? gardenState.tonyStartSprite.getCurrentFrame()
        : null;
      if (tonyFrame) {
        const tonyWidth = tonyFrame.width * tonyScale * canvasScale;
        const tonyHeight = tonyFrame.height * tonyScale * canvasScale;
        const baselineHeight = tonyFrame.height * tonyScale * canvasScale;
        const adjustedTonyY = tonyY + (baselineHeight - tonyHeight);

        // Check if click is within Tony's bounds
        if (
          mouseX > tonyX &&
          mouseX < tonyX + tonyWidth &&
          mouseY > adjustedTonyY &&
          mouseY < adjustedTonyY + tonyHeight
        ) {
          // Click detected on Tony - immediately go to surprised animation
          assets.tonyClickSound.play();
          introStarted = true;
          introPhase = "tony_surprised";
          introPhaseStartTime = millis();
          gardenState.tonySurprisedSprite.reset();
          tonySurprisedDuration =
            (sprites.tonySurprisedFrames.length / 6) * 1000;
          return false;
        }
      }
    }
    return false;
  }

  // Garden mode - check plant clicks and arrow navigation
  if (gameMode === "garden") {
    const navArrows = getNavArrowGeometry();

    // Check if clicked left arrow (go back one section)
    if (currentSection > 1 && isHoveringLeftArrow(navArrows)) {
      startSectionTransition(currentSection - 1);
      return false;
    }

    // Check if clicked right arrow (forward navigation)
    if (isHoveringRightArrow(navArrows)) {
      // Only navigate forward if we have a section beyond current
      if (currentSection < 3) {
        startSectionTransition(currentSection + 1);
      }
      return false;
    }

    // Check if player clicked a plant (only check plants in current section)
    let currentSectionPlants = getPlantsForSection(currentSection);
    for (let plant of currentSectionPlants) {
      if (
        mouseX > plant.x &&
        mouseX < plant.x + plant.width &&
        mouseY > plant.y &&
        mouseY < plant.y + plant.height
      ) {
        // Only trigger if plant hasn't been watered yet (or debug mode is on)
        if (!plant.watered || DEBUG_MODE) {
          waterPlant(plant.id);
        } else {
          flavorText = wateredFlavor[plant.id];
          flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
        }
        return false;
      }
    }

    // Check if player clicked the interactive area (in section 3)
    if (currentSection === 3) {
      const area = gardenState.emptyPlot;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        // Only allow conversation once (unless debug mode)
        if (!area.visited || DEBUG_MODE) {
          startInteractiveAreaConversation();
          area.visited = true;
        } else {
          flavorText = wateredFlavor[area.id];
          flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
        }
        return false;
      }
    }

    // Check if player clicked the shell interactive area (in section 2)
    if (currentSection === 2) {
      const area = gardenState.shell;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        // Shell can be clicked multiple times to trigger different conversations
        startShellConversation();
        return false;
      }
    }

    return false;
  }

  // VN / cutscene mode - click on choices or advance dialogue
  if (gameMode === "vn" || gameMode === "cutscene") {
    // Block all input while the pre-dialogue intro sequence is playing
    if (cutscenePreDialogueIndex >= 0) return false;
    // CRITICAL: Debounce clicks - prevent multiple mousePressed calls for same click
    const currentTime = millis();
    if (currentTime - lastClickTime < CLICK_COOLDOWN) {
      return false;
    }
    lastClickTime = currentTime;

    // Prevent processing multiple clicks in same frame
    if (clickProcessedThisFrame) {
      return false;
    }
    clickProcessedThisFrame = true;

    // Safety check: ensure currentScene is valid
    if (!scenes[currentScene]) {
      return false;
    }

    // CRITICAL: If typewriter is still typing, ONLY allow speeding it up
    // Block all progression (choices, advancing scenes) until text finishes
    if (!typewriterFinished) {
      // Use cachedDialogueOnly which already has player name substituted
      // This prevents character count mismatches when using [PLAYER_NAME] in dialogue
      let dialogueOnly = cachedDialogueOnly;
      // Fast-forward typewriter to the end
      typewriterStartTime = millis() - dialogueOnly.length * typewriterSpeed;
      typewriterFinished = true;
      // Mark that we just sped up - this blocks progression on NEXT click
      userJustSpedUpTypewriter = true;

      // Block everything else - no progression, no choices, nothing
      // Text is now visible, but next click is required to advance
      return false;
    }

    // TEXT IS NOW GUARANTEED TO BE FINISHED - safe to process input

    // Just reset the speedup flag - don't block based on it
    userJustSpedUpTypewriter = false;

    // Check if clicked on a button - ONLY allow clicks on actual buttons
    for (let button of vnChoiceButtons) {
      if (
        mouseX > button.x &&
        mouseX < button.x + button.width &&
        mouseY > button.y &&
        mouseY < button.y + button.height
      ) {
        if (scenes[currentScene].keys && scenes[currentScene].keys.length > 0) {
          assets.conversationSound.play();
        }
        handleVNChoice(button.index);
        return false;
      }
    }

    // Click was not on any button - ignore it
    return false;
  }

  // Story ending screen - two-button end screen
  if (gameMode === "storyEnding") {
    if (fades.toTitleFromEnding.fading) return false;

    const { buttonW, buttonH, buttonY, leftBtnX, rightBtnX } =
      getEndScreenButtons();

    // "Stay in the garden"
    if (
      mouseX > leftBtnX &&
      mouseX < leftBtnX + buttonW &&
      mouseY > buttonY &&
      mouseY < buttonY + buttonH
    ) {
      assets.clickSound.play();
      gameMode = "rain_ending";
      currentSection = 2;
      return false;
    }

    // "Return to title"
    if (
      mouseX > rightBtnX &&
      mouseX < rightBtnX + buttonW &&
      mouseY > buttonY &&
      mouseY < buttonY + buttonH
    ) {
      assets.returnSound.play();
      fades.toTitleFromEnding.fading = true;
      fades.toTitleFromEnding.startTime = millis();
      return false;
    }

    return false;
  }

  // Rain ending - allow section navigation; ESC overlay button clicks
  if (gameMode === "rain_ending") {
    if (showESCOverlay) {
      // Handle Stay/Return buttons (same layout as story ending screen)
      const { buttonW, buttonH, buttonY, leftBtnX, rightBtnX } =
        getEndScreenButtons();

      if (
        mouseX > leftBtnX &&
        mouseX < leftBtnX + buttonW &&
        mouseY > buttonY &&
        mouseY < buttonY + buttonH
      ) {
        // Stay in garden - close overlay
        assets.clickSound.play();
        showESCOverlay = false;
      } else if (
        mouseX > rightBtnX &&
        mouseX < rightBtnX + buttonW &&
        mouseY > buttonY &&
        mouseY < buttonY + buttonH
      ) {
        // Return to title - fade to title
        assets.returnSound.play();
        showESCOverlay = false;
        fades.toTitleFromEnding.fading = true;
        fades.toTitleFromEnding.startTime = millis();
      }
      return false;
    }

    // Plant clicks - show rain flavor text
    let rainSectionPlants = getPlantsForSection(currentSection);
    for (let plant of rainSectionPlants) {
      if (
        mouseX > plant.x &&
        mouseX < plant.x + plant.width &&
        mouseY > plant.y &&
        mouseY < plant.y + plant.height
      ) {
        flavorText = rainFlavor[plant.id];
        flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
        return false;
      }
    }

    // Shell click - flavor text
    if (currentSection === 2) {
      const area = gardenState.shell;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        flavorText = rainFlavor[area.id];
        flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
        return false;
      }
    }

    // Empty plot click - flavor text
    if (currentSection === 3) {
      const area = gardenState.emptyPlot;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        flavorText = rainFlavor[area.id];
        flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
        return false;
      }
    }

    // Allow section navigation via arrows
    const navArrows = getNavArrowGeometry();

    if (currentSection > 1 && isHoveringLeftArrow(navArrows)) {
      startSectionTransition(currentSection - 1);
      return false;
    }
    if (currentSection < 3 && isHoveringRightArrow(navArrows)) {
      startSectionTransition(currentSection + 1);
      return false;
    }

    return false;
  }

  return false;
}

function mouseMoved() {
  // In intro mode: handle all hover (Tony in section 1, plants/shell everywhere)
  if (gameMode === "intro") {
    if (introStarted) {
      isHoveringInteractiveArea = false;
      cursor("default");
      return false;
    }

    // Check Tony hover (section 1 only)
    if (currentSection === 1) {
      const tonyScale = 0.6;
      const tonyX = 1000 * canvasScale;
      const tonyY = 250 * canvasScale;
      let tonyFrame = gardenState.tonyStartSprite
        ? gardenState.tonyStartSprite.getCurrentFrame()
        : null;
      if (tonyFrame) {
        const tonyWidth = tonyFrame.width * tonyScale * canvasScale;
        const tonyHeight = tonyFrame.height * tonyScale * canvasScale;
        const adjustedTonyY =
          tonyY + (tonyFrame.height * tonyScale * canvasScale - tonyHeight);
        if (
          mouseX > tonyX &&
          mouseX < tonyX + tonyWidth &&
          mouseY > adjustedTonyY &&
          mouseY < adjustedTonyY + tonyHeight
        ) {
          isHoveringInteractiveArea = true;
          return false;
        }
      }
    }

    // Check plants in current section
    for (let plant of cachedCurrentSectionPlants) {
      if (
        mouseX > plant.x &&
        mouseX < plant.x + plant.width &&
        mouseY > plant.y &&
        mouseY < plant.y + plant.height
      ) {
        isHoveringInteractiveArea = true;
        return false;
      }
    }

    // Check shell in section 2
    if (currentSection === 2) {
      const area = gardenState.shell;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        isHoveringInteractiveArea = true;
        return false;
      }
    }

    // Check plot in section 3
    if (currentSection === 3) {
      const area = gardenState.emptyPlot;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        isHoveringInteractiveArea = true;
        return false;
      }
    }

    isHoveringInteractiveArea = false;
    cursor("default");
    return false;
  }

  // In rain_ending, hovering any plant or shell shows the question cursor
  if (gameMode === "rain_ending") {
    if (showESCOverlay) {
      isHoveringInteractiveArea = false;
      isHoveringPlant = false;
      updateEndScreenHoverSound(getEndScreenButtons());
      return false;
    }
    isHoveringInteractiveArea = false;
    isHoveringPlant = false;
    for (let plant of cachedCurrentSectionPlants) {
      if (
        mouseX > plant.x &&
        mouseX < plant.x + plant.width &&
        mouseY > plant.y &&
        mouseY < plant.y + plant.height
      ) {
        isHoveringInteractiveArea = true;
        return false;
      }
    }
    if (currentSection === 2) {
      const area = gardenState.shell;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        isHoveringInteractiveArea = true;
        return false;
      }
    }
    if (currentSection === 3) {
      const area = gardenState.emptyPlot;
      if (
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height
      ) {
        isHoveringInteractiveArea = true;
        return false;
      }
    }
    return false;
  }

  // Story ending screen button hover sound
  if (gameMode === "storyEnding") {
    updateEndScreenHoverSound(getEndScreenButtons());
    return false;
  }

  // Only check collision for cursor when in garden mode
  if (gameMode !== "garden") {
    return false;
  }

  // Check if mouse is over any un-watered plants in current section
  isHoveringPlant = false;
  isHoveringInteractiveArea = false;
  for (let plant of cachedCurrentSectionPlants) {
    if (
      mouseX > plant.x &&
      mouseX < plant.x + plant.width &&
      mouseY > plant.y &&
      mouseY < plant.y + plant.height
    ) {
      if (!plant.watered) {
        isHoveringPlant = true;
      } else {
        isHoveringInteractiveArea = true;
      }
      break;
    }
  }

  // If not hovering a plant, check section-specific interactive areas
  if (!isHoveringPlant && !isHoveringInteractiveArea) {
    if (currentSection === 3) {
      const area = gardenState.emptyPlot;
      isHoveringInteractiveArea =
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height;
    } else if (currentSection === 2) {
      const area = gardenState.shell;
      isHoveringInteractiveArea =
        mouseX > area.x &&
        mouseX < area.x + area.width &&
        mouseY > area.y &&
        mouseY < area.y + area.height;
    }
  }

  // Note: Don't set cursor here - let drawGardenMode() handle all cursor display
  // This allows the custom cursor sprite to be drawn properly

  return false;
}

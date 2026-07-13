// VN Dialogue State Machine (scene data lives in scenes.js)
"use strict";

function startPlantConversation(groupId) {
  // Mark that we should return to garden after conversation
  returnToGardenAfterVN = true;

  // Update background based on current section
  if (currentSection === 1) {
    gardenState.backgroundImage = gardenAssets.section1Background;
  } else if (currentSection === 2) {
    gardenState.backgroundImage = gardenAssets.section2Background;
  } else if (currentSection === 3) {
    gardenState.backgroundImage = gardenAssets.section3Background;
  }

  // Start the appropriate conversation based on group
  if (groupId === "herbs") {
    currentScene = 0;
  } else if (groupId === "flowers") {
    currentScene = 100;
  } else if (groupId === "wildpatch") {
    currentScene = 200;
  } else if (groupId === "tomatoes") {
    currentScene = 400;
  } else if (groupId === "seedling") {
    currentScene = 500;
  }

  // Reset cursor state for clean VN mode transition
  isHoveringPlant = false;
  cursor("default");

  gameMode = "transitioning"; // Temporary mode to show watered plants
}

function startInteractiveAreaConversation() {
  // Mark that we should return to garden after conversation
  returnToGardenAfterVN = true;

  // Set background to section 3
  gardenState.backgroundImage = gardenAssets.section3Background;

  // Start the interactive area conversation (scene 600)
  currentScene = 600;

  // Reset cursor state for clean VN mode transition
  isHoveringInteractiveArea = false;
  cursor("default");

  // Enter VN mode directly (no action animation needed)
  fades.toVNMode.startTime = millis();
  gameMode = "vn";
  resetTypewriter();
  lastClickTime = 0; // Reset click cooldown when entering VN mode
}

function startShellConversation() {
  // Mark that we should return to garden after conversation
  returnToGardenAfterVN = true;

  // Set background to section 2
  gardenState.backgroundImage = gardenAssets.section2Background;

  // Check game state to determine which conversation branch
  const allPlantsWatered = checkAllPlantsWatered();
  const emptyPlotVisited = gardenState.emptyPlot.visited;

  // Determine starting scene based on player progress
  if (allPlantsWatered && emptyPlotVisited) {
    // All plants watered and plot visited - player is in post-game phase
    if (!gardenState.shell.earlyConversationTriggered) {
      // Never talked to shell before watering all plants - new opening dialogue
      currentScene = 805;
      gardenState.shell.endGameConversationStarted = true;
    } else if (!gardenState.shell.endGameConversationStarted) {
      // Talked to shell early, now ready to discuss it post-game
      currentScene = 800;
      gardenState.shell.endGameConversationStarted = true;
    } else {
      // Already started post-game conversation, continue to shell story
      currentScene = 830;
    }
  } else {
    // Early shell conversation (before watering all plants)
    currentScene = 700;
    gardenState.shell.earlyConversationTriggered = true;
  }

  // Reset cursor state for clean VN mode transition
  isHoveringInteractiveArea = false;
  cursor("default");

  // Enter VN mode directly (no action animation needed)
  fades.toVNMode.startTime = millis();
  gameMode = "vn";
  resetTypewriter();
  lastClickTime = 0; // Reset click cooldown when entering VN mode
}

function handleVNChoice(choiceIndex) {
  if (!scenes[currentScene]) {
    return;
  }

  // Check if this is an ending scene
  if (scenes[currentScene].isEndingScene) {
    if (scenes[currentScene].startsCutscene) {
      // Fade to black then enter cutscene mode
      fades.toCutscene.targetScene =
        scenes[currentScene].cutsceneTarget || 1100;
      fades.toCutscene.fading = true;
      fades.toCutscene.startTime = millis();
    } else if (scenes[currentScene].endsToVNBrief) {
      // Cutscene → brief VN interlude (no rain), then back to cutscene
      fades.cutsceneToVNBrief.targetScene =
        scenes[currentScene].cutsceneToVNBriefTarget || 1350;
      fades.cutsceneToVNBrief.fading = true;
      fades.cutsceneToVNBrief.startTime = millis();
    } else if (scenes[currentScene].endsToVN) {
      // Cutscene ends - fade to black then enter VN with rain
      fades.cutsceneToVN.targetScene =
        scenes[currentScene].cutsceneToVNTarget || 2000;
      fades.cutsceneToVN.fading = true;
      fades.cutsceneToVN.startTime = millis();
    } else if (scenes[currentScene].isStoryEnding) {
      // Final VN dialogue done - show the two-button end screen
      vnChoiceButtons = [];
      gameMode = "storyEnding";
    } else {
      // Regular ending scenes return to garden
      returnToGardenAfterVN = false;
      gameMode = "garden";
      // Reset Tony's idle sprite when returning from VN
      gardenState.tonyState.currentSprite =
        gardenState.tonyState.tonyIdleSprite;
      gardenState.tonyState.tonyIdleSprite.reset();
      // Reset cursor state when returning to garden
      isHoveringPlant = false;
      cursor("default");
    }
    return;
  }

  let nextScene;

  // If scene has no keys (linear "Continue" button), advance to nextPages[0] or next scene
  if (!scenes[currentScene].keys || scenes[currentScene].keys.length === 0) {
    if (
      scenes[currentScene].nextPages &&
      scenes[currentScene].nextPages.length > 0
    ) {
      nextScene = scenes[currentScene].nextPages[0];
    } else {
      // Auto-advance to next scene if no nextPages defined
      nextScene = currentScene + 1;
    }
  } else {
    // Scene has choices, use the choice index to determine next scene
    if (!scenes[currentScene].nextPages) {
      return;
    }
    nextScene = scenes[currentScene].nextPages[choiceIndex];
  }

  // Bounds check before advancing to next scene
  if (!(nextScene in scenes)) {
    return;
  }

  currentScene = nextScene;
  resetTypewriter();

  // Check if conversation ended - return to garden if needed
  if (returnToGardenAfterVN && currentScene === 1) {
    // Exit button clicked - go back to garden
    returnToGardenAfterVN = false;
    gameMode = "garden";
    // Reset cursor state when returning to garden
    isHoveringPlant = false;
    cursor("default");
    // Garden state persists from before
  }
}

function resetTypewriter() {
  typewriterStartTime = millis();
  typewriterFinished = false;
  typewriterJustFinishedThisFrame = false; // Reset the frame-based finish flag for new scene
  userJustSpedUpTypewriter = false; // Reset speedup flag for new scene
  lastCachedTypewriterChars = -1; // Reset cache tracker for new scene

  // Cache dialogue text parsing to avoid re-parsing every frame
  if (scenes[currentScene]) {
    // Substitute playerName into dialogue text at display time
    cachedDialogueText = scenes[currentScene].text.replace(
      /\[PLAYER_NAME\]/g,
      playerName,
    );
    let allLines = cachedDialogueText.split("\n");
    let dialogueLines = [];
    cachedChoiceLines = [];
    cachedChoiceSet.clear(); // Clear previous choices

    for (let line of allLines) {
      // Only treat as choice if it matches pattern [1], [2], [3], etc.
      if (line.match(/^\s*\[\d+\]/)) {
        cachedChoiceLines.push(line);
        cachedChoiceSet.add(line); // Add to Set for O(1) lookup
      } else {
        dialogueLines.push(line);
      }
    }
    cachedDialogueOnly = dialogueLines.join("\n");
  }
}

function updateChoiceAreasWithYPositions(
  dialogX,
  dialogY,
  dialogWidth,
  dialogHeight,
  dialogueText,
) {
  vnChoiceButtons = [];

  if (!scenes[currentScene]) {
    return;
  }

  // Split full dialogue to track Y positions correctly
  let lines = dialogueText.split("\n");
  let yPos = dialogY + 30 * canvasScale;
  const lineHeight = 28 * canvasScale;
  const maxTextWidth = dialogWidth - 60 * canvasScale;

  // Iterate through all lines and create buttons for choice lines and Continue lines
  for (let line of lines) {
    let isClickable = false;
    let buttonIndex = 0;

    // Check if this line is a choice (only if scene has choices)
    if (
      scenes[currentScene].keys &&
      scenes[currentScene].keys.length > 0 &&
      cachedChoiceSet.has(line)
    ) {
      isClickable = true;
      buttonIndex = cachedChoiceLines.indexOf(line);
    }
    // Check if this line is the Continue text for linear scenes
    else if (
      line === "> Continue" &&
      (!scenes[currentScene].keys || scenes[currentScene].keys.length === 0)
    ) {
      isClickable = true;
      buttonIndex = 0;
    }

    if (isClickable) {
      const startX = dialogX + 30 * canvasScale;
      const width = Math.min(textWidth(line), maxTextWidth);

      const button = {
        x: startX,
        y: yPos,
        width: width,
        height: lineHeight,
        index: buttonIndex,
        key:
          line === "> Continue" ? null : scenes[currentScene].keys[buttonIndex],
        text: line,
        isHovered: false,
      };

      // Check if mouse is over this button
      if (
        mouseX > button.x &&
        mouseX < button.x + button.width &&
        mouseY > button.y &&
        mouseY < button.y + button.height
      ) {
        button.isHovered = true;
      }

      vnChoiceButtons.push(button);
    }

    yPos += lineHeight;
  }

  // Play hover sound when mouse enters a new choice (not Continue)
  const nowHovered = vnChoiceButtons.find((b) => b.isHovered && b.key !== null);
  const nowHoveredText = nowHovered ? nowHovered.text : null;
  if (nowHoveredText !== lastHoveredChoiceText) {
    lastHoveredChoiceText = nowHoveredText;
    if (nowHoveredText && assets.hoverSound) {
      assets.hoverSound.setVolume(0.2);
      assets.hoverSound.play();
    }
  }
}

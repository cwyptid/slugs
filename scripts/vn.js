// VN & Cutscene Mode Rendering
"use strict";

// ========================
// SHARED VN / CUTSCENE HELPERS
// ========================

// Advances the typewriter reveal by currentTime and returns the text to
// display this frame. Shared by drawVNMode and drawCutsceneMode, whose
// typewriter logic was previously duplicated byte-for-byte.
function advanceTypewriter(currentTime) {
  typewriterJustFinishedThisFrame = false;
  let rawElapsedTime = currentTime - typewriterStartTime;
  let charsToShow = Math.floor(rawElapsedTime / typewriterSpeed);

  if (
    cachedDialogueOnly &&
    cachedDialogueOnly.length > 0 &&
    charsToShow >= cachedDialogueOnly.length
  ) {
    if (!typewriterFinished) {
      typewriterJustFinishedThisFrame = true;
    }
    typewriterFinished = true;
    if (lastCachedTypewriterChars !== cachedDialogueOnly.length) {
      let fullText = cachedDialogueOnly;
      if (cachedChoiceLines.length > 0) {
        fullText += "\n" + cachedChoiceLines.join("\n");
      } else if (
        !scenes[currentScene].keys ||
        scenes[currentScene].keys.length === 0
      ) {
        fullText += "\n> Continue";
      }
      cachedFullDialogueWithChoices = fullText;
      lastCachedTypewriterChars = cachedDialogueOnly.length;
    }
    return cachedFullDialogueWithChoices;
  }
  return cachedDialogueOnly.substring(0, charsToShow);
}

// Draws dialogueText line-by-line with choice/Continue hover highlighting.
// useRainColors is passed explicitly rather than read from the global
// isRaining flag: during cutscenes 6-9 the rain-colored UI (cutsceneRainMode,
// based on currentScene) is active well before isRaining itself flips true,
// so the two signals aren't interchangeable.
function drawDialogueLines(
  dialogX,
  dialogY,
  dialogWidth,
  dialogueText,
  useRainColors,
) {
  let lines = dialogueText.split("\n");
  let yPos = dialogY + 30 * canvasScale;
  const lineHeight = 28 * canvasScale;

  let hoveredButtonTexts = new Set();
  for (let button of vnChoiceButtons) {
    if (button.isHovered) hoveredButtonTexts.add(button.text);
  }

  for (let line of lines) {
    let isHovered = hoveredButtonTexts.has(line);
    if (isHovered) {
      fill(useRainColors ? color(152, 77, 123) : color(40, 148, 102));
    } else {
      fill(useRainColors ? color(30, 25, 83) : color(74, 42, 60));
    }
    text(
      line,
      dialogX + 30 * canvasScale,
      yPos,
      dialogWidth - 60 * canvasScale,
    );
    yPos += lineHeight;
  }
}

// ========================
// VN MODE
// ========================

function drawVNMode(currentTime) {
  // Start shell_story fading in at scene 830 (shell conversation)
  if (
    currentScene >= 830 &&
    currentScene < 1000 &&
    assets.shellStory &&
    !assets.shellStory.isPlaying()
  ) {
    if (assets.mainTune && assets.mainTune.isPlaying()) {
      assets.mainTune.setVolume(0, 1.5);
      setTimeout(() => {
        if (assets.mainTune.isPlaying()) assets.mainTune.stop();
      }, 1600);
    }
    assets.shellStory.setVolume(0);
    assets.shellStory.loop();
    setTimeout(() => {
      assets.shellStory.setVolume(0.15, 1.5);
    }, 2500);
  }

  // Draw garden background (rain variant if raining)
  let vnBg = gardenState.backgroundImage;
  if (isRaining) {
    if (currentSection === 1) vnBg = gardenAssets.section1RainBackground;
    else if (currentSection === 2) vnBg = gardenAssets.section2RainBackground;
    else if (currentSection === 3) vnBg = gardenAssets.section3RainBackground;
  }
  if (vnBg) image(vnBg, 0, 0, width, height);

  // Draw all plants with sprite animations so they're visible behind the VN UI
  let currentSectionPlants = cachedCurrentSectionPlants;
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
    const shellSprite = isRaining
      ? gardenState.shell.rainSprite
      : gardenState.shell.sprite;
    if (shellSprite) {
      let shellFrame = shellSprite.getCurrentFrame();
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

  // Draw Tony's overworld sprite fading out when entering VN mode
  const tonyScale = 0.6;
  let tonyX, tonyY;
  if (currentSection === 1) {
    tonyX = 1000 * canvasScale;
    tonyY = 250 * canvasScale;
  } else if (currentSection === 2) {
    tonyX = 50 * canvasScale;
    tonyY = 250 * canvasScale;
  } else if (currentSection === 3) {
    tonyX = 0 * canvasScale;
    tonyY = 150 * canvasScale;
  }

  // Use tonyStartIdleSprite during intro VN fade, otherwise use current sprite
  let fadeSprite = toIntroVN
    ? gardenState.tonyStartIdleSprite
    : gardenState.tonyState.currentSprite;
  let tonyFadeFrame = fadeSprite ? fadeSprite.getCurrentFrame() : null;

  if (tonyFadeFrame) {
    const tonyWidth = tonyFadeFrame.width * tonyScale * canvasScale;
    const tonyHeight = tonyFadeFrame.height * tonyScale * canvasScale;

    let baselineHeight = gardenState.tonyStartSprite
      ? gardenState.tonyStartSprite.getCurrentFrame().height *
        tonyScale *
        canvasScale
      : tonyHeight;

    const adjustedTonyY = tonyY + (baselineHeight - tonyHeight);

    // Calculate fade based on VN entry time
    const elapsed = currentTime - fades.toVNMode.startTime;
    const fadeDuration = fades.toVNMode.duration;
    let tonyAlpha = 255;
    if (elapsed < fadeDuration) {
      const progress = elapsed / fadeDuration;
      tonyAlpha = (1 - progress) * 255; // Fade out
    } else {
      tonyAlpha = 0;
    }

    push();
    tint(255, tonyAlpha);

    // Flip horizontally in section 2
    if (currentSection === 2) {
      translate(tonyX + tonyWidth / 2, adjustedTonyY);
      scale(-1, 1);
      image(tonyFadeFrame, -tonyWidth / 2, 0, tonyWidth, tonyHeight);
    } else {
      image(tonyFadeFrame, tonyX, adjustedTonyY, tonyWidth, tonyHeight);
    }

    pop();
  }

  // Draw rain particles before the dark overlay (so rain is visible but behind UI)
  if (isRaining) drawRainParticles();

  // Only draw VN if we have a valid scene
  if (!scenes[currentScene]) {
    return;
  }

  // Draw portrait (left side) - 400x500px at bottom using Tony smile sprite
  const portraitWidth = 400 * canvasScale;
  const portraitHeight = 500 * canvasScale;
  const portraitX = 20 * canvasScale;
  let portraitY = height - portraitHeight;
  let portraitAlpha = 255;
  let overlayAlpha = 80;

  // Animate entry: fade in + slide up (subtle)
  const fadeInDuration = fades.toVNMode.duration;
  if (currentTime - fades.toVNMode.startTime < fadeInDuration) {
    const progress = (currentTime - fades.toVNMode.startTime) / fadeInDuration;
    // Slide up from 40px below (subtle)
    portraitY += (1 - progress) * 40 * canvasScale;
    // Fade in (slower, more subtle)
    portraitAlpha = Math.pow(progress, 1.5) * 255;
    // Overlay fades in at same time
    overlayAlpha = Math.pow(progress, 1.5) * 80;
  }

  // Draw semi-transparent overlay on top of garden (but behind UI)
  push();
  fill(0, 0, 0, overlayAlpha);
  rect(0, 0, width, height);
  pop();

  // Use the portrait sprite from the current scene
  // Default to smiling portrait if not specified
  if (scenes[currentScene] && scenes[currentScene].image) {
    portraitSprite = scenes[currentScene].image;
  }
  let tonyFrame = portraitSprite.getCurrentFrame();

  push();
  tint(255, portraitAlpha);
  if (tonyFrame) {
    image(tonyFrame, portraitX, portraitY, portraitWidth, portraitHeight);
  }
  pop();

  // Draw dialogue box (right side, bottom)
  const dialogX = 420 * canvasScale;
  const dialogY = height - 175 * canvasScale;

  // Draw textbox.png at its natural size without stretching
  let textboxImg =
    isRaining && gardenAssets.textboxRain
      ? gardenAssets.textboxRain
      : gardenAssets.textbox;
  let textboxWidth = textboxImg.width * canvasScale;
  let textboxHeight = textboxImg.height * canvasScale;

  // Calculate textbox fade-in
  let textboxAlpha = 255;
  const textboxFadeDuration = textboxFadeInDuration;
  const textboxElapsed = currentTime - fades.toVNMode.startTime;
  if (textboxElapsed < textboxFadeDuration) {
    const textboxProgress = textboxElapsed / textboxFadeDuration;
    textboxAlpha = Math.pow(textboxProgress, 1.5) * 255; // Match portrait fade curve
  }

  push();
  tint(255, textboxAlpha);
  image(textboxImg, dialogX, dialogY, textboxWidth, textboxHeight);
  pop();

  // For text rendering, use the textbox dimensions
  const dialogWidth = textboxWidth;
  const dialogHeight = textboxHeight;

  // Draw dialogue text (including choices)
  textSize(20 * canvasScale);
  textAlign(LEFT, TOP);
  textFont(assets.myFont);

  let dialogueText = advanceTypewriter(currentTime);
  if (typewriterFinished) toIntroVN = false; // Clear intro-VN fade flag once text is fully shown

  // Create clickable choice areas (rebuild when typewriter finishes, clear when typing)
  if (typewriterFinished) {
    updateChoiceAreasWithYPositions(
      dialogX,
      dialogY,
      dialogWidth,
      dialogHeight,
      dialogueText,
    );
  } else {
    vnChoiceButtons = [];
  }

  // Draw text with hover highlighting for choices
  textWrap(WORD);
  push();
  drawDialogueLines(dialogX, dialogY, dialogWidth, dialogueText, isRaining);
  pop();

  // Reset cursor to default in VN mode (not hovering any interactive elements)
  cursor("default");

  // Fade to black before entering cutscene mode
  if (fades.toCutscene.fading) {
    const elapsed = currentTime - fades.toCutscene.startTime;
    const progress = Math.min(elapsed / fades.toCutscene.duration, 1);
    push();
    fill(0, 0, 0, progress * 255);
    noStroke();
    rect(0, 0, width, height);
    pop();
    if (progress >= 1) {
      fades.toCutscene.fading = false;
      returnToGardenAfterVN = false;
      currentScene = fades.toCutscene.targetScene;
      gameMode = "cutscene";
      if (assets.mainTune && assets.mainTune.isPlaying()) {
        assets.mainTune.setVolume(0, 3);
        setTimeout(() => {
          if (assets.mainTune.isPlaying()) assets.mainTune.stop();
        }, 3100);
      }
      fades.toVNMode.startTime = millis();
      if (fades.toCutscene.targetScene === 1100) skipCutsceneTextboxFade = true;
      // Start pre-dialogue intro sequence if this cutscene has one
      if (
        scenes[currentScene] &&
        scenes[currentScene].cutscenePreDialogueSequence
      ) {
        cutscenePreDialogueSequence =
          scenes[currentScene].cutscenePreDialogueSequence;
        cutscenePreDialogueIndex = 0;
        cutscenePreDialogueSequence[0].reset();
        // Don't call resetTypewriter yet - it fires when the sequence finishes
      } else {
        cutscenePreDialogueSequence = [];
        cutscenePreDialogueIndex = -1;
        resetTypewriter();
      }
    }
  }
}

// ========================
// CUTSCENE MODE
// ========================

function drawCutsceneMode(currentTime) {
  if (!scenes[currentScene]) return;

  // Switch side panels to rain variant starting at cutscene 6 (scene 1505)
  if (
    currentScene >= 1505 &&
    !document.body.classList.contains("rain-active")
  ) {
    document.body.classList.add("rain-active");
  }

  // Start rain audio loop at cutscene 8 (scene 1600)
  if (
    currentScene >= 1600 &&
    assets.rainSound &&
    !assets.rainSound.isPlaying()
  ) {
    assets.rainSound.setVolume(0.4);
    assets.rainSound.loop();
  }

  // Fade in from black at the very start of a cutscene
  const fadeInDuration = 600;
  const fadeElapsed = currentTime - fades.toVNMode.startTime;
  const fadeInAlpha =
    fadeElapsed < fadeInDuration ? (1 - fadeElapsed / fadeInDuration) * 255 : 0;

  const cutsceneRainMode = currentScene >= 1505;

  // ── PRE-DIALOGUE INTRO SEQUENCE ──────────────────────────────────────────
  if (cutscenePreDialogueIndex >= 0 && cutscenePreDialogueSequence.length > 0) {
    const activeSprite = cutscenePreDialogueSequence[cutscenePreDialogueIndex];
    let frame = activeSprite.getCurrentFrame();
    if (frame) image(frame, 0, 0, width, height);

    // Advance when the current one-shot finishes
    if (activeSprite.hasFinished) {
      cutscenePreDialogueIndex++;
      if (cutscenePreDialogueIndex >= cutscenePreDialogueSequence.length) {
        // Sequence done — start looping dialogue sprite and typewriter
        cutscenePreDialogueIndex = -1;
        cutscenePreDialogueSequence = [];
        if (scenes[currentScene].cutsceneSprite) {
          scenes[currentScene].cutsceneSprite.reset();
        }
        resetTypewriter();
      } else {
        cutscenePreDialogueSequence[cutscenePreDialogueIndex].reset();
      }
    }

    // Draw textbox immediately (empty, no text) during intro sequence
    if (skipCutsceneTextboxFade) {
      let tbImg =
        cutsceneRainMode && gardenAssets.textboxRain
          ? gardenAssets.textboxRain
          : gardenAssets.textbox;
      let tbW = tbImg.width * canvasScale;
      let tbH = tbImg.height * canvasScale;
      let tbX = (width - tbW) / 2;
      let tbY = height - tbH - 20 * canvasScale;
      push();
      tint(255, 255);
      image(tbImg, tbX, tbY, tbW, tbH);
      pop();
    }

    // Draw fade-in overlay on top of intro frames (and textbox)
    if (fadeInAlpha > 0) {
      push();
      fill(0, 0, 0, fadeInAlpha);
      noStroke();
      rect(0, 0, width, height);
      pop();
    }
    return;
  }

  // ── DIALOGUE PHASE ───────────────────────────────────────────────────────

  // Draw full-screen looping cutscene sprite
  if (scenes[currentScene].cutsceneSprite) {
    let frame = scenes[currentScene].cutsceneSprite.getCurrentFrame();
    if (frame) image(frame, 0, 0, width, height);
  } else {
    background(0);
  }

  // Draw centered textbox
  let textboxImg =
    cutsceneRainMode && gardenAssets.textboxRain
      ? gardenAssets.textboxRain
      : gardenAssets.textbox;
  let textboxWidth = textboxImg.width * canvasScale;
  let textboxHeight = textboxImg.height * canvasScale;
  let dialogX = (width - textboxWidth) / 2;
  let dialogY = height - textboxHeight - 20 * canvasScale;

  if (skipCutsceneTextboxFade && fadeElapsed >= fadeInDuration)
    skipCutsceneTextboxFade = false;
  let textboxAlpha = skipCutsceneTextboxFade
    ? 255
    : fadeElapsed < fadeInDuration
      ? (fadeElapsed / fadeInDuration) * 255
      : 255;

  push();
  tint(255, textboxAlpha);
  image(textboxImg, dialogX, dialogY, textboxWidth, textboxHeight);
  pop();

  const dialogWidth = textboxWidth;

  // Typewriter logic
  let dialogueText = advanceTypewriter(currentTime);

  if (typewriterFinished) {
    updateChoiceAreasWithYPositions(
      dialogX,
      dialogY,
      dialogWidth,
      textboxHeight,
      dialogueText,
    );
  } else {
    vnChoiceButtons = [];
  }

  // Draw text
  textSize(20 * canvasScale);
  textAlign(LEFT, TOP);
  textFont(assets.myFont);
  textWrap(WORD);

  push();
  drawDialogueLines(
    dialogX,
    dialogY,
    dialogWidth,
    dialogueText,
    cutsceneRainMode,
  );
  pop();

  cursor("default");

  // Fade-in overlay (from black at cutscene start)
  if (fadeInAlpha > 0) {
    push();
    fill(0, 0, 0, fadeInAlpha);
    noStroke();
    rect(0, 0, width, height);
    pop();
  }

  // Cutscene 6 ends — fade to black then enter ending VN with rain
  if (fades.cutsceneToVN.fading) {
    const elapsed = currentTime - fades.cutsceneToVN.startTime;
    const progress = Math.min(elapsed / fades.cutsceneToVN.duration, 1);
    push();
    fill(0, 0, 0, progress * 255);
    noStroke();
    rect(0, 0, width, height);
    pop();
    // Switch panels when screen is dark enough that the change isn't visible
    if (progress >= 0.85 && !document.body.classList.contains("rain-active")) {
      document.body.classList.add("rain-active");
    }
    if (progress >= 1) {
      fades.cutsceneToVN.fading = false;
      isRaining = true;
      initRainParticles();
      if (assets.shellStory && assets.shellStory.isPlaying()) {
        assets.shellStory.setVolume(0, 2);
        setTimeout(() => {
          if (assets.shellStory.isPlaying()) assets.shellStory.stop();
        }, 2100);
      }
      currentScene = fades.cutsceneToVN.targetScene;
      gameMode = "vn";
      returnToGardenAfterVN = false;
      currentSection = 2;
      gardenState.backgroundImage =
        gardenAssets.section2RainBackground || gardenAssets.section2Background;
      fades.toVNMode.startTime = millis() - (fades.toVNMode.duration + 100); // Skip Tony fade-in, appear immediately
      resetTypewriter();
      lastClickTime = 0;
    }
  }

  // Cutscene → brief VN interlude transition (no rain)
  if (fades.cutsceneToVNBrief.fading) {
    const elapsed = currentTime - fades.cutsceneToVNBrief.startTime;
    const progress = Math.min(elapsed / fades.cutsceneToVNBrief.duration, 1);
    push();
    fill(0, 0, 0, progress * 255);
    noStroke();
    rect(0, 0, width, height);
    pop();
    if (progress >= 1) {
      fades.cutsceneToVNBrief.fading = false;
      currentScene = fades.cutsceneToVNBrief.targetScene;
      gameMode = "vn";
      returnToGardenAfterVN = false;
      currentSection = 2;
      gardenState.backgroundImage = gardenAssets.section2Background;
      fades.toVNMode.startTime = millis() - (fades.toVNMode.duration + 100); // Skip Tony fade-in, appear immediately
      resetTypewriter();
      lastClickTime = 0;
    }
  }

  // Cutscene-to-cutscene transition — fade to black then load next cutscene
  if (fades.toCutscene.fading) {
    const elapsed = currentTime - fades.toCutscene.startTime;
    const progress = Math.min(elapsed / fades.toCutscene.duration, 1);
    push();
    fill(0, 0, 0, progress * 255);
    noStroke();
    rect(0, 0, width, height);
    pop();
    if (progress >= 1) {
      fades.toCutscene.fading = false;
      currentScene = fades.toCutscene.targetScene;
      fades.toVNMode.startTime = millis();
      if (
        fades.toCutscene.targetScene === 1115 ||
        fades.toCutscene.targetScene === 1200
      )
        skipCutsceneTextboxFade = true;
      if (
        scenes[currentScene] &&
        scenes[currentScene].cutscenePreDialogueSequence
      ) {
        cutscenePreDialogueSequence =
          scenes[currentScene].cutscenePreDialogueSequence;
        cutscenePreDialogueIndex = 0;
        cutscenePreDialogueSequence[0].reset();
      } else {
        cutscenePreDialogueSequence = [];
        cutscenePreDialogueIndex = -1;
        resetTypewriter();
      }
    }
  }
}

// Sprite & Character Initialization

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

    // Tracks ms and increments according to frameRate
    // Once gets to the end of the array of frames, decides to loop or finish playing
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
  gardenState.section1Plants[0].drySprite = new Sprite(
    sprites.thymeDryFrames,
    3,
    true,
  );
  gardenState.section1Plants[0].wateredSprite = new Sprite(
    sprites.thymeWateredFrames,
    3,
    true,
  );
  gardenState.section1Plants[1].drySprite = new Sprite(
    sprites.rosemaryDryFrames,
    3,
    true,
  );
  gardenState.section1Plants[1].wateredSprite = new Sprite(
    sprites.rosemaryWateredFrames,
    3,
    true,
  );
  gardenState.section1Plants[2].drySprite = new Sprite(
    sprites.sunflowersDryFrames,
    3,
    true,
  );
  gardenState.section1Plants[2].wateredSprite = new Sprite(
    sprites.sunflowersWateredFrames,
    3,
    true,
  );
  gardenState.section1Plants[3].drySprite = new Sprite(
    sprites.tulipsDryFrames,
    3,
    true,
  );
  gardenState.section1Plants[3].wateredSprite = new Sprite(
    sprites.tulipsWateredFrames,
    3,
    true,
  );
  gardenState.section1Plants[4].drySprite = new Sprite(
    sprites.wildpatchDryFrames,
    3,
    true,
  );
  gardenState.section1Plants[4].wateredSprite = new Sprite(
    sprites.wildpatchWateredFrames,
    3,
    true,
  );

  // Rain sprites for section 1
  gardenState.section1Plants[0].rainSprite = new Sprite(
    sprites.thymeRainFrames,
    3,
    true,
  );
  gardenState.section1Plants[1].rainSprite = new Sprite(
    sprites.rosemaryRainFrames,
    3,
    true,
  );
  gardenState.section1Plants[2].rainSprite = new Sprite(
    sprites.sunflowersRainFrames,
    3,
    true,
  );
  gardenState.section1Plants[3].rainSprite = new Sprite(
    sprites.tulipsRainFrames,
    3,
    true,
  );
  gardenState.section1Plants[4].rainSprite = new Sprite(
    sprites.wildpatchRainFrames,
    3,
    true,
  );

  // Create both dry and watered sprites for each plant in section 2
  gardenState.section2Plants[0].drySprite = new Sprite(
    sprites.tomatoesDryFrames,
    3,
    true,
  );
  gardenState.section2Plants[0].wateredSprite = new Sprite(
    sprites.tomatoesWateredFrames,
    3,
    true,
  );
  gardenState.section2Plants[0].rainSprite = new Sprite(
    sprites.tomatoesRainFrames,
    3,
    true,
  );

  // Create both dry and watered sprites for each plant in section 3
  gardenState.section3Plants[0].drySprite = new Sprite(
    sprites.seedlingDryFrames,
    3,
    true,
  );
  gardenState.section3Plants[0].wateredSprite = new Sprite(
    sprites.seedlingWateredFrames,
    3,
    true,
  );
  gardenState.section3Plants[0].rainSprite = new Sprite(
    sprites.seedlingRainFrames,
    3,
    true,
  );

  // Rain sprites for shell and empty plot
  gardenState.shell.rainSprite = new Sprite(sprites.shellRainFrames, 3, true);
  gardenState.emptyPlot.rainSprite = new Sprite(
    sprites.emptyPlotRainFrames,
    3,
    true,
  );

  // Initialize Tony sprites
  gardenState.tonyState.tonyIdleSprite = new Sprite(
    sprites.tonyIdleFrames,
    3,
    true,
  );
  gardenState.tonyState.tonyActionSprite = new Sprite(
    sprites.tonyActionFrames,
    3,
    false,
  );
  gardenState.tonyState.tonyActionIdleSprite = new Sprite(
    sprites.tonyActionIdleFrames,
    3,
    true,
  );
  gardenState.tonyState.currentSprite = gardenState.tonyState.tonyIdleSprite;

  // Tony VN sprites (for dialogue scenes)
  assets.smiling_waving = new Sprite(sprites.tonySmilingFrames, 3, true);
  assets.smile_rain = new Sprite(sprites.tonySmilingRainFrames, 3, true);
  assets.explaining = new Sprite(sprites.tonyExplainingFrames, 3, true);
  assets.assured = new Sprite(sprites.tonyAssuredFrames, 3, true);
  assets.assured_rain = new Sprite(sprites.tonyAssuredRainFrames, 3, true);
  assets.peaceful = new Sprite(sprites.tonyPeacefulFrames, 3, true);
  assets.peaceful_rain = new Sprite(sprites.tonyPeacefulRainFrames, 3, true);
  assets.sad_peaceful = new Sprite(sprites.tonySadPeacefulFrames, 3, true);
  assets.shy = new Sprite(sprites.tonyShyFrames, 3, true);
  assets.shy_rain = new Sprite(sprites.tonyShyRainFrames, 3, true);
  assets.contemplative = new Sprite(sprites.tonyContemplativeFrames, 3, true);
  assets.contemplative_rain = new Sprite(
    sprites.tonyContemplativeRainFrames,
    3,
    true,
  );
  assets.determined = new Sprite(sprites.tonyDeterminedFrames, 3, true);
  assets.anxious = new Sprite(sprites.tonyAnxiousFrames, 3, true);
  assets.confident = new Sprite(sprites.tonyConfidentFrames, 3, true);
  assets.confident_rain = new Sprite(sprites.tonyConfidentRainFrames, 3, true);
  assets.hopeful = new Sprite(sprites.tonyHopefulFrames, 3, true);
  assets.rueful = new Sprite(sprites.tonyRuefulFrames, 3, true);
  assets.rueful_rain = new Sprite(sprites.tonyRuefulRainFrames, 3, true);
  assets.happy = new Sprite(sprites.tonyHappyFrames, 3, true);
  assets.happy_rain = new Sprite(sprites.tonyHappyRainFrames, 3, true);
  assets.wistful = new Sprite(sprites.tonyWistfulFrames, 3, true);
  assets.wistful_rain = new Sprite(sprites.tonyWistfulRainFrames, 3, true);
  assets.warm = new Sprite(sprites.tonyWarmFrames, 3, true);
  assets.warm_rain = new Sprite(sprites.tonyWarmRainFrames, 3, true);

  // Cutscene sprites
  assets.cutscene_callback_1 = new Sprite(
    sprites.cutsceneCallback1Frames,
    3,
    true,
  );
  assets.cutscene_callback_2 = new Sprite(
    sprites.cutsceneCallback2Frames,
    3,
    true,
  );
  assets.cutscene_returning_shell = new Sprite(
    sprites.cutsceneReturningShellFrames,
    3,
    true,
  );
  assets.cutscene_kneeling_shell = new Sprite(
    sprites.cutsceneKneelingShellFrames,
    3,
    true,
  );
  assets.cutscene_kneeling_clouds = new Sprite(
    sprites.cutsceneKneelingCloudsFrames,
    3,
    true,
  );
  assets.cutscene_kneeling_rain = new Sprite(
    sprites.cutsceneKneelingRainFrames,
    3,
    true,
  );
  assets.cutscene_rainfall = new Sprite(
    sprites.cutsceneRainfallFrames,
    3,
    true,
  );
  assets.cutscene_remove_shell = new Sprite(
    sprites.cutsceneRemoveShellFrames,
    3,
    false,
  );
  assets.cutscene_remove_shell_after = new Sprite(
    sprites.cutsceneRemoveShellAfterFrames,
    3,
    false,
  );
  assets.cutscene_ears = new Sprite(sprites.cutsceneEarsFrames, 6, false);
  assets.cutscene_ears_after = new Sprite(
    sprites.cutsceneEarsAfterFrames,
    3,
    true,
  );

  // Tony rain overworld sprite
  gardenState.tonyState.tonyRainSprite = new Sprite(
    sprites.tonyRainFrames,
    3,
    true,
  );

  // Tony intro animation sprites (for intro sequence)
  gardenState.tonyStartSprite = new Sprite(sprites.tonyStartFrames, 3, true); // 3fps, looping
  gardenState.tonySurprisedSprite = new Sprite(
    sprites.tonySurprisedFrames,
    6,
    false,
  ); // 6fps, plays once
  gardenState.tonyStartIdleSprite = new Sprite(
    sprites.tonyStartIdleFrames,
    3,
    true,
  ); // 3fps, looping

  // Initialize watering can cursor sprite
  if (sprites.cursorFrames && sprites.cursorFrames.length > 0) {
    cursorSprite = new Sprite(sprites.cursorFrames, 5, true);
  }

  // Initialize cursor question sprite (for interactive areas)
  if (sprites.cursorQuestionFrames && sprites.cursorQuestionFrames.length > 0) {
    cursorQuestionSprite = new Sprite(sprites.cursorQuestionFrames, 5, true);
  }
  if (
    sprites.cursorQuestionRainFrames &&
    sprites.cursorQuestionRainFrames.length > 0
  ) {
    cursorQuestionRainSprite = new Sprite(
      sprites.cursorQuestionRainFrames,
      5,
      true,
    );
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
    gardenState.shell.readySprite = new Sprite(
      sprites.shellReadyFrames,
      3,
      true,
    );
  }
}

// ========================
// SPRITE UPDATES
// ========================

function updateAllSprites() {
  // Only update sprites that are visible in current game mode
  if (gameMode === "vn") {
    // In VN mode, update all VN portrait sprites - pause all other animations for performance
    if (scenes[currentScene].image) {
      scenes[currentScene].image.update();
    }
    // All other sprites are paused during VN mode for better performance
  } else if (gameMode === "intro") {
    // In intro mode, update the appropriate Tony sprite based on phase
    if (introPhase === "none") {
      // Waiting for click - animate tony_start and plants
      if (gardenState.tonyStartSprite) {
        gardenState.tonyStartSprite.update();
      }
      for (let plant of cachedCurrentSectionPlants) {
        plant.drySprite.update();
      }
      if (currentSection === 2) {
        if (gardenState.shell.sprite) {
          gardenState.shell.sprite.update();
        }
        if (gardenState.shell.readySprite) {
          gardenState.shell.readySprite.update();
        }
      }
      if (currentSection === 3) {
        gardenState.emptyPlot.sprite.update();
      }
    } else if (introPhase === "tony_surprised") {
      if (gardenState.tonySurprisedSprite) {
        gardenState.tonySurprisedSprite.update();
      }
    } else if (introPhase === "tony_start_idle") {
      if (gardenState.tonyStartIdleSprite) {
        gardenState.tonyStartIdleSprite.update();
      }
    }
    if (cursorQuestionSprite) cursorQuestionSprite.update();
  } else if (gameMode === "cutscene") {
    if (
      cutscenepreDialogueIndex >= 0 &&
      cutscenePreDialogueSequence.length > 0
    ) {
      // Update only the currently active pre-dialogue index
      cutscenePreDialogueSequence[cutscenepreDialogueIndex].update();
    } else if (scenes[currentScene] && scenes[currentScene].cutsceneSprite) {
      // Update the dialogue-phase sprite
      scenes[currentScene].cutsceneSprite.update();
    }
  } else if (gameMode === "transitioning") {
    // During section transitions, pause plant animations
    // Only update Tony's animation
    if (gardenState.tonyState.currentSprite) {
      gardenState.tonyState.currentSprite.update();

      // If action animation finished, switch to action_idle loop
      if (
        gardenState.tonyState.currentSprite ===
          gardenState.tonyState.tonyActionSprite &&
        gardenState.tonyState.tonyActionSprite.hasFinished
      ) {
        gardenState.tonyState.tonyActionIdleSprite.reset();
        gardenState.tonyState.currentSprite =
          gardenState.tonyState.tonyActionIdleSprite;
        actionIdleStartTime = millis(); // Track when action_idle starts
      }
    }
  } else {
    // In garden mode, update all visible sprites
    for (let plant of cachedCurrentSectionPlants) {
      if (isRaining) {
        if (plant.rainSprite) plant.rainSprite.update();
      } else if (plant.watered) {
        if (plant.wateredSprite) plant.wateredSprite.update();
      } else {
        if (plant.drySprite) plant.drySprite.update();
      }
    }

    // Update empty plot sprite
    if (currentSection === 3) {
      if (isRaining && gardenState.emptyPlot.rainSprite) {
        gardenState.emptyPlot.rainSprite.update();
      } else if (gardenState.emptyPlot.sprite) {
        gardenState.emptyPlot.sprite.update();
      }
    }

    // Update shell sprite
    if (currentSection === 2) {
      if (isRaining && gardenState.shell.rainSprite) {
        gardenState.shell.rainSprite.update();
      } else {
        if (gardenState.shell.sprite) gardenState.shell.sprite.update();
        if (gardenState.shell.readySprite)
          gardenState.shell.readySprite.update();
      }
    }

    // Update Tony overworld sprites
    if (gardenState.tonyState.currentSprite) {
      gardenState.tonyState.currentSprite.update();

      // If action animation finished, switch to action_idle loop
      if (
        gardenState.tonyState.currentSprite ===
          gardenState.tonyState.tonyActionSprite &&
        gardenState.tonyState.tonyActionSprite.hasFinished
      ) {
        gardenState.tonyState.tonyActionIdleSprite.reset();
        gardenState.tonyState.currentSprite =
          gardenState.tonyState.tonyActionIdleSprite;
        actionIdleStartTime = millis(); // Track when action_idle starts to determine when we switch to vn
      }

      // If raining
      if (gameMode === "rain_ending") {
        gardenState.tonyState.currentSprite =
          gardenState.tonyState.tonyRainSprite;
      }

      // Update cursor sprites (only in garden mode)
      if (cursorSprite) cursorSprite.update();
      if (cursorQuestionSprite) cursorQuestionSprite.update();
      if (cursorQuestionRainSprite) cursorQuestionRainSprite.update();
    }
  }
}

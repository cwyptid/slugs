// State & Global Variables

// ========================
// DEBUG FLAGS
const DEBUG_MODE = false;
const DEBUG_CUTSCENE = false;
const DEBUG_ENDING = false;
// ========================

// Core game variables
let gameLoaded = false; // true once preload + setup have finished
let gameMode = "title"; // 'title' | 'nameInput' | 'intro' | 'garden' | 'vn' | 'transitioning' | 'cutscene'
let currentSection = 1; // Which section of the garden (1, 2, or 3)
let playerName = ""; // Store the player's entered name
let currentScene = 0; // For VN mode (starts at 0)
let canvasScale = 1; // Currently not in use, eventual scaling down the line
let vnTransitionTime = 0; // Timer for delaying VN mode entry
let vnTransitionDelay = 750; // Milliseconds to wait AFTER action_idle starts before fading to VN
let textboxFadeInDuration = 400; // Duration for textbox fade (normal VN transitions)

// Intro sequence state & timing
let introStartTime = 0; // When intro sequence started
let introPhaseStartTime = 0; // When current phase started
let tonySurprisedDuration = 0; // Will be calculated based on sprite frames and fps
let tonyStartIdleDuration = 500; // How long to loop tony_start_idle (.5 seconds)
let introStarted = false; // Whether player has clicked Tony to start the sequence
let toIntroVN = false; // Track if we're transitioning from intro sequence to VN (for special sprite loop)
let introPhase = "none"; // 'none' (waiting for click on Tony)
let mainTuneStarted = false; // Are we playing the mainTune (starts when you talk to Tony)

// Assets for VN mode
let assets = {};
let scenes = {};

// Assets for garden mode
let gardenAssets = {};

// Sprite animations
let sprites = {};

// Garden state - plant ids, sizes, positions, watered status, sprites, backgroundImage, tonySprite
let gardenState = {
  section1Plants: [
    {
      id: "thyme",
      x: 860,
      y: 470,
      width: 226,
      height: 96,
      watered: false,
      drySprite: null, // Will be initialized in setup
      wateredSprite: null,
      rainSprite: null,
      groupId: "herbs",
    },
    {
      id: "rosemary",
      x: 480,
      y: 420,
      width: 226,
      height: 160,
      watered: false,
      drySprite: null, // Will be initialized in setup
      wateredSprite: null,
      rainSprite: null,
      groupId: "herbs",
    },
    {
      id: "sunflowers",
      x: 440,
      y: 85,
      width: 320,
      height: 250,
      watered: false,
      drySprite: null, // Will be initialized in setup
      wateredSprite: null,
      rainSprite: null,
      groupId: "flowers",
    },
    {
      id: "tulips",
      x: 840,
      y: 175,
      width: 250,
      height: 160,
      watered: false,
      drySprite: null, // Will be initialized in setup
      wateredSprite: null,
      rainSprite: null,
      groupId: "flowers",
    },
    {
      id: "wildpatch",
      x: 65,
      y: 140,
      width: 390,
      height: 540,
      watered: false,
      drySprite: null, // Will be initialized in setup
      wateredSprite: null,
      rainSprite: null,
      groupId: "wildpatch",
    },
  ],
  section2Plants: [
    {
      id: "tomatoes",
      x: 640,
      y: 60,
      width: 447,
      height: 620,
      watered: false,
      drySprite: null, // Will be initialized in setup
      wateredSprite: null,
      rainSprite: null,
      groupId: "tomatoes",
    },
  ],
  section3Plants: [
    {
      id: "seedling",
      x: 390,
      y: 340,
      width: 100,
      height: 100,
      watered: false,
      drySprite: null, // Will be initialized in setup
      wateredSprite: null,
      rainSprite: null,
      groupId: "seedling",
    },
  ],
  emptyPlot: {
    id: "emptyplot",
    x: 725,
    y: 175,
    width: 380,
    height: 440,
    sprite: null, // Will be initialized in setup
    rainSprite: null,
    visited: false, // Track if conversation has been triggered once
  },
  shell: {
    id: "shell",
    x: 75,
    y: 50,
    width: 475,
    height: 400,
    sprite: null, // Will be initialized in setup
    readySprite: null,
    rainSprite: null,
    earlyConversationTriggered: false, // Track if early shell conversation happened
    endGameConversationStarted: false, // Track if player has started the shell conversation
  },
  backgroundImage: null, // Background for the current section
  tonyState: {
    currentSprite: null, // Which sprite is playing
    tonyIdleSprite: null,
    tonyActionSprite: null,
    tonyActionIdleSprite: null,
    tonyRainSprite: null,
  },
};

// Flavor text (shown when clicking plants/shell before meeting Tony)
const FLAVOR_TEXT_DURATION = 2500;
let flavorText = "";
let flavorTextTimer = 0;

const plantFlavor = {
  thyme: "Not sure what this is, but it smells great.",
  rosemary: "Looks like someone's been gardening...",
  sunflowers: "These are well taken care of.",
  tulips: "Someone clearly put some love into this.",
  wildpatch: "It's unruly.",
  tomatoes: "These look almost ready to pick.",
  seedling: "This one doesn't look too hot...",
  emptyplot: "Whole lotta nothing.",
  shell: "Weird. Some birds have been nesting here.",
};

const wateredFlavor = {
  thyme: "Smells nice.",
  rosemary: "Looking good.",
  sunflowers: "They're soaking up the sun.",
  tulips: "All taken care of.",
  wildpatch: "Just doing its thing.",
  tomatoes: "Getting closer to ready.",
  seedling: "Hanging in there...",
  emptyplot: "Whole lotta potential.",
};

const rainFlavor = {
  thyme: "Smells like wet thyme.",
  rosemary: "Rosemary doesn't seem to mind.",
  sunflowers: "Soaking up the... rain, I guess.",
  tulips: "The rain somehow makes them even prettier.",
  wildpatch: "Happy about all this, probably.",
  tomatoes: "These sure are sturdy.",
  seedling: "Hopefully the rain helps...",
  emptyplot: "Whole lotta wet potential.",
  shell: "The birds inside are sleeping soundly.",
};

// Performance optimization: cache plant lookups (used in getPlantsForSection)
let cachedCurrentSectionPlants = []; // Cache plants for current section (avoid multiple calls per frame)
let lastCachedSection = -1; // Track which section was cached

// Custom cursor animation
let cursorSprite = null; //
let cursorWidth = 125; // Cursor width in pixels
let cursorHeight = 100; // Cursor height in pixels
let cursorOffsetX = 0; // Horizontal offset from mouse position
let cursorOffsetY = 0; // Vertical offset from mouse position

// Cursor question sprite (for interactive areas)
let cursorQuestionSprite = null;
let cursorQuestionRainSprite = null;
let isHoveringInteractiveArea = false; // Track if hovering over interactive area
let isCurrentlyHoveringPlant = false; // Track hover state for watering can cursor
let justReturnedFromVN = false; // Flag to skip hover check on frame we return from VN

// Fades and transitions
const fades = {
  toNameInput: { fading: false, startTime: 0, duration: 400 }, // Fade from title to name input
  toStoryTransition: { fading: false, startTime: 0, duration: 400 }, // After name input
  toIntro: { fading: false, startTime: 0, duration: 400 }, // After post-name input intro
  toVNMode: { fading: false, startTime: 0, duration: 400 }, // Enter VN mode after watering / interacting
  toCutscene: { fading: false, startTime: 0, duration: 800, targetScene: 1100 }, // Enter cutscene mode when Tony talks about the shell
  // Returning to VN mode after the final cutscene
  cutsceneToVN: {
    fading: false,
    startTime: 0,
    duration: 3500,
    targetScene: 2000,
  },
  // Quickly return to VN mode during the cutscenes, briefly
  cutsceneToVNBrief: {
    fading: false,
    startTime: 0,
    duration: 800,
    targetScene: 1350,
  },
  toTitleFromEnding: { fading: false, startTime: 0, duration: 1000 }, // Return to title screen after beating the game
};

const sectionTransition = {
  // Move between garden sections
  fading: false,
  startTime: 0,
  duration: 300,
  target: 1,
};

// Timer for what happens between the name-input screen and the start of the game
const storyTransition = {
  finished: false,
  startTime: 0,
  duration: 5000,
};

// VN State persistence
let actionIdleStartTime = 0; // Track when action_idle animation started
let returnToGardenAfterVN = false; // For plants, shell-deflection, intro, empty plot , and "stay in garden"
let triggeringPlantId = null; // What plant or interactible the player clicked

// Cutscene pre-dialogue intro sequence state machine & instant textbox
let cutscenePreDialogueSequence = []; // array of Sprite objects to play in order
let cutscenepreDialogueIndex = -1; // -1 = not active (show dialogue), 0+ = current step in the sequence til done
let skipCutsceneTextboxFade = false; // When true, textbox appears instantly (black overlay still fades normally)

// Rain state
let isRaining = false;
let rainParticles = [];

// Typewriter effect for dialogue
let typewriterStartTime = 0; // When current scene text started typing
let typewriterSpeed = 25; // Milliseconds per character (lower = faster)
let typewriterFinished = false; // Whether all text has been revealed
let typewriterJustFinishedThisFrame = false; // Tracks if typewriter BECAME finished on this specific frame
let storyTransitionTypewriterSpeed = 80; // Much slower typewriter for story transition screen
let cachedDialogueText = ""; // Cache dialogue text to avoid re-parsing every frame
let cachedDialogueOnly = ""; // Cache non-choice dialogue
let cachedChoiceLines = []; // Cache choice lines
let cachedChoiceSet = new Set(); // Set of choice lines for O(1) lookup instead of O(n)
let cachedChoiceWidths = []; // Cache choice button widths to avoid expensive textWidth() calls
let cachedFullDialogueWithChoices = ""; // Cache full dialogue with choices to avoid recalculating every frame
let lastCachedTypewriterChars = -1; // Track last char count to know when to update display string

// Click cooldown to prevent rapid clicking from advancing dialogue twice
const CLICK_COOLDOWN = 250; // Milliseconds between allowed clicks - prevents rapid-fire clicks that break progression
let lastClickTime = 0;
let clickProcessedThisFrame = false; // Prevent multiple clicks in same frame
let userJustSpedUpTypewriter = false; // User sped up text this click - block progression on next click

// Name input screen
const NAME_MAX_LENGTH = 12; // Max player name length
const LETTER_ROWS = 2; // 2 rows
const LETTERS_PER_ROW = 13; // 2 * 13 = 26 letters of the alphabet babey
const BUTTON_SIZE = 85; // 85px buttons
const BUTTON_SPACING = 10; // 10px apart
const BUTTON_ROWS_START_Y = 280; // Start at y index 280
let currentNameInput = ""; // Name being typed
let nameInputButtons = []; // Button objects for name input
let hoveredButtonIndex = -1; // Which button is currently hovered by mouse
let selectedButtonIndex = -1; // Which button is currently selected via keyboard (-1 = none)

// UI and input
let vnChoiceButtons = []; // VN choice buttons - > Continue, [1 - 3]
let lastHoveredChoiceText = null; // Track if we've been hovering over a choice option, so the sound doesn't infinitely play
let lastESCHoveredButton = null; // Track if we've been hovering over a button option,so the sound doesn't infintely play

// End screen ESC overlay ("Return to title?")
let showESCOverlay = false;

// Get plants for current section, stores them as a "cache" so we don't need to do a call to lookup the array every frame
function getPlantsForSection(section) {
  // Use cached plants if section hasn't changed
  if (section === lastCachedSection && cachedCurrentSectionPlants.length > 0) {
    return cachedCurrentSectionPlants;
  }

  // Update cache when section changes
  if (section === 1) {
    cachedCurrentSectionPlants = gardenState.section1Plants;
  } else if (section === 2) {
    cachedCurrentSectionPlants = gardenState.section2Plants;
  } else if (section === 3) {
    cachedCurrentSectionPlants = gardenState.section3Plants;
  } else {
    cachedCurrentSectionPlants = [];
  }

  lastCachedSection = section;
  return cachedCurrentSectionPlants;
}

function checkAllPlantsWatered() {
  // Check if all plants across all sections have been watered
  const allSection1Watered = gardenState.section1Plants.every(
    (plant) => plant.watered,
  );
  const allSection2Watered = gardenState.section2Plants.every(
    (plant) => plant.watered,
  );
  const allSection3Watered = gardenState.section3Plants.every(
    (plant) => plant.watered,
  );

  return allSection1Watered && allSection2Watered && allSection3Watered; // If true, along with emptyPlot.visited, shell begins to glow
}

function resetGame() {
  // Reset all game state for a fresh playthrough
  gameMode = "title";
  currentScene = 0;
  currentSection = 1;
  currentNameInput = "";
  playerName = "";

  // Reset intro state
  introPhase = "none";
  introPhaseStartTime = 0;
  introStarted = false;

  // Reset background to section 1
  if (gardenState.backgroundImage) {
    gardenState.backgroundImage = gardenState.section1Background;
  }

  // Reset intro sprites
  gardenState.tonyStartSprite.reset();
  gardenState.tonySurprisedSprite.reset();
  gardenState.tonyStartIdleSprite.reset();

  // Reset garden state
  gardenState.tonyState.currentSprite = gardenState.tonyState.tonyIdleSprite;
  gardenState.tonyState.tonyIdleSprite.reset();

  // Reset all plants in all sections to dry, unwatered state
  for (let plant of gardenState.section1Plants) {
    plant.watered = false;
    if (plant.drySprite) plant.drySprite.reset();
    if (plant.wateredSprite) plant.wateredSprite.reset();
  }
  for (let plant of gardenState.section2Plants) {
    plant.watered = false;
    if (plant.drySprite) plant.drySprite.reset();
    if (plant.wateredSprite) plant.wateredSprite.reset();
  }
  for (let plant of gardenState.section3Plants) {
    plant.watered = false;
    if (plant.drySprite) plant.drySprite.reset();
    if (plant.wateredSprite) plant.wateredSprite.reset();
  }

  // Reset empty plot
  gardenState.emptyPlot.visited = false;

  // Reset shell
  gardenState.shell.clicked = false;
  gardenState.shell.earlyConversationTriggered = false;
  gardenState.shell.endGameConversationStarted = false;
  if (gardenState.shell.sprite) gardenState.shell.sprite.reset();
  if (gardenState.shell.readySprite) gardenState.shell.readySprite.reset();

  // Reset UI state
  isCurrentlyHoveringPlant = false;
  isHoveringInteractiveArea = false;
  justReturnedFromVN = false;
  currentNameInput = "";
  selectedButtonIndex = -1; // Reset keyboard selection for name input buttons

  // Reset fade flags
  fadingToTitleAfterShell = false;
  fades.cutsceneToVN.fading = false;
  fades.toTitleFromEnding.fading = false;

  // Reset rain state
  isRaining = false;
  rainParticles = [];
  showESCOverlay = false;

  // Reset typewriter
  resetTypewriter();

  // Hide nameInput panel when returning to title
  document.body.classList.remove("nameInput-active");
  document.body.classList.remove("rain-active");

  if (assets.mainTune && assets.mainTune.isPlaying()) assets.mainTune.stop();
  if (assets.shellStory && assets.shellStory.isPlaying())
    assets.shellStory.stop();
  if (assets.rainSound && assets.rainSound.isPlaying()) assets.rainSound.stop();
  mainTuneStarted = false;
  if (assets.titleMusic && !assets.titleMusic.isPlaying())
    assets.titleMusic.loop();
}

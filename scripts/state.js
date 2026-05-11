// A Game About Slugs - State & Global Variables

// ========================
// DEBUG FLAG - set to true to replay conversations without restrictions
const DEBUG_MODE = false;
// DEBUG_CUTSCENE - set to true to skip straight to cutscene 1 on load
// Backtick (`) key also jumps back to cutscene 1 from any screen while this is on
const DEBUG_CUTSCENE = true;
// DEBUG_ENDING - set to true to skip straight to the ending VN (scene 2000) with rain
// ] key also jumps to ending VN from any screen while this is on
const DEBUG_ENDING = false;
// ========================

let gameMode = 'title'; // 'title' | 'nameInput' | 'intro' | 'garden' | 'vn'
let currentSection = 1; // Which section of the garden (1, 2, or 3)
let playerName = ""; // Store the player's entered name
let currentScene = 0; // For VN mode (starts at 0)
let canvasScale = 1;
let vnTransitionTime = 0; // Timer for delaying VN mode entry
let vnTransitionDelay = 750; // Milliseconds to wait AFTER action_idle starts before fading to VN
let vnEntryTime = 0; // Timer for VN entry animation
let vnEntryDuration = 400; // Duration of fade-in + slide-up in ms (short & subtle)
let introVNEntryDuration = 400; // Duration of fade-in for intro sequence Tony (longer)
let textboxFadeInDuration = 400; // Duration for textbox fade (normal VN transitions)
let introTextboxFadeInDuration = 1200; // Duration for textbox fade (intro sequence to VN)
let actionIdleStartTime = 0; // Track when action_idle animation started

// Intro sequence state
let introStartTime = 0; // When intro sequence started
let introPhase = 'none'; // 'none' (waiting for click) -> 'tony_start' -> 'tony_surprised' -> 'tony_start_idle' -> 'vn'
let introPhaseStartTime = 0; // When current phase started
let introStarted = false; // Whether player has clicked Tony to start the sequence
let tonyStartDuration = 1000; // How long to loop tony_start (1 second)
let tonySurprisedDuration = 0; // Will be calculated based on sprite frames and fps
let tonyStartIdleDuration = 500; // How long to loop tony_start_idle (.5 seconds)
let fadingIntoIntro = false; // Whether we're fading from name input to intro
let fadeIntoIntroStartTime = 0; // When fade started
let isIntroSequenceVN = false; // Track if we're transitioning from intro sequence to VN (for longer fade)
let fadeIntoIntroDuration = 400; // Duration of fade in ms
let fadingIntoNameInput = false; // Whether we're fading from title to name input
let fadeIntoNameInputStartTime = 0; // When fade started
let fadeIntoNameInputDuration = 400; // Duration of fade in ms

// Story transition screen (after name input, before intro)
let storyTransitionStartTime = 0; // When the story transition screen started
let storyTransitionFinished = false; // Whether the screen has auto-advanced
let storyTransitionDuration = 5000; // How long to show the screen before auto-advancing (5 seconds)
let fadingIntoStoryTransition = false; // Whether we're fading from name input to story transition
let fadeIntoStoryTransitionStartTime = 0; // When fade started
let fadeIntoStoryTransitionDuration = 400; // Duration of fade in ms (shorter transition)

// Section transition fade
let sectionTransitionTime = 0; // Timer for section transition
let sectionTransitionDuration = 300; // Duration of fade in/out ms
let isTransitioningSection = false; // Whether we're in the middle of a section transition
let nextSectionTarget = 1; // Which section we're transitioning to

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
let lastClickTime = 0;
const CLICK_COOLDOWN = 250; // Milliseconds between allowed clicks - prevents rapid-fire clicks that break progression
let clickProcessedThisFrame = false; // Prevent multiple clicks in same frame
let userJustSpedUpTypewriter = false; // User sped up text this click - block progression on next click

// Performance optimization: cache plant lookups
let cachedCurrentSectionPlants = []; // Cache plants for current section
let lastCachedSection = -1; // Track which section was cached
let frameCachedPlants = []; // Cache plants for current frame (avoid multiple calls per frame)

// Custom cursor animation
let cursorSprite = null;
let cursorWidth = 125; // Cursor width in pixels
let cursorHeight = 100; // Cursor height in pixels
let cursorOffsetX = 0; // Horizontal offset from mouse position
let cursorOffsetY = 0; // Vertical offset from mouse position

// Cursor question sprite (for interactive areas)
let cursorQuestionSprite = null;
let cursorQuestionRainSprite = null;
let isHoveringInteractiveArea = false; // Track if hovering over interactive area
let justReturnedFromVN = false; // Flag to skip hover check on frame we return from VN

// Flavor text (shown when clicking plants/shell before meeting Tony)
let flavorText = "";
let flavorTextTimer = 0;
const FLAVOR_TEXT_DURATION = 2500;

// Name input screen
let currentNameInput = ""; // Name being typed
let nameInputButtons = []; // Button objects for name input
let hoveredButtonIndex = -1; // Which button is currently hovered by mouse
let selectedButtonIndex = -1; // Which button is currently selected via keyboard (-1 = none)
let nameBoxImage = null;
let nameBoxRainImage = null;
let textButtonImage = null;
let otherBoxImage = null;
let otherBoxRainImage = null;
const NAME_MAX_LENGTH = 12;
const LETTER_ROWS = 2;
const LETTERS_PER_ROW = 13;
const BUTTON_SIZE = 85;
const BUTTON_SPACING = 10;
const BUTTON_ROWS_START_Y = 280;

// Assets for VN mode (existing characters)
let assets = [];
let scenes = [];

// Sprite animations
let sprites = {};

// Assets for garden mode
let gardenAssets = {};

// Garden state - plants organized by section
let gardenState = {
	section1Plants: [
		{
			id: 'thyme',
			x: 860,
			y: 470,
			width: 226,
			height: 96,
			watered: false,
			drySprite: null,
			wateredSprite: null,
			groupId: 'herbs',
			conversationId: 'herbs_conversation'
		},
		{
			id: 'rosemary',
			x: 480,
			y: 420,
			width: 226,
			height: 160,
			watered: false,
			drySprite: null,
			wateredSprite: null,
			groupId: 'herbs',
			conversationId: 'herbs_conversation'
		},
		{
			id: 'sunflowers',
			x: 440,
			y: 85,
			width: 320,
			height: 250,
			watered: false,
			drySprite: null,
			wateredSprite: null,
			groupId: 'flowers',
			conversationId: 'flowers_conversation'
		},
		{
			id: 'tulips',
			x: 840,
			y: 175,
			width: 250,
			height: 160,
			watered: false,
			drySprite: null,
			wateredSprite: null,
			groupId: 'flowers',
			conversationId: 'flowers_conversation'
		},
		{
			id: 'wildpatch',
			x: 65,
			y: 140,
			width: 390,
			height: 540,
			watered: false,
			drySprite: null,
			wateredSprite: null,
			groupId: 'wildpatch',
			conversationId: 'wildpatch_conversation'
		}
	],
	section2Plants: [
		{
			id: 'tomatoes',
			x: 640,
			y: 60,
			width: 447,
			height: 620,
			watered: false,
			drySprite: null,
			wateredSprite: null,
			groupId: 'tomatoes',
			conversationId: 'tomatoes_conversation'
		}
	],
	section3Plants: [
		{
			id: 'seedling',
			x: 390,
			y: 340,
			width: 100,
			height: 100,
			watered: false,
			drySprite: null,
			wateredSprite: null,
			groupId: 'seedling',
			conversationId: 'seedling_conversation'
		}
	],
	emptyPlot: {
		x: 725,
		y: 175,
		width: 380,
		height: 440,
		sprite: null, // Will be initialized in setup
		conversationId: 'interactive_area',
		visited: false // Track if conversation has been triggered once
	},
	shell: {
		x: 75, // Placeholder - user can adjust
		y: 50, // Placeholder - user can adjust
		width: 475,
		height: 400,
		sprite: null, // Will be initialized in setup
		conversationId: 'shell_conversation',
		earlyConversationTriggered: false, // Track if early shell conversation happened
		postGameConversationTriggered: false, // Track if post-game shell conversation happened
		postGameConversationStarted: false // Track if player has started the "ready to talk" conversation
	},
	backgroundImage: null,
	tonyState: {
		currentSprite: null, // Which sprite is playing
		tonyIdleSprite: null,
		tonyActionSprite: null,
		tonyActionIdleSprite: null
	}
};

// Helper function to get plants for current section
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
	const allSection1Watered = gardenState.section1Plants.every(plant => plant.watered);
	const allSection2Watered = gardenState.section2Plants.every(plant => plant.watered);
	const allSection3Watered = gardenState.section3Plants.every(plant => plant.watered);

	return allSection1Watered && allSection2Watered && allSection3Watered;
}

// VN State persistence
let returnToGardenAfterVN = false;
let triggeringPlantId = null;
let fadingOutFromVN = false;

// Shell dialogue ending - fade to white and return to title
let fadingToTitleAfterShell = false; // DEMO END: Fade to white after shell dialogue
let fadeToTitleStartTime = 0;
const fadeToTitleDuration = 2000; // 2 second fade to white

// Cutscene mode transition - fade to black then enter cutscene
let fadingToCutscene = false;
let fadeToCutsceneStartTime = 0;
const fadeToCutsceneDuration = 800;
let fadeToCutsceneTargetScene = 1100; // which scene to land on after fade

// Cutscene pre-dialogue intro sequence state machine
let cutsceneIntroSequence = []; // array of Sprite objects to play in order
let cutsceneIntroStep = -1;     // -1 = not active (show dialogue), 0+ = current step

// Cutscene end - fade to black and hold
let cutsceneEndFading = false;
let cutsceneEndFadeStartTime = 0;
const cutsceneEndFadeDuration = 1500;

// Cutscene-to-VN transition (after cutscene 6 → ending VN with rain)
let fadingCutsceneToVN = false;
let fadeCutsceneToVNStartTime = 0;
const fadeCutsceneToVNDuration = 1000;
let fadeCutsceneToVNTargetScene = 2000; // which VN scene to land on after fade
let skipVNOverworldFade = false; // When true, suppresses overworld Tony fade-out (used for cutscene→VN transitions)
let skipCutsceneTextboxFade = false; // When true, textbox appears instantly (black overlay still fades normally)

// Cutscene-to-VN brief interlude transition (mid-story, no rain)
let fadingCutsceneToVNBrief = false;
let fadeCutsceneToVNBriefStartTime = 0;
const fadeCutsceneToVNBriefDuration = 800;
let fadeCutsceneToVNBriefTargetScene = 1350;

// Rain state
let isRaining = false;
let rainParticles = [];

// End screen ESC overlay ("Return to title?")
let showESCOverlay = false;

// Fade to title from ending (black fade)
let fadingToTitleFromEnding = false;
let fadeToTitleFromEndingStartTime = 0;
const fadeToTitleFromEndingDuration = 1000;

// UI and input
let buttons = [];
let inp;
let isCurrentlyHoveringPlant = false; // Track hover state for optimized cursor

// Font
let myFont;

// Declared here because it's used in draw() and elsewhere but never declared in original
let lastProcessedScene = -1;

// ========================
// RESET GAME (DEMO END)
// ========================

function resetGame() {
	// Reset all game state for a fresh playthrough
	gameMode = 'title';
	currentScene = 0;
	currentSection = 1;
	currentNameInput = "";
	playerName = "";

	// Reset intro state
	introPhase = 'none';
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
	gardenState.shell.postGameConversationStarted = false;
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
	fadingOutFromVN = false;
	fadingCutsceneToVN = false;
	fadingCutsceneToVNBrief = false;
	fadingToTitleFromEnding = false;
	skipVNOverworldFade = false;

	// Reset rain state
	isRaining = false;
	rainParticles = [];
	showESCOverlay = false;

	// Reset typewriter
	resetTypewriter();

	// Hide nameInput panel when returning to title
	document.body.classList.remove('nameInput-active');
	document.body.classList.remove('rain-active');
}

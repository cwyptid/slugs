// ========================
// GAME STATE & VARIABLES
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
let isHoveringInteractiveArea = false; // Track if hovering over interactive area
let justReturnedFromVN = false; // Flag to skip hover check on frame we return from VN

// Name input screen
let currentNameInput = ""; // Name being typed
let nameInputButtons = []; // Button objects for name input
let hoveredButtonIndex = -1; // Which button is currently hovered by mouse
let selectedButtonIndex = -1; // Which button is currently selected via keyboard (-1 = none)
let nameBoxImage = null;
let textButtonImage = null;
let otherBoxImage = null;
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

// UI and input
let buttons = [];
let inp;
let isCurrentlyHoveringPlant = false; // Track hover state for optimized cursor

// Font
let myFont;

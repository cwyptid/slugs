// A Game About Slugs - Two-Mode Game Engine
// Garden Exploration + Visual Novel with state persistence

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
// GAME STATE & VARIABLES
// ========================

// ========================
// DEBUG FLAG - set to true to replay conversations without restrictions
const DEBUG_MODE = true;
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

// ========================
// PRELOAD - Load all assets
// ========================

function preload() {
	// Title screen
	assets.titleImage = loadImage("./assets/UI/titlescreen.gif");

	// Name input screen assets
	nameBoxImage = loadImage("./assets/UI/namebox.png");
	textButtonImage = loadImage("./assets/UI/text_button.png");
	otherBoxImage = loadImage("./assets/UI/otherbox.png");

	// Backgrounds for different sections
	gardenAssets.section1Background = loadImage("./assets/environment/section1_normal.png");
	gardenAssets.section2Background = loadImage("./assets/environment/section2_normal.png");
	gardenAssets.section3Background = loadImage("./assets/environment/section3_normal.png");
	gardenAssets.textbox = loadImage("./assets/UI/textbox.png");
	gardenAssets.arrowRight = loadImage("./assets/UI/arrow_right.png");
	gardenAssets.arrowLeft = loadImage("./assets/UI/arrow_left.png");

	// Load sprite frame arrays
	// Tony VN Sprite (tony_smile) - 3 fps, loops
	sprites.tonySmilingFrames = [
		loadImage("./assets/sprites/tony_VN/tony_smile/tony_smile-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_smile/tony_smile-2.png")
	];

	// Tony VN Sprite (tony_explaining) - 3 fps, loops
	sprites.tonyExplainingFrames = [
		loadImage("./assets/sprites/tony_VN/tony_explaining/tony_explaining-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_explaining/tony_explaining-2.png")
	];

	// Tony VN Sprite (tony_assured) - 3 fps, loops
	sprites.tonyAssuredFrames = [
		loadImage("./assets/sprites/tony_VN/tony_assured/tony_assured-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_assured/tony_assured-2.png")
	];

	// Tony VN Sprite (tony_peaceful) - 3 fps, loops
	sprites.tonyPeacefulFrames = [
		loadImage("./assets/sprites/tony_VN/tony_peaceful/tony_peaceful-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_peaceful/tony_peaceful-2.png")
	];

	// Tony VN Sprite (tony_sad_peaceful) - 3 fps, loops
	sprites.tonySadPeacefulFrames = [
		loadImage("./assets/sprites/tony_VN/tony_sad_peaceful/tony_sad_peaceful-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_sad_peaceful/tony_sad_peaceful-2.png")
	];

	// Tony VN Sprite (tony_shy) - 3 fps, loops
	sprites.tonyShyFrames = [
		loadImage("./assets/sprites/tony_VN/tony_shy/tony_shy-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_shy/tony_shy-2.png")
	];

	// Tony VN Sprite (tony_contemplative) - 3 fps, loops
	sprites.tonyContemplativeFrames = [
		loadImage("./assets/sprites/tony_VN/tony_contemplative/tony_contemplative-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_contemplative/tony_contemplative-2.png")
	];

	// Tony VN Sprite (tony_determined) - 3 fps, loops
	sprites.tonyDeterminedFrames = [
		loadImage("./assets/sprites/tony_VN/tony_determined/tony_determined-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_determined/tony_determined-2.png")
	];

	// Tony VN Sprite (tony_anxious) - 3 fps, loops
	sprites.tonyAnxiousFrames = [
		loadImage("./assets/sprites/tony_VN/tony_anxious/tony_anxious-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_anxious/tony_anxious-2.png")
	];

	// Tony VN Sprite (tony_confident) - 3 fps, loops
	sprites.tonyConfidentFrames = [
		loadImage("./assets/sprites/tony_VN/tony_confident/tony_confident-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_confident/tony_confident-2.png")
	];

	// Tony VN Sprite (tony_hopeful) - 3 fps, loops
	sprites.tonyHopefulFrames = [
		loadImage("./assets/sprites/tony_VN/tony_hopeful/tony_hopeful-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_hopeful/tony_hopeful-2.png")
	];

	// Tony VN Sprite (tony_rueful) - 3 fps, loops
	sprites.tonyRuefulFrames = [
		loadImage("./assets/sprites/tony_VN/tony_rueful/tony_rueful-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_rueful/tony_rueful-2.png")
	];

	// Tony VN Sprite (tony_happy) - 3 fps, loops
	sprites.tonyHappyFrames = [
		loadImage("./assets/sprites/tony_VN/tony_happy/tony_happy-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_happy/tony_happy-2.png")
	];

	// Tony VN Sprite (tony_wistful) - 3 fps, loops
	sprites.tonyWistfulFrames = [
		loadImage("./assets/sprites/tony_VN/tony_wistful/tony_wistful-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_wistful/tony_wistful-2.png")
	];

	// Tony VN Sprite (tony_warm) - 3 fps, loops
	sprites.tonyWarmFrames = [
		loadImage("./assets/sprites/tony_VN/tony_warm/tony_warm-1.png"),
		loadImage("./assets/sprites/tony_VN/tony_warm/tony_warm-2.png")
	];

	// Tony Overworld Sprites
	// tony_idle - 3 fps, loops
	sprites.tonyIdleFrames = [
		loadImage("./assets/sprites/tony_overworld/tony_idle/tony_idle-1.png"),
		loadImage("./assets/sprites/tony_overworld/tony_idle/tony_idle-2.png"),
		loadImage("./assets/sprites/tony_overworld/tony_idle/tony_idle-3.png")
	];
	// tony_action - 3 fps, plays once
	sprites.tonyActionFrames = [
		loadImage("./assets/sprites/tony_overworld/tony_action/tony_action-1.png"),
		loadImage("./assets/sprites/tony_overworld/tony_action/tony_action-2.png"),
		loadImage("./assets/sprites/tony_overworld/tony_action/tony_action-3.png"),
		loadImage("./assets/sprites/tony_overworld/tony_action/tony_action-4.png")
	];
	// tony_action_idle - 3 fps, loops
	sprites.tonyActionIdleFrames = [
		loadImage("./assets/sprites/tony_overworld/tony_action_idle/tony_action_idle-1.png"),
		loadImage("./assets/sprites/tony_overworld/tony_action_idle/tony_action_idle-2.png")
	];
	// tony_start - intro sprite animation (looping)
	sprites.tonyStartFrames = [
		loadImage("./assets/sprites/tony_overworld/tony_start/tony_start-1.png"),
		loadImage("./assets/sprites/tony_overworld/tony_start/tony_start-2.png")
	];
	// tony_surprised - reaction animation (plays once at 6fps)
	sprites.tonySurprisedFrames = [
		loadImage("./assets/sprites/tony_overworld/tony_surprised/tony_surprised-1.png"),
		loadImage("./assets/sprites/tony_overworld/tony_surprised/tony_surprised-2.png"),
		loadImage("./assets/sprites/tony_overworld/tony_surprised/tony_surprised-3.png")
	];
	// tony_start_idle - idle looping animation (3fps)
	sprites.tonyStartIdleFrames = [
		loadImage("./assets/sprites/tony_overworld/tony_start_idle/tony_start_idle-1.png"),
		loadImage("./assets/sprites/tony_overworld/tony_start_idle/tony_start_idle-2.png")
	];

	// Plant sprites - separate animations for dry vs watered states
	// Thyme
	sprites.thymeDryFrames = [
		loadImage("./assets/sprites/plants/thyme_dry/thyme_dry-1.png"),
		loadImage("./assets/sprites/plants/thyme_dry/thyme_dry-2.png")
	];
	sprites.thymeWateredFrames = [
		loadImage("./assets/sprites/plants/thyme_watered/thyme_watered-1.png"),
		loadImage("./assets/sprites/plants/thyme_watered/thyme_watered-2.png")
	];
	// Rosemary
	sprites.rosemaryDryFrames = [
		loadImage("./assets/sprites/plants/rosemary_dry/rosemary_dry-1.png"),
		loadImage("./assets/sprites/plants/rosemary_dry/rosemary_dry-2.png")
	];
	sprites.rosemaryWateredFrames = [
		loadImage("./assets/sprites/plants/rosemary_watered/rosemary_watered-1.png"),
		loadImage("./assets/sprites/plants/rosemary_watered/rosemary_watered-2.png")
	];
	// Flowers
	sprites.sunflowersDryFrames = [
		loadImage("./assets/sprites/plants/sunflowers_dry/sunflowers_dry-1.png"),
		loadImage("./assets/sprites/plants/sunflowers_dry/sunflowers_dry-2.png")
	];
	sprites.sunflowersWateredFrames = [
		loadImage("./assets/sprites/plants/sunflowers_watered/sunflowers_watered-1.png"),
		loadImage("./assets/sprites/plants/sunflowers_watered/sunflowers_watered-2.png")
	];
	sprites.tulipsDryFrames = [
		loadImage("./assets/sprites/plants/tulips_dry/tulips_dry-1.png"),
		loadImage("./assets/sprites/plants/tulips_dry/tulips_dry-2.png")
	];
	sprites.tulipsWateredFrames = [
		loadImage("./assets/sprites/plants/tulips_watered/tulips_watered-1.png"),
		loadImage("./assets/sprites/plants/tulips_watered/tulips_watered-2.png")
	];
	// Wildpatch
	sprites.wildpatchDryFrames = [
		loadImage("./assets/sprites/plants/wildpatch_dry/wildpatch_dry-1.png"),
		loadImage("./assets/sprites/plants/wildpatch_dry/wildpatch_dry-2.png")
	];
	sprites.wildpatchWateredFrames = [
		loadImage("./assets/sprites/plants/wildpatch_watered/wildpatch_watered-1.png"),
		loadImage("./assets/sprites/plants/wildpatch_watered/wildpatch_watered-2.png")
	];
	// Tomatoes
	sprites.tomatoesDryFrames = [
		loadImage("./assets/sprites/plants/tomatoes_dry/tomatoes_dry-1.png"),
		loadImage("./assets/sprites/plants/tomatoes_dry/tomatoes_dry-2.png")
	];
	sprites.tomatoesWateredFrames = [
		loadImage("./assets/sprites/plants/tomatoes_watered/tomatoes_watered-1.png"),
		loadImage("./assets/sprites/plants/tomatoes_watered/tomatoes_watered-2.png")
	];
	// Seedling
	sprites.seedlingDryFrames = [
		loadImage("./assets/sprites/plants/seedling_dry/seedling_dry-1.png"),
		loadImage("./assets/sprites/plants/seedling_dry/seedling_dry-2.png")
	];
	sprites.seedlingWateredFrames = [
		loadImage("./assets/sprites/plants/seedling_watered/seedling_watered-1.png"),
		loadImage("./assets/sprites/plants/seedling_watered/seedling_watered-2.png")
	];
	// Cursor animation frames
	sprites.cursorFrames = [
		loadImage("./assets/sprites/cursor/cursor-1.png"),
		loadImage("./assets/sprites/cursor/cursor-2.png"),
		loadImage("./assets/sprites/cursor/cursor-3.png")
	];
	// Cursor question animation frames
	sprites.cursorQuestionFrames = [
		loadImage("./assets/sprites/cursor_question/cursor_question-1.png"),
		loadImage("./assets/sprites/cursor_question/cursor_question-2.png"),
		loadImage("./assets/sprites/cursor_question/cursor_question-3.png")
	];
	// Empty plot animation frames (not a plant, but uses same sprite system)
	sprites.emptyPlotFrames = [
		loadImage("./assets/sprites/plants/emptyplot/emptyplot-1.png"),
		loadImage("./assets/sprites/plants/emptyplot/emptyplot-2.png")
	];
	// Shell animation frames (interactive item for section 2)
	sprites.shellFrames = [
		loadImage("./assets/sprites/plants/shell_normal/shell_normal-1.png"),
		loadImage("./assets/sprites/plants/shell_normal/shell_normal-2.png")
	];
	// Shell ready frames (when all plants watered)
	sprites.shellReadyFrames = [
		loadImage("./assets/sprites/plants/shell_ready/shell_ready-1.png"),
		loadImage("./assets/sprites/plants/shell_ready/shell_ready-2.png")
	];
	// Font
	myFont = loadFont("./assets/boldpixels/BoldPixels.ttf");
}

// ========================
// SETUP
// ========================

function setup() {
	// Game runs at 1280x720 (16:9 - matches garden background)
	let canvasWidth = 1280;
	let canvasHeight = 720;

	// Responsive scaling for smaller screens
	if (windowWidth < 1300) {
		canvasScale = (windowWidth - 20) / 1280;
		canvasWidth = windowWidth - 20;
		canvasHeight = 720 * canvasScale;
	}

	createCanvas(canvasWidth, canvasHeight);
	// Parent canvas to p5-container so it renders between the decorative panels
	let p5Container = document.getElementById('p5-container');
	if (p5Container && canvas.parentNode !== p5Container) {
		p5Container.appendChild(canvas);
	}

	textFont(myFont);
	fill(255, 253, 191);
	textSize(24);
	rectMode(CORNER); // Use CORNER mode for normal positioning

	// Create input box (hidden - not used yet)
	inp = createInput("");
	inp.hide();

	// Initialize name input screen buttons
	initializeNameInputButtons();

	// Initialize garden assets (set section 1 background by default)
	gardenState.backgroundImage = gardenAssets.section1Background;

	// Initialize plant sprites (3 fps, looping)
	// Create both dry and watered sprites for each plant in section 1
	gardenState.section1Plants[0].drySprite = new Sprite(sprites.thymeDryFrames, 3, true);
	gardenState.section1Plants[0].wateredSprite = new Sprite(sprites.thymeWateredFrames, 3, true);
	gardenState.section1Plants[1].drySprite = new Sprite(sprites.rosemaryDryFrames, 3, true);
	gardenState.section1Plants[1].wateredSprite = new Sprite(sprites.rosemaryWateredFrames, 3, true);
	gardenState.section1Plants[2].drySprite = new Sprite(sprites.sunflowersDryFrames, 3, true);
	gardenState.section1Plants[2].wateredSprite = new Sprite(sprites.sunflowersWateredFrames, 3, true);
	gardenState.section1Plants[3].drySprite = new Sprite(sprites.tulipsDryFrames, 3, true);
	gardenState.section1Plants[3].wateredSprite = new Sprite(sprites.tulipsWateredFrames, 3, true);
	gardenState.section1Plants[4].drySprite = new Sprite(sprites.wildpatchDryFrames, 3, true);
	gardenState.section1Plants[4].wateredSprite = new Sprite(sprites.wildpatchWateredFrames, 3, true);

	// Create both dry and watered sprites for each plant in section 2
	gardenState.section2Plants[0].drySprite = new Sprite(sprites.tomatoesDryFrames, 3, true);
	gardenState.section2Plants[0].wateredSprite = new Sprite(sprites.tomatoesWateredFrames, 3, true);

	// Create both dry and watered sprites for each plant in section 3
	gardenState.section3Plants[0].drySprite = new Sprite(sprites.seedlingDryFrames, 3, true);
	gardenState.section3Plants[0].wateredSprite = new Sprite(sprites.seedlingWateredFrames, 3, true);

	// Initialize Tony sprites
	gardenState.tonyState.tonyIdleSprite = new Sprite(sprites.tonyIdleFrames, 3, true);
	gardenState.tonyState.tonyActionSprite = new Sprite(sprites.tonyActionFrames, 3, false);
	gardenState.tonyState.tonyActionIdleSprite = new Sprite(sprites.tonyActionIdleFrames, 3, true);
	gardenState.tonyState.currentSprite = gardenState.tonyState.tonyIdleSprite;

	// Tony VN sprites (for dialogue scenes)
	gardenState.tonySmilingVNSprite = new Sprite(sprites.tonySmilingFrames, 3, true);
	gardenState.tonyExplainingVNSprite = new Sprite(sprites.tonyExplainingFrames, 3, true);
	gardenState.tonyAssuredVNSprite = new Sprite(sprites.tonyAssuredFrames, 3, true);
	gardenState.tonyPeacefulVNSprite = new Sprite(sprites.tonyPeacefulFrames, 3, true);
	gardenState.tonySadPeacefulVNSprite = new Sprite(sprites.tonySadPeacefulFrames, 3, true);
	gardenState.tonyShyVNSprite = new Sprite(sprites.tonyShyFrames, 3, true);
	gardenState.tonyContemplativeVNSprite = new Sprite(sprites.tonyContemplativeFrames, 3, true);
	gardenState.tonyDeterminedVNSprite = new Sprite(sprites.tonyDeterminedFrames, 3, true);
	gardenState.tonyAnxiousVNSprite = new Sprite(sprites.tonyAnxiousFrames, 3, true);
	gardenState.tonyConfidentVNSprite = new Sprite(sprites.tonyConfidentFrames, 3, true);
	gardenState.tonyHopefulVNSprite = new Sprite(sprites.tonyHopefulFrames, 3, true);
	gardenState.tonyRuefulVNSprite = new Sprite(sprites.tonyRuefulFrames, 3, true);
	gardenState.tonyHappyVNSprite = new Sprite(sprites.tonyHappyFrames, 3, true);
	gardenState.tonyWistfulVNSprite = new Sprite(sprites.tonyWistfulFrames, 3, true);
	gardenState.tonyWarmVNSprite = new Sprite(sprites.tonyWarmFrames, 3, true);

	// Create asset references for scene definitions
	assets.smiling_waving = gardenState.tonySmilingVNSprite;
	assets.explaining = gardenState.tonyExplainingVNSprite;
	assets.assured = gardenState.tonyAssuredVNSprite;
	assets.peaceful = gardenState.tonyPeacefulVNSprite;
	assets.sad_peaceful = gardenState.tonySadPeacefulVNSprite;
	assets.shy = gardenState.tonyShyVNSprite;
	assets.contemplative = gardenState.tonyContemplativeVNSprite;
	assets.determined = gardenState.tonyDeterminedVNSprite;
	assets.anxious = gardenState.tonyAnxiousVNSprite;
	assets.confident = gardenState.tonyConfidentVNSprite;
	assets.hopeful = gardenState.tonyHopefulVNSprite;
	assets.rueful = gardenState.tonyRuefulVNSprite;
	assets.happy = gardenState.tonyHappyVNSprite;
	assets.wistful = gardenState.tonyWistfulVNSprite;
	assets.warm = gardenState.tonyWarmVNSprite;

	// Tony intro animation sprites (for intro sequence)
	gardenState.tonyStartSprite = new Sprite(sprites.tonyStartFrames, 3, true); // 3fps, looping
	gardenState.tonySurprisedSprite = new Sprite(sprites.tonySurprisedFrames, 6, false); // 6fps, plays once
	gardenState.tonyStartIdleSprite = new Sprite(sprites.tonyStartIdleFrames, 3, true); // 3fps, looping

	// Initialize cursor sprite (5 fps for nice animation between 2 frames)
	if (sprites.cursorFrames && sprites.cursorFrames.length > 0) {
		cursorSprite = new Sprite(sprites.cursorFrames, 5, true);
	}

	// Initialize cursor question sprite (for interactive areas)
	if (sprites.cursorQuestionFrames && sprites.cursorQuestionFrames.length > 0) {
		cursorQuestionSprite = new Sprite(sprites.cursorQuestionFrames, 5, true);
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
		gardenState.shell.readySprite = new Sprite(sprites.shellReadyFrames, 3, true);
	}

	// Scale plant positions and sizes based on canvas scale
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

	// Setup initial scenes (VN mode)
	setupScenes();
}

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

	// Reset typewriter
	resetTypewriter();

	// Hide nameInput panel when returning to title
	document.body.classList.remove('nameInput-active');
}

// ========================
// MAIN DRAW LOOP
// ========================

function draw() {
	// Reset click flag at start of frame to allow one click per frame
	clickProcessedThisFrame = false;

	// Cache current time to avoid calling millis() multiple times per frame
	const currentTime = millis();

	// Cache plants for this frame to avoid multiple getPlantsForSection() calls
	frameCachedPlants = getPlantsForSection(currentSection);

	// Update all sprites
	updateAllSprites();

	// Handle intro sequence - display sprite for a moment then start dialogue
	if (gameMode === 'intro') {
		drawGardenMode(currentTime); // Draw garden with start sprite

		const timeInPhase = currentTime - introPhaseStartTime;

		if (introPhase === 'waiting') {
			// Waiting for player to click Tony to start the sequence
			// Do nothing, just display Tony with tony_start sprite (handled in rendering)
		} else if (introPhase === 'tony_start') {
			// Loop tony_start for 1.5 seconds
			if (timeInPhase >= tonyStartDuration) {
				introPhase = 'tony_surprised';
				introPhaseStartTime = currentTime;
				gardenState.tonySurprisedSprite.reset();
				// Calculate duration based on frames and fps: 3 frames at 6fps = ~500ms
				tonySurprisedDuration = (sprites.tonySurprisedFrames.length / 6) * 1000;
			}
		} else if (introPhase === 'tony_surprised') {
			// Play tony_surprised once (no loop)
			if (timeInPhase >= tonySurprisedDuration) {
				introPhase = 'tony_start_idle';
				introPhaseStartTime = currentTime;
				gardenState.tonyStartIdleSprite.reset();
			}
		} else if (introPhase === 'tony_start_idle') {
			// Loop tony_start_idle for 0.5 seconds
			if (timeInPhase >= tonyStartIdleDuration) {
				// Transition to VN mode for opening dialogue
				gameMode = 'vn';
				currentScene = 1000; // Start at opening dialogue scene
				vnEntryTime = currentTime;
				isIntroSequenceVN = true; // Use longer fade for intro sequence
				resetTypewriter();
				lastClickTime = 0; // Reset click cooldown when entering VN mode
				lastProcessedScene = -1; // Reset scene tracker to allow first click

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
		if (fadingIntoIntro) {
			const elapsedFade = currentTime - fadeIntoIntroStartTime;
			if (elapsedFade >= fadeIntoIntroDuration) {
				fadingIntoIntro = false; // Fade is complete
			} else {
				// Draw black overlay that fades out
				const fadeProgress = elapsedFade / fadeIntoIntroDuration; // 0 to 1
				const fadeAlpha = (1 - fadeProgress) * 255; // Start opaque, fade to transparent
				fill(0, fadeAlpha);
				noStroke();
				rect(0, 0, width, height);
			}
		}
	} else if (gameMode === 'transitioning') {
		drawGardenMode(currentTime); // Show garden with watered plants and Tony's action animations

		// Wait for action_idle to start, then wait vnTransitionDelay before transitioning
		const isInActionIdle = gardenState.tonyState.currentSprite === gardenState.tonyState.tonyActionIdleSprite;
		const timeSinceActionIdleStart = isInActionIdle ? currentTime - actionIdleStartTime : 0;

		// Only transition after action_idle has been looping for vnTransitionDelay
		if (isInActionIdle && timeSinceActionIdleStart >= vnTransitionDelay) {
			// Reset cursor states before entering VN mode
			isCurrentlyHoveringPlant = false;
			isHoveringInteractiveArea = false;
			gameMode = 'vn'; // Enter VN mode after delay
			vnEntryTime = currentTime; // Start entry animation timer
			resetTypewriter(); // Start typewriter effect for current scene
			lastClickTime = 0; // Reset click cooldown when entering VN mode
			lastProcessedScene = -1; // Reset scene tracker to allow first click
		}
	} else {
		// Route to appropriate draw function based on game mode
		switch (gameMode) {
			case 'title':
				drawTitleScreen();
				break;
			case 'nameInput':
				drawNameInputScreen();
				// Draw fade in effect from title screen
				if (fadingIntoNameInput) {
					const elapsedFade = currentTime - fadeIntoNameInputStartTime;
					if (elapsedFade >= fadeIntoNameInputDuration) {
						fadingIntoNameInput = false; // Fade is complete
					} else {
						// Draw black overlay that fades out
						const fadeProgress = elapsedFade / fadeIntoNameInputDuration; // 0 to 1
						const fadeAlpha = (1 - fadeProgress) * 255; // Start opaque, fade to transparent
						fill(0, fadeAlpha);
						noStroke();
						rect(0, 0, width, height);
					}
				}
				break;
			case 'storyTransition':
				drawStoryTransitionScreen(currentTime);
				break;
			case 'garden':
				drawGardenMode(currentTime);
				break;
			case 'vn':
				drawVNMode(currentTime);
				break;
		}
	}

	// Handle input visibility
	checkTextBoxVisibility();
}

function updateAllSprites() {
	// Only update sprites that are visible in current game mode
	if (gameMode === 'vn') {
		// In VN mode, update all VN portrait sprites - pause all other animations for performance
		if (gardenState.tonySmilingVNSprite) {
			gardenState.tonySmilingVNSprite.update();
		}
		if (gardenState.tonyExplainingVNSprite) {
			gardenState.tonyExplainingVNSprite.update();
		}
		if (gardenState.tonyAssuredVNSprite) {
			gardenState.tonyAssuredVNSprite.update();
		}
		if (gardenState.tonyPeacefulVNSprite) {
			gardenState.tonyPeacefulVNSprite.update();
		}
		if (gardenState.tonySadPeacefulVNSprite) {
			gardenState.tonySadPeacefulVNSprite.update();
		}
		if (gardenState.tonyShyVNSprite) {
			gardenState.tonyShyVNSprite.update();
		}
		if (gardenState.tonyContemplativeVNSprite) {
			gardenState.tonyContemplativeVNSprite.update();
		}
		if (gardenState.tonyDeterminedVNSprite) {
			gardenState.tonyDeterminedVNSprite.update();
		}
		if (gardenState.tonyAnxiousVNSprite) {
			gardenState.tonyAnxiousVNSprite.update();
		}
		if (gardenState.tonyConfidentVNSprite) {
			gardenState.tonyConfidentVNSprite.update();
		}
		if (gardenState.tonyHopefulVNSprite) {
			gardenState.tonyHopefulVNSprite.update();
		}
		if (gardenState.tonyRuefulVNSprite) {
			gardenState.tonyRuefulVNSprite.update();
		}
		if (gardenState.tonyHappyVNSprite) {
			gardenState.tonyHappyVNSprite.update();
		}
		if (gardenState.tonyWistfulVNSprite) {
			gardenState.tonyWistfulVNSprite.update();
		}
		if (gardenState.tonyWarmVNSprite) {
			gardenState.tonyWarmVNSprite.update();
		}
		// All other sprites are paused during VN mode for better performance
	} else if (gameMode === 'intro') {
		// In intro mode, update the appropriate Tony sprite based on phase
		if (introPhase === 'none') {
			// Waiting for click - animate tony_start and plants
			if (gardenState.tonyStartSprite) {
				gardenState.tonyStartSprite.update();
			}
			// Also update plant animations while waiting
			for (let plant of frameCachedPlants) {
				if (plant.watered) {
					if (plant.wateredSprite) plant.wateredSprite.update();
				} else {
					if (plant.drySprite) plant.drySprite.update();
				}
			}
			// Update shell and empty plot animations in intro mode
			if (currentSection === 2) {
				if (gardenState.shell.sprite) {
					gardenState.shell.sprite.update();
				}
				if (gardenState.shell.readySprite) {
					gardenState.shell.readySprite.update();
				}
			}
			if (currentSection === 3 && gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		} else if (introPhase === 'tony_start') {
			// During tony_start phase, animate both Tony and plants
			if (gardenState.tonyStartSprite) {
				gardenState.tonyStartSprite.update();
			}
			// Also update plant animations during tony_start
			for (let plant of frameCachedPlants) {
				if (plant.watered) {
					if (plant.wateredSprite) plant.wateredSprite.update();
				} else {
					if (plant.drySprite) plant.drySprite.update();
				}
			}
			// Update shell and empty plot animations in intro mode
			if (currentSection === 2) {
				if (gardenState.shell.sprite) {
					gardenState.shell.sprite.update();
				}
				if (gardenState.shell.readySprite) {
					gardenState.shell.readySprite.update();
				}
			}
			if (currentSection === 3 && gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		} else if (introPhase === 'tony_surprised') {
			if (gardenState.tonySurprisedSprite) {
				gardenState.tonySurprisedSprite.update();
			}
			// Update shell and empty plot animations
			if (currentSection === 2) {
				if (gardenState.shell.sprite) {
					gardenState.shell.sprite.update();
				}
				if (gardenState.shell.readySprite) {
					gardenState.shell.readySprite.update();
				}
			}
			if (currentSection === 3 && gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		} else if (introPhase === 'tony_start_idle') {
			if (gardenState.tonyStartIdleSprite) {
				gardenState.tonyStartIdleSprite.update();
			}
			// Update shell and empty plot animations
			if (currentSection === 2) {
				if (gardenState.shell.sprite) {
					gardenState.shell.sprite.update();
				}
				if (gardenState.shell.readySprite) {
					gardenState.shell.readySprite.update();
				}
			}
			if (currentSection === 3 && gardenState.emptyPlot.sprite) {
				gardenState.emptyPlot.sprite.update();
			}
		}
		// Always update cursor sprites during intro (for question mark animation)
		if (cursorQuestionSprite) {
			cursorQuestionSprite.update();
		}
	} else if (gameMode === 'transitioning') {
		// During section transitions, pause plant animations (they're hidden by fade overlay)
		// Only update Tony's animation since it's still visible
		if (gardenState.tonyState.currentSprite) {
			gardenState.tonyState.currentSprite.update();

			// If action animation finished, switch to action_idle loop
			if (gardenState.tonyState.currentSprite === gardenState.tonyState.tonyActionSprite &&
				gardenState.tonyState.tonyActionSprite.hasFinished) {
				gardenState.tonyState.tonyActionIdleSprite.reset();
				gardenState.tonyState.currentSprite = gardenState.tonyState.tonyActionIdleSprite;
				actionIdleStartTime = millis(); // Track when action_idle starts
			}
		}
	} else {
		// In garden mode, update all visible sprites
		for (let plant of frameCachedPlants) {
			if (plant.watered) {
				if (plant.wateredSprite) plant.wateredSprite.update();
			} else {
				if (plant.drySprite) plant.drySprite.update();
			}
		}

		// Update Tony overworld sprites
		if (gardenState.tonyState.currentSprite) {
			gardenState.tonyState.currentSprite.update();

			// If action animation finished, switch to action_idle loop
			if (gardenState.tonyState.currentSprite === gardenState.tonyState.tonyActionSprite &&
				gardenState.tonyState.tonyActionSprite.hasFinished) {
				gardenState.tonyState.tonyActionIdleSprite.reset();
				gardenState.tonyState.currentSprite = gardenState.tonyState.tonyActionIdleSprite;
				actionIdleStartTime = millis(); // Track when action_idle starts
			}
		}

		// Update cursor sprites (only in garden mode)
		if (cursorSprite) {
			cursorSprite.update();
		}
		if (cursorQuestionSprite) {
			cursorQuestionSprite.update();
		}

		// Update empty plot sprite (only in section 3)
		if (currentSection === 3 && gardenState.emptyPlot.sprite) {
			gardenState.emptyPlot.sprite.update();
		}

		// Update shell sprite (only in section 2)
		if (currentSection === 2) {
			if (gardenState.shell.sprite) {
				gardenState.shell.sprite.update();
			}
			if (gardenState.shell.readySprite) {
				gardenState.shell.readySprite.update();
			}
		}
	}
}

// ========================
// TITLE SCREEN
// ========================

function drawTitleScreen() {
	// Draw title image
	image(assets.titleImage, 0, 0, width, height);
}

// ========================
// NAME INPUT SCREEN
// ========================

function initializeNameInputButtons() {
	nameInputButtons = [];
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	// Calculate centering for the letter buttons
	const totalLetterButtonsWidth = (LETTERS_PER_ROW * BUTTON_SIZE) + ((LETTERS_PER_ROW - 1) * BUTTON_SPACING);
	const startX = (width - totalLetterButtonsWidth) / 2;

	// Create letter buttons (26 letters in 2 rows)
	for (let i = 0; i < alphabet.length; i++) {
		const row = Math.floor(i / LETTERS_PER_ROW);
		const col = i % LETTERS_PER_ROW;
		const x = startX + col * (BUTTON_SIZE + BUTTON_SPACING);
		const y = BUTTON_ROWS_START_Y + row * (BUTTON_SIZE + BUTTON_SPACING);

		nameInputButtons.push({
			label: alphabet[i],
			x: x,
			y: y,
			width: BUTTON_SIZE,
			height: BUTTON_SIZE,
			type: 'letter',
			isHovered: false
		});
	}

	// Create action buttons (SPACE, DELETE, DONE) - centered at bottom
	const actionButtonWidth = 254; // otherbox.png width
	const actionButtonHeight = 85; // otherbox.png height
	const actionButtonY = BUTTON_ROWS_START_Y + (LETTER_ROWS * (BUTTON_SIZE + BUTTON_SPACING)) + 40;

	// Total width needed for 3 action buttons
	const totalActionButtonsWidth = (3 * actionButtonWidth) + (2 * BUTTON_SPACING);
	const actionStartX = (width - totalActionButtonsWidth) / 2;

	// SPACE button
	nameInputButtons.push({
		label: "SPACE",
		x: actionStartX,
		y: actionButtonY,
		width: actionButtonWidth,
		height: actionButtonHeight,
		type: 'action',
		isHovered: false
	});

	// DELETE button
	nameInputButtons.push({
		label: "DELETE",
		x: actionStartX + actionButtonWidth + BUTTON_SPACING,
		y: actionButtonY,
		width: actionButtonWidth,
		height: actionButtonHeight,
		type: 'action',
		isHovered: false
	});

	// DONE button
	nameInputButtons.push({
		label: "DONE",
		x: actionStartX + (2 * (actionButtonWidth + BUTTON_SPACING)),
		y: actionButtonY,
		width: actionButtonWidth,
		height: actionButtonHeight,
		type: 'action',
		isHovered: false
	});
}

function drawNameInputScreen() {
	// Semi-transparent dark background
	background(39, 30, 50, 255);

	// Draw personable prompt at top in bigger text
	push();
	fill(255, 253, 191); // Game's text color
	textSize(40);
	textAlign(CENTER);
	text("Your Name?", width / 2, 65);
	pop();

	// Draw nameBox at center with current input and character count
	const nameBoxWidth = 500;
	const nameBoxHeight = 116;
	const nameBoxX = (width - nameBoxWidth) / 2;
	const nameBoxY = 110;

	if (nameBoxImage) {
		image(nameBoxImage, nameBoxX, nameBoxY, nameBoxWidth, nameBoxHeight);
	}

	// Draw text: current name input + character count
	push();
	fill(78, 30, 51); // Black text
	textSize(32);
	textAlign(CENTER, CENTER);

	let displayText = currentNameInput + ` (${currentNameInput.length}/12)`;
	text(displayText, nameBoxX + nameBoxWidth / 2, nameBoxY + nameBoxHeight / 2 - 4);
	pop();

	// Draw all buttons with hover effects
	for (let i = 0; i < nameInputButtons.length; i++) {
		const button = nameInputButtons[i];

		// Check if button is selected via keyboard
		const isSelected = i === selectedButtonIndex;

		// Check if button is hovered by mouse (always calculate, but only show raise if not keyboard selected)
		const isHovered = mouseX > button.x && mouseX < button.x + button.width &&
		                 mouseY > button.y && mouseY < button.y + button.height;

		push();

		// Apply hover/select bounce effect (move button up)
		// Only raise if: (hovering AND not keyboard selected) OR (keyboard selected)
		const bounceAmount = (isHovered && selectedButtonIndex === -1) || isSelected ? -12 : 0;
		translate(0, bounceAmount);

		// Draw button image or background
		if (button.type === 'letter') {
			if (textButtonImage) {
				image(textButtonImage, button.x, button.y, button.width, button.height);
			}
		} else {
			if (otherBoxImage) {
				image(otherBoxImage, button.x, button.y, button.width, button.height);
			}
		}

		// Draw button text
		fill(78, 30, 51); // Black text
		textSize(32);
		textAlign(CENTER, CENTER);

		let displayLabel = button.label;
		if (button.label === "SPACE") {
			displayLabel = "[SPACE]";
		} else if (button.label === "DELETE") {
			displayLabel = "[DEL]";
		}

		text(displayLabel, button.x + button.width / 2, button.y + button.height / 2 - 4);

		pop();

		// Change cursor to hand when hovering
		if (isHovered) {
			cursor(HAND);
		}
	}

	// Reset cursor if not hovering any button
	let isHoveringAny = false;
	for (let button of nameInputButtons) {
		if (button.isHovered) {
			isHoveringAny = true;
			break;
		}
	}
	if (!isHoveringAny) {
		cursor('default');
	}
}

function handleNameInputClick() {
	// Check each button for click
	for (let button of nameInputButtons) {
		if (mouseX > button.x && mouseX < button.x + button.width &&
		    mouseY > button.y && mouseY < button.y + button.height) {

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
				if (currentNameInput.length > 0 && currentNameInput.length <= NAME_MAX_LENGTH) {
					playerName = currentNameInput; // Store name in global variable
					gameMode = 'storyTransition'; // Transition to story transition screen
					fadingIntoStoryTransition = true;
					fadeIntoStoryTransitionStartTime = millis();
					storyTransitionStartTime = millis() + fadeIntoStoryTransitionDuration; // Delay text start by fade duration
					storyTransitionFinished = false;

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
// GARDEN MODE
// ========================

function drawGardenMode(currentTime) {
	// Use frame-cached plants for drawing
	let currentSectionPlants = frameCachedPlants;

	// Draw appropriate background based on current section
	if (currentSection === 1) {
		image(gardenAssets.section1Background, 0, 0, width, height);
	} else if (currentSection === 2) {
		image(gardenAssets.section2Background, 0, 0, width, height);
	} else if (currentSection === 3) {
		image(gardenAssets.section3Background, 0, 0, width, height);
	}

	// Draw all plants with sprite animations - only draw the ACTIVE sprite
	for (let plant of currentSectionPlants) {
		if (plant.watered) {
			// ONLY draw watered sprite
			let frame = plant.wateredSprite ? plant.wateredSprite.getCurrentFrame() : null;
			if (frame) {
				image(frame, plant.x, plant.y, plant.width, plant.height);
			}
		} else {
			// ONLY draw dry sprite
			let frame = plant.drySprite ? plant.drySprite.getCurrentFrame() : null;
			if (frame) {
				image(frame, plant.x, plant.y, plant.width, plant.height);
			}
		}
	}

	// Draw empty plot sprite (only in section 3)
	if (currentSection === 3 && gardenState.emptyPlot.sprite) {
		let emptyPlotFrame = gardenState.emptyPlot.sprite.getCurrentFrame();
		if (emptyPlotFrame) {
			image(emptyPlotFrame, gardenState.emptyPlot.x, gardenState.emptyPlot.y, gardenState.emptyPlot.width, gardenState.emptyPlot.height);
		}
	}

	// Draw shell sprite (only in section 2)
	if (currentSection === 2) {
		const allPlantsWatered = checkAllPlantsWatered();
		const shellSpriteToUse = allPlantsWatered ? gardenState.shell.readySprite : gardenState.shell.sprite;

		if (shellSpriteToUse) {
			let shellFrame = shellSpriteToUse.getCurrentFrame();
			if (shellFrame) {
				image(shellFrame, gardenState.shell.x, gardenState.shell.y, gardenState.shell.width, gardenState.shell.height);
			}
		}
	}

	// Draw Tony's sprite animation (only when NOT in VN mode)
	// Tony is scaled to 0.6x and positions scale with viewport
	// In intro mode, only draw Tony in section 1
	if ((gameMode === 'garden' || gameMode === 'transitioning' || (gameMode === 'intro' && currentSection === 1) || (isIntroSequenceVN && gameMode === 'vn'))) {
		const tonyScale = 0.6;
		// Position Tony based on current section
		let tonyX, tonyY;
		if (currentSection === 1) {
			tonyX = 1000 * canvasScale; // Right side of section 1
			tonyY = 250 * canvasScale;
		} else if (currentSection === 2) {
			tonyX = 50 * canvasScale; // Left side for section 2
			tonyY = 250 * canvasScale; // Will be adjusted later by user
		} else if (currentSection === 3) {
			tonyX = 0 * canvasScale; // Right side of section 3
			tonyY = 150 * canvasScale; // Will be adjusted later by user
		}

		// In intro mode, use appropriate sprite based on phase
		// During intro VN fade, use tonyStartIdleSprite to continue the animation
		let currentSprite;
		if (gameMode === 'intro') {
			if (introPhase === 'none' || introPhase === 'tony_start') {
				currentSprite = gardenState.tonyStartSprite;
			} else if (introPhase === 'tony_surprised') {
				currentSprite = gardenState.tonySurprisedSprite;
			} else if (introPhase === 'tony_start_idle') {
				currentSprite = gardenState.tonyStartIdleSprite;
			}
		} else if (isIntroSequenceVN && gameMode === 'vn') {
			// During intro VN fade, use tonyStartIdleSprite
			currentSprite = gardenState.tonyStartIdleSprite;
		} else {
			currentSprite = gardenState.tonyState.currentSprite;
		}
		let tonyFrame = currentSprite ? currentSprite.getCurrentFrame() : null;

		if (tonyFrame) {
			// Maintain aspect ratio by scaling the frame's actual dimensions
			const tonyWidth = tonyFrame.width * tonyScale * canvasScale;
			const tonyHeight = tonyFrame.height * tonyScale * canvasScale;

			// Get the baseline sprite height (tony_start) for consistent positioning
			let baselineHeight = gardenState.tonyStartSprite ?
				gardenState.tonyStartSprite.getCurrentFrame().height * tonyScale * canvasScale :
				tonyHeight;

			// Adjust Y position so bottom of sprite stays consistent
			const adjustedTonyY = tonyY + (baselineHeight - tonyHeight);

			let tonyAlpha = 255;

		// Fade out when entering VN mode (both intro sequence and regular transitions)
		if (gameMode === 'vn') {
			const elapsed = currentTime - vnEntryTime;
			const fadeDuration = isIntroSequenceVN ? introVNEntryDuration : vnEntryDuration;
			if (elapsed < fadeDuration) {
				const progress = elapsed / fadeDuration;
				tonyAlpha = (1 - progress) * 255; // Fade out
			} else {
				tonyAlpha = 0;
			}
		}

		// Fade in when returning from VN mode (back to garden)
		if (fadingOutFromVN && gameMode === 'garden') {
			const elapsed = currentTime - vnEntryTime;
			const fadeDuration = isIntroSequenceVN ? introVNEntryDuration : vnEntryDuration;
			if (elapsed < fadeDuration) {
				const progress = elapsed / fadeDuration;
				tonyAlpha = progress * 255; // Fade in over fadeDuration
			}
			if (elapsed >= fadeDuration) {
				isIntroSequenceVN = false; // Reset flag for next VN transition
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

	// Draw navigation arrows with bobbing animation
	let isArrowHovered = false;
	const arrowSize = 40 * 1.5;
	const arrowBaseY = 20; // Top corner
	const bobSpeed = 0.005; // Extremely slow bobbing
	const bobAmount = 1; // Barely moves
	const bobY = arrowBaseY + Math.sin(currentTime * bobSpeed) * bobAmount;

	// Draw left arrow (go back to section 1) - only show on section 2+
	if ((gameMode === 'garden' || gameMode === 'intro') && currentSection > 1 && gardenAssets.arrowLeft) {
		const arrowLeftX = 20; // Left side
		let leftArrowHovered = mouseX > arrowLeftX && mouseX < arrowLeftX + arrowSize &&
			mouseY > arrowBaseY - bobAmount && mouseY < arrowBaseY + arrowSize + bobAmount;

		let arrowAlpha = leftArrowHovered ? 255 : 180;
		if (leftArrowHovered) {
			cursor(HAND);
			isArrowHovered = true;
		}

		push();
		tint(255, arrowAlpha);
		image(gardenAssets.arrowLeft, arrowLeftX, bobY, arrowSize, arrowSize);
		pop();
	}

	// Draw right arrow (navigate forward) - show on sections 1-2 only
	if ((gameMode === 'garden' || gameMode === 'intro') && currentSection < 3 && gardenAssets.arrowRight) {
		const arrowRightX = width - arrowSize - 20; // Right side
		let rightArrowHovered = mouseX > arrowRightX && mouseX < arrowRightX + arrowSize &&
			mouseY > arrowBaseY - bobAmount && mouseY < arrowBaseY + arrowSize + bobAmount;

		let arrowAlpha = rightArrowHovered ? 255 : 180;
		if (rightArrowHovered) {
			cursor(HAND);
			isArrowHovered = true;
		}

		push();
		tint(255, arrowAlpha);
		image(gardenAssets.arrowRight, arrowRightX, bobY, arrowSize, arrowSize);
		pop();
	}

	// Draw flavor text if active (shown when clicking plants/shell before meeting Tony)
	if (flavorText && currentTime < flavorTextTimer) {
		const elapsed = currentTime - (flavorTextTimer - FLAVOR_TEXT_DURATION);
		const fadeOut = Math.max(0, 1 - (elapsed - (FLAVOR_TEXT_DURATION * 0.7)) / (FLAVOR_TEXT_DURATION * 0.3));
		const alpha = Math.min(1, elapsed / 200) * fadeOut;
		if (gardenAssets.textbox) {
			const tbW = gardenAssets.textbox.width * canvasScale;
			const tbH = gardenAssets.textbox.height * canvasScale;
			const tbX = (width - tbW) / 2;
			const tbY = height - tbH - 10 * canvasScale;
			push();
			tint(255, alpha * 255);
			image(gardenAssets.textbox, tbX, tbY, tbW, tbH);
			pop();
			push();
			textFont(myFont);
			textSize(20 * canvasScale);
			textAlign(CENTER, CENTER);
			fill(74, 42, 60, alpha * 255);
			noStroke();
			text(flavorText, tbX + tbW / 2, tbY + tbH / 2);
			pop();
		}
	} else if (flavorText && currentTime >= flavorTextTimer) {
		flavorText = "";
	}

	// Draw custom cursor when hovering plants or interactive areas (mouseMoved() tracks hover state)
	if (isCurrentlyHoveringPlant && cursorSprite) {
		cursor('none'); // Hide default cursor
		let cursorFrame = cursorSprite.getCurrentFrame();
		if (cursorFrame) {
			push();
			imageMode(CENTER);
			image(cursorFrame, mouseX + cursorOffsetX, mouseY + cursorOffsetY, cursorWidth, cursorHeight);
			pop();
		}
	} else if (isHoveringInteractiveArea && cursorQuestionSprite && !(gameMode === 'intro' && introStarted)) {
		cursor('none'); // Hide default cursor
		let cursorFrame = cursorQuestionSprite.getCurrentFrame();
		if (cursorFrame) {
			push();
			imageMode(CENTER);
			image(cursorFrame, mouseX + cursorOffsetX, mouseY + cursorOffsetY, cursorWidth, cursorHeight);
			pop();
		}
	} else if (isArrowHovered) {
		cursor(HAND);
	} else {
		cursor('default');
	}

	// Draw section transition fade overlay
	if (isTransitioningSection) {
		const elapsed = currentTime - sectionTransitionTime;
		const progress = Math.min(elapsed / sectionTransitionDuration, 1);

		// Fade out then in - goes from 0 -> 1 -> 0 alpha over the duration
		const fadeAlpha = progress < 0.5 ?
			(progress * 2) * 255 :  // First half: fade in (0 to 1)
			((1 - progress) * 2) * 255;  // Second half: fade out (1 to 0)

		push();
		fill(0, 0, 0, fadeAlpha);
		rect(0, 0, width, height);
		pop();

		// When fade reaches midpoint, actually change the section
		if (progress >= 0.5 && currentSection !== nextSectionTarget) {
			currentSection = nextSectionTarget;
		}

		// Finish transition when complete
		if (progress >= 1) {
			isTransitioningSection = false;
		}
	}

}

// ========================
// VN MODE
// ========================

function drawVNMode(currentTime) {
	// Draw garden background
	if (gardenState.backgroundImage) {
		image(gardenState.backgroundImage, 0, 0, width, height);
	}

	// Draw all plants with sprite animations so they're visible behind the VN UI
	let currentSectionPlants = frameCachedPlants;
	for (let plant of currentSectionPlants) {
		if (plant.watered) {
			// ONLY draw watered sprite
			let frame = plant.wateredSprite ? plant.wateredSprite.getCurrentFrame() : null;
			if (frame) {
				image(frame, plant.x, plant.y, plant.width, plant.height);
			}
		} else {
			// ONLY draw dry sprite
			let frame = plant.drySprite ? plant.drySprite.getCurrentFrame() : null;
			if (frame) {
				image(frame, plant.x, plant.y, plant.width, plant.height);
			}
		}
	}

	// Draw empty plot sprite (only in section 3)
	if (currentSection === 3 && gardenState.emptyPlot.sprite) {
		let emptyPlotFrame = gardenState.emptyPlot.sprite.getCurrentFrame();
		if (emptyPlotFrame) {
			image(emptyPlotFrame, gardenState.emptyPlot.x, gardenState.emptyPlot.y, gardenState.emptyPlot.width, gardenState.emptyPlot.height);
		}
	}

	// Draw shell sprite (only in section 2)
	if (currentSection === 2 && gardenState.shell.sprite) {
		let shellFrame = gardenState.shell.sprite.getCurrentFrame();
		if (shellFrame) {
			image(shellFrame, gardenState.shell.x, gardenState.shell.y, gardenState.shell.width, gardenState.shell.height);
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
	let fadeSprite = isIntroSequenceVN ? gardenState.tonyStartIdleSprite : gardenState.tonyState.currentSprite;
	let tonyFadeFrame = fadeSprite ? fadeSprite.getCurrentFrame() : null;

	if (tonyFadeFrame) {
		const tonyWidth = tonyFadeFrame.width * tonyScale * canvasScale;
		const tonyHeight = tonyFadeFrame.height * tonyScale * canvasScale;

		let baselineHeight = gardenState.tonyStartSprite ?
			gardenState.tonyStartSprite.getCurrentFrame().height * tonyScale * canvasScale :
			tonyHeight;

		const adjustedTonyY = tonyY + (baselineHeight - tonyHeight);

		// Calculate fade based on VN entry time
		const elapsed = currentTime - vnEntryTime;
		const fadeDuration = isIntroSequenceVN ? introVNEntryDuration : vnEntryDuration;
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

	// Only draw VN if we have a valid scene
	if (!scenes[currentScene]) {
		return;
	}

	// Draw portrait (left side) - 400x500px at bottom using Tony smile sprite
	const portraitWidth = 400;
	const portraitHeight = 500;
	const portraitX = 20;
	let portraitY = height - portraitHeight;
	let portraitAlpha = 255;
	let overlayAlpha = 80;

	// Animate entry: fade in + slide up (subtle)
	const fadeInDuration = isIntroSequenceVN ? introVNEntryDuration : vnEntryDuration;
	if (currentTime - vnEntryTime < fadeInDuration) {
		const progress = (currentTime - vnEntryTime) / fadeInDuration;
		// Slide up from 40px below (subtle)
		portraitY += (1 - progress) * 40;
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
	let portraitSprite = gardenState.tonySmilingVNSprite;
	if (scenes[currentScene] && scenes[currentScene].image) {
		portraitSprite = scenes[currentScene].image;
	}

	// Create the default sprite once if it doesn't exist
	if (!gardenState.tonySmilingVNSprite) {
		gardenState.tonySmilingVNSprite = new Sprite(sprites.tonySmilingFrames, 3, true);
		portraitSprite = gardenState.tonySmilingVNSprite;
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
	const dialogY = height - (175 * canvasScale);

	// Draw textbox.png at its natural size without stretching
	let textboxImg = gardenAssets.textbox;
	let textboxWidth = textboxImg.width * canvasScale;
	let textboxHeight = textboxImg.height * canvasScale;

	// Calculate textbox fade-in
	let textboxAlpha = 255;
	const textboxFadeDuration = isIntroSequenceVN ? introTextboxFadeInDuration : textboxFadeInDuration;
	const textboxElapsed = currentTime - vnEntryTime;
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
	fill(74, 42, 60); // White text for dark textbox
	textSize(20);
	textAlign(LEFT, TOP);
	textFont(myFont);

	// Reset the "just finished" flag at the start of each draw frame
	typewriterJustFinishedThisFrame = false;

	// Calculate typewriter progress (delay if coming from intro sequence)
	const typewriterDelayDuration = isIntroSequenceVN ? introTextboxFadeInDuration : 0;
	let rawElapsedTime = currentTime - typewriterStartTime;
	let elapsedTime = Math.max(0, rawElapsedTime - typewriterDelayDuration);
	let charsToShow = Math.floor(elapsedTime / typewriterSpeed);

	// Use cached dialogue values (parsed once at scene start, not every frame)
	let dialogueText = "";
	// Only mark typewriter as finished if we have dialogue and have shown all of it
	if (cachedDialogueOnly && cachedDialogueOnly.length > 0 && charsToShow >= cachedDialogueOnly.length) {
		// Track if this is the frame where typewriter JUST finished
		if (!typewriterFinished) {
			console.log(`[DRAW] Typewriter JUST finished. Scene: ${currentScene}, charsToShow: ${charsToShow}, totalChars: ${cachedDialogueOnly.length}`);
			typewriterJustFinishedThisFrame = true;
		}
		typewriterFinished = true;
		// Only build full dialogue once when typewriter finishes
		if (lastCachedTypewriterChars !== cachedDialogueOnly.length) {
			let fullText = cachedDialogueOnly;

			// If scene has choices, add them
			if (cachedChoiceLines.length > 0) {
				fullText += '\n' + cachedChoiceLines.join('\n');
			} else if (!scenes[currentScene].keys || scenes[currentScene].keys.length === 0) {
				// If scene has no keys, add a Continue line
				fullText += '\n> Continue';
			}

			cachedFullDialogueWithChoices = fullText;
			lastCachedTypewriterChars = cachedDialogueOnly.length;
		}
		dialogueText = cachedFullDialogueWithChoices;
		// Reset flag after text finishes typing
		isIntroSequenceVN = false;
	} else {
		// Show only typed portion of dialogue (no choices yet)
		dialogueText = cachedDialogueOnly.substring(0, charsToShow);
	}

	// Create clickable choice areas (rebuild when typewriter finishes, clear when typing)
	if (typewriterFinished) {
		updateChoiceAreasWithYPositions(dialogX, dialogY, dialogWidth, dialogHeight, dialogueText);
	} else {
		buttons = [];
	}

	// Draw text with hover highlighting for choices
	// Set text wrapping once before push to avoid repeated state changes
	textWrap(WORD);

	push();

	// Split and draw with hover color for choice lines
	let lines = dialogueText.split('\n');
	let yPos = dialogY + (30 * canvasScale);
	const lineHeight = 28;

	// Create a map of hovered button texts for O(1) lookup instead of nested loop
	let hoveredButtonTexts = new Set();
	for (let button of buttons) {
		if (button.isHovered) {
			hoveredButtonTexts.add(button.text);
		}
	}

	for (let line of lines) {
		// Check if this line is a hovered choice using Set lookup (O(1) instead of O(n))
		let isHovered = hoveredButtonTexts.has(line);

		if (isHovered) {
			fill(40, 148, 102); // Hovered choices
		} else {
			fill(74, 42, 60); // Normal text
		}

		text(line, dialogX + 30, yPos, dialogWidth - 60);
		yPos += lineHeight;
	}

	pop();

	// Reset cursor to default in VN mode (not hovering any interactive elements)
	cursor('default');

	// DEMO END: Fade to white after shell dialogue ending
	if (fadingToTitleAfterShell) {
		const currentTime = millis();
		const elapsed = currentTime - fadeToTitleStartTime;
		const progress = Math.min(elapsed / fadeToTitleDuration, 1);

		// Draw white overlay with increasing opacity
		push();
		fill(255, 255, 255, progress * 255);
		noStroke();
		rect(0, 0, width, height);
		pop();

		// When fade completes, return to title screen
		if (progress >= 1) {
			fadingToTitleAfterShell = false;
			gameMode = 'title';
			resetGame(); // Reset all game state for new playthrough
		}
	}
}

function updateChoiceAreasWithYPositions(dialogX, dialogY, dialogWidth, dialogHeight, dialogueText) {
	buttons = [];

	if (!scenes[currentScene]) {
		return;
	}

	// Split full dialogue to track Y positions correctly
	let lines = dialogueText.split('\n');
	let yPos = dialogY + (30 * canvasScale);
	const lineHeight = 28;
	const maxTextWidth = dialogWidth - 60;

	// Iterate through all lines and create buttons for choice lines and Continue lines
	for (let line of lines) {
		let isClickable = false;
		let buttonIndex = 0;

		// Check if this line is a choice (only if scene has choices)
		if (scenes[currentScene].keys && scenes[currentScene].keys.length > 0 && cachedChoiceSet.has(line)) {
			isClickable = true;
			buttonIndex = cachedChoiceLines.indexOf(line);
		}
		// Check if this line is the Continue text for linear scenes
		else if (line === "> Continue" && (!scenes[currentScene].keys || scenes[currentScene].keys.length === 0)) {
			isClickable = true;
			buttonIndex = 0;
		}

		if (isClickable) {
			const startX = dialogX + 30;
			const width = Math.min(textWidth(line), maxTextWidth);

			const button = {
				x: startX,
				y: yPos,
				width: width,
				height: lineHeight,
				index: buttonIndex,
				key: line === "> Continue" ? null : scenes[currentScene].keys[buttonIndex],
				text: line,
				isHovered: false,
			};

			// Check if mouse is over this button
			if (mouseX > button.x && mouseX < button.x + button.width &&
				mouseY > button.y && mouseY < button.y + button.height) {
				button.isHovered = true;
			}

			buttons.push(button);
		}

		yPos += lineHeight;
	}
}


// ========================
// INPUT HANDLING
// ========================

function keyPressed() {
	userStartAudio();

	// Title screen - start game with any key
	if (gameMode === 'title') {
		currentScene = 0;
		gameMode = 'nameInput'; // Go to name input screen
		currentNameInput = "";
		fadingIntoNameInput = true; // Start fade effect
		fadeIntoNameInputStartTime = millis();
		document.body.classList.add('nameInput-active'); // Show panel-3
		return false;
	}

	// Story transition screen - skip with Enter or Space
	if (gameMode === 'storyTransition') {
		if (keyCode === ENTER || keyCode === 32) { // 32 is Space
			gameMode = 'intro';
			currentSection = 2;
			fadingIntoIntro = true;
			fadeIntoIntroStartTime = millis();
			introStartTime = millis() + fadeIntoIntroDuration;
			introPhase = 'none';
			introPhaseStartTime = millis() + fadeIntoIntroDuration;
			introStarted = false;

			// Reset intro sprites
			gardenState.tonyStartSprite.reset();
			gardenState.tonySurprisedSprite.reset();
			gardenState.tonyStartIdleSprite.reset();

			// Hide panel-3 when entering intro
			document.body.classList.remove('nameInput-active');
			return false;
		}
	}

	// Name input screen - handle keyboard input
	if (gameMode === 'nameInput') {
		// Enter to submit name (check FIRST before anything else)
		if (keyCode === ENTER) {
			if (currentNameInput.length > 0 && currentNameInput.length <= NAME_MAX_LENGTH) {
				playerName = currentNameInput;
				gameMode = 'storyTransition';
				fadingIntoStoryTransition = true;
				fadeIntoStoryTransitionStartTime = millis();
				storyTransitionStartTime = millis() + fadeIntoStoryTransitionDuration; // Delay text start by fade duration
				storyTransitionFinished = false;

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
			selectedButtonIndex = (selectedButtonIndex - 1 + nameInputButtons.length) % nameInputButtons.length;
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
			selectedButtonIndex = (selectedButtonIndex - LETTERS_PER_ROW + nameInputButtons.length) % nameInputButtons.length;
			return false;
		}
		if (keyCode === DOWN_ARROW) {
			if (selectedButtonIndex === -1) selectedButtonIndex = 0;
			// Move down by LETTERS_PER_ROW buttons
			selectedButtonIndex = (selectedButtonIndex + LETTERS_PER_ROW) % nameInputButtons.length;
			return false;
		}
		// Space to select current button (or add space if not navigating)
		if (key === ' ') {
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
					if (currentNameInput.length > 0 && currentNameInput.length <= NAME_MAX_LENGTH) {
						playerName = currentNameInput;
						gameMode = 'garden';
						currentSection = 1;
						gardenState.tonyState.currentSprite = gardenState.tonyState.tonyIdleSprite;
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
		if ((key >= 'A' && key <= 'Z') || (key >= 'a' && key <= 'z')) {
			if (currentNameInput.length < NAME_MAX_LENGTH) {
				currentNameInput += key.toUpperCase();
			}
			return false;
		}
		// Ignore all other keys (don't let them pass through)
		return false;
	}

	// Garden mode - no keyboard interaction yet
	if (gameMode === 'garden') {
		return false;
	}

	// VN mode - input handling
	if (gameMode === 'vn') {
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
					handleVNChoice(i);
					return false;
				}
			}
			// Any other key is ignored (including ENTER/SPACE)
			return false;
		}

		// Scene has NO choices - only accept ENTER or SPACE to click Continue button
		if (keyCode === ENTER || keyCode === 32) { // ENTER or SPACE
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
	if (gameMode === 'title') {
		currentScene = 0;
		gameMode = 'nameInput'; // Go to name input screen
		currentNameInput = "";
		fadingIntoNameInput = true; // Start fade effect
		fadeIntoNameInputStartTime = millis();
		document.body.classList.add('nameInput-active'); // Show panel-3
		return false;
	}

	// Name input screen - handle button clicks
	if (gameMode === 'nameInput') {
		handleNameInputClick();
		return false;
	}

	// Story transition screen - click to skip to intro
	if (gameMode === 'storyTransition') {
		gameMode = 'intro';
		currentSection = 2;
		fadingIntoIntro = true;
		fadeIntoIntroStartTime = millis();
		introStartTime = millis() + fadeIntoIntroDuration;
		introPhase = 'none';
		introPhaseStartTime = millis() + fadeIntoIntroDuration;
		introStarted = false;

		// Reset intro sprites
		gardenState.tonyStartSprite.reset();
		gardenState.tonySurprisedSprite.reset();
		gardenState.tonyStartIdleSprite.reset();

		// Hide panel-3 when entering intro
		document.body.classList.remove('nameInput-active');
		return false;
	}

	// Intro mode - check if clicked on Tony to start sequence or navigate sections
	if (gameMode === 'intro') {
		// Allow section navigation with arrows before clicking Tony
		const arrowSize = 40 * 1.5;
		const arrowBaseY = 20;
		const bobAmount = 1;

		// Check if clicked left arrow (go back one section)
		if (currentSection > 1) {
			const arrowLeftX = 20;
			if (mouseX > arrowLeftX && mouseX < arrowLeftX + arrowSize &&
				mouseY > arrowBaseY - bobAmount && mouseY < arrowBaseY + arrowSize + bobAmount) {
				startSectionTransition(currentSection - 1);
				return false;
			}
		}

		// Check if clicked right arrow (go forward one section)
		if (currentSection < 3) {
			const arrowRightX = width - arrowSize - 20;
			if (mouseX > arrowRightX && mouseX < arrowRightX + arrowSize &&
				mouseY > arrowBaseY - bobAmount && mouseY < arrowBaseY + arrowSize + bobAmount) {
				startSectionTransition(currentSection + 1);
				return false;
			}
		}

		// Check if clicked a plant before meeting Tony (show flavor text)
		for (let plant of frameCachedPlants) {
			if (mouseX > plant.x && mouseX < plant.x + plant.width &&
				mouseY > plant.y && mouseY < plant.y + plant.height) {
				const plantFlavor = {
					thyme:      "Looks like someone's been gardening...",
					rosemary:   "Looks like someone's been gardening...",
					sunflowers: "These are well taken care of.",
					tulips:     "Someone clearly put some love into this.",
					wildpatch:  "It's unruly.",
					tomatoes:   "These look almost ready to pick.",
					seedling:   "This one doesn't look so great..."
				};
				flavorText = plantFlavor[plant.id] || "Looks like someone's been gardening...";
				flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
				return false;
			}
		}
		// Check if clicked the shell before meeting Tony
		if (currentSection === 2) {
			const area = gardenState.shell;
			if (mouseX > area.x && mouseX < area.x + area.width &&
				mouseY > area.y && mouseY < area.y + area.height) {
				flavorText = "Weird.";
				flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
				return false;
			}
		}

		// Check if clicked on Tony to start sequence (ONLY in section 1 where she's drawn)
		if (introPhase === 'none' && !introStarted && currentSection === 1) {
			// Check if click is on Tony (rough hitbox based on sprite bounds)
			// Tony is positioned at tonyX, tonyY with scale 0.6
			const tonyScale = 0.6;
			const tonyX = 1000 * canvasScale;
			const tonyY = 250 * canvasScale;

			let tonyFrame = gardenState.tonyStartSprite ? gardenState.tonyStartSprite.getCurrentFrame() : null;
			if (tonyFrame) {
				const tonyWidth = tonyFrame.width * tonyScale * canvasScale;
				const tonyHeight = tonyFrame.height * tonyScale * canvasScale;
				const baselineHeight = tonyFrame.height * tonyScale * canvasScale;
				const adjustedTonyY = tonyY + (baselineHeight - tonyHeight);

				// Check if click is within Tony's bounds
				if (mouseX > tonyX && mouseX < tonyX + tonyWidth &&
					mouseY > adjustedTonyY && mouseY < adjustedTonyY + tonyHeight) {
					// Click detected on Tony - immediately go to surprised animation
					introStarted = true;
					introPhase = 'tony_surprised';
					introPhaseStartTime = millis();
					gardenState.tonySurprisedSprite.reset();
					tonySurprisedDuration = (sprites.tonySurprisedFrames.length / 6) * 1000;
					return false;
				}
			}
		}
		return false;
	}

	// Garden mode - check plant clicks and arrow navigation
	if (gameMode === 'garden') {
		const arrowSize = 40 * 1.5;
		const arrowBaseY = 20;
		const bobAmount = 1;

		// Check if clicked left arrow (go back one section)
		if (currentSection > 1) {
			const arrowLeftX = 20;
			if (mouseX > arrowLeftX && mouseX < arrowLeftX + arrowSize &&
				mouseY > arrowBaseY - bobAmount && mouseY < arrowBaseY + arrowSize + bobAmount) {
				startSectionTransition(currentSection - 1);
				return false;
			}
		}

		// Check if clicked right arrow (forward navigation)
		const arrowRightX = width - arrowSize - 20;
		if (mouseX > arrowRightX && mouseX < arrowRightX + arrowSize &&
			mouseY > arrowBaseY - bobAmount && mouseY < arrowBaseY + arrowSize + bobAmount) {
			// Only navigate forward if we have a section beyond current
			if (currentSection < 3) {
				startSectionTransition(currentSection + 1);
			}
			return false;
		}

		// Check if player clicked a plant (only check plants in current section)
		let currentSectionPlants = getPlantsForSection(currentSection);
		for (let plant of currentSectionPlants) {
			if (mouseX > plant.x && mouseX < plant.x + plant.width &&
				mouseY > plant.y && mouseY < plant.y + plant.height) {
				// Only trigger if plant hasn't been watered yet (or debug mode is on)
				if (!plant.watered || DEBUG_MODE) {
					waterPlant(plant.id);
				} else {
					const wateredFlavor = {
						thyme:      "The thyme smells wonderful.",
						rosemary:   "The rosemary is looking good.",
						sunflowers: "They're soaking up the sun.",
						tulips:     "All taken care of.",
						wildpatch:  "Doing its own thing, as usual.",
						tomatoes:   "Getting closer to ready.",
						seedling:   "Hanging in there."
					};
					flavorText = wateredFlavor[plant.id] || "Already watered.";
					flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
				}
				return false;
			}
		}

		// Check if player clicked the interactive area (in section 3)
		if (currentSection === 3) {
			const area = gardenState.emptyPlot;
			if (mouseX > area.x && mouseX < area.x + area.width &&
				mouseY > area.y && mouseY < area.y + area.height) {
				// Only allow conversation once (unless debug mode)
				if (!area.visited || DEBUG_MODE) {
					startInteractiveAreaConversation();
					area.visited = true;
				}
				return false;
			}
		}

			// Check if player clicked the shell interactive area (in section 2)
		if (currentSection === 2) {
			const area = gardenState.shell;
			if (mouseX > area.x && mouseX < area.x + area.width &&
				mouseY > area.y && mouseY < area.y + area.height) {
				// Shell can be clicked multiple times to trigger different conversations
				startShellConversation();
				return false;
			}
		}

	return false;
	}

	// VN mode - click on choices or advance dialogue
	if (gameMode === 'vn') {
		// CRITICAL: Debounce clicks - prevent multiple mousePressed calls for same click
		const currentTime = millis();
		if (currentTime - lastClickTime < CLICK_COOLDOWN) {
			console.log(`[CLICK DEBOUNCED] Too soon after last click (${currentTime - lastClickTime}ms since last)`);
			return false;
		}
		lastClickTime = currentTime;

		// Prevent processing multiple clicks in same frame
		if (clickProcessedThisFrame) {
			console.log(`[CLICK BLOCKED] Already processed a click this frame`);
			return false;
		}
		clickProcessedThisFrame = true;

		// Safety check: ensure currentScene is valid
		if (!scenes[currentScene]) {
			return false;
		}

		const clickId = Math.random().toString(36).substring(7);
		console.log(`[CLICK ${clickId}] START - Scene: ${currentScene}, typewriterFinished: ${typewriterFinished}`);

		// CRITICAL: If typewriter is still typing, ONLY allow speeding it up
		// Block all progression (choices, advancing scenes) until text finishes
		if (!typewriterFinished) {
			console.log(`[CLICK ${clickId}] Typewriter still typing - speeding up`);
			// Use cachedDialogueOnly which already has player name substituted
			// This prevents character count mismatches when using [PLAYER_NAME] in dialogue
			let dialogueOnly = cachedDialogueOnly;
			// Fast-forward typewriter to the end
			typewriterStartTime = millis() - (dialogueOnly.length * typewriterSpeed);
			typewriterFinished = true;
			// Mark that we just sped up - this blocks progression on NEXT click
			userJustSpedUpTypewriter = true;

			// Block everything else - no progression, no choices, nothing
			// Text is now visible, but next click is required to advance
			console.log(`[CLICK ${clickId}] RETURNING after speedup`);
			return false;
		}

		// TEXT IS NOW GUARANTEED TO BE FINISHED - safe to process input

		// Just reset the speedup flag - don't block based on it
		userJustSpedUpTypewriter = false;

		// Check if clicked on a button - ONLY allow clicks on actual buttons
		for (let button of buttons) {
			if (mouseX > button.x && mouseX < button.x + button.width &&
				mouseY > button.y && mouseY < button.y + button.height) {
				console.log(`[CLICK ${clickId}] Button clicked`);
				handleVNChoice(button.index);
				return false;
			}
		}

		// Click was not on any button - ignore it
		console.log(`[CLICK ${clickId}] Click not on any button - ignoring`);
		return false;
	}

	return false;
}

function mouseMoved() {
	// In intro mode: handle all hover (Tony in section 1, plants/shell everywhere)
	if (gameMode === 'intro') {
		if (introStarted) {
			isHoveringInteractiveArea = false;
			cursor('default');
			return false;
		}

		// Check Tony hover (section 1 only)
		if (currentSection === 1) {
			const tonyScale = 0.6;
			const tonyX = 1000 * canvasScale;
			const tonyY = 250 * canvasScale;
			let tonyFrame = gardenState.tonyStartSprite ? gardenState.tonyStartSprite.getCurrentFrame() : null;
			if (tonyFrame) {
				const tonyWidth = tonyFrame.width * tonyScale * canvasScale;
				const tonyHeight = tonyFrame.height * tonyScale * canvasScale;
				const adjustedTonyY = tonyY + (tonyFrame.height * tonyScale * canvasScale - tonyHeight);
				if (mouseX > tonyX && mouseX < tonyX + tonyWidth &&
					mouseY > adjustedTonyY && mouseY < adjustedTonyY + tonyHeight) {
					isHoveringInteractiveArea = true;
					return false;
				}
			}
		}

		// Check plants in current section
		for (let plant of frameCachedPlants) {
			if (mouseX > plant.x && mouseX < plant.x + plant.width &&
				mouseY > plant.y && mouseY < plant.y + plant.height) {
				isHoveringInteractiveArea = true;
				return false;
			}
		}

		// Check shell in section 2
		if (currentSection === 2) {
			const area = gardenState.shell;
			if (mouseX > area.x && mouseX < area.x + area.width &&
				mouseY > area.y && mouseY < area.y + area.height) {
				isHoveringInteractiveArea = true;
				return false;
			}
		}

		isHoveringInteractiveArea = false;
		cursor('default');
		return false;
	}

	// Only check collision for cursor when in garden mode
	if (gameMode !== 'garden') {
		return false;
	}

	// Check if mouse is over any un-watered plants in current section
	isCurrentlyHoveringPlant = false;
	// Early exit after finding first hovered plant
	for (let plant of frameCachedPlants) {
		// Skip watered plants entirely
		if (plant.watered) continue;

		if (mouseX > plant.x && mouseX < plant.x + plant.width &&
			mouseY > plant.y && mouseY < plant.y + plant.height) {
			isCurrentlyHoveringPlant = true;
			break;
		}
	}

	// Check if mouse is over interactive area in section 3 (avoid check if not in section 3)
	// Only show question cursor if the area hasn't been visited yet
	if (currentSection === 3 && (!gardenState.emptyPlot.visited || DEBUG_MODE)) {
		const area = gardenState.emptyPlot;
		isHoveringInteractiveArea = (mouseX > area.x && mouseX < area.x + area.width &&
			mouseY > area.y && mouseY < area.y + area.height);
	}
	// Check if mouse is over shell interactive area in section 2
	else if (currentSection === 2 && (!gardenState.shell.visited || DEBUG_MODE)) {
		const area = gardenState.shell;
		isHoveringInteractiveArea = (mouseX > area.x && mouseX < area.x + area.width &&
			mouseY > area.y && mouseY < area.y + area.height);
	} else {
		isHoveringInteractiveArea = false;
	}

	// Note: Don't set cursor here - let drawGardenMode() handle all cursor display
	// This allows the custom cursor sprite to be drawn properly

	return false;
}

// ========================
// GARDEN MODE FUNCTIONS
// ========================

function startSectionTransition(targetSection) {
	// Start the fade transition to a new section
	isTransitioningSection = true;
	nextSectionTarget = targetSection;
	sectionTransitionTime = millis();
}

function waterPlant(plantId) {
	// Find the clicked plant and its group in current section
	let currentSectionPlants = getPlantsForSection(currentSection);
	let clickedPlant = currentSectionPlants.find(p => p.id === plantId);
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

function startPlantConversation(groupId) {

	// Mark that we should return to garden after conversation
	returnToGardenAfterVN = true;
	triggeringPlantId = groupId;

	// Update background based on current section
	if (currentSection === 1) {
		gardenState.backgroundImage = gardenAssets.section1Background;
	} else if (currentSection === 2) {
		gardenState.backgroundImage = gardenAssets.section2Background;
	} else if (currentSection === 3) {
		gardenState.backgroundImage = gardenAssets.section3Background;
	}

	// Start the appropriate conversation based on group
	if (groupId === 'herbs') {
		currentScene = 0;
	} else if (groupId === 'flowers') {
		currentScene = 100;
	} else if (groupId === 'wildpatch') {
		currentScene = 200;
	} else if (groupId === 'tomatoes') {
		currentScene = 400;
	} else if (groupId === 'seedling') {
		currentScene = 500;
	}

	// Reset cursor state for clean VN mode transition
	isCurrentlyHoveringPlant = false;
	cursor('default');

	// Set timer to delay VN mode entry so we can see plants watered
	vnTransitionTime = millis();
	gameMode = 'transitioning'; // Temporary mode to show watered plants
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
	cursor('default');

	// Enter VN mode directly (no action animation needed)
	vnEntryTime = millis();
	gameMode = 'vn';
	resetTypewriter();
	lastClickTime = 0; // Reset click cooldown when entering VN mode
	lastProcessedScene = -1; // Reset scene tracker to allow first click
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
			gardenState.shell.postGameConversationStarted = true;
		} else if (!gardenState.shell.postGameConversationStarted) {
			// Talked to shell early, now ready to discuss it post-game
			currentScene = 800;
			gardenState.shell.postGameConversationStarted = true;
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
	cursor('default');

	// Enter VN mode directly (no action animation needed)
	vnEntryTime = millis();
	gameMode = 'vn';
	resetTypewriter();
	lastClickTime = 0; // Reset click cooldown when entering VN mode
	lastProcessedScene = -1; // Reset scene tracker to allow first click
}

// ========================
// VN MODE FUNCTIONS
// ========================

function handleVNChoice(choiceIndex) {
	if (!scenes[currentScene]) {
		return;
	}

	// Check if this is an ending scene
	if (scenes[currentScene].isEndingScene) {
		// Shell ending scenes trigger demo end fade-to-title
		if (currentScene >= 800 && currentScene <= 999) {
			// Shell conversation ending - fade to white and return to title
			fadingToTitleAfterShell = true;
			fadeToTitleStartTime = millis();
		} else {
			// Regular ending scenes return to garden
			returnToGardenAfterVN = false;
			gameMode = 'garden';
			// Reset Tony's idle sprite when returning from VN
			gardenState.tonyState.currentSprite = gardenState.tonyState.tonyIdleSprite;
			gardenState.tonyState.tonyIdleSprite.reset();
			// Reset cursor state when returning to garden
			isCurrentlyHoveringPlant = false;
			cursor('default');
		}
		return;
	}

	let nextScene;

	// If scene has no keys (linear "Continue" button), advance to nextPages[0] or next scene
	if (!scenes[currentScene].keys || scenes[currentScene].keys.length === 0) {
		if (scenes[currentScene].nextPages && scenes[currentScene].nextPages.length > 0) {
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
	if (nextScene < 0 || nextScene >= scenes.length) {
		return;
	}

	currentScene = nextScene;
	resetTypewriter();

	// Check if conversation ended - return to garden if needed
	if (returnToGardenAfterVN && currentScene === 1) {
		// Exit button clicked - go back to garden
		returnToGardenAfterVN = false;
		gameMode = 'garden';
		// Reset cursor state when returning to garden
		isCurrentlyHoveringPlant = false;
		cursor('default');
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
		cachedDialogueText = scenes[currentScene].text.replace(/\[PLAYER_NAME\]/g, playerName);
		let allLines = cachedDialogueText.split('\n');
		let dialogueLines = [];
		cachedChoiceLines = [];
		cachedChoiceSet.clear(); // Clear previous choices
		cachedChoiceWidths = [];

		for (let line of allLines) {
			// Only treat as choice if it matches pattern [1], [2], [3], etc.
			if (line.match(/^\s*\[\d+\]/)) {
				cachedChoiceLines.push(line);
				cachedChoiceSet.add(line); // Add to Set for O(1) lookup
				// Pre-calculate button widths to avoid expensive textWidth() calls every frame
				cachedChoiceWidths.push(textWidth(line));
			} else {
				dialogueLines.push(line);
			}
		}
		cachedDialogueOnly = dialogueLines.join('\n');
	}
}

// ========================
// STORY TRANSITION SCREEN
// ========================

function drawStoryTransitionScreen(currentTime) {
	// Draw name input screen background (same dark color)
	background(39, 30, 50); // #271e32

	// Draw main text with typewriter effect
	textFont(myFont);
	textSize(32);
	textAlign(CENTER, CENTER);
	fill(255, 253, 191); // Light cream color

	// Calculate typewriter progress with slower speed for story transition
	let elapsedTime = currentTime - storyTransitionStartTime;
	let charsToShow = Math.floor(elapsedTime / storyTransitionTypewriterSpeed);

	// Combine the two lines
	let fullText = playerName + "...!\nThis path leads to a familiar place...";
	let allChars = fullText.length;

	// Show typewriter effect
	if (charsToShow >= allChars) {
		storyTransitionFinished = true;
		// Auto-advance to intro after duration
		if (elapsedTime >= storyTransitionDuration) {
			gameMode = 'intro';
			currentSection = 2;
			fadingIntoIntro = true;
			fadeIntoIntroStartTime = currentTime;
			introStartTime = currentTime + fadeIntoIntroDuration;
			introPhase = 'none';
			introPhaseStartTime = currentTime + fadeIntoIntroDuration;
			introStarted = false;

			// Reset intro sprites
			gardenState.tonyStartSprite.reset();
			gardenState.tonySurprisedSprite.reset();
			gardenState.tonyStartIdleSprite.reset();

			// Hide panel-3 when entering intro
			document.body.classList.remove('nameInput-active');
		}
	}

	// Show typed text
	let displayText = fullText.substring(0, charsToShow);
	text(displayText, width / 2, height / 2);

	// Draw fade in effect from name input
	if (fadingIntoStoryTransition) {
		const elapsedFade = currentTime - fadeIntoStoryTransitionStartTime;
		if (elapsedFade >= fadeIntoStoryTransitionDuration) {
			fadingIntoStoryTransition = false; // Fade is complete
		} else {
			// Draw black overlay that fades out
			const fadeProgress = elapsedFade / fadeIntoStoryTransitionDuration; // 0 to 1
			const fadeAlpha = (1 - fadeProgress) * 255; // Start opaque, fade to transparent
			fill(0, fadeAlpha);
			noStroke();
			rect(0, 0, width, height);
		}
	}

	// Allow clicking to skip to intro
	// (handled in mousePressed)
}

// ========================
// UI MANAGEMENT
// ========================

function checkTextBoxVisibility() {
	// Always hide input - no name input scene anymore
	inp.hide();
}

// ========================
// SCENE DATA (VN MODE)
// ========================

function setupScenes() {
	// ===== OPENING SEQUENCE (SCENES 1000-1099) =====

	// Scene 1000: Tony's opening line
	scenes[1000] = {
		text: "Hey! Oh wow, hi!",
		image: assets.hopeful, // TODO: Replace with caught_off_guard expression when available
		keys: [],
		nextPages: [1001]
	};

	scenes[1001] = {
		text: "[PLAYER_NAME]? Is that you?\n[1] Slime Tony?!",
		image: assets.hopeful,
		keys: ["1"],
		nextPages: [1002] // Branch 1 or Branch 2
	};

	// ===== BRANCH 1: "Tony?!" =====
	scenes[1002] = {
		text: "Yeah! You recognized me? I know I've changed a bit...",
		image: assets.shy, // TODO: Replace with tony_shy.png
		keys: [],
		nextPages: [1003]
	};
	
	scenes[1003] = {
		text: "It's great seeing you again.\n[1] What are you up to? Someone's been gardening up a storm.",
		image: assets.smiling_waving,
		keys: ["1"],
		nextPages: [1010] // Branch A or Branch B
	};

	// ===== BRANCH B: "What are you doing out here?" =====
	scenes[1010] = {
		text: "That'd be me! Picked up the hobby a while back.",
		image: assets.happy,
		keys: [],
		nextPages: [1010.5]
	};

	scenes["1010.5"] = {
		text: "Kind of a long story how I got into it.\n[1] I'm always down for story time.",
		image: assets.explaining, // 
		keys: ["1"],
		nextPages: [1011] // Both lead to same convergence
	};

	scenes["1010.5"].text = "Kind of a long story how I got into it.\n[1] I'm always down for story time.";

	// ===== BRANCHES A & B CONVERGE HERE + FINAL CHOICE =====
	scenes[1011] = {
		text: "Actually... would you mind helping me water? We could catch up while we work.\n[1] Sure!\n[2] Sounds like a plan.",
		image: assets.contemplative,
		keys: ["1", "2"],
		nextPages: [1050, 1060] // Branch X or Branch Y
	};

	// ===== BRANCH X: "Sure!" =====
	scenes[1050] = {
		text: "My watering can should be here somewhere - just click on the plants to give them a sip.\n",
		image: assets.explaining,
		keys: [],
		nextPages: [1070]
	};

	// ===== BRANCH Y: "I'd like that" =====
	scenes[1060] = {
		text: "Rad! It's nice to have company.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [1060.5]
	};

	scenes["1060.5"] = {
		text: "My watering can should be here somewhere - just click on the plants to give them a sip.\n",
		image: assets.explaining,
		keys: [],
		nextPages: [1070]
	};

	// ===== CLOSING SCENE =====
	scenes[1070] = {
		text: "And [PLAYER_NAME]? I'm real glad you're here.",
		image: assets.warm, // TODO: Replace with tony_grateful.png
		keys: [],
		nextPages: [],
		isEndingScene: true // Return to garden after this
	};

	// ===== HERB CONVERSATION =====

	// Scene 0: Opening
	scenes[0] = {
		text: "Ah, the herbs. These are pretty hardy.\n[1] What kind are they?\n[2] They smell amazing.\n[3] Do you cook with them?",
		image: assets.happy, // placeholder
		keys: ["1", "2", "3"],
		nextPages: [10, 20, 30], // Branch 1A, 1B, 1C
	};

	// ===== BRANCH 1A: "What kind are they?" =====
	scenes[10] = {
		text: "This little fella is thyme, and that's rosemary over there.",
		image: assets.explaining,
		keys: [],
		nextPages: [],
	};

	scenes[11] = {
		text: "I didn't know a thing about herbs when I started. Had to look everything up.\n[1] That's cool that you taught yourself.",
		image: assets.shy,
		keys: ["1"],
		nextPages: [15]
	};

	scenes[15] = {
		text: "You think so? I'm not all that.\n[1] How'd you end up learning?",
		image: assets.warm,
		keys: ["1"],
		nextPages: [12],
	};

	scenes[12] = {
		text: "Books and blogs mostly... more trial and error than I'd have liked.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [],
	};

	scenes[13] = {
		text: "Killed a few plants before I had things figured out...",
		image: assets.rueful,
		keys: [],
		nextPages: [],
	};

	scenes[14] = {
		text: "But that's to be expected! They say failure's part of learning.",
		image: assets.peaceful,
		keys: [],
		nextPages: [50], // Converge to ending
	};

	// ===== BRANCH 1B: "They smell amazing" =====
	scenes[20] = {
		text: "Right? That's my favorite thing about them.",
		image: assets.happy, 
		keys: [],
		nextPages: [],
	};

	scenes[21] = {
		text: "When it's hot out, you can smell them from across the garden.\n[1] It's really peaceful here.\n[2] Must be nice to work with.",
		image: assets.warm, 
		keys: ["1", "2"],
		nextPages: [22, 25], // Branch 1B-1, 1B-2
	};

	// Branch 1B-1: "peaceful"
	scenes[22] = {
		text: "It is, that's why I like it.",
		image: assets.warm, 
		keys: [],
		nextPages: [],
	};

	scenes[23] = {
		text: "The world is loud and scary sometimes.",
		image: assets.rueful,
		keys: [],
		nextPages: [],
	};

	scenes[24] = {
		text: "But here? It's like all my worries fade away.",
		image: assets.peaceful,
		keys: [],
		nextPages: [50], // Converge to ending
	};

	// Branch 1B-2: "nice to work with"
	scenes[25] = {
		text: "Yeah. There's something grounding about it.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [],
	};

	scenes[26] = {
		text: "Nothing quite like getting your hands dirty and smelling the earth.",
		image: assets.peaceful,
		keys: [],
		nextPages: [],
	};

	scenes[27] = {
		text: "Makes me feel present, you know?",
		image: assets.warm, 
		keys: [],
		nextPages: [50], // Converge to ending
	};

	// ===== BRANCH 1C: "cook with them" =====
	scenes[30] = {
		text: "Sometimes! Not as much as I probably should.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [],
	};

	scenes[31] = {
		text: "Mostly I just like having them around.\n[1] Just for the vibes?\n[2] That's fair.",
		image: assets.shy,
		keys: ["1", "2"],
		nextPages: [32, 35], // Branch 1C-1, 1C-2
	};

	// Branch 1C-1: "for the vibes"
	scenes[32] = {
		text: "Exactly! They don't have to be useful.",
		image: assets.happy, 
		keys: [],
		nextPages: [],
	};

	scenes[33] = {
		text: "They can just exist and smell nice.",
		image: assets.peaceful,
		keys: [],
		nextPages: [50], // Converge to ending
	};

	// Branch 1C-2: "that's fair"
	scenes[35] = {
		text: "Yeah - like, not everything needs a purpose, you know?",
		image: assets.confident,
		keys: [],
		nextPages: [],
	};

	scenes[36] = {
		text: "Them just being here is enough for me.",
		image: assets.warm, 
		keys: [],
		nextPages: [50], // Converge to ending
	};

	// ===== ENDING (converges from all branches) =====
	scenes[50] = {
		text: "Anyway, thanks for watering them. I owe you.",
		image: assets.warm, 
		keys: [],
		nextPages: [], // Auto-return to garden after this
		isEndingScene: true
	};

	// ===== FLOWERS CONVERSATION =====

	// Scene 100: Opening
	scenes[100] = {
		text: "These ones are just for looking at.\n[1] They're really pretty.\n[2] What kind are they?",
		image: assets.peaceful,
		keys: ["1", "2"],
		nextPages: [110, 120], // Branch 2A, 2B
	};

	// ===== BRANCH 2A: "They're really pretty" =====
	scenes[110] = {
		text: "Thanks! I think so too.",
		image: assets.shy,
		keys: [],
		nextPages: [111],
	};

	scenes[111] = {
		text: "You know, I used to feel kinda silly about liking pretty things.\n[1] Why?\n[2] That's not silly.",
		image: assets.sad_peaceful,
		keys: ["1", "2"],
		nextPages: [112, 115], // Branch 2A-1, 2A-2
	};

	// Branch 2A-1: "Why guilty?"
	scenes[112] = {
		text: "I don't know. It was like... I had to earn it somehow?",
		image: assets.anxious, 
		keys: [],
		nextPages: [113],
	};

	scenes[113] = {
		text: "Like since they're just for aesthetics, I didn't need them. Something so indulgent...",
		image: assets.anxious,
		keys: [],
		nextPages: [114],
	};

	scenes[114] = {
		text: "But flowers don't care. They don't even know how pretty they are! They just... exist.",
		image: assets.warm,
		keys: [],
		nextPages: [150], // Converge to ending
	};

	// Branch 2A-2: "You shouldn't feel guilty"
	scenes[115] = {
		text: "Thanks. I know it's weird... I just find it hard to believe.",
		image: assets.shy, 
		keys: [],
		nextPages: [116],
	};

	scenes[116] = {
		text: "Beautiful things are a part of life too. Even if they don't serve a purpose.",
		image: assets.peaceful,
		keys: [],
		nextPages: [150], // Converge to ending
	};

	// ===== BRANCH 2B: "What kind are they?" =====
	scenes[120] = {
		text: "Honestly? Not sure of all the names.",
		image: assets.happy, 
		keys: [],
		nextPages: [121],
	};

	scenes[121] = {
		text: "I just picked ones I thought were pretty when I was at the garden center.\n[1] That's a good way to choose.\n[2] Following your instincts?",
		image: assets.shy,
		keys: ["1", "2"],
		nextPages: [122, 125], // Branch 2B-1, 2B-2
	};

	// Branch 2B-1: "good way to choose"
	scenes[122] = {
		text: "I think so too. Not everything needs to be researched and planned.",
		image: assets.happy, 
		keys: [],
		nextPages: [123],
	};

	scenes[123] = {
		text: "Sometimes you just... pick what makes you happy.",
		image: assets.happy, 
		keys: [],
		nextPages: [150], // Converge to ending
	};

	// Branch 2B-2: "following your instincts"
	scenes[125] = {
		text: "Yeah. I'm trying to do that more.",
		image: assets.assured,
		keys: [],
		nextPages: [126],
	};

	scenes[126] = {
		text: "Listen to what I actually want instead of what I think I should want.",
		image: assets.confident,
		keys: [],
		nextPages: [127],
	};

	scenes[127] = {
		text: "It's harder than it sounds, but it's worth it.",
		image: assets.warm, 
		keys: [],
		nextPages: [150], // Converge to ending
	};

	// ===== ENDING (converges from all branches) =====
	scenes[150] = {
		text: "They make the garden feel alive.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [], // Auto-return to garden after this
		isEndingScene: true
	};

	// ===== WILDPATCH CONVERSATION =====

	// Scene 200: Opening
	scenes[200] = {
		text: "I leave this part alone.",
		image: assets.peaceful,
		keys: ["1", "2", "3"],
		nextPages: [210, 220, 230], // Branch 3A, 3B, 3C
	};

	// Add choice text to opening scene
	scenes[200].text = "I leave this part alone.\n[1] On purpose?\n[2] It looks nice wild.\n[3] Don't you worry about it?";

	// ===== BRANCH 3A: "On purpose?" =====
	scenes[210] = {
		text: "Yep. I wanted one part that just... does its own thing.",
		image: assets.warm, 
		keys: [],
		nextPages: [211],
	};

	scenes[211] = {
		text: "Not everything needs my intervention.\n[1] I bet that takes discipline.",
		image: assets.confident, 
		keys: ["1"],
		nextPages: [212],
	};

	// Branch 3A-1: "discipline"
	scenes[212] = {
		text: "It does, actually! My first instinct is to control everything.",
		image: assets.happy, 
		keys: [],
		nextPages: [213],
	};

	scenes[213] = {
		text: "Make it neat. Organized. Safe.",
		image: assets.anxious, 
		keys: [],
		nextPages: [214],
	};

	scenes[214] = {
		text: "But they say some things are better wild.",
		image: assets.confident, 
		keys: [],
		nextPages: [300], // Converge to ending
	};

	// ===== BRANCH 3B: "It looks nice wild" =====
	scenes[220] = {
		text: "I think so too! It's nice to see nature at work.",
		image: assets.warm, 
		keys: [],
		nextPages: [221],
	};

	scenes[221] = {
		text: "It's not trying to be anything other than what it is.",
		image: assets.peaceful,
		keys: ["1"],
		nextPages: [225], // Branch 3B-1, 3B-2
	};

	scenes[221].text = "It's not trying to be anything other than what it is.\n[1] It takes orders from no man.";

	// Branch 3B-2: "Permission"
	scenes[225] = {
		text: "Exactly. These plants don't need to impress anyone.",
		image: assets.confident, 
		keys: [],
		nextPages: [226],
	};

	scenes[226] = {
		text: "They're just alive. Just here. Ain't nothing wrong with that.",
		image: assets.peaceful,
		keys: [],
		nextPages: [300], // Converge to ending
	};

	// ===== BRANCH 3C: "Don't you worry?" =====
	scenes[230] = {
		text: "Sometimes, but I'm learning that worry doesn't help.",
		image: assets.smile, 
		keys: [],
		nextPages: [231],
	};

	scenes[231] = {
		text: "This patch will grow or it won't. My worrying won't change that.",
		image: assets.peaceful,
		keys: ["1", "2"],
		nextPages: [232, 235], // Branch 3C-1, 3C-2
	};

	scenes[231].text = "This patch will grow or it won't. My worrying won't change that.\n[1] That takes a lot of letting go.\n[2] Sounds freeing.";

	// Branch 3C-1: "Letting go"
	scenes[232] = {
		text: "I want to control outcomes. Keep bad things from happening.",
		image: assets.anxious,
		keys: [],
		nextPages: [233],
	};

	scenes[233] = {
		text: "But I can't... so I practice letting go here.",
		image: assets.rueful,
		keys: [],
		nextPages: [300], // Converge to ending
	};

	// Branch 3C-2: "Freeing"
	scenes[235] = {
		text: "It is! I don't have to think about this corner at all.",
		image: assets.happy,
		keys: [],
		nextPages: [236],
	};

	scenes[236] = {
		text: "No planning, no maintenance schedule, no 'is this optimal?'",
		image: assets.confident,
		keys: [],
		nextPages: [237],
	};

	scenes[237] = {
		text: "It just does its thing.",
		image: assets.warm,
		keys: [],
		nextPages: [300], // Converge to ending
	};

	// ===== ENDING (converges from all branches) =====
	scenes[300] = {
		text: "I like having it here. Reminds me to let things be.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [], // Auto-return to garden after this
		isEndingScene: true
	};

	// ===== TOMATOES CONVERSATION =====

	// Scene 400: Opening
	scenes[400] = {
		text: "Tomatoes are interesting little dudes. They need support.\n[1] The stakes?\n[2] They look heavy.\n[3] How do you know when they're ready?",
		image: assets.warm,
		keys: ["1", "2", "3"],
		nextPages: [410, 420, 430], // Branch 4A, 4B, 4C
	};

	// ===== BRANCH 4A: "The stakes?" =====
	scenes[410] = {
		text: "Yeah. See how I've got them strapped to these stakes here?",
		image: assets.explaining,
		keys: [],
		nextPages: [411],
	};

	scenes[411] = {
		text: "Without them, the plants would collapse under the weight of the fruits.",
		image: assets.assured,
		keys: ["1", "2"],
		nextPages: [412, 415], // Branch 4A-1, 4A-2
	};

	scenes[411].text = "Without them, the plants would collapse under their own weight.\n[1] Talk about high maintenance...\n[2] They'd break otherwise?";
	scenes[412] = {
		text: "It's necessary. They're built to climb, and to lean, so their fruit can grow bigger and juicer.\n",
		image: assets.confident, 
		keys: [],
		nextPages: [413],
	};

	scenes[413] = {
		text: "With the proper support, they're able to reach their potential.",
		image: assets.peaceful,
		keys: [],
		nextPages: [450], // Converge to ending
	};

	// Branch 4A-2: "They'd break"
	scenes[415] = {
		text: "Sort of. The weight of their own fruit can crush the stems, or they'd grow across the ground.",
		image: assets.assured,
		keys: [],
		nextPages: [416],
	};

	scenes[416] = {
		text: "Without something to lean on, they can't grow fully.",
		image: assets.explaining,
		keys: [],
		nextPages: [450], // Converge to ending
	};

	// ===== BRANCH 4B: "They look heavy" =====
	scenes[420] = {
		text: "They are. All that fruit weighs them down.",
		image: assets.explaining,
		keys: [],
		nextPages: [421],
	};

	scenes[421] = {
		text: "That's why they need the stakes - to hold the weight they can't carry alone.\n[1] Makes sense.\n[2] Guess we all need support sometimes.",
		image: assets.warm,
		keys: ["1", "2"],
		nextPages: [422, 425], // Branch 4B-1, 4B-2
	};

	// Branch 4B-1: "Makes sense"
	scenes[422] = {
		text: "Yeah, it's just how things work.",
		image: assets.peaceful,
		keys: [],
		nextPages: [423],
	};

	scenes[423] = {
		text: "Some things need a little extra help. That's okay.",
		image: assets.warm,
		keys: [],
		nextPages: [450], // Converge to ending
	};

	// Branch 4B-2: "We all need support"
	scenes[425] = {
		text: "Yeah. We do.",
		image: assets.peaceful,
		keys: [],
		nextPages: [426],
	};

	scenes[426] = {
		text: "It's only natural, after all.",
		image: assets.warm,
		keys: [],
		nextPages: [450], // Converge to ending
	};

	// ===== BRANCH 4C: "When they're ready?" =====
	scenes[430] = {
		text: "Well... when they're fully red and a little soft, that's when you pick them.",
		image: assets.explaining,
		keys: [],
		nextPages: [431.5],
	};

	scenes[431.5] = {
		text: "Before that, they need a bit more time. Any later, and they get all yucky.",
		image: assets.explaining,
		keys: [],
		nextPages: [431], // Branch 4C-1, 4C-2
	};

		scenes[431] = {
		text: "I'm a bit nervous it's going to pass me by, to be honest.\n[1] That timing matters.\n[2] Things change all the time.",
		image: assets.shy,
		keys: ["1", "2"],
		nextPages: [432, 435], // Branch 4C-1, 4C-2
	};

	// Branch 4C-1: "Timing matters"
	scenes[432] = {
		text: "It does, not just with plants, but with everything.",
		image: assets.assured,
		keys: [],
		nextPages: [433],
	};

	scenes[433] = {
		text: "Sometimes you have to wait... sometimes you have to act.",
		image: assets.assured,
		keys: [],
		nextPages: [434],
	};

	scenes[434] = {
		text: "Figuring out which is which... that's the hard part.",
		image: assets.contemplative,
		keys: [],
		nextPages: [450], // Converge to ending
	};

	// Branch 4C-2: "Things change"
	scenes[435] = {
		text: "You've got that right. Whether you're ready or not.",
		image: assets.wistful,
		keys: [],
		nextPages: [436],
	};

	scenes[436] = {
		text: "All you can do is pay attention and respond.",
		image: assets.contemplative,
		keys: [],
		nextPages: [437],
	};

	scenes[437] = {
		text: "That's all any of us can do.",
		image: assets.peaceful,
		keys: [],
		nextPages: [450], // Converge to ending
	};

	// ===== ENDING (converges from all branches) =====
	scenes[450] = {
		text: "These ones should be ready to harvest soon.",
		image: assets.warm, 
		keys: [],
		nextPages: [], // Auto-return to garden after this
		isEndingScene: true
	};

	// ===== SEEDLING CONVERSATION (Scene 500) =====
	// Scene 500: Opening
	scenes[500] = {
		text: "This one's not doing great.",
		image: assets.rueful,
		keys: ["1", "2"],
		nextPages: [510, 520, 530], // Branch 5A, 5B
	};

	scenes[500].text = "This one's not doing great.\n[1] What's wrong with it?\n[2] Do you think it'll make it?";

	// ===== BRANCH 5A: "What's wrong?" =====
	scenes[510] = {
		text: "I'm not sure exactly. It sprouted just fine, but it's been struggling since.",
		image: assets.wistful,
		keys: [],
		nextPages: [511],
	};

	scenes[511] = {
		text: "Could be the soil, or maybe even disease. It's hard to tell when you can't ask it what's up.",
		image: assets.contemplative,
		keys: ["1", "2"],
		nextPages: [512, 514], // Branch 5A-1, 5A-2
	};

	scenes[511].text = "Could be the soil, or maybe even disease. It's hard to tell when you can't ask it what's up..\n[1] Can you fix it?\n[2] That sounds frustrating.";

	// Branch 5A-1: "Can you fix it?"
	scenes[512] = {
		text: "I've been adjusting things. Sometimes more water, sometimes less water. Been moving it around a bit, too.",
		image: assets.anxious, 
		keys: [],
		nextPages: [513],
	};

	scenes[513] = {
		text: "I guess sometimes there's just nothing you can do.",
		image: assets.sad_peaceful, 
		keys: [],
		nextPages: [550], // Converge to ending
	};

	// Branch 5A-2: "That's frustrating"
	scenes[514] = {
		text: "Very. I want to do the right thing, but I'm running out of options.",
		image: assets.wistful, 
		keys: [],
		nextPages: [515],
	};

	scenes[515] = {
		text: "All I can do is keep trying. Keep doing my best.",
		image: assets.wistful,
		keys: [],
		nextPages: [516],
	};

	scenes[516] = {
		text: "And accept that my best might not be enough after all.",
		image: assets.sad_peaceful, 
		keys: [],
		nextPages: [550], // Converge to ending
	};

	// ===== BRANCH 5B: "Will it make it?" =====
	scenes[520] = {
		text: "I don't know.",
		image: assets.contemplative, 
		keys: [],
		nextPages: [521],
	};

	scenes[521] = {
		text: "Probably not, if I'm being realistic.",
		image: assets.anxious,
		keys: ["1", "2"],
		nextPages: [522, 525], // Branch 5B-1, 5B-2
	};

	scenes[521].text = "Probably not, if I'm being realistic.\n[1] I'm sorry.\n[2] That's really hard.";

	// Branch 5B-1: "I'm sorry"
	scenes[522] = {
		text: "Thanks. It's okay. Or it will be, either way.",
		image: assets.sad_peaceful, 
		keys: [],
		nextPages: [523],
	};

	scenes[523] = {
		text: "Not everything makes it. That's just... how it is.",
		image: assets.wistful,
		keys: [],
		nextPages: [524],
	};

	scenes[524] = {
		text: "But I have to keep trying. I want to see things through.",
		image: assets.rueful,
		keys: [],
		nextPages: [550], // Converge to ending
	};

	// Branch 5B-2: "That's really hard"
	scenes[525] = {
		text: "It is.",
		image: assets.sad_peaceful, 
		keys: [],
		nextPages: [526],
	};

	scenes[526] = {
		text: "Watching something struggle when you can't fix it...",
		image: assets.wistful, 
		keys: [],
		nextPages: [527],
	};

	scenes[527] = {
		text: "All you can do is keep showing up, regardless if it changes the outcome.",
		image: assets.assured,
		keys: [],
		nextPages: [550], // Converge to ending
	};


	// ===== ENDING (converges from all branches) =====
	scenes[550] = {
		text: "Even if it doesn't make it... I'm glad it sprouted at all.",
		image: assets.peaceful,
		keys: [],
		nextPages: [], // Auto-return to garden after this
		isEndingScene: true
	};

	// ===== INTERACTIVE AREA CONVERSATION (Scene 600 - Empty Plot) =====
	// Scene 600: Opening
	scenes[600] = {
		text: "I haven't planted a thing here yet.\n[1] What will you plant?\n[2] Saving it for something special?\n[3] Why leave all this empty space?",
		image: assets.shy, 
		keys: ["1", "2", "3"],
		nextPages: [610, 620, 630], // Branch 6A, 6B, 6C
	};

	// ===== BRANCH 6A: "What will you plant?" =====
	scenes[610] = {
		text: "I'm not sure yet.",
		image: assets.contemplative,
		keys: [],
		nextPages: [611],
	};

	scenes[611] = {
		text: "I've been thinking about it, but I don't have an answer.\n[1] Take your time.\n[2] You'll know when you're ready.",
		image: assets.contemplative, 
		keys: ["1", "2"],
		nextPages: [612, 615], // Branch 6A-1, 6A-2
	};

	// Branch 6A-1: "Take your time"
	scenes[612] = {
		text: "Thanks. I think I need to.",
		image: assets.warm,
		keys: [],
		nextPages: [613],
	};

	scenes[613] = {
		text: "I spent so long forcing decisions before I was ready.",
		image: assets.wistful, // tony_sad_peaceful placeholder
		keys: [],
		nextPages: [614],
	};

	scenes[614] = {
		text: "Uncertainty isn't my enemy. It really want to think this through.",
		image: assets.peaceful, 
		keys: [],
		nextPages: [650], // Converge to ending
	};

	// Branch 6A-2: "You'll know"
	scenes[615] = {
		text: "I think so too. When the right thing comes along, I'll feel it.",
		image: assets.happy,
		keys: [],
		nextPages: [616],
	};

	scenes[616] = {
		text: "Until that moment comes, this space can just... be potential.",
		image: assets.warm,
		keys: [],
		nextPages: [650], // Converge to ending
	};

	// ===== BRANCH 6B: "Something special?" =====
	scenes[620] = {
		text: "Maybe. I haven't decided if it needs to be special or just... what feels right.",
		image: assets.contemplative, 
		keys: [],
		nextPages: [621],
	};

	scenes[621] = {
		text: "I'm trying teach myself not everything has to be profound.\n[1] Yeah, trust your instincts.",
		image: assets.warm, 
		keys: ["1"],
		nextPages: [625], 
	};

	scenes[625] = {
		text: "Working on it! Trusting what I want instead of overthinking all the time.",
		image: assets.shy, 
		nextPages: [626],
	};

	scenes[626] = {
		text: "This empty plot is good practice.",
		image: assets.warm,
		keys: [],
		nextPages: [650], // Converge to ending
	};

	// ===== BRANCH 6C: "Why leave it empty?" =====
	scenes[630] = {
		text: "Because I'm not ready to fill it yet.",
		image: assets.confident, 
		keys: [],
		nextPages: [631],
	};

	scenes[631] = {
		text: "And that's okay. Not everything needs to be decided right now.\n[1] Keep being patient with yourself.\n[2] I guess it'll always be here.",
		image: assets.happy,
		keys: ["1", "2"],
		nextPages: [632, 635], // Branch 6C-1, 6C-2
	};

	// Branch 6C-1: "Be patient"
	scenes[632] = {
		text: "Yeah. Yeah, I should.",
		image: assets.contemplative, 
		keys: [],
		nextPages: [633],
	};

	scenes[633] = {
		text: "Rushing never helped anything grow.",
		image: assets.warm, 
		keys: [],
		nextPages: [634],
	};

	scenes[634] = {
		text: "Not plants, not people.",
		image: assets.peaceful,
		keys: [],
		nextPages: [650], // Converge to ending
	};

	// Branch 6C-2: "garden will wait"
	scenes[635] = {
		text: "You have a point! The soil's not going anywhere.",
		image: assets.peaceful, 
		keys: [],
		nextPages: [636],
	};

	scenes[636] = {
		text: "When I know what should go here, I'll go ahead and plant it.",
		image: assets.warm,
		keys: [],
		nextPages: [637],
	};

	scenes[637] = {
		text: "Until then, it's just... possibility.",
		image: assets.happy,
		keys: [],
		nextPages: [650], // Converge to ending
	};

	// ===== ENDING (converges from all branches) =====
	scenes[650] = {
		text: "I like looking at it sometimes. Imagining what could grow here.",
		image: assets.peaceful,
		keys: [],
		nextPages: [], // Auto-return to garden after this
		isEndingScene: true
	};

	// ===== SHELL CONVERSATION - EARLY (BEFORE ALL PLANTS WATERED) (SCENE 700+) =====
	scenes[700] = {
		text: "Oh. Yeah. That.",
		image: assets.rueful, 
		keys: [],
		nextPages: [700.25],
	};

	scenes["700.25"] = {
		text: "That's... well, it's my shell. Or it was.",
		image: assets.rueful, 
		keys: ["1", "2"],
		nextPages: [710, 720], // Branch 7A, 7B
	};

	scenes["700.25"].text = "That's... well, it's my shell. Or it was.\n[1] Oh yeah! You're not wearing it?\n[2] What happened to it?";

	// ===== BRANCH 7A: "Oh yeah! You're not wearing it?" =====
	scenes[710] = {
		text: "No, not anymore. Haven't for a while.",
		image: assets.shy, 
		keys: [],
		nextPages: [710.5],
	};

	scenes["710.5"] = {
		text: "It's kinda complicated. Can we... maybe come back to that?",
		image: assets.contemplative, 
		keys: [],
		nextPages: [740],
	};

	// ===== BRANCH 7B: "What happened to it?" =====
	scenes[720] = {
		text: "Long story. A really long story.",
		image: assets.rueful,
		keys: [],
		nextPages: [720.5],
	};

	scenes["720.5"] = {
		text: "Can I tell you about it later? After we've watered a bit?",
		image: assets.shy,
		keys: [],
		nextPages: [740],
	};

	// ===== CONVERGE: Both branches lead here =====
	scenes[740] = {
		text: "I promise I'll explain. Just... need to ease into it, you know?\n[1] Of course, no pressure.\n[2] Whenever you're ready.",
		image: assets.wistful, 
		keys: ["1", "2"],
		nextPages: [750, 755], // Branch 7C, 7D
	};

	// ===== BRANCH 7C: "Of course, no pressure" =====
	scenes[750] = {
		text: "Thanks. I really appreciate that.",
		image: assets.smile,
		keys: [],
		nextPages: [760],
	};

	// ===== BRANCH 7D: "Whenever you're ready" =====
	scenes[755] = {
		text: "Thanks, [PLAYER_NAME]. That means a lot.",
		image: assets.smile,
		keys: [],
		nextPages: [760],
	};

	// ===== CONVERGE: Both branches lead here =====
	scenes[760] = {
		text: "Let's water some plants. It helps me think.",
		image: assets.warm,
		keys: [],
		nextPages: [],
		isEndingScene: true
	};

	// ===== POST-GAME SHELL CONVERSATION (SCENE 800+) =====
	// Triggers if player has watered all plants AND visited the empty plot

	// SCENE 805: First time clicking shell after watering all plants (never clicked before)
	scenes[805] = {
		text: "Hey, so...",
		image: assets.assured, 
		keys: [],
		nextPages: [806],
	};

	scenes[806] = {
		text: "I've been thinking. About why I don't have this on anymore.",
		image: assets.rueful,
		keys: [],
		nextPages: [807],
	};

	scenes[807] = {
		text: "You've probably been curious. Or maybe you haven't - I don't know. I shouldn't assume.",
		image: assets.shy, 
		keys: [],
		nextPages: [808],
	};

	scenes[808] = {
		text: "But I want to tell you about it... if that's okay.\n[1] I'm all ears, dude.\n[2] Only if you're comfortable.",
		image: assets.warm, 
		keys: ["1", "2"],
		nextPages: [810, 820], // Branch to same endpoints as the deflection path
	};

	// SCENE 800: Deflection path (if player clicked shell before watering all plants)
	scenes[800] = {
		text: "Okay. Good work. I think... I think I'm ready to talk about the shell now.",
		image: assets.assured,
		keys: [],
		nextPages: [800.5],
	};

	scenes["800.5"] = {
		text: "If you still want to hear about it. I shouldn't assume.",
		image: assets.wistful,
		keys: ["1", "2"],
		nextPages: [810, 820], // Branch 8A, 8B
	};

	scenes["800.5"].text = "If you still want to hear it.\n[1] I'm all ears, dude.\n[2] Only if you're comfortable.";

	// ===== BRANCH 8A: "I'm listening" =====
	scenes[810] = {
		text: "Thanks. Okay. Here goes.",
		image: assets.warm, 
		keys: [],
		nextPages: [830],
	};

	// ===== BRANCH 8B: "Only if you're comfortable" =====
	scenes[820] = {
		text: "Hey, I am. I want to tell you.",
		image: assets.warm, 
		keys: [],
		nextPages: [820.5],
	};

	scenes["820.5"] = {
		text: "You're one of the few people around who knew me... before.",
		image: assets.wistful, 
		keys: [],
		nextPages: [830],
	};

	// ===== SHELL STORY CONTINUES =====
	scenes[830] = {
		text: "So, the shell...",
		image: assets.assured,
		keys: [],
		nextPages: [830.5],
	};

	scenes["830.5"] = {
		text: "When we last talked, I wasn't just wearing it - I was practially living in it...",
		image: assets.rueful, 
		keys: [],
		nextPages: [],
		isEndingScene: true
	};
}

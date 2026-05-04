// ========================
// PRELOAD - Load all assets
// ========================

function preload() {
	// Title screen
	assets.titleImage = loadImage("./assets/titlescreen.gif");

	// Name input screen assets
	nameBoxImage = loadImage("./assets/namebox.png");
	textButtonImage = loadImage("./assets/text_button.png");
	otherBoxImage = loadImage("./assets/otherbox.png");

	// Backgrounds for different sections
	gardenAssets.section1Background = loadImage("./assets/environment/section1_normal.png");
	gardenAssets.section2Background = loadImage("./assets/environment/section2_normal.png");
	gardenAssets.section3Background = loadImage("./assets/environment/section3_normal.png");
	gardenAssets.textbox = loadImage("./assets/textbox.png");
	gardenAssets.arrowRight = loadImage("./assets/arrow_right.png");
	gardenAssets.arrowLeft = loadImage("./assets/arrow_left.png");

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
	myFont = loadFont("./BoldPixels.ttf");
}

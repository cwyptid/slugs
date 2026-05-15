// Asset Loading

function loadGameAssets() {
	// Title screen
	assets.titleImage = loadImage("assets/UI/titlescreen.gif");

	// Name input screen assets
	nameBoxImage = loadImage("assets/UI/namebox.png");
	nameBoxRainImage = loadImage("assets/UI/namebox_rain.png");
	textButtonImage = loadImage("assets/UI/text_button.png");
	otherBoxImage = loadImage("assets/UI/otherbox.png");
	otherBoxRainImage = loadImage("assets/UI/otherbox_rain.png");

	// Backgrounds for different sections
	gardenAssets.section1Background = loadImage("assets/environment/section1_normal.png");
	gardenAssets.section2Background = loadImage("assets/environment/section2_normal.png");
	gardenAssets.section3Background = loadImage("assets/environment/section3_normal.png");
	gardenAssets.rainSprite = loadImage("assets/environment/rain.png");
	gardenAssets.rainCollisionSprite = loadImage("assets/environment/rain-collision.png");
	gardenAssets.textbox = loadImage("assets/UI/textbox.png");
	gardenAssets.textboxRain = loadImage("assets/UI/textbox_rain.png");
	gardenAssets.arrowRight = loadImage("assets/UI/arrow_right.png");
	gardenAssets.arrowLeft = loadImage("assets/UI/arrow_left.png");
	gardenAssets.arrowRightRain = loadImage("assets/UI/arrow_right_rain.png");
	gardenAssets.arrowLeftRain = loadImage("assets/UI/arrow_left_rain.png");

	// Load sprite frame arrays
	// Tony VN Sprite (tony_smile) - 3 fps, loops
	sprites.tonySmilingFrames = [
		loadImage("assets/sprites/tony_VN/tony_smile/tony_smile-1.png"),
		loadImage("assets/sprites/tony_VN/tony_smile/tony_smile-2.png")
	];

	// Tony VN Sprite (tony_smile_rain) - 3 fps, loops
	sprites.tonySmilingRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_smile_rain/tony_smile_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_smile_rain/tony_smile_rain-2.png")
	];

	// Tony VN Sprite (tony_explaining) - 3 fps, loops
	sprites.tonyExplainingFrames = [
		loadImage("assets/sprites/tony_VN/tony_explaining/tony_explaining-1.png"),
		loadImage("assets/sprites/tony_VN/tony_explaining/tony_explaining-2.png")
	];

	// Tony VN Sprite (tony_assured) - 3 fps, loops
	sprites.tonyAssuredFrames = [
		loadImage("assets/sprites/tony_VN/tony_assured/tony_assured-1.png"),
		loadImage("assets/sprites/tony_VN/tony_assured/tony_assured-2.png")
	];

	// Tony VN Sprite (tony_assured_rain) - 3 fps, loops
	sprites.tonyAssuredRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_assured_rain/tony_assured_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_assured_rain/tony_assured_rain-2.png")
	];

	// Tony VN Sprite (tony_peaceful) - 3 fps, loops
	sprites.tonyPeacefulFrames = [
		loadImage("assets/sprites/tony_VN/tony_peaceful/tony_peaceful-1.png"),
		loadImage("assets/sprites/tony_VN/tony_peaceful/tony_peaceful-2.png")
	];

	// Tony VN Sprite (tony_peaceful_rain) - 3 fps, loops
	sprites.tonyPeacefulRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_peaceful_rain/tony_peaceful_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_peaceful_rain/tony_peaceful_rain-2.png")
	];

	// Tony VN Sprite (tony_sad_peaceful) - 3 fps, loops
	sprites.tonySadPeacefulFrames = [
		loadImage("assets/sprites/tony_VN/tony_sad_peaceful/tony_sad_peaceful-1.png"),
		loadImage("assets/sprites/tony_VN/tony_sad_peaceful/tony_sad_peaceful-2.png")
	];

	// Tony VN Sprite (tony_shy) - 3 fps, loops
	sprites.tonyShyFrames = [
		loadImage("assets/sprites/tony_VN/tony_shy/tony_shy-1.png"),
		loadImage("assets/sprites/tony_VN/tony_shy/tony_shy-2.png")
	];


	// Tony VN Sprite (tony_shy_rain) - 3 fps, loops
	sprites.tonyShyRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_shy_rain/tony_shy_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_shy_rain/tony_shy_rain-2.png")
	];

	// Tony VN Sprite (tony_contemplative) - 3 fps, loops
	sprites.tonyContemplativeFrames = [
		loadImage("assets/sprites/tony_VN/tony_contemplative/tony_contemplative-1.png"),
		loadImage("assets/sprites/tony_VN/tony_contemplative/tony_contemplative-2.png")
	];

	// Tony VN Sprite (tony_contemplative_rain) - 3 fps, loops
	sprites.tonyContemplativeRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_contemplative_rain/tony_contemplative_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_contemplative_rain/tony_contemplative_rain-2.png")
	];

	// Tony VN Sprite (tony_determined) - 3 fps, loops
	sprites.tonyDeterminedFrames = [
		loadImage("assets/sprites/tony_VN/tony_determined/tony_determined-1.png"),
		loadImage("assets/sprites/tony_VN/tony_determined/tony_determined-2.png")
	];

	// Tony VN Sprite (tony_anxious) - 3 fps, loops
	sprites.tonyAnxiousFrames = [
		loadImage("assets/sprites/tony_VN/tony_anxious/tony_anxious-1.png"),
		loadImage("assets/sprites/tony_VN/tony_anxious/tony_anxious-2.png")
	];

	// Tony VN Sprite (tony_confident) - 3 fps, loops
	sprites.tonyConfidentFrames = [
		loadImage("assets/sprites/tony_VN/tony_confident/tony_confident-1.png"),
		loadImage("assets/sprites/tony_VN/tony_confident/tony_confident-2.png")
	];

	// Tony VN Sprite (tony_confident_rain) - 3 fps, loops
	sprites.tonyConfidentRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_confident_rain/tony_confident_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_confident_rain/tony_confident_rain-2.png")
	];

	// Tony VN Sprite (tony_hopeful) - 3 fps, loops
	sprites.tonyHopefulFrames = [
		loadImage("assets/sprites/tony_VN/tony_hopeful/tony_hopeful-1.png"),
		loadImage("assets/sprites/tony_VN/tony_hopeful/tony_hopeful-2.png")
	];

	// Tony VN Sprite (tony_rueful) - 3 fps, loops
	sprites.tonyRuefulFrames = [
		loadImage("assets/sprites/tony_VN/tony_rueful/tony_rueful-1.png"),
		loadImage("assets/sprites/tony_VN/tony_rueful/tony_rueful-2.png")
	];

	// Tony VN Sprite (tony_rueful_rain) - 3 fps, loops
	sprites.tonyRuefulRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_rueful_rain/tony_rueful_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_rueful_rain/tony_rueful_rain-2.png")
	];

	// Tony VN Sprite (tony_happy) - 3 fps, loops
	sprites.tonyHappyFrames = [
		loadImage("assets/sprites/tony_VN/tony_happy/tony_happy-1.png"),
		loadImage("assets/sprites/tony_VN/tony_happy/tony_happy-2.png")
	];

	// Tony VN Sprite (tony_happy_rain) - 3 fps, loops
	sprites.tonyHappyRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_happy_rain/tony_happy_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_happy_rain/tony_happy_rain-2.png"),
	];

	// Tony VN Sprite (tony_wistful) - 3 fps, loops
	sprites.tonyWistfulFrames = [
		loadImage("assets/sprites/tony_VN/tony_wistful/tony_wistful-1.png"),
		loadImage("assets/sprites/tony_VN/tony_wistful/tony_wistful-2.png")
	];

	// Tony VN Sprite (tony_wistful_rain) - 3 fps, loops
	sprites.tonyWistfulRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_wistful_rain/tony_wistful_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_wistful_rain/tony_wistful_rain-2.png"),
	];

	// Tony VN Sprite (tony_warm) - 3 fps, loops
	sprites.tonyWarmFrames = [
		loadImage("assets/sprites/tony_VN/tony_warm/tony_warm-1.png"),
		loadImage("assets/sprites/tony_VN/tony_warm/tony_warm-2.png")
	];

	// Tony VN Sprite (tony_warm_rain) - 3 fps, loops
	sprites.tonyWarmRainFrames = [
		loadImage("assets/sprites/tony_VN/tony_warm_rain/tony_warm_rain-1.png"),
		loadImage("assets/sprites/tony_VN/tony_warm_rain/tony_warm_rain-2.png"),
	];

	// Tony Overworld Sprites
	// tony_idle - 3 fps, loops
	sprites.tonyIdleFrames = [
		loadImage("assets/sprites/tony_overworld/tony_idle/tony_idle-1.png"),
		loadImage("assets/sprites/tony_overworld/tony_idle/tony_idle-2.png"),
		loadImage("assets/sprites/tony_overworld/tony_idle/tony_idle-3.png")
	];
	// tony_action - 3 fps, plays once
	sprites.tonyActionFrames = [
		loadImage("assets/sprites/tony_overworld/tony_action/tony_action-1.png"),
		loadImage("assets/sprites/tony_overworld/tony_action/tony_action-2.png"),
		loadImage("assets/sprites/tony_overworld/tony_action/tony_action-3.png"),
		loadImage("assets/sprites/tony_overworld/tony_action/tony_action-4.png")
	];
	// tony_action_idle - 3 fps, loops
	sprites.tonyActionIdleFrames = [
		loadImage("assets/sprites/tony_overworld/tony_action_idle/tony_action_idle-1.png"),
		loadImage("assets/sprites/tony_overworld/tony_action_idle/tony_action_idle-2.png")
	];
	// tony_start - intro sprite animation (looping)
	sprites.tonyStartFrames = [
		loadImage("assets/sprites/tony_overworld/tony_start/tony_start-1.png"),
		loadImage("assets/sprites/tony_overworld/tony_start/tony_start-2.png")
	];
	// tony_surprised - reaction animation (plays once at 6fps)
	sprites.tonySurprisedFrames = [
		loadImage("assets/sprites/tony_overworld/tony_surprised/tony_surprised-1.png"),
		loadImage("assets/sprites/tony_overworld/tony_surprised/tony_surprised-2.png"),
		loadImage("assets/sprites/tony_overworld/tony_surprised/tony_surprised-3.png")
	];
	// tony_start_idle - idle looping animation (3fps)
	sprites.tonyStartIdleFrames = [
		loadImage("assets/sprites/tony_overworld/tony_start_idle/tony_start_idle-1.png"),
		loadImage("assets/sprites/tony_overworld/tony_start_idle/tony_start_idle-2.png")
	];

	// Plant sprites - separate animations for dry vs watered states
	// Thyme
	sprites.thymeDryFrames = [
		loadImage("assets/sprites/plants/thyme_dry/thyme_dry-1.png"),
		loadImage("assets/sprites/plants/thyme_dry/thyme_dry-2.png")
	];
	sprites.thymeWateredFrames = [
		loadImage("assets/sprites/plants/thyme_watered/thyme_watered-1.png"),
		loadImage("assets/sprites/plants/thyme_watered/thyme_watered-2.png")
	];
	// Rosemary
	sprites.rosemaryDryFrames = [
		loadImage("assets/sprites/plants/rosemary_dry/rosemary_dry-1.png"),
		loadImage("assets/sprites/plants/rosemary_dry/rosemary_dry-2.png")
	];
	sprites.rosemaryWateredFrames = [
		loadImage("assets/sprites/plants/rosemary_watered/rosemary_watered-1.png"),
		loadImage("assets/sprites/plants/rosemary_watered/rosemary_watered-2.png")
	];
	// Flowers
	sprites.sunflowersDryFrames = [
		loadImage("assets/sprites/plants/sunflowers_dry/sunflowers_dry-1.png"),
		loadImage("assets/sprites/plants/sunflowers_dry/sunflowers_dry-2.png")
	];
	sprites.sunflowersWateredFrames = [
		loadImage("assets/sprites/plants/sunflowers_watered/sunflowers_watered-1.png"),
		loadImage("assets/sprites/plants/sunflowers_watered/sunflowers_watered-2.png")
	];
	sprites.tulipsDryFrames = [
		loadImage("assets/sprites/plants/tulips_dry/tulips_dry-1.png"),
		loadImage("assets/sprites/plants/tulips_dry/tulips_dry-2.png")
	];
	sprites.tulipsWateredFrames = [
		loadImage("assets/sprites/plants/tulips_watered/tulips_watered-1.png"),
		loadImage("assets/sprites/plants/tulips_watered/tulips_watered-2.png")
	];
	// Wildpatch
	sprites.wildpatchDryFrames = [
		loadImage("assets/sprites/plants/wildpatch_dry/wildpatch_dry-1.png"),
		loadImage("assets/sprites/plants/wildpatch_dry/wildpatch_dry-2.png")
	];
	sprites.wildpatchWateredFrames = [
		loadImage("assets/sprites/plants/wildpatch_watered/wildpatch_watered-1.png"),
		loadImage("assets/sprites/plants/wildpatch_watered/wildpatch_watered-2.png")
	];
	// Tomatoes
	sprites.tomatoesDryFrames = [
		loadImage("assets/sprites/plants/tomatoes_dry/tomatoes_dry-1.png"),
		loadImage("assets/sprites/plants/tomatoes_dry/tomatoes_dry-2.png")
	];
	sprites.tomatoesWateredFrames = [
		loadImage("assets/sprites/plants/tomatoes_watered/tomatoes_watered-1.png"),
		loadImage("assets/sprites/plants/tomatoes_watered/tomatoes_watered-2.png")
	];
	// Seedling
	sprites.seedlingDryFrames = [
		loadImage("assets/sprites/plants/seedling_dry/seedling_dry-1.png"),
		loadImage("assets/sprites/plants/seedling_dry/seedling_dry-2.png")
	];
	sprites.seedlingWateredFrames = [
		loadImage("assets/sprites/plants/seedling_watered/seedling_watered-1.png"),
		loadImage("assets/sprites/plants/seedling_watered/seedling_watered-2.png")
	];
	// Rain sprites for all plants, shell, and empty plot
	sprites.thymeRainFrames = [
		loadImage("assets/sprites/plants/thyme_rain/thyme_rain-1.png"),
		loadImage("assets/sprites/plants/thyme_rain/thyme_rain-2.png")
	];
	sprites.rosemaryRainFrames = [
		loadImage("assets/sprites/plants/rosemary_rain/rosemary_rain-1.png"),
		loadImage("assets/sprites/plants/rosemary_rain/rosemary_rain-2.png")
	];
	sprites.sunflowersRainFrames = [
		loadImage("assets/sprites/plants/sunflowers_rain/sunflowers_rain-1.png"),
		loadImage("assets/sprites/plants/sunflowers_rain/sunflowers_rain-2.png")
	];
	sprites.tulipsRainFrames = [
		loadImage("assets/sprites/plants/tulips_rain/tulips_rain-1.png"),
		loadImage("assets/sprites/plants/tulips_rain/tulips_rain-2.png")
	];
	sprites.wildpatchRainFrames = [
		loadImage("assets/sprites/plants/wildpatch_rain/wildpatch_rain-1.png"),
		loadImage("assets/sprites/plants/wildpatch_rain/wildpatch_rain-2.png")
	];
	sprites.tomatoesRainFrames = [
		loadImage("assets/sprites/plants/tomatoes_rain/tomatoes_rain-1.png"),
		loadImage("assets/sprites/plants/tomatoes_rain/tomatoes_rain-2.png")
	];
	sprites.seedlingRainFrames = [
		loadImage("assets/sprites/plants/seedling_rain/seedling_rain-1.png"),
		loadImage("assets/sprites/plants/seedling_rain/seedling_rain-2.png")
	];
	sprites.emptyPlotRainFrames = [
		loadImage("assets/sprites/plants/emptyplot_rain/emptyplot_rain-1.png"),
		loadImage("assets/sprites/plants/emptyplot_rain/emptyplot_rain-2.png")
	];
	sprites.shellRainFrames = [
		loadImage("assets/sprites/plants/shell_rain/shell_rain-1.png"),
		loadImage("assets/sprites/plants/shell_rain/shell_rain-2.png")
	];
	// Cursor animation frames
	sprites.cursorFrames = [
		loadImage("assets/sprites/cursor/cursor-1.png"),
		loadImage("assets/sprites/cursor/cursor-2.png"),
		loadImage("assets/sprites/cursor/cursor-3.png")
	];
	// Cursor question animation frames
	sprites.cursorQuestionFrames = [
		loadImage("assets/sprites/cursor_question/cursor_question-1.png"),
		loadImage("assets/sprites/cursor_question/cursor_question-2.png"),
		loadImage("assets/sprites/cursor_question/cursor_question-3.png")
	];
	sprites.cursorQuestionRainFrames = [
		loadImage("assets/sprites/cursor_question_rain/cursor_question_rain-1.png"),
		loadImage("assets/sprites/cursor_question_rain/cursor_question_rain-2.png"),
		loadImage("assets/sprites/cursor_question_rain/cursor_question_rain-3.png")
	];
	// Empty plot animation frames (not a plant, but uses same sprite system)
	sprites.emptyPlotFrames = [
		loadImage("assets/sprites/plants/emptyplot/emptyplot-1.png"),
		loadImage("assets/sprites/plants/emptyplot/emptyplot-2.png")
	];
	// Shell animation frames (interactive item for section 2)
	sprites.shellFrames = [
		loadImage("assets/sprites/plants/shell_normal/shell_normal-1.png"),
		loadImage("assets/sprites/plants/shell_normal/shell_normal-2.png")
	];
	// Shell ready frames (when all plants watered)
	sprites.shellReadyFrames = [
		loadImage("assets/sprites/plants/shell_ready/shell_ready-1.png"),
		loadImage("assets/sprites/plants/shell_ready/shell_ready-2.png")
	];
	// Cutscene sprites - cutscene 1
	sprites.cutsceneCallback1Frames = [
		loadImage("assets/cutscenes/tony_callback_1/tony_callback_1-1.png"),
		loadImage("assets/cutscenes/tony_callback_1/tony_callback_1-2.png")
	];
	sprites.cutsceneCallback2Frames = [
		loadImage("assets/cutscenes/tony_callback_2/tony_callback_2-1.png"),
		loadImage("assets/cutscenes/tony_callback_2/tony_callback_2-2.png")
	];

	// Cutscene sprites - cutscenes 3-9 (simple 2-frame loops at 3fps)
	sprites.cutsceneLeavingFrames = [
		loadImage("assets/cutscenes/tony_leaving/tony_leaving-1.png"),
		loadImage("assets/cutscenes/tony_leaving/tony_leaving-2.png")
	];
	sprites.cutsceneReturningFrames = [
		loadImage("assets/cutscenes/tony_returning/tony_returning-1.png"),
		loadImage("assets/cutscenes/tony_returning/tony_returning-2.png")
	];
	sprites.cutsceneReturningShellFrames = [
		loadImage("assets/cutscenes/shell_return/shell_return-1.png"),
		loadImage("assets/cutscenes/shell_return/shell_return-2.png")
	];
	sprites.cutsceneKneelingShellFrames = [
		loadImage("assets/cutscenes/tony_kneeling_shell/tony_kneeling_shell-1.png"),
		loadImage("assets/cutscenes/tony_kneeling_shell/tony_kneeling_shell-2.png")
	];
	sprites.cutsceneKneelingCloudsFrames = [
		loadImage("assets/cutscenes/tony_kneeling_clouds/tony_kneeling_clouds-1.png"),
		loadImage("assets/cutscenes/tony_kneeling_clouds/tony_kneeling_clouds-2.png")
	];
	sprites.cutsceneKneelingRainFrames = [
		loadImage("assets/cutscenes/tony_kneeling_rain/tony_kneeling_rain-1.png"),
		loadImage("assets/cutscenes/tony_kneeling_rain/tony_kneeling_rain-2.png")
	];
	sprites.cutsceneRainfallFrames = [
		loadImage("assets/cutscenes/tony_rainfall/tony_rainfall-1.png"),
		loadImage("assets/cutscenes/tony_rainfall/tony_rainfall-2.png")
	];

	// Cutscene sprites - cutscene 2 intro sequence
	sprites.cutsceneRemoveShellFrames = [
		loadImage("assets/cutscenes/tony_remove_shell/tony_remove_shell-1.png"),
		loadImage("assets/cutscenes/tony_remove_shell/tony_remove_shell-2.png"),
		loadImage("assets/cutscenes/tony_remove_shell/tony_remove_shell-3.png"),
		loadImage("assets/cutscenes/tony_remove_shell/tony_remove_shell-4.png")
	];
	sprites.cutsceneRemoveShellAfterFrames = [
		loadImage("assets/cutscenes/tony_remove_shell_after/tony_remove_shell_after-1.png"),
		loadImage("assets/cutscenes/tony_remove_shell_after/tony_remove_shell_after-2.png")
	];
	sprites.cutsceneEarsFrames = [
		loadImage("assets/cutscenes/tony_ears/tony_ears-1.png"),
		loadImage("assets/cutscenes/tony_ears/tony_ears-2.png"),
		loadImage("assets/cutscenes/tony_ears/tony_ears-3.png"),
		loadImage("assets/cutscenes/tony_ears/tony_ears-4.png"),
		loadImage("assets/cutscenes/tony_ears/tony_ears-5.png")
	];
	sprites.cutsceneEarsAfterFrames = [
		loadImage("assets/cutscenes/tony_ears_after/tony_ears_after-1.png"),
		loadImage("assets/cutscenes/tony_ears_after/tony_ears_after-2.png")
	];

	// Rain backgrounds
	gardenAssets.section1RainBackground = loadImage("assets/environment/section1_rain.png");
	gardenAssets.section2RainBackground = loadImage("assets/environment/section2_rain.png");
	gardenAssets.section3RainBackground = loadImage("assets/environment/section3_rain.png");

	// Tony rain overworld sprite frames
	sprites.tonyRainFrames = [
		loadImage("assets/sprites/tony_overworld/tony_idle_rain/tony_idle_rain-1.png"),
		loadImage("assets/sprites/tony_overworld/tony_idle_rain/tony_idle_rain-2.png"),
		loadImage("assets/sprites/tony_overworld/tony_idle_rain/tony_idle_rain-3.png")
	];

	// Font
	myFont = loadFont("assets/boldpixels/BoldPixels.ttf");
}

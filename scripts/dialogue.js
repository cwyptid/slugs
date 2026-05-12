// A Game About Slugs - Dialogue & Scene Data

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

function handleVNChoice(choiceIndex) {
	if (!scenes[currentScene]) {
		return;
	}

	// Check if this is an ending scene
	if (scenes[currentScene].isEndingScene) {
		if (scenes[currentScene].startsCutscene) {
			// Fade to black then enter cutscene mode
			fadeToCutsceneTargetScene = scenes[currentScene].cutsceneTarget || 1100;
			fadingToCutscene = true;
			fadeToCutsceneStartTime = millis();
		} else if (scenes[currentScene].endsToVNBrief) {
			// Cutscene → brief VN interlude (no rain), then back to cutscene
			fadeCutsceneToVNBriefTargetScene = scenes[currentScene].cutsceneToVNBriefTarget || 1350;
			fadingCutsceneToVNBrief = true;
			fadeCutsceneToVNBriefStartTime = millis();
		} else if (scenes[currentScene].endsToVN) {
			// Cutscene ends - fade to black then enter VN with rain
			fadeCutsceneToVNTargetScene = scenes[currentScene].cutsceneToVNTarget || 2000;
			fadingCutsceneToVN = true;
			fadeCutsceneToVNStartTime = millis();
		} else if (scenes[currentScene].isStoryEnding) {
			// Final VN dialogue done - show the two-button end screen
			buttons = [];
			gameMode = 'storyEnding';
		} else if (scenes[currentScene].isCutsceneEnd) {
			// Cutscene ended - fade to black and hold (placeholder)
			cutsceneEndFading = true;
			cutsceneEndFadeStartTime = millis();
		} else if (currentScene >= 800 && currentScene <= 999) {
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
// SCENE DATA (VN MODE)
// ========================

function setupScenes() {
	// ===== OPENING SEQUENCE (SCENES 1000-1099) =====

	scenes[1000] = {
		text: "Hey! Oh wow, hi!",
		image: assets.hopeful, // TODO: Replace with caught_off_guard expression when available
		keys: [],
		nextPages: [1001]
	};

	scenes[1001] = {
		text: "[PLAYER_NAME]? Is that you?\n[1] Slime Tony?!\n[2] Tony? It's been forever!",
		image: assets.hopeful,
		keys: ["1", "2"],
		nextPages: [1002, 1002]
	};

	scenes[1002] = {
		text: "Yeah! You recognized me? I know I've changed a bit...",
		image: assets.shy, 
		keys: [],
		nextPages: [1003]
	};

	scenes[1003] = {
		text: "It's great seeing you again.\n[1] What are you up to? Someone's been gardening up a storm.\n[2] You know who's responsible for these plants?",
		image: assets.smiling_waving,
		keys: ["1", "2"],
		nextPages: [1010, 1010]
	};

	scenes[1010] = {
		text: "That'd be me! Picked up the hobby a while back.",
		image: assets.happy,
		keys: [],
		nextPages: [1010.5]
	};

	scenes["1010.5"] = {
		text: "Kind of a long story how I got into it.\n[1] I'm always down for story time.\n[2] I've got time to kill.",
		image: assets.explaining,
		keys: ["1", "2"],
		nextPages: [1011, 1011]
	};

	scenes[1011] = {
		text: "In that case... would you mind helping me water? We could catch up while we work.\n[1] Sure!\n[2] Sounds like a plan.",
		image: assets.contemplative,
		keys: ["1", "2"],
		nextPages: [1050, 1060] 
	};

	// ===== BRANCH X: "Sure!" =====
	scenes[1050] = {
		text: "My watering can should be here somewhere. Just click on the plants to give them a sip.\n",
		image: assets.explaining,
		keys: [],
		nextPages: [1070]
	};

	// ===== BRANCH Y: "Sounds like a plan" =====
	scenes[1060] = {
		text: "Rad! It's nice to have company.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [1060.5]
	};

	scenes["1060.5"] = {
		text: "My watering can should be here somewhere. Just click on the plants to give them a sip.\n",
		image: assets.explaining,
		keys: [],
		nextPages: [1070]
	};

	// ===== CLOSING SCENE =====
	scenes[1070] = {
		text: "And [PLAYER_NAME]? I'm real glad you're here.",
		image: assets.warm, 
		keys: [],
		nextPages: [],
		isEndingScene: true 
	};

	// ===== HERB CONVERSATION =====

	// Scene 0: Opening
	scenes[0] = {
		text: "Ah, the herbs. These are pretty hardy.\n[1] What kind are they?\n[2] They smell amazing.\n[3] Do you cook with them?",
		image: assets.happy, 
		keys: ["1", "2", "3"],
		nextPages: [10, 20, 30], 
	};

	// ===== BRANCH 1A: "What kind are they?" =====
	scenes[10] = {
		text: "This little fella is thyme, and that's rosemary over there.",
		image: assets.explaining,
		keys: [],
		nextPages: [],
	};

	scenes[11] = {
		text: "I didn't know a thing about herbs when I started. Had to look everything up.\n[1] That's cool that you taught yourself.\n[2] Must have been a lot of work.",
		image: assets.shy,
		keys: ["1", "2"],
		nextPages: [15, 15]
	};

	scenes[15] = {
		text: "You think so? I'm not all that.",
		image: assets.warm,
		keys: [],
		nextPages: [12],
	};

	scenes[12] = {
		text: "I just read books and blogs mostly. Took more trial and error than I'd have liked.\n",
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

	// Branch 1B-1: "It's peaceful here"
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

	// Branch 1B-2: "Must be nice to work with"
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

	// ===== BRANCH 1C: "Cook with them" =====
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

	// Branch 1C-1: "For the vibes"
	scenes[32] = {
		text: "Right! They don't have to be useful.",
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

	// Branch 1C-2: "That's fair"
	scenes[35] = {
		text: "Yeah. like, not everything needs a purpose, you know?",
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

	// Branch 2A-1: "Why"
	scenes[112] = {
		text: "I don't know. It was like... I had to earn it somehow?",
		image: assets.anxious,
		keys: [],
		nextPages: [113],
	};

	scenes[113] = {
		text: "Like since they're just for aesthetics, I didn't need them. Something so indulgent...\n",
		image: assets.rueful,
		keys: [],
		nextPages: [114],
	};

	scenes[114] = {
		text: "But flowers don't care. They don't even know how pretty they are! They just... exist\n.",
		image: assets.warm,
		keys: [],
		nextPages: [150], // Converge to ending
	};

	// Branch 2A-2: "That's not silly"
	scenes[115] = {
		text: "I know it's weird... I just find it hard to believe.",
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

	// Branch 2B-1: "Good way to choose"
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

	// Branch 2B-2: "Following your instincts"
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
		nextPages: [], 
		isEndingScene: true
	};

	// ===== WILDPATCH CONVERSATION =====

	// Scene 200: Opening
	scenes[200] = {
		text: "I leave this part alone.\n[1] On purpose?\n[2] It looks nice wild.\n[3] Don't you worry about it?",
		image: assets.peaceful,
		keys: ["1", "2", "3"],
		nextPages: [210, 220, 230], // Branch 3A, 3B, 3C
	};

	// ===== BRANCH 3A: "On purpose?" =====
	scenes[210] = {
		text: "Yep. I wanted one part that just... does its own thing.",
		image: assets.warm,
		keys: [],
		nextPages: [211],
	};

	scenes[211] = {
		text: "Not everything needs my intervention.\n[1] I bet that takes discipline.\n[2] Doesn't that drive you crazy?",
		image: assets.confident,
		keys: ["1", "2"],
		nextPages: [212, 212], // Branch 3A-1, 3A-2 (same path for both)
	};

	// Branch 3A-1: "That takes discipline"
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
		text: "It's not trying to be anything other than what it is.\n[1] It takes orders from no man.\n[2] Living the dream.",
		image: assets.peaceful,
		keys: ["1", "2"],
		nextPages: [225, 222], // Branch 3B-1, 3B-2
	};

	// Branch 3B-1: "Living the dream"
	scenes[222] = {
		text: "You can say that again.",
		image: assets.happy,
		keys: [],
		nextPages: [223],
	};

	scenes[223] = {
		text: "You know, sometimes I wish I was one of these plants. Or a wild creature.",
		image: assets.contemplative,
		keys: [],
		nextPages: [224],
	};

	scenes[224] = {
		text: "It's dumb, but I'd have a clear idea of my objective that way. Wouldn't feel so lost..\n",
		image: assets.rueful,
		keys: [],
		nextPages: [300],
	}

	// Branch 3B-2: "Takes orders from no man"
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
		text: "This patch will grow or it won't. My worrying won't change that.\n[1] That takes a lot of letting go.\n[2] Sounds freeing.",
		image: assets.peaceful,
		keys: ["1", "2"],
		nextPages: [232, 235], // Branch 3C-1, 3C-2
	};

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
		nextPages: [], 
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
		text: "Without them, the plants would collapse under the weight of the fruits.\n[1] Talk about high maintenance...\n[2] They'd break otherwise?",
		image: assets.assured,
		keys: ["1", "2"],
		nextPages: [412, 415], // Branch 4A-1, 4A-2
	};

	// Branch 4A-1: "High maintenance"
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
		text: "Sort of. The weight of their own fruit can crush the stems, or they'd grow across the ground.\n",
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
		text: "That's why they need the stakes. To hold the weight they can't carry alone.\n[1] Makes sense.\n[2] Guess we all need support sometimes.",
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
		nextPages: [431],
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
		nextPages: [],
		isEndingScene: true
	};

	// ===== SEEDLING CONVERSATION (Scene 500) =====
	// Scene 500: Opening
	scenes[500] = {
		text: "This one's not doing great.\n[1] What's wrong with it?\n[2] Do you think it'll make it?",
		image: assets.rueful,
		keys: ["1", "2"],
		nextPages: [510, 520, 530], // Branch 5A, 5B
	};

	// ===== BRANCH 5A: "What's wrong?" =====
	scenes[510] = {
		text: "I'm not sure exactly. It sprouted just fine, but it's been struggling since.",
		image: assets.wistful,
		keys: [],
		nextPages: [511],
	};

	scenes[511] = {
		text: "Could be the soil, or maybe even disease. It's hard to tell when you can't ask it what's up.\n\n[1] Can you fix it?\n[2] That sounds frustrating.",
		image: assets.contemplative,
		keys: ["1", "2"],
		nextPages: [512, 514], // Branch 5A-1, 5A-2
	};
	// Branch 5A-1: "Can you fix it?"
	scenes[512] = {
		text: "I've been adjusting things. Sometimes more water, sometimes less water. Been moving it around a bit, too.\n",
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
		image: assets.assured,
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
		text: "Probably not, if I'm being realistic.\n[1] I'm sorry.\n[2] That's really hard.",
		image: assets.anxious,
		keys: ["1", "2"],
		nextPages: [522, 525], // Branch 5B-1, 5B-2
	};

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
		text: "All you can do is keep showing up, whether it makes a difference or not.",
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
		text: "I haven't planted a thing here yet.\n[1] What'll you plant?\n[2] Saving it for something special?\n[3] Why leave all this empty space?",
		image: assets.shy,
		keys: ["1", "2", "3"],
		nextPages: [610, 620, 630], // Branch 6A, 6B, 6C
	};

	// ===== BRANCH 6A: "What will you plant?" =====
	scenes[610] = {
		text: "Not too sure yet.",
		image: assets.contemplative,
		keys: [],
		nextPages: [611],
	};

	scenes[611] = {
		text: "I've been thinking about it, but I don't have much of an answer.\n[1] That's fine, take your time.\n[2] I bet you'll know when you're ready.",
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
		image: assets.wistful, 
		keys: [],
		nextPages: [614],
	};

	scenes[614] = {
		text: "Uncertainty shouldnt be my enemy. I need the space to think things through.",
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
		text: "I'm trying teach myself not everything has to be profound.",
		image: assets.warm,
		keys: [],
		nextPages: [625],
	};

	scenes[625] = {
		text: "Trusting what I want instead of overthinking all the time.",
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

	// Branch 6C-2: "It'll always be here"
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
		text: "That's... well, it's my shell. Or it was.\n[1] Oh yeah! You're not wearing it?\n[2] What happened to it?",
		image: assets.rueful,
		keys: ["1", "2"],
		nextPages: [710, 720], // Branch 7A, 7B
	};

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
		text: "You mind if I tell you about it later? After we've watered a bit?",
		image: assets.shy,
		keys: [],
		nextPages: [740],
	};

	// ===== CONVERGE: Both branches lead here =====
	scenes[740] = {
		text: "I promise I'll explain. Just... gotta to ease into it, you know?\n[1] Of course, no pressure.\n[2] Whenever you're ready.",
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
		text: "Let's chill out and water some plants. It helps me think.",
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
		text: "You've probably been curious. Or maybe you haven't. I don't know. I shouldn't assume.\n",
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
		text: "If you still want to hear about it. I shouldn't assume.\n[1] I'm all ears, dude.\n[2] Only if you're comfortable.",
		image: assets.wistful,
		keys: ["1", "2"],
		nextPages: [810, 820], // Branch 8A, 8B
	};

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
		text: "When we last talked, I wasn't just wearing it. I was practially living in it...",
		image: assets.rueful,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		startsCutscene: true // transitions to cutscene mode instead of demo end
	};

	// ===== CUTSCENE 1 =====

	// CUTSCENE 1-1: tony_callback_1 frames
	scenes[1100] = {
		text: "The shell was supposed to solve all my problems, and for a while, it pretty much did.\n",
		cutsceneSprite: assets.cutscene_callback_1,
		keys: [],
		nextPages: [1117],
	};

	scenes[1117] = {
		text: "I felt safe. I felt like I could be myself without worrying about what would happen.\n",
		cutsceneSprite: assets.cutscene_callback_1,
		keys: [],
		nextPages: [1114],
	};

	scenes[1114] = {
		text: "I was all like 'Man, being a snail rules! Slugs are totally missing out.'",
		cutsceneSprite: assets.cutscene_callback_1,
		keys: [],
		nextPages: [1118],
	};

	scenes[1118] = {
		text: "To me, being a slug meant being born to lose.",
		cutsceneSprite: assets.cutscene_callback_1,
		keys: [],
		nextPages: [1120],
	};

	scenes[1120] = {
		text: "Or even worse, loseable.",
		cutsceneSprite: assets.cutscene_callback_1,
		keys: [],
		nextPages: [1119],
	};

	scenes[1119] = {
		text: "Being a snail was the obvious choice.",
		cutsceneSprite: assets.cutscene_callback_1,
		keys: [],
		nextPages: [1101],
	};

	scenes[1101] = {
		text: "But it turns out I just couldn't win either way.",
		cutsceneSprite: assets.cutscene_callback_1,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		startsCutscene: true,
		cutsceneTarget: 1115
	};

	// CUTSCENE 1-2: tony_callback_2 frames

	scenes[1115] = {
		text: "After a while… it started to get heavy.",
		cutsceneSprite: assets.cutscene_callback_2,
		keys: [],
		nextPages: [1116],
	};

	scenes[1116] = {
		text: "And being a snail became pretty bogus too.",
		cutsceneSprite: assets.cutscene_callback_2,
		keys: [],
		nextPages: [1102],
	};

	scenes[1102] = {
		text: "I began to feel like I couldn't be myself and wear the shell.\n[1] What do you mean?\n[2] Why?",
		cutsceneSprite: assets.cutscene_callback_2,
		keys: ["1", "2"],
		nextPages: [1110, 1110]
	};

	// (both choices converge here)
	scenes[1110] = {
		text: "It's hard to explain, but I guess I'd put it this way.",
		cutsceneSprite: assets.cutscene_callback_2,
		keys: [],
		nextPages: [1111]
	};

	scenes[1111] = {
		text: "It didn't fit around me anymore. I had to cast parts of who I was away just to stay inside.\n",
		cutsceneSprite: assets.cutscene_callback_2,
		keys: [],
		nextPages: [1112]
	};

	scenes[1112] = {
		text: "But I was scared to take it off. Without it, there'd be nothing left to protect me.\n",
		cutsceneSprite: assets.cutscene_callback_2,
		keys: [],
		nextPages: [1113]
	};

	scenes[1113] = {
		text: "And yet…",
		cutsceneSprite: assets.cutscene_callback_2,
		keys: [],
		nextPages: [1200],
		isEndingScene: true,
		startsCutscene: true,
		cutsceneTarget: 1200
	};

	// ===== CUTSCENE 2 =====
	// Intro sequence: tony_remove_shell (once) → tony_remove_shell_after (once) → tony_ears (once) → tony_ears_after (loops, dialogue starts)

	scenes[1200] = {
		text: "I HAD to. I had to be me again.",
		cutsceneSprite: assets.cutscene_ears_after,
		cutsceneIntroSequence: [
			assets.cutscene_remove_shell,
			assets.cutscene_remove_shell_after,
			assets.cutscene_ears
		],
		keys: [],
		nextPages: [1201]
	};

	scenes[1201] = {
		text: "I just left it here. Didn't quite know what to do with it.",
		cutsceneSprite: assets.cutscene_ears_after,
		keys: [],
		nextPages: [1202]
	};

	scenes[1202] = {
		text: "Thought about throwing it off a bridge honestly.",
		cutsceneSprite: assets.cutscene_ears_after,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		endsToVNBrief: true,
		cutsceneToVNBriefTarget: 1350
	};

	// ===== VN INTERLUDE (replaces cutscenes 3 and 4) =====

	scenes[1350] = {
		text: "Basically, I ran.",
		image: assets.shy,
		keys: [],
		nextPages: [1351]
	};

	scenes[1351] = {
		text: "I needed to be myself again, but I didn't even remember how.",
		image: assets.assured,
		keys: [],
		nextPages: [1356]
	};

	scenes[1356] = {
		text: "So I moved someplace nobody knew me.",
		image: assets.wistful,
		keys: [],
		nextPages: [1352]
	};

	scenes[1352] = {
		text: "Can't say it helped. I think it messed me up a bit. But that's what I thought was best for me at the time.\n\n[1] I get it.\n[2] Some things just don't turn out right.",
		image: assets.rueful,
		keys: ["1", "2"],
		nextPages: [1353, 1353]
	};

	scenes[1353] = {
		text: "Regardless, when I came back…",
		image: assets.contemplative,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		startsCutscene: true,
		cutsceneTarget: 1354
	};

	// ===== CUTSCENE 5 =====

	scenes[1354] = {
		text: "It was still here. Right where I left it.",
		cutsceneSprite: assets.cutscene_returning_shell,
		keys: [],
		nextPages: [1355]
	};

	scenes[1355] = {
		text: "But it wasn't that same, suffocating shell anymore!",
		cutsceneSprite: assets.cutscene_returning_shell,
		keys: [],
		nextPages: [1403],
	};

	scenes[1403] = {
		text: "Moss, vines, little flowers sprouting through the cracks.",
		cutsceneSprite: assets.cutscene_returning_shell,
		keys: [],
		nextPages: [1404],
	};

	scenes[1404] = {
		text: "It was teeming with life.",
		cutsceneSprite: assets.cutscene_returning_shell,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		startsCutscene: true,
		cutsceneTarget: 1500
	};

	// ===== CUTSCENE 6 =====

	scenes[1500] = {
		text: "The shell I left behind had become so much more. I couldn't believe my eyes.",
		cutsceneSprite: assets.cutscene_kneeling_shell,
		keys: [],
		nextPages: [1501],
	};

	scenes[1501] = {
		text: "Until then, I wanted to forget it. Act like it never happened.",
		cutsceneSprite: assets.cutscene_kneeling_shell,
		keys: [],
		nextPages: [1502]
	};

	scenes[1502] = {
		text: "But it was…beautiful.\n[1] What happened to it?\n[2] What'd you do then?",
		cutsceneSprite: assets.cutscene_kneeling_shell,
		keys: ["1", "2"],
		nextPages: [1503, 1503]
	};

	// Both choices converge here
	scenes[1503] = {
		text: "It could've been mere minutes, could've been hours. Hard to tell looking back on it.\n",
		cutsceneSprite: assets.cutscene_kneeling_shell,
		keys: [],
		nextPages: [1504]
	};

	scenes[1504] = {
		text: "But I just took it in.",
		cutsceneSprite: assets.cutscene_kneeling_shell,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		startsCutscene: true,
		cutsceneTarget: 1505
	};

	// ===== CUTSCENE 6 =====

	scenes[1505] = {
		text: "…",
		cutsceneSprite: assets.cutscene_kneeling_clouds,
		keys: [],
		nextPages: [1506]
	};

	scenes[1506] = {
		text: "Eventually, though, it began to rain.",
		cutsceneSprite: assets.cutscene_kneeling_clouds,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		startsCutscene: true,
		cutsceneTarget: 1600
	};

	// ===== CUTSCENE 8 =====

	scenes[1600] = {
		text: "I almost FLIPPED at first. I didn't have my shell on! Old habits, y'know?",
		cutsceneSprite: assets.cutscene_kneeling_rain,
		keys: [],
		nextPages: [1601]
	};

	scenes[1601] = {
		text: "It'd seemed like forever since I'd felt rain. The shell had always kept me dry.",
		cutsceneSprite: assets.cutscene_kneeling_rain,
		keys: [],
		nextPages: [1602]
	};

	scenes[1602] = {
		text: "But it felt… nice. Really, really nice.",
		cutsceneSprite: assets.cutscene_kneeling_rain,
		keys: [],
		nextPages: [1603]
	};

	scenes[1603] = {
		text: "That's when I realized that while the shell kept me safe for so long…",
		cutsceneSprite: assets.cutscene_kneeling_rain,
		keys: [],
		nextPages: [1604]
	};

	scenes[1604] = {
		text: "It also kept me from feeling anything at all.",
		cutsceneSprite: assets.cutscene_kneeling_rain,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		startsCutscene: true,
		cutsceneTarget: 1605
	};

	// ===== CUTSCENE 9 =====

	scenes[1605] = {
		text: "See, these plants are exposed! Out in the open.",
		cutsceneSprite: assets.cutscene_rainfall,
		keys: [],
		nextPages: [1606]
	};

	scenes[1606] = {
		text: "Birds could nab 'em, they could get trampled on, anything can happen really.",
		cutsceneSprite: assets.cutscene_rainfall,
		keys: [],
		nextPages: [1607]
	};

	scenes[1607] = {
		text: "But them being out in the open like this? That's the only way they're gonna grow.",
		cutsceneSprite: assets.cutscene_rainfall,
		keys: [],
		nextPages: [1608]
	};

	scenes[1608] = {
		text: "Getting their rain, sunshine, all of it.",
		cutsceneSprite: assets.cutscene_rainfall,
		keys: [],
		nextPages: [1609]
	};

	scenes[1609] = {
		text: "I wanted to understand what these plants needed that day, so that's when I started learning.\n",
		cutsceneSprite: assets.cutscene_rainfall,
		keys: [],
		nextPages: [1610]
	};

	scenes[1610] = {
		text: "About soil, light, water, growth. What it takes to live.",
		cutsceneSprite: assets.cutscene_rainfall,
		keys: [],
		nextPages: [1611]
	};

	scenes[1611] = {
		text: "Because then, maybe I could find my answer, too.",
		cutsceneSprite: assets.cutscene_rainfall,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		endsToVN: true,
		cutsceneToVNTarget: 2000 // Hand off to VN mode here
	};

	// ===== ENDING SEQUENCE (SCENES 2000-2016) =====
	// Entered from cutscene 9 via endsToVN transition; isRaining = true at this point

	scenes[2000] = {
		text: "Oh! It's raining now, actually.",
		image: assets.contemplative_rain,
		keys: [],
		nextPages: [2017]
	};

	scenes[2017] = {
		text: "Funny timing.",
		image: assets.warm_rain,
		keys: [],
		nextPages: [2001]
	};

	scenes[2001] = {
		text: "I guess we didn't need to water the plants today, after all...\n[1] That's okay, we had a good time!\n[2] Who cares if it was necessary?",
		image: assets.shy_rain,
		keys: ["1", "2"],
		nextPages: [2002, 2002]
	};

	scenes[2002] = {
		text: "Haha, you're right!",
		image: assets.happy_rain,
		keys: [],
		nextPages: [2003]
	};

	scenes[2003] = {
		text: "Either way, it was great catching up with you, [PLAYER_NAME].",
		image: assets.warm_rain,
		keys: [],
		nextPages: [2005]
	};

	scenes[2005] = {
		text: "You know…",
		image: assets.contemplative_rain,
		keys: [],
		nextPages: [2006]
	};

	scenes[2006] = {
		text: "I used to think being a snail was so much better. I hated being a slug for as long as I could remember.\n",
		image: assets.wistful_rain,
		keys: [],
		nextPages: [2007]
	};

	scenes[2007] = {
		text: "But it was less…me.",
		image: assets.rueful_rain,
		keys: [],
		nextPages: [2008]
	};

	scenes[2008] = {
		text: "After I ditched the shell, I felt ashamed for having tried something different. Really embarrassed that it didn't work out.\n",
		image: assets.rueful_rain,
		keys: [],
		nextPages: [2009]
	};

	scenes[2009] = {
		text: "But now, I'm just going to be myself.",
		image: assets.confident_rain,
		keys: [],
		nextPages: [2010]
	};

	scenes[2010] = {
		text: "Don't get me wrong, it was all me! Even with the shell.",
		image: assets.happy_rain,
		keys: [],
		nextPages: [2011]
	};

	scenes[2011] = {
		text: "But I just want to be present in the moment. Even if it means a more vulnerable mode of existence.\n",
		image: assets.peaceful_rain,
		keys: [],
		nextPages: [2012]
	};

	scenes[2012] = {
		text: "It has to be worth something.\n[1] I'm happy for you.\n[2] It is. I know it.",
		image: assets.assured_rain,
		keys: ["1", "2"],
		nextPages: [2013, 2013]
	};

	scenes[2013] = {
		text: "Thanks for hearing me out. It felt good to get that off my chest.",
		image: assets.warm_rain,
		keys: [],
		nextPages: [2014]
	};

	scenes[2014] = {
		text: "This rain'll keep falling for a while. I think I'll stay out here.",
		image: assets.smile_rain,
		keys: [],
		nextPages: [2015]
	};

	scenes[2015] = {
		text: "You're welcome to stick around. Or go if you need. Whatever floats your boat.",
		image: assets.smile_rain,
		keys: [],
		nextPages: [2016]
	};

	scenes[2016] = {
		text: "Just take care of yourself, okay?",
		image: assets.warm_rain,
		keys: [],
		nextPages: [],
		isEndingScene: true,
		isStoryEnding: true // Triggers the two-button end screen
	};
}

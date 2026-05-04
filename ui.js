// ========================
// TITLE SCREEN
// ========================

function drawTitleScreen() {
	if (assets.titleImage) {
		image(assets.titleImage, 0, 0, width, height);
	}
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

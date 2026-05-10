// A Game About Slugs - UI & Input Handling

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

// ========================
// TITLE SCREEN
// ========================

function drawTitleScreen() {
	// Draw title image
	image(assets.titleImage, 0, 0, width, height);
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
// RAIN PARTICLE SYSTEM
// ========================

function initRainParticles() {
	const counts = [8, 10, 8];
	rainParticles = [[], [], []];
	for (let b = 0; b < 3; b++) {
		for (let i = 0; i < counts[b]; i++) {
			rainParticles[b].push({
				x: random(-50, width),
				y: random(-height, height),
				speed: random(7, 10)
			});
		}
	}
}

function updateRainParticles() {
	for (let bucket of rainParticles) {
		for (let p of bucket) {
			p.x += 2;
			p.y += p.speed;
			if (p.y > height + 12 || p.x > width + 12) {
				p.x = random(-width * 0.1, width);
				p.y = -12;
			}
		}
	}
}

function drawRainParticles() {
	const ctx = drawingContext;
	const opacities = [0.4, 0.62, 0.82];
	ctx.fillStyle = 'rgb(255, 253, 218)';
	for (let b = 0; b < 3; b++) {
		ctx.globalAlpha = opacities[b];
		for (let p of rainParticles[b]) {
			ctx.fillRect(p.x,     p.y,      3, 5);
			ctx.fillRect(p.x + 2, p.y + 6,  3, 5);
			ctx.fillRect(p.x + 4, p.y + 12, 3, 5);
		}
	}
	ctx.globalAlpha = 1;
}

// ========================
// GARDEN MODE
// ========================

function drawGardenMode(currentTime) {
	// Use frame-cached plants for drawing
	let currentSectionPlants = frameCachedPlants;

	// Draw appropriate background based on current section (rain variant when raining)
	if (currentSection === 1) {
		image(isRaining ? gardenAssets.section1RainBackground : gardenAssets.section1Background, 0, 0, width, height);
	} else if (currentSection === 2) {
		image(isRaining ? gardenAssets.section2RainBackground : gardenAssets.section2Background, 0, 0, width, height);
	} else if (currentSection === 3) {
		image(isRaining ? gardenAssets.section3RainBackground : gardenAssets.section3Background, 0, 0, width, height);
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
		// In rain_ending the game is over, so show the normal shell sprite again
		const allPlantsWatered = checkAllPlantsWatered() && gameMode !== 'rain_ending';
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
	if ((gameMode === 'garden' || gameMode === 'rain_ending' || gameMode === 'transitioning' || (gameMode === 'intro' && currentSection === 1) || (isIntroSequenceVN && gameMode === 'vn'))) {
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
			// Use rain variant when raining (placeholder = same as idle)
			currentSprite = (isRaining && gardenState.tonyState.tonyRainSprite)
				? gardenState.tonyState.tonyRainSprite
				: gardenState.tonyState.currentSprite;
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

	// Draw rain particles over garden (before arrows and UI)
	if (isRaining) drawRainParticles();

	// Draw navigation arrows with bobbing animation
	let isArrowHovered = false;
	const arrowSize = 40 * 1.5;
	const arrowBaseY = 20; // Top corner
	const bobSpeed = 0.005; // Extremely slow bobbing
	const bobAmount = 1; // Barely moves
	const bobY = arrowBaseY + Math.sin(currentTime * bobSpeed) * bobAmount;

	// Draw left arrow (go back to section 1) - only show on section 2+
	if ((gameMode === 'garden' || gameMode === 'intro' || gameMode === 'rain_ending') && currentSection > 1 && gardenAssets.arrowLeft) {
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
	if ((gameMode === 'garden' || gameMode === 'intro' || gameMode === 'rain_ending') && currentSection < 3 && gardenAssets.arrowRight) {
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
		if (nameBoxImage) {
			const tbW = 500 * canvasScale;
			const tbH = 116 * canvasScale;
			const tbX = (width - tbW) / 2;
			const tbY = height - tbH - 10 * canvasScale;
			push();
			tint(255, alpha * 255);
			image(nameBoxImage, tbX, tbY, tbW, tbH);
			pop();
			push();
			textFont(myFont);
			textSize(20 * canvasScale);
			textAlign(CENTER, CENTER);
			fill(78, 30, 51, alpha * 255);
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

	// Draw rain particles before the dark overlay (so rain is visible but behind UI)
	if (isRaining) drawRainParticles();

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

	// Fade to black before entering cutscene mode
	if (fadingToCutscene) {
		const elapsed = currentTime - fadeToCutsceneStartTime;
		const progress = Math.min(elapsed / fadeToCutsceneDuration, 1);
		push();
		fill(0, 0, 0, progress * 255);
		noStroke();
		rect(0, 0, width, height);
		pop();
		if (progress >= 1) {
			fadingToCutscene = false;
			returnToGardenAfterVN = false;
			currentScene = fadeToCutsceneTargetScene;
			gameMode = 'cutscene';
			vnEntryTime = millis();
			// Start pre-dialogue intro sequence if this scene has one
			if (scenes[currentScene] && scenes[currentScene].cutsceneIntroSequence) {
				cutsceneIntroSequence = scenes[currentScene].cutsceneIntroSequence;
				cutsceneIntroStep = 0;
				cutsceneIntroSequence[0].reset();
				// Don't call resetTypewriter yet - it fires when the sequence finishes
			} else {
				cutsceneIntroSequence = [];
				cutsceneIntroStep = -1;
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

	// Fade in from black at the very start of a cutscene
	const fadeInDuration = 600;
	const fadeElapsed = currentTime - vnEntryTime;
	const fadeInAlpha = fadeElapsed < fadeInDuration
		? (1 - fadeElapsed / fadeInDuration) * 255
		: 0;

	// ── PRE-DIALOGUE INTRO SEQUENCE ──────────────────────────────────────────
	if (cutsceneIntroStep >= 0 && cutsceneIntroSequence.length > 0) {
		const activeSprite = cutsceneIntroSequence[cutsceneIntroStep];
		let frame = activeSprite.getCurrentFrame();
		if (frame) image(frame, 0, 0, width, height);

		// Advance when the current one-shot finishes
		if (activeSprite.hasFinished) {
			cutsceneIntroStep++;
			if (cutsceneIntroStep >= cutsceneIntroSequence.length) {
				// Sequence done — start looping dialogue sprite and typewriter
				cutsceneIntroStep = -1;
				cutsceneIntroSequence = [];
				if (scenes[currentScene].cutsceneSprite) {
					scenes[currentScene].cutsceneSprite.reset();
				}
				resetTypewriter();
			} else {
				cutsceneIntroSequence[cutsceneIntroStep].reset();
			}
		}

		// Draw fade-in overlay on top of intro frames
		if (fadeInAlpha > 0) {
			push();
			fill(0, 0, 0, fadeInAlpha);
			noStroke();
			rect(0, 0, width, height);
			pop();
		}
		return; // No textbox during intro sequence
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
	let textboxImg = gardenAssets.textbox;
	let textboxWidth = textboxImg.width * canvasScale;
	let textboxHeight = textboxImg.height * canvasScale;
	let dialogX = (width - textboxWidth) / 2;
	let dialogY = height - textboxHeight - 20 * canvasScale;

	let textboxAlpha = fadeElapsed < fadeInDuration
		? (fadeElapsed / fadeInDuration) * 255
		: 255;

	push();
	tint(255, textboxAlpha);
	image(textboxImg, dialogX, dialogY, textboxWidth, textboxHeight);
	pop();

	const dialogWidth = textboxWidth;

	// Typewriter logic
	typewriterJustFinishedThisFrame = false;
	let rawElapsedTime = currentTime - typewriterStartTime;
	let charsToShow = Math.floor(rawElapsedTime / typewriterSpeed);

	let dialogueText = "";
	if (cachedDialogueOnly && cachedDialogueOnly.length > 0 && charsToShow >= cachedDialogueOnly.length) {
		if (!typewriterFinished) {
			typewriterJustFinishedThisFrame = true;
		}
		typewriterFinished = true;
		if (lastCachedTypewriterChars !== cachedDialogueOnly.length) {
			let fullText = cachedDialogueOnly;
			if (cachedChoiceLines.length > 0) {
				fullText += '\n' + cachedChoiceLines.join('\n');
			} else if (!scenes[currentScene].keys || scenes[currentScene].keys.length === 0) {
				fullText += '\n> Continue';
			}
			cachedFullDialogueWithChoices = fullText;
			lastCachedTypewriterChars = cachedDialogueOnly.length;
		}
		dialogueText = cachedFullDialogueWithChoices;
	} else {
		dialogueText = cachedDialogueOnly.substring(0, charsToShow);
	}

	if (typewriterFinished) {
		updateChoiceAreasWithYPositions(dialogX, dialogY, dialogWidth, textboxHeight, dialogueText);
	} else {
		buttons = [];
	}

	// Draw text
	fill(74, 42, 60);
	textSize(20);
	textAlign(LEFT, TOP);
	textFont(myFont);
	textWrap(WORD);

	push();
	let lines = dialogueText.split('\n');
	let yPos = dialogY + (30 * canvasScale);
	const lineHeight = 28;

	let hoveredButtonTexts = new Set();
	for (let button of buttons) {
		if (button.isHovered) hoveredButtonTexts.add(button.text);
	}
	for (let line of lines) {
		fill(hoveredButtonTexts.has(line) ? color(40, 148, 102) : color(74, 42, 60));
		text(line, dialogX + 30, yPos, dialogWidth - 60);
		yPos += lineHeight;
	}
	pop();

	cursor('default');

	// Fade-in overlay (from black at cutscene start)
	if (fadeInAlpha > 0) {
		push();
		fill(0, 0, 0, fadeInAlpha);
		noStroke();
		rect(0, 0, width, height);
		pop();
	}

	// Cutscene 6 ends — fade to black then enter ending VN with rain
	if (fadingCutsceneToVN) {
		const elapsed = currentTime - fadeCutsceneToVNStartTime;
		const progress = Math.min(elapsed / fadeCutsceneToVNDuration, 1);
		push();
		fill(0, 0, 0, progress * 255);
		noStroke();
		rect(0, 0, width, height);
		pop();
		if (progress >= 1) {
			fadingCutsceneToVN = false;
			isRaining = true;
			initRainParticles();
			currentScene = fadeCutsceneToVNTargetScene;
			gameMode = 'vn';
			returnToGardenAfterVN = false;
			currentSection = 2;
			gardenState.backgroundImage = gardenAssets.section2RainBackground || gardenAssets.section2Background;
			// Pre-expire Tony fade so she is invisible immediately (she wasn't in the cutscene)
			vnEntryTime = millis() - (vnEntryDuration + 100);
			resetTypewriter();
			lastClickTime = 0;
			lastProcessedScene = -1;
		}
	}

	// Cutscene end — fade to black and hold
	if (cutsceneEndFading) {
		const elapsed = currentTime - cutsceneEndFadeStartTime;
		const progress = Math.min(elapsed / cutsceneEndFadeDuration, 1);
		push();
		fill(0, 0, 0, progress * 255);
		noStroke();
		rect(0, 0, width, height);
		pop();
	}

	// Cutscene-to-cutscene transition — fade to black then load next cutscene
	if (fadingToCutscene) {
		const elapsed = currentTime - fadeToCutsceneStartTime;
		const progress = Math.min(elapsed / fadeToCutsceneDuration, 1);
		push();
		fill(0, 0, 0, progress * 255);
		noStroke();
		rect(0, 0, width, height);
		pop();
		if (progress >= 1) {
			fadingToCutscene = false;
			currentScene = fadeToCutsceneTargetScene;
			vnEntryTime = millis();
			if (scenes[currentScene] && scenes[currentScene].cutsceneIntroSequence) {
				cutsceneIntroSequence = scenes[currentScene].cutsceneIntroSequence;
				cutsceneIntroStep = 0;
				cutsceneIntroSequence[0].reset();
			} else {
				cutsceneIntroSequence = [];
				cutsceneIntroStep = -1;
				resetTypewriter();
			}
		}
	}
}

// ========================
// STORY ENDING SCREEN
// ========================

function drawStoryEndingMode(currentTime) {
	// Draw garden background (section 2, rain variant) with all plants visible
	if (gardenState.backgroundImage) {
		image(gardenState.backgroundImage, 0, 0, width, height);
	}

	// Draw section 2 watered plants (where the story ends)
	for (let plant of gardenState.section2Plants) {
		if (plant.wateredSprite) {
			let frame = plant.wateredSprite.getCurrentFrame();
			if (frame) image(frame, plant.x, plant.y, plant.width, plant.height);
		}
	}

	// Draw shell (normal sprite — game is over, ready state no longer applies)
	if (gardenState.shell.sprite) {
		let shellFrame = gardenState.shell.sprite.getCurrentFrame();
		if (shellFrame) image(shellFrame, gardenState.shell.x, gardenState.shell.y, gardenState.shell.width, gardenState.shell.height);
	}

	// Draw rain
	if (isRaining) drawRainParticles();

	// Fade to title when triggered
	if (fadingToTitleFromEnding) {
		const elapsed = currentTime - fadeToTitleFromEndingStartTime;
		const progress = Math.min(elapsed / fadeToTitleFromEndingDuration, 1);
		push();
		fill(0, 0, 0, progress * 255);
		noStroke();
		rect(0, 0, width, height);
		pop();
		if (progress >= 1) {
			fadingToTitleFromEnding = false;
			resetGame();
			gameMode = 'title';
		}
		return;
	}

	// Semi-transparent dark overlay
	push();
	fill(0, 0, 0, 90);
	noStroke();
	rect(0, 0, width, height);
	pop();

	// Buttons using otherBoxImage (254×85 natural size)
	const buttonW = 254 * canvasScale;
	const buttonH = 85 * canvasScale;
	const buttonY = height * 0.55;
	const gap = 40 * canvasScale;
	const leftBtnX = (width / 2) - buttonW - gap / 2;
	const rightBtnX = (width / 2) + gap / 2;

	const stayHovered = mouseX > leftBtnX && mouseX < leftBtnX + buttonW &&
		mouseY > buttonY && mouseY < buttonY + buttonH;
	const returnHovered = mouseX > rightBtnX && mouseX < rightBtnX + buttonW &&
		mouseY > buttonY && mouseY < buttonY + buttonH;

	textFont(myFont);
	textSize(24);
	textAlign(CENTER, CENTER);

	// "Stay in garden" button
	push();
	translate(0, stayHovered ? -12 : 0);
	if (otherBoxImage) image(otherBoxImage, leftBtnX, buttonY, buttonW, buttonH);
	fill(78, 30, 51);
	noStroke();
	text("STAY IN GARDEN", leftBtnX + buttonW / 2, buttonY + buttonH / 2 - 4);
	pop();

	// "Return to title" button
	push();
	translate(0, returnHovered ? -12 : 0);
	if (otherBoxImage) image(otherBoxImage, rightBtnX, buttonY, buttonW, buttonH);
	fill(78, 30, 51);
	noStroke();
	text("RETURN TO TITLE", rightBtnX + buttonW / 2, buttonY + buttonH / 2 - 4);
	pop();

	if (stayHovered || returnHovered) cursor(HAND);
	else cursor('default');
}

function drawESCOverlay() {
	// Same layout as the story ending screen buttons
	push();
	fill(0, 0, 0, 90);
	noStroke();
	rect(0, 0, width, height);
	pop();

	const buttonW = 254 * canvasScale;
	const buttonH = 85 * canvasScale;
	const buttonY = height * 0.55;
	const gap = 40 * canvasScale;
	const leftBtnX = (width / 2) - buttonW - gap / 2;
	const rightBtnX = (width / 2) + gap / 2;

	const stayHovered = mouseX > leftBtnX && mouseX < leftBtnX + buttonW &&
		mouseY > buttonY && mouseY < buttonY + buttonH;
	const returnHovered = mouseX > rightBtnX && mouseX < rightBtnX + buttonW &&
		mouseY > buttonY && mouseY < buttonY + buttonH;

	textFont(myFont);
	textSize(24);
	textAlign(CENTER, CENTER);

	push();
	translate(0, stayHovered ? -12 : 0);
	if (otherBoxImage) image(otherBoxImage, leftBtnX, buttonY, buttonW, buttonH);
	fill(78, 30, 51);
	noStroke();
	text("STAY IN GARDEN", leftBtnX + buttonW / 2, buttonY + buttonH / 2 - 4);
	pop();

	push();
	translate(0, returnHovered ? -12 : 0);
	if (otherBoxImage) image(otherBoxImage, rightBtnX, buttonY, buttonW, buttonH);
	fill(78, 30, 51);
	noStroke();
	text("RETURN TO TITLE", rightBtnX + buttonW / 2, buttonY + buttonH / 2 - 4);
	pop();

	if (stayHovered || returnHovered) cursor(HAND);
	else cursor('default');
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

// ========================
// INPUT HANDLING
// ========================

function keyPressed() {
	userStartAudio();

	// Debug shortcut: backtick jumps to cutscene 1 from any screen
	if (DEBUG_CUTSCENE && key === '`') {
		playerName = playerName || "Debug";
		fadingToCutscene = false;
		cutsceneEndFading = false;
		fadingToTitleAfterShell = false;
		isRaining = false;
		showESCOverlay = false;
		buttons = [];
		currentScene = 1100;
		gameMode = 'cutscene';
		vnEntryTime = millis();
		resetTypewriter();
		return false;
	}

	// Debug shortcut: ] jumps to ending VN (scene 2000) with rain from any screen
	if (DEBUG_ENDING && key === ']') {
		playerName = playerName || "Debug";
		fadingCutsceneToVN = false;
		fadingToTitleFromEnding = false;
		showESCOverlay = false;
		buttons = [];
		for (let plant of [...gardenState.section1Plants, ...gardenState.section2Plants, ...gardenState.section3Plants]) {
			plant.watered = true;
		}
		gardenState.emptyPlot.visited = true;
		isRaining = true;
		initRainParticles();
		currentScene = 2000;
		gameMode = 'vn';
		currentSection = 2;
		gardenState.backgroundImage = gardenAssets.section2Background;
		vnEntryTime = millis() - (vnEntryDuration + 100);
		resetTypewriter();
		return false;
	}

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

	// Story ending screen - block all key input while showing
	if (gameMode === 'storyEnding') {
		return false;
	}

	// Rain ending - ESC toggles the "Return to title?" overlay
	if (gameMode === 'rain_ending') {
		if (keyCode === ESCAPE) {
			showESCOverlay = !showESCOverlay;
		}
		return false;
	}

	// VN / cutscene mode - input handling
	if (gameMode === 'vn' || gameMode === 'cutscene') {
		// Block all input while the pre-dialogue intro sequence is playing
		if (cutsceneIntroStep >= 0) return false;
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

	// VN / cutscene mode - click on choices or advance dialogue
	if (gameMode === 'vn' || gameMode === 'cutscene') {
		// Block all input while the pre-dialogue intro sequence is playing
		if (cutsceneIntroStep >= 0) return false;
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

	// Story ending screen - two-button end screen
	if (gameMode === 'storyEnding') {
		if (fadingToTitleFromEnding) return false;

		const buttonW = 280 * canvasScale;
		const buttonH = 65 * canvasScale;
		const buttonY = height * 0.55;
		const gap = 40 * canvasScale;
		const leftBtnX = (width / 2) - buttonW - gap / 2;
		const rightBtnX = (width / 2) + gap / 2;

		// "Stay in the garden"
		if (mouseX > leftBtnX && mouseX < leftBtnX + buttonW &&
			mouseY > buttonY && mouseY < buttonY + buttonH) {
			gameMode = 'rain_ending';
			currentSection = 2;
			return false;
		}

		// "Return to title"
		if (mouseX > rightBtnX && mouseX < rightBtnX + buttonW &&
			mouseY > buttonY && mouseY < buttonY + buttonH) {
			fadingToTitleFromEnding = true;
			fadeToTitleFromEndingStartTime = millis();
			return false;
		}

		return false;
	}

	// Rain ending - allow section navigation; ESC overlay button clicks
	if (gameMode === 'rain_ending') {
		if (showESCOverlay) {
			// Handle Stay/Return buttons (same layout as story ending screen)
			const buttonW = 254 * canvasScale;
			const buttonH = 85 * canvasScale;
			const buttonY = height * 0.55;
			const gap = 40 * canvasScale;
			const leftBtnX = (width / 2) - buttonW - gap / 2;
			const rightBtnX = (width / 2) + gap / 2;

			if (mouseX > leftBtnX && mouseX < leftBtnX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
				// Stay in garden - close overlay
				showESCOverlay = false;
			} else if (mouseX > rightBtnX && mouseX < rightBtnX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
				// Return to title - fade to title
				showESCOverlay = false;
				fadingToTitleFromEnding = true;
				fadeToTitleFromEndingStartTime = millis();
			}
			return false;
		}

		// Plant clicks - show watered flavor text
		let rainSectionPlants = getPlantsForSection(currentSection);
		for (let plant of rainSectionPlants) {
			if (mouseX > plant.x && mouseX < plant.x + plant.width &&
				mouseY > plant.y && mouseY < plant.y + plant.height) {
				const wateredFlavor = {
					thyme:      "The thyme smells wonderful.",
					rosemary:   "The rosemary is looking good.",
					sunflowers: "They're soaking up the sun.",
					tulips:     "All taken care of.",
					wildpatch:  "Doing its own thing, as usual.",
					tomatoes:   "Getting closer to ready.",
					seedling:   "Hanging in there."
				};
				flavorText = wateredFlavor[plant.id] || "The rain feels nice.";
				flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
				return false;
			}
		}

		// Shell click - flavor text
		if (currentSection === 2) {
			const area = gardenState.shell;
			if (mouseX > area.x && mouseX < area.x + area.width &&
				mouseY > area.y && mouseY < area.y + area.height) {
				flavorText = "Still here.";
				flavorTextTimer = millis() + FLAVOR_TEXT_DURATION;
				return false;
			}
		}

		// Allow section navigation via arrows
		const arrowSize = 40 * 1.5;
		const arrowBaseY = 20;
		const bobAmount = 1;

		if (currentSection > 1) {
			const arrowLeftX = 20;
			if (mouseX > arrowLeftX && mouseX < arrowLeftX + arrowSize &&
				mouseY > arrowBaseY - bobAmount && mouseY < arrowBaseY + arrowSize + bobAmount) {
				startSectionTransition(currentSection - 1);
				return false;
			}
		}
		if (currentSection < 3) {
			const arrowRightX = width - arrowSize - 20;
			if (mouseX > arrowRightX && mouseX < arrowRightX + arrowSize &&
				mouseY > arrowBaseY - bobAmount && mouseY < arrowBaseY + arrowSize + bobAmount) {
				startSectionTransition(currentSection + 1);
				return false;
			}
		}

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

	// In rain_ending, hovering any plant or shell shows the question cursor
	if (gameMode === 'rain_ending') {
		if (showESCOverlay) {
			isHoveringInteractiveArea = false;
			isCurrentlyHoveringPlant = false;
			return false;
		}
		isHoveringInteractiveArea = false;
		isCurrentlyHoveringPlant = false;
		for (let plant of frameCachedPlants) {
			if (mouseX > plant.x && mouseX < plant.x + plant.width &&
				mouseY > plant.y && mouseY < plant.y + plant.height) {
				isHoveringInteractiveArea = true;
				return false;
			}
		}
		if (currentSection === 2) {
			const area = gardenState.shell;
			if (mouseX > area.x && mouseX < area.x + area.width &&
				mouseY > area.y && mouseY < area.y + area.height) {
				isHoveringInteractiveArea = true;
				return false;
			}
		}
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

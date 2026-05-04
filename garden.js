// ========================
// GARDEN MODE
// ========================

function initializeGarden() {
	// Initialize all plant sprites - dry versions
	for (let plant of gardenState.section1Plants) {
		plant.drySprite = new Sprite(sprites[plant.id + 'DryFrames'], 3, true);
		plant.wateredSprite = new Sprite(sprites[plant.id + 'WateredFrames'], 3, true);
	}
	for (let plant of gardenState.section2Plants) {
		plant.drySprite = new Sprite(sprites[plant.id + 'DryFrames'], 3, true);
		plant.wateredSprite = new Sprite(sprites[plant.id + 'WateredFrames'], 3, true);
	}
	for (let plant of gardenState.section3Plants) {
		plant.drySprite = new Sprite(sprites[plant.id + 'DryFrames'], 3, true);
		plant.wateredSprite = new Sprite(sprites[plant.id + 'WateredFrames'], 3, true);
	}

	// Initialize interactive sprites
	gardenState.emptyPlot.sprite = new Sprite(sprites.emptyPlotFrames, 3, true);
	gardenState.shell.sprite = new Sprite(sprites.shellFrames, 3, true);
	gardenState.shell.readySprite = new Sprite(sprites.shellReadyFrames, 3, true);

	// Initialize Tony overworld sprites
	gardenState.tonyStartSprite = new Sprite(sprites.tonyStartFrames, 3, true);
	gardenState.tonySurprisedSprite = new Sprite(sprites.tonySurprisedFrames, 6, false);
	gardenState.tonyStartIdleSprite = new Sprite(sprites.tonyStartIdleFrames, 3, true);

	// Tony garden sprites (idle + action)
	gardenState.tonyIdleSprite = new Sprite(sprites.tonyIdleFrames, 3, true);
	gardenState.tonyActionSprite = new Sprite(sprites.tonyActionFrames, 3, false);
	gardenState.tonyActionIdleSprite = new Sprite(sprites.tonyActionIdleFrames, 3, true);

	// Set initial state
	gardenState.tonyState.currentSprite = gardenState.tonyIdleSprite;
	gardenState.backgroundImage = gardenAssets.section1Background;

	// Initialize cursor sprites
	cursorSprite = new Sprite(sprites.cursorFrames, 3, true);
	cursorQuestionSprite = new Sprite(sprites.cursorQuestionFrames, 3, true);
}

function drawGardenMode(currentTime) {
	// Draw appropriate background
	if (currentSection === 1) {
		image(gardenAssets.section1Background, 0, 0, width, height);
	} else if (currentSection === 2) {
		image(gardenAssets.section2Background, 0, 0, width, height);
	} else if (currentSection === 3) {
		image(gardenAssets.section3Background, 0, 0, width, height);
	}

	// Update and draw all plants with proper animation
	let currentSectionPlants = getPlantsForSection(currentSection);
	for (let plant of currentSectionPlants) {
		plant.drySprite.update();
		plant.wateredSprite.update();

		let frame = plant.watered ? plant.wateredSprite.getCurrentFrame() : plant.drySprite.getCurrentFrame();
		if (frame) {
			image(frame, plant.x, plant.y, plant.width, plant.height);
		}
	}

	// Draw interactive items
	if (currentSection === 3 && gardenState.emptyPlot.sprite) {
		gardenState.emptyPlot.sprite.update();
		let frame = gardenState.emptyPlot.sprite.getCurrentFrame();
		if (frame) {
			image(frame, gardenState.emptyPlot.x, gardenState.emptyPlot.y, gardenState.emptyPlot.width, gardenState.emptyPlot.height);
		}
	}

	if (currentSection === 2) {
		const allPlantsWatered = checkAllPlantsWatered();
		let shellSprite = allPlantsWatered ? gardenState.shell.readySprite : gardenState.shell.sprite;
		if (shellSprite) {
			shellSprite.update();
			let frame = shellSprite.getCurrentFrame();
			if (frame) {
				image(frame, gardenState.shell.x, gardenState.shell.y, gardenState.shell.width, gardenState.shell.height);
			}
		}
	}

	// Draw Tony's overworld sprite
	drawTonyOverworld(currentTime);

	// Draw navigation arrows
	drawNavigationArrows(currentTime);

	// Draw custom cursor
	updateAndDrawCursor();

	// Draw section transition overlay
	if (isTransitioningSection) {
		const elapsed = currentTime - sectionTransitionTime;
		const progress = Math.min(elapsed / sectionTransitionDuration, 1);
		const fadeAlpha = progress < 0.5 ?
			(progress * 2) * 255 :
			((1 - progress) * 2) * 255;

		push();
		fill(0, 0, 0, fadeAlpha);
		rect(0, 0, width, height);
		pop();

		if (progress >= 0.5 && currentSection !== nextSectionTarget) {
			currentSection = nextSectionTarget;
		}

		if (progress >= 1) {
			isTransitioningSection = false;
		}
	}
}

function drawTonyOverworld(currentTime) {
	if ((gameMode === 'garden' || gameMode === 'intro' || gameMode === 'transitioning')) {
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

		// Select sprite based on mode
		let currentSprite;
		if (gameMode === 'intro') {
			if (introPhase === 'none' || introPhase === 'tony_start') {
				currentSprite = gardenState.tonyStartSprite;
			} else if (introPhase === 'tony_surprised') {
				currentSprite = gardenState.tonySurprisedSprite;
			} else if (introPhase === 'tony_start_idle') {
				currentSprite = gardenState.tonyStartIdleSprite;
			}
		} else {
			currentSprite = gardenState.tonyState.currentSprite;
		}

		if (currentSprite) {
			currentSprite.update();
			let tonyFrame = currentSprite.getCurrentFrame();
			if (tonyFrame) {
				const tonyWidth = tonyFrame.width * tonyScale * canvasScale;
				const tonyHeight = tonyFrame.height * tonyScale * canvasScale;
				let baselineHeight = gardenState.tonyStartSprite ?
					gardenState.tonyStartSprite.getCurrentFrame().height * tonyScale * canvasScale :
					tonyHeight;
				const adjustedTonyY = tonyY + (baselineHeight - tonyHeight);

				push();
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
	}
}

function drawNavigationArrows(currentTime) {
	const arrowSize = 40 * 1.5;
	const arrowBaseY = 20;
	const bobY = arrowBaseY + Math.sin(currentTime * 0.005) * 1;

	let isHovered = false;

	// Left arrow
	if ((gameMode === 'garden' || gameMode === 'intro') && currentSection > 1 && gardenAssets.arrowLeft) {
		const arrowLeftX = 20;
		let hovered = mouseX > arrowLeftX && mouseX < arrowLeftX + arrowSize &&
		              mouseY > arrowBaseY - 1 && mouseY < arrowBaseY + arrowSize + 1;

		push();
		tint(255, hovered ? 255 : 180);
		image(gardenAssets.arrowLeft, arrowLeftX, bobY, arrowSize, arrowSize);
		pop();

		if (hovered) {
			cursor(HAND);
			isHovered = true;
		}
	}

	// Right arrow
	if ((gameMode === 'garden' || gameMode === 'intro') && currentSection < 3 && gardenAssets.arrowRight) {
		const arrowRightX = width - arrowSize - 20;
		let hovered = mouseX > arrowRightX && mouseX < arrowRightX + arrowSize &&
		              mouseY > arrowBaseY - 1 && mouseY < arrowBaseY + arrowSize + 1;

		push();
		tint(255, hovered ? 255 : 180);
		image(gardenAssets.arrowRight, arrowRightX, bobY, arrowSize, arrowSize);
		pop();

		if (hovered) {
			cursor(HAND);
			isHovered = true;
		}
	}

	if (!isHovered) {
		cursor('default');
	}
}

function updateAndDrawCursor() {
	if (isCurrentlyHoveringPlant && cursorSprite) {
		cursor('none');
		cursorSprite.update();
		let frame = cursorSprite.getCurrentFrame();
		if (frame) {
			push();
			imageMode(CENTER);
			image(frame, mouseX + cursorOffsetX, mouseY + cursorOffsetY, cursorWidth, cursorHeight);
			pop();
		}
	} else if (isHoveringInteractiveArea && cursorQuestionSprite) {
		cursor('none');
		cursorQuestionSprite.update();
		let frame = cursorQuestionSprite.getCurrentFrame();
		if (frame) {
			push();
			imageMode(CENTER);
			image(frame, mouseX + cursorOffsetX, mouseY + cursorOffsetY, cursorWidth, cursorHeight);
			pop();
		}
	}
}

function waterPlant(plantId) {
	// Find and water the plant
	for (let plant of getPlantsForSection(currentSection)) {
		if (plant.id === plantId) {
			plant.watered = true;
			break;
		}
	}
}

function handlePlantClick(plantId) {
	// Check if it's the shell
	if (plantId === 'shell') {
		returnToGardenAfterVN = true;
		triggeringPlantId = 'shell';
		gameMode = 'vn';
		currentScene = checkAllPlantsWatered() && gardenState.shell.visited ? 800 : 700;
		gardenState.shell.visited = true;
		vnEntryTime = millis();
		return;
	}

	// Check if it's the empty plot
	if (plantId === 'emptyPlot') {
		returnToGardenAfterVN = true;
		triggeringPlantId = 'emptyPlot';
		gameMode = 'vn';
		currentScene = 600;
		gardenState.emptyPlot.visited = true;
		vnEntryTime = millis();
		return;
	}

	// Check if it's a regular plant
	let foundPlant = null;
	for (let plant of getPlantsForSection(currentSection)) {
		if (plant.id === plantId && !plant.watered) {
			foundPlant = plant;
			break;
		}
	}

	if (foundPlant) {
		waterPlant(plantId);
	} else {
		// Plant is already watered - trigger conversation
		returnToGardenAfterVN = true;
		triggeringPlantId = plantId;
		gameMode = 'vn';

		// Determine scene based on plant ID
		const sceneMap = {
			'thyme': 0, 'rosemary': 0,
			'sunflowers': 100, 'tulips': 100,
			'wildpatch': 200,
			'tomatoes': 400,
			'seedling': 500
		};

		currentScene = sceneMap[plantId] || 0;
		vnEntryTime = millis();
	}
}

function checkIfHoveringPlant() {
	isCurrentlyHoveringPlant = false;
	isHoveringInteractiveArea = false;

	let currentSectionPlants = getPlantsForSection(currentSection);

	// Check plants
	for (let plant of currentSectionPlants) {
		if (mouseX > plant.x && mouseX < plant.x + plant.width &&
		    mouseY > plant.y && mouseY < plant.y + plant.height) {
			isCurrentlyHoveringPlant = true;
			return;
		}
	}

	// Check empty plot
	if (currentSection === 3) {
		if (mouseX > gardenState.emptyPlot.x && mouseX < gardenState.emptyPlot.x + gardenState.emptyPlot.width &&
		    mouseY > gardenState.emptyPlot.y && mouseY < gardenState.emptyPlot.y + gardenState.emptyPlot.height) {
			isHoveringInteractiveArea = true;
			return;
		}
	}

	// Check shell
	if (currentSection === 2) {
		if (mouseX > gardenState.shell.x && mouseX < gardenState.shell.x + gardenState.shell.width &&
		    mouseY > gardenState.shell.y && mouseY < gardenState.shell.y + gardenState.shell.height) {
			isHoveringInteractiveArea = true;
			return;
		}
	}
}

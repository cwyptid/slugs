// ========================
// SCENE DATA (VN MODE)
// ========================

let lastProcessedScene = -1; // Track to prevent processing same scene twice

function setupScenes() {
	// ===== OPENING SEQUENCE (SCENES 1000-1099) =====

	// Scene 1000: Tony's opening line
	scenes[1000] = {
		text: "Oh! Oh wow—hi!",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [1001]
	};

	// Scene 1001: Tony recognizes player + First choice point combined
	scenes[1001] = {
		text: "[PLAYER_NAME]? Is that you?\n[1] Slime Tony?!\n[2] It's been a while!",
		image: assets.smiling_waving,
		keys: ["1", "2"],
		nextPages: [1002, 1009]
	};

	// ===== BRANCH 1: "Tony?!" =====
	scenes[1002] = {
		text: "Yeah! It's me. I know, I probably look different.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [1003]
	};

	// ===== BRANCH 2: "It's been a while!" =====
	scenes[1009] = {
		text: "It really has. Wow. I didn't think I'd see you again.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [1003]
	};

	// ===== CONVERGE: Both branches lead here + Second choice point combined =====
	scenes[1003] = {
		text: "This is such a nice surprise.\n[1] You do look... different.\n[2] What are you doing out here?",
		image: assets.smiling_waving,
		keys: ["1", "2"],
		nextPages: [1004, 1010]
	};

	// ===== BRANCH A: "You look different" =====
	scenes[1004] = {
		text: "Yeah, I... a lot has changed. I'm not really sure where to start.\n[1] Take your time.\n[2] We've got time.",
		image: assets.smiling_waving,
		keys: ["1", "2"],
		nextPages: [1011, 1011]
	};

	// ===== BRANCH B: "What are you doing out here?" =====
	scenes[1010] = {
		text: "I've been gardening! Started a few months ago.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [1010.5]
	};

	scenes["1010.5"] = {
		text: "It's kind of a long story how I got into it.\n[1] I'd love to hear it.\n[2] Tell me about it?",
		image: assets.explaining,
		keys: ["1", "2"],
		nextPages: [1011, 1011]
	};

	// ===== BRANCHES A & B CONVERGE HERE + FINAL CHOICE =====
	scenes[1011] = {
		text: "Actually... would you want to help me water? We could catch up while we work.\n[1] Sure!\n[2] I'd like that.",
		image: assets.smiling_waving,
		keys: ["1", "2"],
		nextPages: [1050, 1060]
	};

	// ===== BRANCH X: "Sure!" =====
	scenes[1050] = {
		text: "Great! Just click on any plants that look thirsty.",
		image: assets.explaining,
		keys: [],
		nextPages: [1070]
	};

	// ===== BRANCH Y: "I'd like that" =====
	scenes[1060] = {
		text: "Me too. It's nice to have company.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [1060.5]
	};

	scenes["1060.5"] = {
		text: "The watering can is right there—just click on the plants.",
		image: assets.explaining,
		keys: [],
		nextPages: [1070]
	};

	// ===== CLOSING SCENE =====
	scenes[1070] = {
		text: "And [PLAYER_NAME]? Thanks for being here.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [],
		isEndingScene: true
	};

	// ===== HERB CONVERSATION =====
	// Scene 0: Opening
	scenes[0] = {
		text: "Ah, the herbs. These are pretty hardy.\n[1] What kind are they?\n[2] They smell amazing.\n[3] Do you cook with them?",
		image: assets.smiling_waving,
		keys: ["1", "2", "3"],
		nextPages: [10, 20, 30]
	};

	scenes[10] = {text: "This is thyme, and that's rosemary over there.", image: assets.explaining, keys: [], nextPages: [11]};
	scenes[11] = {text: "I didn't know anything about herbs when I started. Had to look everything up.\n[1] How did you learn?\n[2] That's cool that you taught yourself.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [12, 15]};
	scenes[12] = {text: "Books, mostly. And a lot of trial and error.", image: assets.smiling_waving, keys: [], nextPages: [13]};
	scenes[13] = {text: "Killed a few plants before I figured it out.", image: assets.smiling_waving, keys: [], nextPages: [14]};
	scenes[14] = {text: "But that's okay. Failure's part of learning.", image: assets.smiling_waving, keys: [], nextPages: [50]};
	scenes[15] = {text: "Had to. Didn't really know anyone here to ask.", image: assets.smiling_waving, keys: [], nextPages: [16]};
	scenes[16] = {text: "It was lonely at first, but... also kind of freeing?", image: assets.smiling_waving, keys: [], nextPages: [17]};
	scenes[17] = {text: "Getting to figure things out on my own terms.", image: assets.smiling_waving, keys: [], nextPages: [50]};

	// ===== BRANCH 1B: "They smell amazing" =====
	scenes[20] = {text: "Right? That's my favorite thing about them.", image: assets.smiling_waving, keys: [], nextPages: [21]};
	scenes[21] = {text: "When it's hot out, you can smell them from across the garden.\n[1] It's really peaceful here.\n[2] Must be nice to work with.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [22, 25]};
	scenes[22] = {text: "It is. That's why I like it.", image: assets.smiling_waving, keys: [], nextPages: [23]};
	scenes[23] = {text: "The world is loud and scary sometimes.", image: assets.smiling_waving, keys: [], nextPages: [24]};
	scenes[24] = {text: "But here? It's just... quiet. Green. Growing.", image: assets.smiling_waving, keys: [], nextPages: [50]};
	scenes[25] = {text: "Yeah. There's something grounding about it.", image: assets.smiling_waving, keys: [], nextPages: [26]};
	scenes[26] = {text: "Getting your hands dirty. Smelling the earth.", image: assets.smiling_waving, keys: [], nextPages: [27]};
	scenes[27] = {text: "Makes me feel present, you know?", image: assets.smiling_waving, keys: [], nextPages: [50]};

	// ===== BRANCH 1C: "cook with them" =====
	scenes[30] = {text: "Sometimes! Not as much as I probably should.", image: assets.smiling_waving, keys: [], nextPages: [31]};
	scenes[31] = {text: "Mostly I just like having them around.\n[1] Just for the vibes?\n[2] That's fair.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [32, 35]};
	scenes[32] = {text: "Exactly! They don't have to be useful.", image: assets.smiling_waving, keys: [], nextPages: [33]};
	scenes[33] = {text: "They can just exist and smell nice.", image: assets.smiling_waving, keys: [], nextPages: [50]};
	scenes[35] = {text: "Yeah. Not everything needs a purpose, you know?", image: assets.smiling_waving, keys: [], nextPages: [36]};
	scenes[36] = {text: "They're here. They're growing. That's enough.", image: assets.smiling_waving, keys: [], nextPages: [50]};

	// ===== ENDING (converges from all branches) =====
	scenes[50] = {
		text: "Anyway. Thanks for watering them.",
		image: assets.smiling_waving,
		keys: [],
		nextPages: [],
		isEndingScene: true
	};

	// ===== FLOWERS CONVERSATION =====
	scenes[100] = {text: "These ones are just for looking at.\n[1] They're really pretty.\n[2] What kind are they?\n[3] Why plant flowers?", image: assets.smiling_waving, keys: ["1", "2", "3"], nextPages: [110, 120, 130]};
	scenes[110] = {text: "Thanks. I think so too.", image: assets.smiling_waving, keys: [], nextPages: [111]};
	scenes[111] = {text: "I used to feel guilty about liking pretty things.\n[1] Why guilty?\n[2] You shouldn't feel guilty.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [112, 115]};
	scenes[112] = {text: "I don't know. Like I had to earn it somehow?", image: assets.smiling_waving, keys: [], nextPages: [113]};
	scenes[113] = {text: "Like I couldn't just enjoy beauty for its own sake.", image: assets.smiling_waving, keys: [], nextPages: [114]};
	scenes[114] = {text: "But flowers don't care. They just bloom.", image: assets.smiling_waving, keys: [], nextPages: [150]};
	scenes[115] = {text: "Yeah. I'm allowed to like pretty things.", image: assets.assured, keys: [], nextPages: [116]};
	scenes[116] = {text: "Even if they don't serve a purpose.", image: assets.smiling_waving, keys: [], nextPages: [150]};
	scenes[120] = {text: "Honestly? I'm not sure of all the names.", image: assets.smiling_waving, keys: [], nextPages: [121]};
	scenes[121] = {text: "I just picked ones I thought were pretty when I was at the garden center.\n[1] That's a good way to choose.\n[2] Following your instincts?", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [122, 125]};
	scenes[122] = {text: "I think so too. Not everything needs to be researched and planned.", image: assets.smiling_waving, keys: [], nextPages: [123]};
	scenes[123] = {text: "Sometimes you just... pick what makes you happy.", image: assets.smiling_waving, keys: [], nextPages: [150]};
	scenes[125] = {text: "Yeah. I'm trying to do that more.", image: assets.smiling_waving, keys: [], nextPages: [126]};
	scenes[126] = {text: "Listen to what I actually want instead of what I think I should want.", image: assets.smiling_waving, keys: [], nextPages: [127]};
	scenes[127] = {text: "It's harder than it sounds. But it's worth it.", image: assets.smiling_waving, keys: [], nextPages: [150]};
	scenes[130] = {text: "I wanted something that wasn't about survival.", image: assets.smiling_waving, keys: [], nextPages: [131]};
	scenes[131] = {text: "Something that was just... nice. Just beautiful.\n[1] For yourself?\n[2] You deserve that.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [132, 135]};
	scenes[132] = {text: "Yeah. For me.", image: assets.smiling_waving, keys: [], nextPages: [133]};
	scenes[133] = {text: "Not for anyone else. Not to prove a point.", image: assets.assured, keys: [], nextPages: [134]};
	scenes[134] = {text: "Just because I wanted them.", image: assets.smiling_waving, keys: [], nextPages: [150]};
	scenes[135] = {text: "I'm working on believing that.", image: assets.smiling_waving, keys: [], nextPages: [136]};
	scenes[136] = {text: "That I can have things just because they make me happy.", image: assets.smiling_waving, keys: [], nextPages: [137]};
	scenes[137] = {text: "These flowers help me remember.", image: assets.smiling_waving, keys: [], nextPages: [150]};
	scenes[150] = {text: "They make the garden feel alive.", image: assets.smiling_waving, keys: [], nextPages: [], isEndingScene: true};

	// ===== WILDPATCH CONVERSATION =====
	scenes[200] = {text: "I leave this part alone.\n[1] On purpose?\n[2] It looks nice wild.\n[3] Don't you worry about it?", image: assets.smiling_waving, keys: ["1", "2", "3"], nextPages: [210, 220, 230]};
	scenes[210] = {text: "Yeah. I wanted one part that just... does its own thing.", image: assets.smiling_waving, keys: [], nextPages: [211]};
	scenes[211] = {text: "Not everything needs my intervention.\n[1] That takes discipline.\n[2] Trust in nature.", image: assets.assured, keys: ["1", "2"], nextPages: [212, 215]};
	scenes[212] = {text: "It does, actually! My first instinct is to control everything.", image: assets.smiling_waving, keys: [], nextPages: [213]};
	scenes[213] = {text: "Make it neat. Organized. Safe.", image: assets.smiling_waving, keys: [], nextPages: [214]};
	scenes[214] = {text: "But some things are better wild.", image: assets.smiling_waving, keys: [], nextPages: [300]};
	scenes[215] = {text: "I'm working on that. Trusting that things can be okay without me managing them.", image: assets.smiling_waving, keys: [], nextPages: [216]};
	scenes[216] = {text: "It's hard. But it's also freeing.", image: assets.smiling_waving, keys: [], nextPages: [300]};
	scenes[220] = {text: "I think so too. There's something honest about it.", image: assets.smiling_waving, keys: [], nextPages: [221]};
	scenes[221] = {text: "It's not trying to be anything other than what it is.\n[1] Authenticity is important.\n[2] It doesn't need permission.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [222, 225]};
	scenes[222] = {text: "Yeah. Just... existing. Growing how it wants to grow.", image: assets.smiling_waving, keys: [], nextPages: [223]};
	scenes[223] = {text: "I want that.", image: assets.smiling_waving, keys: [], nextPages: [300]};
	scenes[225] = {text: "Exactly. These plants aren't trying to impress anyone.", image: assets.smiling_waving, keys: [], nextPages: [226]};
	scenes[226] = {text: "They're just alive. Just here. Ain't nothing wrong with that.", image: assets.smiling_waving, keys: [], nextPages: [300]};
	scenes[230] = {text: "Sometimes. But I'm learning that worry doesn't help.", image: assets.smiling_waving, keys: [], nextPages: [231]};
	scenes[231] = {text: "This patch will grow or it won't. My worrying won't change that.\n[1] That takes a lot of letting go.\n[2] Sound's freeing.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [232, 235]};
	scenes[232] = {text: "I want to control outcomes. Keep bad things from happening.", image: assets.smile, keys: [], nextPages: [233]};
	scenes[233] = {text: "But I can't. So I practice letting go here.", image: assets.smile, keys: [], nextPages: [300]};
	scenes[235] = {text: "It is! I don't have to think about this corner at all.", image: assets.smile, keys: [], nextPages: [236]};
	scenes[236] = {text: "No planning, no maintenance schedule, no 'is this optimal?'", image: assets.explaining, keys: [], nextPages: [237]};
	scenes[237] = {text: "It just does its thing.", image: assets.smile, keys: [], nextPages: [300]};
	scenes[300] = {text: "I like having it here. Reminds me to let things be.", image: assets.smiling_waving, keys: [], nextPages: [], isEndingScene: true};

	// ===== TOMATOES CONVERSATION =====
	scenes[400] = {text: "Tomatoes are interesting. They need support.\n[1] The stakes?\n[2] They look heavy.\n[3] How do you know when they're ready?", image: assets.smiling_waving, keys: ["1", "2", "3"], nextPages: [410, 420, 430]};
	scenes[410] = {text: "Yeah. See how they're tied to these wooden stakes?", image: assets.smiling_waving, keys: [], nextPages: [411]};
	scenes[411] = {text: "Without them, the plants would collapse under their own weight.\n[1] That's smart.\n[2] They'd break otherwise?", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [412, 415]};
	scenes[412] = {text: "It's necessary. They're built to climb, to lean.", image: assets.smiling_waving, keys: [], nextPages: [413]};
	scenes[413] = {text: "Needing support isn't a flaw. It's just how they are.", image: assets.smiling_waving, keys: [], nextPages: [450]};
	scenes[415] = {text: "Yeah. The weight of their own fruit would crush the stems.", image: assets.smiling_waving, keys: [], nextPages: [416]};
	scenes[416] = {text: "Without something to lean on, they can't grow fully.", image: assets.smiling_waving, keys: [], nextPages: [450]};
	scenes[420] = {text: "They are. All that fruit weighs them down.", image: assets.smiling_waving, keys: [], nextPages: [421]};
	scenes[421] = {text: "That's why they need the stakes. To hold the weight they can't carry alone.\n[1] Makes sense.\n[2] We all need support sometimes.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [422, 425]};
	scenes[422] = {text: "Yeah. It's just how things work.", image: assets.smiling_waving, keys: [], nextPages: [423]};
	scenes[423] = {text: "Some things need a little extra help. That's okay.", image: assets.smiling_waving, keys: [], nextPages: [450]};
	scenes[425] = {text: "Yeah. We do.", image: assets.smiling_waving, keys: [], nextPages: [426]};
	scenes[426] = {text: "It's only natural, after all.", image: assets.smiling_waving, keys: [], nextPages: [450]};
	scenes[430] = {text: "When they're fully red and a little soft. That's when you pick them.", image: assets.smiling_waving, keys: [], nextPages: [431]};
	scenes[431] = {text: "Before that, they're not quite ready. After that, they start to rot.\n[1] Timing matters.\n[2] Things change anyway.", image: assets.explaining, keys: ["1", "2"], nextPages: [432, 435]};
	scenes[432] = {text: "It does. With plants, with everything.", image: assets.smiling_waving, keys: [], nextPages: [433]};
	scenes[433] = {text: "Sometimes you have to wait. Sometimes you have to act.", image: assets.smiling_waving, keys: [], nextPages: [434]};
	scenes[434] = {text: "Figuring out which is which... that's the hard part.", image: assets.smiling_waving, keys: [], nextPages: [450]};
	scenes[435] = {text: "They do. Whether you're ready or not.", image: assets.smiling_waving, keys: [], nextPages: [436]};
	scenes[436] = {text: "All you can do is pay attention and respond.", image: assets.smiling_waving, keys: [], nextPages: [437]};
	scenes[437] = {text: "That's all any of us can do.", image: assets.smiling_waving, keys: [], nextPages: [450]};
	scenes[450] = {text: "These ones should be ready to harvest soon.", image: assets.smiling_waving, keys: [], nextPages: [], isEndingScene: true};

	// Rest of scenes (500-830.5) set up similarly
	// SEEDLING, INTERACTIVE AREA, SHELL conversations condensed for space
	scenes[500] = {text: "This one's not doing great.\n[1] What's wrong with it?\n[2] Will it make it?\n[3] Why keep trying?", image: assets.smiling_waving, keys: ["1", "2", "3"], nextPages: [510, 520, 530]};
	scenes[510] = {text: "I'm not sure exactly. It sprouted okay, but it's been struggling since.", image: assets.smiling_waving, keys: [], nextPages: [511]};
	scenes[511] = {text: "Could be the soil, the light, disease. Hard to tell.\n[1] Can you fix it?\n[2] That's frustrating.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [512, 514]};
	scenes[512] = {text: "I've been adjusting things. More water, less water. Different location.", image: assets.smiling_waving, keys: [], nextPages: [513]};
	scenes[513] = {text: "Sometimes there's just nothing you can do.", image: assets.smiling_waving, keys: [], nextPages: [550]};
	scenes[514] = {text: "It is. I want to help, but I don't always know how.", image: assets.smiling_waving, keys: [], nextPages: [515]};
	scenes[515] = {text: "All I can do is keep trying. Keep paying attention.", image: assets.smiling_waving, keys: [], nextPages: [516]};
	scenes[516] = {text: "And accept that it might not be enough.", image: assets.smiling_waving, keys: [], nextPages: [550]};
	scenes[520] = {text: "I don't know.", image: assets.smiling_waving, keys: [], nextPages: [521]};
	scenes[521] = {text: "Probably not, if I'm being realistic.\n[1] I'm sorry.\n[2] That's really hard.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [522, 525]};
	scenes[522] = {text: "Thanks. It's okay. Or it will be. Either way.", image: assets.smiling_waving, keys: [], nextPages: [523]};
	scenes[523] = {text: "Not everything makes it. That's just... how it is.", image: assets.smiling_waving, keys: [], nextPages: [524]};
	scenes[524] = {text: "But I have to keep trying.", image: assets.smiling_waving, keys: [], nextPages: [550]};
	scenes[525] = {text: "It is.", image: assets.smiling_waving, keys: [], nextPages: [526]};
	scenes[526] = {text: "Watching something struggle when you can't fix it...", image: assets.smiling_waving, keys: [], nextPages: [527]};
	scenes[527] = {text: "All you can do is keep showing up.", image: assets.smiling_waving, keys: [], nextPages: [550]};
	scenes[530] = {text: "Because... what else can I do?", image: assets.smiling_waving, keys: [], nextPages: [531]};
	scenes[531] = {text: "Give up on it? Let it die without trying?\n[1] That would feel worse.\n[2] You're just… not ready to give up.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [532, 535]};
	scenes[532] = {text: "Exactly. Even if trying doesn't save it, at least I tried.", image: assets.smiling_waving, keys: [], nextPages: [533]};
	scenes[533] = {text: "At least it wasn't alone while it struggled.", image: assets.smiling_waving, keys: [], nextPages: [534]};
	scenes[534] = {text: "I think that matters. Even if it doesn't change the outcome.", image: assets.smiling_waving, keys: [], nextPages: [550]};
	scenes[535] = {text: "Yeah. I'm not.", image: assets.smiling_waving, keys: [], nextPages: [536]};
	scenes[536] = {text: "That's... that's what I'm doing with myself too.", image: assets.smiling_waving, keys: [], nextPages: [537]};
	scenes[537] = {text: "I don't know if I'll make my peace. If I'll ever feel completely okay.", image: assets.smiling_waving, keys: [], nextPages: [538]};
	scenes[538] = {text: "But what else can we do?", image: assets.smiling_waving, keys: [], nextPages: [550]};
	scenes[550] = {text: "Even if it doesn't make it... I'm glad it sprouted at all.", image: assets.smiling_waving, keys: [], nextPages: [], isEndingScene: true};

	// INTERACTIVE AREA & SHELL CONVERSATIONS (highly condensed)
	scenes[600] = {text: "I haven't planted anything here yet.\n[1] What will you plant?\n[2] Saving it for something special?\n[3] Why leave it empty?", image: assets.smiling_waving, keys: ["1", "2", "3"], nextPages: [610, 620, 630]};
	scenes[610] = {text: "I'm not sure yet.", image: assets.smiling_waving, keys: [], nextPages: [611]};
	scenes[611] = {text: "I've been thinking about it, but I don't have an answer.\n[1] Take your time.\n[2] You'll know when you're ready.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [612, 615]};
	scenes[612] = {text: "Thanks. I think I need to.", image: assets.smiling_waving, keys: [], nextPages: [613]};
	scenes[613] = {text: "I spent so long forcing decisions before I was ready.", image: assets.smiling_waving, keys: [], nextPages: [614]};
	scenes[614] = {text: "It's okay to wait. To not know yet.", image: assets.smiling_waving, keys: [], nextPages: [650]};
	scenes[615] = {text: "I think so too. When the right thing comes along, I'll feel it.", image: assets.smiling_waving, keys: [], nextPages: [616]};
	scenes[616] = {text: "Until then, this space can just... be potential.", image: assets.smiling_waving, keys: [], nextPages: [650]};
	scenes[620] = {text: "Maybe. I haven't decided if it needs to be special or just... what feels right.", image: assets.smiling_waving, keys: [], nextPages: [621]};
	scenes[621] = {text: "I'm learning not everything has to be profound.\n[1] Sometimes simple is enough.\n[2] Trust your instincts.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [622, 625]};
	scenes[622] = {text: "Yeah. Maybe I'll just plant something I like looking at.", image: assets.smiling_waving, keys: [], nextPages: [623]};
	scenes[623] = {text: "It doesn't have to mean anything. It can just be nice.", image: assets.smiling_waving, keys: [], nextPages: [650]};
	scenes[625] = {text: "I'm working on that. Trusting what I want instead of overthinking.", image: assets.smiling_waving, keys: [], nextPages: [626]};
	scenes[626] = {text: "This empty plot is good practice.", image: assets.smiling_waving, keys: [], nextPages: [650]};
	scenes[630] = {text: "Because I'm not ready to fill it yet.", image: assets.assured, keys: [], nextPages: [631]};
	scenes[631] = {text: "And that's okay. Not everything needs to be decided right now.\n[1] Be patient with yourself.\n[2] I guess it'll always be here.", image: assets.smiling_waving, keys: ["1", "2"], nextPages: [632, 635]};
	scenes[632] = {text: "Yeah. Yeah, I should.", image: assets.smiling_waving, keys: [], nextPages: [633]};
	scenes[633] = {text: "Rushing never helped anything grow.", image: assets.smiling_waving, keys: [], nextPages: [634]};
	scenes[634] = {text: "Not plants. Not people.", image: assets.smiling_waving, keys: [], nextPages: [650]};
	scenes[635] = {text: "It will. The soil's not going anywhere.", image: assets.smiling_waving, keys: [], nextPages: [636]};
	scenes[636] = {text: "When I know what should go here, I'll plant it.", image: assets.smiling_waving, keys: [], nextPages: [637]};
	scenes[637] = {text: "Until then, it's just... possibility.", image: assets.smiling_waving, keys: [], nextPages: [650]};
	scenes[650] = {text: "I like looking at it sometimes. Imagining what could grow here.", image: assets.smiling_waving, keys: [], nextPages: [], isEndingScene: true};

	// SHELL CONVERSATIONS
	scenes[700] = {text: "Oh. Yeah. That.", image: assets.rueful, keys: [], nextPages: [700.25]};
	scenes["700.25"] = {text: "That's... well, it's my shell. Or it was.\n[1] Oh yeah! You're not wearing it?\n[2] What happened to it?", image: assets.rueful, keys: ["1", "2"], nextPages: [710, 720]};
	scenes[710] = {text: "No, not anymore. Haven't for a while.", image: assets.shy, keys: [], nextPages: [710.5]};
	scenes["710.5"] = {text: "It's complicated. Can we... maybe come back to that?", image: assets.shy, keys: [], nextPages: [740]};
	scenes[720] = {text: "Long story. A really long story.", image: assets.shy, keys: [], nextPages: [720.5]};
	scenes["720.5"] = {text: "Can I tell you about it later? After we've watered a bit?", image: assets.shy, keys: [], nextPages: [740]};
	scenes[740] = {text: "I promise I'll explain. Just... need to ease into it, you know?\n[1] Of course, no pressure.\n[2] Whenever you're ready.", image: assets.contemplative, keys: ["1", "2"], nextPages: [750, 755]};
	scenes[750] = {text: "Thanks. I appreciate that.", image: assets.smile, keys: [], nextPages: [760]};
	scenes[755] = {text: "Thanks, [PLAYER_NAME]. That means a lot.", image: assets.smile, keys: [], nextPages: [760]};
	scenes[760] = {text: "Let's water some plants. It helps me think.", image: assets.smile, keys: [], nextPages: [], isEndingScene: true};

	// POST-GAME SHELL
	scenes[805] = {text: "Hey, so...", image: assets.contemplative, keys: [], nextPages: [806]};
	scenes[806] = {text: "I've been thinking. About why I don't have this on anymore.", image: assets.rueful, keys: [], nextPages: [807]};
	scenes[807] = {text: "You've probably been curious. Or maybe you haven't—I don't know.", image: assets.shy, keys: [], nextPages: [808]};
	scenes[808] = {text: "But I want to tell you about it. If that's okay.\n[1] I'm listening.\n[2] Only if you're comfortable.", image: assets.warm, keys: ["1", "2"], nextPages: [810, 820]};
	scenes[800] = {text: "Okay. I think I'm ready to talk about the shell now.", image: assets.hopeful, keys: [], nextPages: [800.5]};
	scenes["800.5"] = {text: "If you still want to hear it.\n[1] I'm listening.\n[2] Only if you're comfortable.", image: assets.hopeful, keys: ["1", "2"], nextPages: [810, 820]};
	scenes[810] = {text: "Thanks. Okay. Here goes.", image: assets.grateful, keys: [], nextPages: [830]};
	scenes[820] = {text: "I am. I want to tell you.", image: assets.grateful, keys: [], nextPages: [820.5]};
	scenes["820.5"] = {text: "You're one of the few people who knew me... before.", image: assets.wistful, keys: [], nextPages: [830]};
	scenes[830] = {text: "So. The shell.", image: assets.sad_peaceful, keys: [], nextPages: [830.5]};
	scenes["830.5"] = {text: "When we last talked, I was wearing it. Living in it.", image: assets.sad_peaceful, keys: [], nextPages: [], isEndingScene: true};
}

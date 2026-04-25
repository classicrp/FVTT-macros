const _VERSION = '0.5.19';
const _SHOW = true;		// 	debug point flag
const _VERBOSE = true;	//	console.log() flag
const _PAUSED = true;	//	pause at specified point flag
const _TEST = true;		//	test mode flag
const _MEMTEST = false;	//	virtual memory heap dump flag
/*  
	Special Thanks: With help from the crew on Discord::FVTT#macro-polo; 
					@Micheal, @Zhell and mentions to @Freeze and @Flix for 
					spectating in this latest round of Code Golf.  Fore!
*/
	if (_SHOW) debugger
	const CRLF = String.fromCharCode(13).concat(String.fromCharCode(10));

	let srcs = '', fltrd = '', rslt = '', temp = '', msg = '', obj = [];

/* 
	GET an array of all "Conditions" listed in the rules journal
*/
	const ATTR_JRNL_CONT = "pages.0.text.content";
	const RGX_COND_LIST = /<h2>(.*?)<\/h2>/g;
	const UUID_JRNL_COND = "Compendium.pf-content.pf-rules.JournalEntry.FH4DP3oqkBwhLFNS";

/* 	CREATE an instance of the specified [ItemJournalPF]. ------------------- */
	const jrnl = await fromUuid(UUID_JRNL_COND);
	
/*	EXTRACT the data & structure from <jrnl> for processing. --------------- */
	const jrnlData = await game.journal.fromCompendium(jrnl);
	
/*	GET the HTML contents from <jrnlData>. --------------------------------- */
	const contentHTML = await foundry.utils.getProperty(jrnlData, ATTR_JRNL_CONT);
	
/*	USE REGEX to extract only the <h2></h2> tags and text. ----------------- */
	let conditions = await contentHTML.toLowerCase().match(RGX_COND_LIST);
/*	---	REMOVE the wrapping tags. ---------------------------------------------- */
	for (let i = 0; i < conditions.length; i++) {
		conditions[i] = removeHTML(conditions[i], false);
	}
	if (_VERBOSE) {
		console.log(_VERSION, 'conditions:', conditions);
	}

/*
	GET Poison items from non-CRP Compendium packs.
*/
	const FLTR_TYPE = "consumable";
	const FLTR_SUBTYPE = "poison";
	
	if (_TEST) {
/* 	---	TEST CASE BEGIN ---------------------------------------------------- */
		const name = "Dhabba spittle";
		const ERR_MSG_TEST = "Unable to retrieve specified poison from pack data.";
		//	this handles a specific request that returns all copies in Compendiums
		srcs = await game.packs?.filter(f => f.title.toLowerCase().includes('item')).map(g => g.index.getName(name)).filter(g => (typeof g !== 'undefined'));
		if (!srcs) {
			ui.notifications.error(ERR_MSG_TEST);
			console.error(_VERSION, ERR_MSG_TEST);
			return;
		}	
	} else {
/* 	--- LIVE CASE BEGIN ---------------------------------------------------- */
		//	this handles the top set of items with each index for a Compendium,
		//	that needs to be manually filtered.
		const ERR_MSG_LIVE = "Unable to retrieve any poisons from pack data.";
		const ERR_MSG_OCRS = "Could not count occurrences of Poisons already converted.";
		const ERR_MSG_SOME = "Unable to filter out any pre-existing poisons."
		srcs = await game.packs?.filter(f=> f.title.toLowerCase().includes('item')).map(g => g.index);
		if (!srcs) {
			ui.notifications.error(ERR_MSG_LIVE);
			console.error(_VERSION, ERR_MSG_LIVE);
			return;
		}
		//	filters Collections for only the appropriate request
		for (const c of srcs) {
			for (const s of c) {
				if (s.type === FLTR_TYPE && s.system.subType === FLTR_SUBTYPE) {
					rslt.push(s);
				}
			}
		}
		//	sorts that collection alphabetically by "name".
		await rslt.sort(function(a, b){
			let x = a.name.toLowerCase();
			let y = b.name.toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});
		//	counts the number of times a poison (by "name") occurs in all packs.
		temp = await countOccurrences(rslt, obj);
		if (!temp) {
			ui.notifications.error(ERR_MSG_OCRS);
			console.error(_VERSION, ERR_MSG_OCRS);
			return;
		}
		//	GET a list of each poison that shows up more than once.
		fltrd = obj.filter(f => f.occurs > 1);
		if (_VERBOSE) {
			console.log(_VERSION, 'fltrd:', fltrd, CRLF, 'rslt:', rslt);
		}
		if (fltrd) {
			//	we want to ignore those "name".
			srcs = await rslt.filter(a => !fltrd.some(b => b.name === a.name));
			if (!srcs) {
				ui.notifications.error(ERR_MSG_SOME);
				console.error(_VERSION, ERR_MSG_SOME);
				return;
			}
		} else {
			//	no poisons occur more than once.
			srcs = rslt;
		}
		//	clear large memory objects
		rslt = null;
		fltrd = null;
		obj = null;
/* 	--- LIVE CASE END ------------------------------------------------------ */
	}
	if (_VERBOSE) {
		console.log(_VERSION, 'srcs:', srcs);
	}
/*
	CREATE a copy of Poison item in "Compendium.crp-contents.crp-items"
		in folder "ITEMS", subfolder "Poisons" for each not already there. 
*/
	const CRP_ITEMS = "crp-contents.crp-items";
	const CRP_MACROS = "crp-contents.crp-macros";
	const CRP_FLDR_BFF_PSN = "DGNHw19qOPUjYRMy";		//	Compendium.crp-contents.crp-items.Folder. + this
	const CRP_FLDR_ITM_PSN = "Bn4K7b0X6r1WHKmN";		//	Compendium.crp-contents.crp-items.Folder. + this
	const CRP_IMG_BASE = "modules/crp-contents/assets/icons/";
	const REPLACE_THIS_WITH_BUFF_UUID = "REPLACE_THIS_WITH_BUFF_UUID";

	const ATTR_UKN_NAME = "system.unidentified.name";
	const ATTR_UKN_DESC = "system.description.unidentified";
	const ATTR_KNWN_DESC = "system.description.value";
	const ATTR_KNWN_PRC = "system.price";
	const ATTR_FLDR = "folder";
	const ATTR_PACK = "pack";
	const ATTR_IMG = "img";
	const ATTR_ITM_IDNT = "system.identified";
	const ATTR_ITM_CARRIED = "system.carried";
	const ATTR_ITM_EQP = "system.equipped";
	const ATTR_ITM_STS_DSRC = "_stats.duplicateSource";
	const ATTR_ITM_ACT_IMG = "system.actions.0.img";
	const ATTR_ITM_ACT_NOTE_EFF = "system.actions.0.notes.effect.0";
	const ATTR_ITM_ACT_SAV_DESC = "system.actions.0.save.description";
	const ATTR_EFF_NOTE = "system.effectNotes.0";
	
	const TXT_UNK_NAME = "Vial of liquid";
	const TXT_UNK_DESC = "<p>Some liquid in a vial.</p>";
	const TXT_NOTE_START = `<span style="font-size:1.2em">`;
	const TXT_NOTE_APPLY = " @Apply[" + REPLACE_THIS_WITH_BUFF_UUID + "]<br>";
		
	for (const s of srcs) {
		let descHTML = "", itemName = "", buffName = "";
		let cure = "", frequency = "", price = "", effect = "", onset = "";
		let secondary = "", initial = "", condition = "";

/*	GRAB the needed <uuid>. ------------------------------------------------ */
		const itemUuid = s.uuid;
		if (_VERBOSE) {
			console.log(_VERSION, "itemUuid:", itemUuid);
		}

/*	CREATE an instance of the current [ItemConsumablePF]. ------------------ */
		const item = await fromUuid(itemUuid);
		if (_VERBOSE) {
			console.log(_VERSION, "item:", item);
		}

/*	EXTRACT the data structure from <item> for further processing. --------- */
		let itemData = await game.items.fromCompendium(item);
		if (_VERBOSE) {
			console.log(_VERSION, "itemData:", itemData);
		}

/*	SET <img> to another icon if it is the default ------------------------- */
		const img = checkImage(itemData.img);
		rslt = await foundry.utils.setProperty(itemData, ATTR_IMG, img);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_IMG, "] not set to:", img);
		}
		
/*	SET <Unidentified Name> to "Vial of liquid". --------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_UKN_NAME, TXT_UNK_NAME);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_UKN_NAME, "] not set to:", TXT_UNK_NAME);
		}

/*	SET <Superficial Details> to "Some liquid in a vial. ------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_UKN_DESC, TXT_UNK_DESC);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_UKN_DESC, "] not set to:", TXT_UNK_DESC );
		}

/*	SET	<equipped> to FALSE. ----------------------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_EQP, false);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_EQP, "] not set to:", false );
		}

/*	SET <carried> to FALSE. ------------------------------------------------ */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_CARRIED, false);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_CARRIED, "] not set to:", false );
		}

/*
	GET <Identified Properties>
*/
		descHTML = foundry.utils.getProperty(itemData, ATTR_KNWN_DESC);

/*	-------	CONVERT descHTML into an HTML Array. --------------------------- */
		let descHTMLParsed = foundry.utils.parseHTML(descHTML);

/*	---	ADD at top "<h3>" + <Item.name> + "</h3>" -------------------------- */
		itemName = foundry.utils.getProperty(itemData, "name");
		const TXT_HDR = `<h3>${itemName}</h3>`;
		descHTML = TXT_HDR + descHTML;

/*	---	INSERT after "Cure..." - "</p>" + "; <b>Value</b> " + <price> +_
			" gp.</p>". ---------------------------------------------------- */

/*	-------	CREATE "Value". ------------------------------------------------ */
		price = foundry.utils.getProperty(itemData, ATTR_KNWN_PRC);
		const TXT_VALUE = `<strong>Value</strong> ${price} gp.`;

/*	-------	EXTRACT "Cure". ------------------------------------------------ */
		const TXT_CURE = "<strong>Cure</strong> 1 save";
		rslt = extractFromHTML(descHTMLParsed, "Cure");
		if (!rslt) {
			cure = await extractCure(TXT_CURE);
		} else {
			cure = await extractCure(rslt);
		}

/*	-------	BUILD "Cure; Value" line. -------------------------------------- */
		const RGX_LAST_PARA_TAG = /<\/p>$/;
		if (!descHTML.includes('Cure')) {			
			descHTML = descHTML + "<p>" + cure.html + "; " + TXT_VALUE + "</p>";
		} else {
			descHTML = descHTML.replace(RGX_LAST_PARA_TAG, ("; " + TXT_VALUE)) + "</p>";
		}

/*	---	SET updated <Identified Properties> -------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_KNWN_DESC, descHTML);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_KNWN_DESC, "] not set to:", descHTML );
		}

/*	-------	UPDATE Parsed Array. ------------------------------------------- */
		descHTMLParsed = foundry.utils.parseHTML(descHTML);

/*
 	SET <action['Use'].SavingThrowEffect> = <span style="font-size: 1.2em">
		<b>Frequency:</b> " + (frequency from details) + "<br><b>Cure:</b> " 
		+ (cure from details OR 1 if none exists there) + " save(s)</span>" 
*/

/*	---	EXTRACT "Frequency". ----------------------------------------------- */
		fltrd = extractFromHTML(descHTMLParsed, "Frequency");
		frequency = await extractFrequency(fltrd);
		if (!frequency) {
			const WRN_MSG_FREQ = `Could not locate any "Frequency" information from item description.`;
			console.warn(_VERSION, WRN_MSG_FREQ );
		}

/*	---	POPULATE <savingThrowEffect>. -------------------------------------- */
		const savingThrowEffect = TXT_NOTE_START + frequency.html + "<br>" + cure.html + "</span>";

/*	---	SET <savingThrowEffect>. ------------------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_ACT_SAV_DESC, savingThrowEffect);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_ACT_SAV_DESC, "] not set to:", savingThrowEffect );
		}

/*	CLEAR any pre-existing <actionEffect>. --------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_ACT_NOTE_EFF, "");
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_ACT_NOTE_EFF, "] not set to:", " " );
		}

/*	SET <system.actions.0.img> to <img> if they don't match ---------------- */
		if (itemData.system.actions[0].img !== img) {
			rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_ACT_IMG, img);
			if (!rslt) {
				console.warn(_VERSION, "itemData property [", ATTR_ITM_ACT_IMG, "] not set to:", img );
			}
			
		}

/*	SET <identified> flag to FALSE. ---------------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_IDNT, false);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_IDNT, "] not set to:", false );
		}

/*	SET destination <folder> within Compendium ----------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_FLDR, CRP_FLDR_ITM_PSN);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_FLDR, "] not set to:", CRP_FLDR_ITM_PSN );
		}

/*	SET <duplicateSource> to originating item UUID. ------------------------ */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_STS_DSRC, itemUuid);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_STS_DSRC, "] not set to:", savingThrowEffect );
		}

/*	SET <pack> to proper Compendium. --------------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_PACK, CRP_ITEMS);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_PACK, "] not set to:", CRP_ITEMS );
		}

/* 	SET <effectNote> = "<span style="font-size:1.2em"><b>Onset:</b>	+ onset 
		from details + @Apply[ (place itemUuid for the poison's	buff here)]
		<br> + IF a secondary item exists add "<b>Secondary:</b> " + IF a 
		Condition exists, add; "@Condition[ (condition lowercase name)" + 
		";duration=" + Set duration as a die roll/number only for "rnds" 
		(if you want it to last random "m" minutes, "t" turns, "h" hours, 
		"d" days, then multilpy by {10 for "m", 100 for "t", 600 for "h", 
		14400 for "d"} OR number + "m" or "t" or "h" or "d" + "]</span>"
*/

/* 	---	EXTRACT "Onset". --------------------------------------------------- */
		fltrd = extractFromHTML(descHTMLParsed, "Onset").replace(`; ${frequency.html}`, '');
		if (fltrd) {
			onset = extractOnset(fltrd);
		}

/* 	---	EXTRACT "Initial". ------------------------------------------------- */
		fltrd = extractFromHTML(descHTMLParsed, "Initial");
		initial = (fltrd) ? true : false;

/* 	---	EXTRACT "Secondary". ----------------------------------------------- */
		fltrd = extractFromHTML(descHTMLParsed, "Secondary");
		secondary = (fltrd) ? true : false;

/* 	---	EXTRACT "Effect". -------------------------------------------------- */
		fltrd = extractFromHTML(descHTMLParsed, "Effect");
		if (fltrd) {
			effect = extractEffect(fltrd, initial, secondary);
console.log("effect:", effect);
/* 	-------	CHECK if "Effect" has a "Condition". --------------------------- */
			if (!condition && hasCondition( fltrd, conditions )) {
/* 	-----------	EXTRACT "Condition". --------------------------------------- */
				condition = getConditionBreakdown(fltrd, conditions);
console.log("condition:", condition);
			}
		}

/* 	---	POPULATE <effectNote>. --------------------------------------------- */
		let effectNote = populateEffectNote(onset, initial, effect, secondary, condition);
	
/*
	CREATE a new BUFF item placed in "Compendium.crp-contents.crp-items" in 
		folder "BUFFS", subfolder "Poisons".
*/

if (_SHOW) debugger

/*	---	WRITE new Buff in Compendium --------------------------------------- */	
		let buff = "";
		try {
			buff = await pf1.documents.item.ItemBuffPF.create(
					createBuffData(descHTML, itemData, cure, effect, frequency),
				{ 
					pack: CRP_ITEMS, 
					folder: CRP_FLDR_BFF_PSN, 
					source: ("Compendium." + CRP_ITEMS + ".Folder." + CRP_FLDR_BFF_PSN) 
				}
			);
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff.name, "failed to create.");
			return;
		}
		if (_VERBOSE) {
			console.log(_VERSION, 'create buff results:', buff);
		}

/*
	---	SET buffUuid of associated Poison Item to newly created BUFF buffUuid. 
*/

/* 	-------	CREATE <buffUuid>. --------------------------------------------- */
		const buffUuid = "Compendium." + CRP_ITEMS + ".Item." + buff._id;

/* 	-------	UPDEATE Item <effectNote> with <buffUuid>. --------------------- */
		effectNote = await effectNote.replace(REPLACE_THIS_WITH_BUFF_UUID, buffUuid);

/* 	-------	SET <effectNote> in <itemData>. -------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_EFF_NOTE, effectNote);
		if (!rslt) {
			console.warn(_VERSION, "itemData property [", ATTR_EFF_NOTE, "] not set to:", effectNote );
		}

/*	-------	SET "Save" <save> to <itemData.system.actions.0.save> ----- */
		const ATTR_ITM_ACT_SAV = "system.actions.0.save";
		const ATTR_ACT_SAV_DC = "save.dc";
		const ATTR_ACT_SAV_DESC = "save.description";
		const ATTR_ACT_SAV_TYP = "save.type";
		const saveFromItemData = foundry.utils.getProperty( itemData, ATTR_ITM_ACT_SAV );

/*	---	CREATE <actions> in <buff> ------------------------------------------ */
		try {
			await pf1.components.ItemAction.create(createActionsData(buff, saveFromItemData), { parent: buff })
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff.name, ", Action: [ createActionsData() ], failed to write.");
			return;
		}

/*	---	CREATE <changes> in <buff> ----------------------------------------- */
		try {
			await pf1.components.ItemChange.create(createChangesData(buff, effect, initial), { parent: buff })
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff.name, ", Action: [ createActionsData() ], failed to write.");
			return;
		}
		
/*	---	CREATE <scriptCalls> in <buff> ------------------------------------- */
		try {
			await pf1.components.ItemScriptCall.create(createScriptCallData(), { parent: buff })
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff.name, ", Action: [ createScriptCallData() ], failed to write.");
			return;
		}
		
if (_SHOW) debugger
		
/*	WRITE new Item in Compendium ------------------------------------------- */
		try {
			rslt = await Item.create(itemData, { pack: CRP_ITEMS, folder: CRP_FLDR_ITM_PSN, source: ("Compendium." + CRP_ITEMS + ".Folder." + CRP_FLDR_ITM_PSN) });
		} catch (error) {
			console.error(error, _VERSION, "Item:", itemData.name, "failed to create.");
			return;
		}
		if (_VERBOSE) {
			console.log(_VERSION, 'create item result:', rslt);
		}

	}

return;

function countOccurrences(arr) {
	return arr.reduce((acc, element) => {
		obj.push(nameOccurs(element.name, (acc[element.name] || 0) + 1 ));
		acc[element.name] = (acc[element.name] || 0) + 1;
		return acc;
		},
		{}
	); // Initialize accumulator as empty object
}

function nameOccurs(t, n) {
	return {
		name: t,
		occurs: n
	}
}

function removeHTML(htm, state) {
//	if (show) debugger
	let rslt = "", srcs = "";
	srcs = foundry.utils.parseHTML(htm);
//	if (_VERBOSE) console.log(_VERSION, "HTML source:", srcs);
	if ((!Array.isArray(srcs)) && srcs) return srcs.innerText;
	for (let i = 0; i < srcs.length; i++) {
		//	picked apart based on <p>
		let raw = srcs[i].innerHTML;
		const coded = foundry.utils.parseHTML(raw);
//		if (_VERBOSE) console.log(_VERSION, "HTML sub-source:", coded);
		if (typeof coded !== "undefined") { 
			if (typeof coded.length === "undefined") {
				//  only one instance present
				raw = raw.replaceAll( coded.outerHTML, `[${coded.outerText.toUpperCase()}]` );
			} else {
				for (let j =0; j < coded.length; j++) {
				//	picked apart based on <strong>... or other codes?
					raw = raw.replaceAll( coded[j].outerHTML, `[${coded[j].outerText.toUpperCase()}]` );
				}
			}
		}
		const CRLF = String.fromCharCode(13).concat(String.fromCharCode(10));
		if (state) {
			rslt += raw.concat(CRLF);
		} else {
			rslt += raw;
		}
	}
//	if (_VERBOSE) console.log(_VERSION, "Text:", rslt);
	return rslt;
}

function extractFromHTML(srcs, tag) {
//	if (_SHOW) debugger
	let rslt = "";
    for (const s of srcs) {
        if (s.innerHTML.includes(tag)) {
          rslt = s.innerHTML;
          break;
        }
    }
	return rslt;
}

function hasCondition(t, cond) {
	//	See if the passed in "Effect" line holds a known Condition
	return cond.find(f => t.includes(f))||"";
}

function durations() {
	return [
      { key: "round", value: ["r", "rnd", "round", "rounds", "rnds"], mult: 1 },
      { key: "minute", value: ["m", "min", "mins", "minute", "minutes"], mult: 10 },
      { key: "turn", value: ["t", "trn", "turn", "trns", "turns"], mult: 100 },
      { key: "hour", value: ["h", "hr", "hrs", "hour", "hours"], mult: 600 },
      { key: "day", value: ["d", "day", "days"], mult: 14400  },
      { key: "week", value: ["w", "wk", "wks", "week", "weeks"], mult: 100800 }
    ];
}

function savingThrows() {
	return [
		{ key: "fort", value: ["fortitude", "fort", "for", "fo", "f"] },
		{ key: "ref", value: ["reflex", "ref", "re", "r"] },
		{ key: "will", value: ["will", "wi", "w"] }
	];
}

function damageTypes() {
	return [
		{ key: "acid", value: "Acid" },
		{ key: "cold", value: ["Cold", "Ice"] },
		{ key: "electric", value: ["Electricity", "Electrical", "Lightning", "Arc"] },
		{ key: "fire", value: ["Flame", "Fire"] },
		{ key: "sonic", value: ["Sonic", "Thunder"] },
		{ key: "magic", value: "Magic" },
		{ key: "force", value: "Force" },
		{ key: "negative", value: ["Negative", "Neg"] },
		{ key: "positive", value: ["Positive", "Pos"] },
		{ key: "slashing", value: ["Slashing", "Slash", "Cut", "S"] },
		{ key: "piercing", value: ["Piercing", "Pierce", "Stab", "P"] },
		{ key: "bludgeoning", value: ["Bludgeoning", "Bludgeon", "Club", "Beat", "B"] },
		{ key: "wounds", value: ["Wounds", "Wound", "Critical", "Crit"] }	
	]
}

function getConditionBreakdown(htm, cond) {
	let condition = "";
	const RGX_COND = /(\w+)\s+(?:for\s+)?(\d+d\d+|\d+)\s+(minutes|rounds|minute|round|turns|hours|weeks|rnds|mins|turn|trns|hour|days|week|rnd|min|trn|hrs|day|wks|hr|wk|r|m|t|h|d|w)/i;
	const rslt = htm.match(RGX_COND);
	if (rslt) {
		condition = {
			effect: rslt[0],
			name: rslt[1],
			duration: rslt[2],
			units: durations().find(entry => entry.value.includes(rslt[3].toLowerCase())).key||null,
			mult: 1
		};
		if ((condition.duration.includes("d")) && (condition.units !== "round")) {
			//	We have a die equation that only resolves as "rounds" from
			//	the Enricher.  Get the <mult> for the "units" key from the 
			//	<conditions> dataset and update <cond.mult>.  Units need to
			//	be set to "rounds".
			condition.mult = durations().find(entry => entry.key === condition.units).mult||null;
			condition.units = "round";
		}
	} else {
		//  only contains the condition with no extra info
debugger
		fltrd = cond.find(f => htm.includes(f));
		if (fltrd) {
			condition = {
				effect: fltrd,
				name: fltrd,
				duration: -1,
				units: "",
				mult: 1
			}
		}
	}
	return condition;
}

function hasInitial(htm) {
	return htm.toLowerCase().includes("initial");	
}

function hasSecondary(htm) {
	return htm.toLowerCase().includes("secondary");	
}

function extractInitial(htm) {
	const RGX_INITIAL = /<strong>Initial(?: Effect)?<\/strong>\s*(\d+(?:d\d+)?)\s*(Str|Dex|Con|Int|Wis|Cha)/i;
	let rslt = htm.match(RGX_INITIAL);
	if (rslt) {
		let eff = getEffectBreakdown(rslt[0]);
		rslt = eff;
	}
	return rslt;
}

function extractSecondary(htm) {
	const RGX_SECONDARY = /(<strong>Secondary(?: Effect)?<\/strong>\s*(([\w\s]*?)\s*(\d+d\d+|\d+)\s*(minutes|rounds|minute|round|turns|hours|weeks|rnds|mins|turn|trns|hour|days|week|rnd|min|trn|hrs|day|wks|hr|wk|r|m|t|h|d|w|Str|Dex|Con|Int|Wis|Cha)(?:\s*damage)?))/i;
	let rslt = htm.match(RGX_SECONDARY);
	if (rslt) {
		let eff = getEffectBreakdown(rslt[0]);
		let cnd = getConditionBreakdown(rslt[0], conditions);
		if (eff && !cnd) {
			rslt = eff;
		} else if (!eff && cnd) {
			rslt = cnd;
		} else {
			rslt = null;
		}
	}
	return rslt;
}

function extractEffect(htm, i, s) {
	let arr = [], eff = "";
	const rslt = getEachEffect(htm);
	if (rslt) {
		for (let r of rslt) {
			eff = getEffectBreakdown(r);
			arr.push(eff);
		}
	}
	return arr;
}

function getEachEffect(htm, i, s) {
	const RGX_EA_EFF = /(\d+(?:d\d+)?)\s+(str|dex|con|int|wis|cha|acid|cold|electricity|fire|sonic|magic|force|negative|positive)(?:\s+damage)?/gi;
debugger	
	return htm.match(RGX_EA_EFF);
}

function getEffectBreakdown(htm, i, s) {
	const RGX_EFF_BRKD = /(?<number>\d+(?:d\d+)?)\s+(str|dex|con|int|wis|cha|acid|cold|electricity|fire|sonic|magic|force|negative|positive)(?:\s+damage)?/i;
debugger
	const rslt = htm.match(RGX_EFF_BRKD);
	if (rslt) {
		return {
			effect: htm,
			ability: rslt[2].toLowerCase(),
			amount: rslt[1]
		}
	}
	return null;
}

function extractCure(htm) {
	const RGX_CURE = /(<(\w+)>.*?<\/\2>)\s+(\d+)\s+(consecutive\s+)?(saves?)/i;
	const rslt = htm.match(RGX_CURE);
	const consec = htm.toLowerCase().includes("consecutive");
	if (rslt) {
		return {
			html: rslt[0],
			savesNeeded: Number(rslt[3]),
			consecutive: ((!consec) ? -1 : 0)
		}
	}
	return null;
}

function extractFrequency(htm) {
	const RGX_FREQ = /<(.*?)>Frequency<\/\1>\s*(.*?(\d+d\d+|\d+)\s+(minutes|rounds|minute|round|turns|hours|weeks|rnds|mins|turn|trns|hour|days|week|rnd|min|trn|hrs|day|wks|hr|wk|r|m|t|h|d|w)\b)/i
	const rslt = htm.match(RGX_FREQ);
	if (rslt) {
		return {
			html: rslt[0],
			duration: rslt[3],
			units: durations().find(entry => entry.value.includes(rslt[4].toLowerCase())).key||null
		}
	} else {
		return {
			html: "Only occurs once.",
			duration: 0,
			units: ""
		}
	}
}

function extractOnset(htm) {
	const RGX_FREQ = /<(.*?)>Onset<\/\1>\s*(.*?(\d+d\d+|\d+)\s+(minutes|rounds|minute|round|turns|hours|weeks|rnds|mins|turn|trns|hour|days|week|rnd|min|trn|hrs|day|wks|hr|wk|r|m|t|h|d|w)\b)/i
	const rslt = htm.match(RGX_FREQ);
	if (rslt) {
		return {
			html: rslt[0],
			duration: rslt[3],
			units: durations().find(entry => entry.value.includes(rslt[4].toLowerCase())).key||null
		}
	}
	return null;
}

function getFrequencyBreakdown(htm) {
	const RGX_FREQ = /<strong>Frequency<\/strong>\s*([^<]+)/;
	return htm.match(RGX_FREQ);
}

function createChangesData(d, e, i) {
	//	CREATE a new <changes> object for each type of damage listed in Details
	//		SET <target> to damage type (mostly an ability)
	//		SET <formula> to number or in case of dice; "-floor(random() * [ size of dice ] + 1) +@dFlags.poison(poison name).(target)
	//		ENSURE <operator> is "add"
	//		LOOP as needed
	const changes = [];
	for (let effect of e) {
		if (!damageTypes().find(f => f.includes(effect.name))) {
			let name = getNameFromData(d.name);
			let dFlags = "@dFlags." + name + "." + effect.ability;
			let amount = "";
			if (effect.amount.includes("d")) {
				const n = effect.amount.charAt(0);
				const m = effect.amount.charAt(2);
				amount = `(${n} * floor(random() * ${m} + 1))`;
			} else {
				amount = effect.amount;
			}
			formula = "-" + amount;
			if (!i) {
				//	cumulative damage kept
				formula +=  " +" + dFlags;
			}
			let change = {
				_id: randomID(8),
				formula: formula,
				operator: "add",
				target: effect.ability,
				type: "untyped"
			};
			changes.push(change);
		}
	}
	return changes;
}

function createScriptCallData() {
	const UUID_CURE_CHK = "Compendium.crp-contents.crp-macros.Macro.wEGLTOmr7iSa5E3l";
	const UUID_TOGGLE_CHK = "Compendium.crp-contents.crp-macros.Macro.0kwyj53zVj6I6rKs";
	/* object definitions for 'buffCureCheck' and buffToggleCheck' macros -- */
	return [
		{
			category: "use",
			hidden: false,
			img: "",
			name: "buffCureCheck",
			type: "macro",
			value: UUID_CURE_CHK,
			_id: randomID(8)
		},
		{
			category: "toggle",
			hidden: false,
			img: "",
			name: "buffToggleCheck",
			type: "macro",
			value: UUID_TOGGLE_CHK,
			_id: randomID(8)
		}
	];
}

function createBuffData(htm, data, c, e, f) {
	const id = randomID(16);
	const buffUuid = "Compendium." + CRP_ITEMS + ".Item." + id;
	//	CREATE dictionary items for;
	//		<frequencyUnits> (String) {"" for inifinity, "round" for rnds, "turn" for turns, "hour" for hrs, "day" for days}, pulled from "Details".
	//		<frequencyDuration> (Number), pulled from "Details".
	//		<consecutiveSaves> (Number) { -1 if not present, 0 otherwise }, pulled from "Details".
	//		<savesNeeded> (Number) { 1 if not present, ohterwise pulled from "Details"}.
	//		<savesMade> (Number) { 0 }.
	//		<unitsPassed> (Number) { 0 }.
	let buffData = {
		name: `Poison (${data.name.toLowerCase().replace('poison', '')})`,
		type: "buff",
		img: data.img,
		_id: id,
		pack: CRP_ITEMS,
		folder: CRP_FLDR_BFF_PSN,
		system: { 
            showInQuickbar: true,
			description: {
					value: htm
				},
			flags: {
				dictionary: {
					frequencyUnits: f.units,
					frequencyDuration: f.duration,
					consecutiveSaves: c.consecutive,
					savesNeeded: c.savesNeeded,
					savesMade: 0,
					unitsPassed: 0
				}
			},
			duration: {
				end: "initiative",
				units: f.units,
				value: f.duration
			}
		}
	};
	for (let effect of e) {
		//	add in [effect.abilities]: 0,
		buffData.system.flags.dictionary[effect.ability] = 0;
	}
	return buffData;
}

function createActionsData(b, s) {
	return [
		{ 
			name: "Save", 
			activation: {
				type: "nonaction"
			},
			actionType: "save",
			img: b.img,
			tag: "save",
			save: {
				dc: s.dc, 
				description: s.description, 
				type: s.type
			}
		},
		{
			name: "Cured",
			activation: {
				type: "nonaction"
			},
			actionType: "other",
			img: b.img,
			tag: "cure"
		}
	];
}

function getNameFromData(n) {
 	const words = n.match(/[a-zA-Z]+/g);
	const result = words
		.map((word, index) => {
			if (index === 0) {
				return word.toLowerCase(); // lowercase first word: "poison"
			}
			// Capitalize the first letter of every other word
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join(''); // Join them back together
    return result;
}

function checkImage(img) {
	const IMG_DEFAULT = "systems/pf1/icons/items/potions/unique-9.jpg";
	let rslt = ""; rnd = 0;
	if (img === IMG_DEFAULT) {
		do {
			rnd = Math.floor(Math.random() * 100) + 1;
		}
		while (rnd === 38);	// that's a healing one
		rslt = CRP_IMG_BASE + rnd.toString() + ".png";
	} else {
		rslt = img;
	}
	return rslt;
}

function populateEffectNote(o, i, e, s, c) {
	const TXT_EFF_NOTE_INIT = "<strong>Initial:</strong> ";
	const TXT_EFF_NOTE_EFCT = "<strong>Effect:</strong> ";
	const TXT_EFF_NOTE_SECD = "<strong>Secondary:</strong> ";
	let effectNote = TXT_NOTE_START;
debugger
	if (o) {
		effectNote += o.html;
	} 
	if (i) {
		effectNote += TXT_EFF_NOTE_INIT;
	} 
	if (e && !i) {
		effectNote += TXT_EFF_NOTE_EFCT;
	}
	effectNote += TXT_NOTE_APPLY;
	if (s) {
		effectNote += TXT_EFF_NOTE_SECD;
	}
	if (c) {
		const TXT_COND_START = `@Condition[${c.name};duration=`;
		let txtCond = TXT_COND_START;
		if (c.mult !== 1 && c.units === "round" && !Number.isInteger(c.duration)) {
			txtCond += c.duration + "*" + c.mult + "]";
		} else {
			txtCond += c.duration + " " + c.units + "]";
		}
		effectNote += " " + txtCond;
	}
	effectNote += "</span>";
	return effectNote;
}
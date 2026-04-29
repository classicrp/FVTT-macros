const _VERSION = '0.5.32';
const _SHOW = false;	// 	debug point flag
const _VERBOSE = false;	//	console.log() flag
const _PAUSED = true;	//	pause at specified point flag
const _TEST = true;		//	test mode flag
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

/* 	CREATE an instance of the specified [ItemJournalPF] -------------------- */
	const jrnl = await fromUuid(UUID_JRNL_COND);
	
/*	EXTRACT the data & structure from <jrnl> for processing ---------------- */
	const jrnlData = await game.journal.fromCompendium(jrnl);
	
/*	GET the HTML contents from <jrnlData> ---------------------------------- */
	const contentHTML = await foundry.utils.getProperty(jrnlData, ATTR_JRNL_CONT);
	
/*	USE REGEX to extract only the <h2></h2> tags and text ------------------ */
	let conditions = await contentHTML.toLowerCase().match(RGX_COND_LIST);
	/*	REMOVE the wrapping tags ------------------------------------------- */
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
	/* 	TEST CASE BEGIN ---------------------------------------------------- */
		const name = "Blistercap spore";
		const ERR_MSG_TEST = "Unable to retrieve specified poison from pack data.";
		//	this handles a specific request that returns all copies in Compendiums
		srcs = await game.packs?.filter(f => f.title.toLowerCase().includes('item')).map(g => g.index.getName(name)).filter(g => (typeof g !== 'undefined'));
		if (!srcs) {
			ui.notifications.error(ERR_MSG_TEST);
			console.error(_VERSION, ERR_MSG_TEST);
			return;
		}	
	} else {
	/* 	LIVE CASE BEGIN ---------------------------------------------------- */
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
	/* 	LIVE CASE END ------------------------------------------------------ */
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
		
	for (const s of srcs) {
		let descHTML = "", itemName = "", buffName = "";
		let cure = "", frequency = "", price = "", effect = "", onset = "";
		let secondary = "", initial = "", condition = "";

	/*	GRAB the needed <uuid> --------------------------------------------- */
		const itemUuid = s.uuid;
		if (_VERBOSE) {
			console.log(_VERSION, "itemUuid:", itemUuid);
		}

	/*	CREATE an instance of the current [ItemConsumablePF] --------------- */
		const item = await fromUuid(itemUuid);
		if (_VERBOSE) {
			console.log(_VERSION, "item:", item);
		}

	/*	EXTRACT the data structure from <item> for further processing ------ */
		let itemData = await game.items.fromCompendium(item);
		if (_VERBOSE) {
			console.log(_VERSION, "itemData:", itemData);
		}

/*	SET <img> to another icon if it is the default ------------------------- */
		const img = checkImage(itemData.img);
		rslt = await foundry.utils.setProperty(itemData, ATTR_IMG, img);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_IMG, WRN_MSG_NOT, img);
		}
		
/*	SET <Unidentified Name> to "Vial of liquid" ---------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_UKN_NAME, TXT_UNK_NAME);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_UKN_NAME, WRN_MSG_NOT, TXT_UNK_NAME);
		}

/*	SET <Superficial Details> to "Some liquid in a vial -------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_UKN_DESC, TXT_UNK_DESC);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_UKN_DESC, WRN_MSG_NOT, TXT_UNK_DESC );
		}

/*
	GET <Identified Properties>
*/

		descHTML = foundry.utils.getProperty(itemData, ATTR_KNWN_DESC);

	/*	ADD at top "<h3>" + <Item.name> + "</h3>" -------------------------- */
		itemName = foundry.utils.getProperty(itemData, "name");
		const TXT_HDR = `<h3>${itemName}</h3>`;
		descHTML = TXT_HDR + descHTML;

	/*	CONVERT descHTML into an HTML Array -------------------------------- */
		let descHTMLParsed = foundry.utils.parseHTML(descHTML);

	/*	INSERT after "Cure..." - "</p>" + "; <b>Value</b> " + <price> +	" gp.</p>" */

		/*	CREATE "Value" ------------------------------------------------- */
		price = foundry.utils.getProperty(itemData, ATTR_KNWN_PRC);
		const TXT_VALUE = `<strong>Value</strong> ${price} gp.`;

		/*	EXTRACT "Cure" ------------------------------------------------- */
		cure = await extractCure(descHTMLParsed);

		/*	BUILD "Cure; Value" line --------------------------------------- */
		descHTML = await includeCureValueLine(descHTMLParsed, rslt, cure, TXT_VALUE);

	/*	SET updated <Identified Properties> -------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_KNWN_DESC, descHTML);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_KNWN_DESC, WRN_MSG_NOT, descHTML );
		}

		/*	UPDATE Parsed Array -------------------------------------------- */
		descHTMLParsed = foundry.utils.parseHTML(descHTML);

/*
 	SET <action['Use'].SavingThrowEffect> = <span style="font-size: 1.2em">
		<b>Frequency:</b> " + (frequency from details) + "<br><b>Cure:</b> " 
		+ (cure from details OR 1 if none exists there) + " save(s)</span>" 
*/

	/*	EXTRACT "Frequency" ------------------------------------------------ */
		fltrd = extractFromHTML(descHTMLParsed, "Frequency");
		frequency = await extractFrequency(fltrd);
		if (!frequency) {
			const WRN_MSG_FREQ = `Could not locate any "Frequency" information from item description.`;
			console.warn(_VERSION, WRN_MSG_FREQ );
		}

	const WRN_MSG_PROP = "itemData property [";
	const WRN_MSG_NOT = "] not set to:";
	
	/*	POPULATE <savingThrowEffect> --------------------------------------- */
		const savingThrowEffect = TXT_NOTE_START + frequency.html + "<br>" + cure.html + "</span>";

	/*	SET <savingThrowEffect> -------------------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_ACT_SAV_DESC, savingThrowEffect);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_ITM_ACT_SAV_DESC, WRN_MSG_NOT, savingThrowEffect );
		}

/*	CLEAR any pre-existing <actionEffect> ---------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_ACT_NOTE_EFF, "");
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_ITM_ACT_NOTE_EFF, WRN_MSG_NOT, " " );
		}

/*	SET <system.actions.0.img> to <img> if they don't match ---------------- */
		if (itemData.system.actions[0].img !== img) {
			rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_ACT_IMG, img);
			if (!rslt) {
				console.warn(_VERSION, WRN_MSG_PROP, ATTR_ITM_ACT_IMG, WRN_MSG_NOT, img );
			}
			
		}

/*	SET <identified> flag to FALSE ----------------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_IDNT, false);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_ITM_IDNT, WRN_MSG_NOT, false );
		}

/*	SET destination <folder> within Compendium ----------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_FLDR, CRP_FLDR_ITM_PSN);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_FLDR, WRN_MSG_NOT, CRP_FLDR_ITM_PSN );
		}

/*	SET <duplicateSource> to originating item UUID ------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_ITM_STS_DSRC, itemUuid);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_ITM_STS_DSRC, WRN_MSG_NOT, savingThrowEffect );
		}

/*	SET <pack> to proper Compendium ---------------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_PACK, CRP_ITEMS);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_PACK, WRN_MSG_NOT, CRP_ITEMS );
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

	/* 	EXTRACT "Onset" ---------------------------------------------------- */
		fltrd = extractFromHTML(descHTMLParsed, "Onset").replace(`; ${frequency.html}`, '');
		if (fltrd) {
			onset = extractOnset(fltrd);
		}

	/* 	EXTRACT "Initial" -------------------------------------------------- */
		initial = hasInitial(descHTML);

	/* 	EXTRACT "Secondary" ------------------------------------------------ */
		secondary = hasSecondary(descHTML);

	/* 	EXTRACT "Effect" --------------------------------------------------- */
		fltrd = extractFromHTML(descHTMLParsed, "Effect");
		if (fltrd) {
			effect = extractEffect(fltrd, initial, secondary);
		}
	/* 	CHECK if "Effect" has a "Condition" ---------------------------- */
		if (hasCondition(fltrd, conditions)) {
			/* 	EXTRACT "Condition" ---------------------------------------- */
			condition = getConditionBreakdown(fltrd, conditions);
		}

	/* 	POPULATE <effectNote> ---------------------------------------------- */
		let effectNote = populateEffectNote(onset, initial, effect, secondary, condition);
	
/*
	CREATE a new BUFF item placed in "Compendium.crp-contents.crp-items" in 
		folder "BUFFS", subfolder "Poisons".
*/

if (_SHOW) debugger

	/*	WRITE new Buff in Compendium --------------------------------------- */	
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

	/*	SET buffUuid of associated Poison Item to newly created BUFF buffUuid */

		/* 	CREATE <buffUuid> ---------------------------------------------- */
		const buffUuid = "Compendium." + CRP_ITEMS + ".Item." + buff._id;

		/* 	UPDEATE Item <effectNote> with <buffUuid> ---------------------- */
		const RGX_REPLACE = /(?<=@Apply\[).*(?=\])/;
		effectNote = await effectNote.replace(RGX_REPLACE, buffUuid);

		/* 	SET <effectNote> in <itemData> --------------------------------- */
		rslt = await foundry.utils.setProperty(itemData, ATTR_EFF_NOTE, effectNote);
		if (!rslt) {
			console.warn(_VERSION, WRN_MSG_PROP, ATTR_EFF_NOTE, WRN_MSG_NOT, effectNote );
		}

		/*	SET "Save" <save> to <itemData.system.actions.0.save> ----- */
		const ATTR_ITM_ACT_SAV = "system.actions.0.save";
		const ATTR_ACT_SAV_DC = "save.dc";
		const ATTR_ACT_SAV_DESC = "save.description";
		const ATTR_ACT_SAV_TYP = "save.type";
		const saveFromItemData = foundry.utils.getProperty( itemData, ATTR_ITM_ACT_SAV );

	/*	CREATE <actions> in <buff> ------------------------------------------ */
		try {
			await pf1.components.ItemAction.create(createActionsData(buff, saveFromItemData), { parent: buff })
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff.name, ", Action: [ createActionsData() ], failed to write.");
			return;
		}

	/*	CREATE <changes> in <buff> ----------------------------------------- */
		try {
			await pf1.components.ItemChange.create(createChangesData(buff, effect, frequency), { parent: buff })
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff.name, ", Action: [ createChangesData() ], failed to write.");
			return;
		}
		
	/*	CREATE <scriptCalls> in <buff> ------------------------------------- */
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

function hasCondition(content, cond) {
	//	See if the passed in "Effect" line holds a known Condition
	return cond.find(f => content.includes(f))||"";
}

function abilities() {
	return [
		{ key: "str", value: ["strength", "str", "st"]},
		{ key: "dex", value: ["dexterity", "dex", "dx"]},
		{ key: "con", value: ["constitution", "con", "cn"]},
		{ key: "int", value: ["intelligence", "int", "in"]},
		{ key: "wis", value: ["wisdom", "wis", "ws"]},
		{ key: "cha", value: ["charisma", "cha", "ch"]}		
	]
}

function isAbility(t) {
	return abilities().some(s => s.value.includes(t.toLowerCase()));
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

function isDuration(t) {
	return durations().some(s => s.value.includes(t.toLowerCase()));
}

function savingThrows() {
	return [
		{ key: "fort", value: ["fortitude", "fort", "for", "fo", "f"] },
		{ key: "ref", value: ["reflex", "ref", "re", "r"] },
		{ key: "will", value: ["will", "wi", "w"] }
	];
}

function isSavingThrow(t) {
	return savingThrows().some(s => s.value.includes(t.toLowerCase()));
}

function damageTypes() {
	return [
		{ key: "acid", value: ["acid"] },
		{ key: "cold", value: ["cold", "ice"] },
		{ key: "electric", value: ["electricity", "electrical", "lightning", "arc"] },
		{ key: "fire", value: ["flame", "fire"] },
		{ key: "sonic", value: ["sonic", "thunder"] },
		{ key: "magic", value: ["magic"] },
		{ key: "force", value: ["force"] },
		{ key: "negative", value: ["negative", "neg"] },
		{ key: "positive", value: ["positive", "pos"] },
		{ key: "slashing", value: ["slashing", "slash", "cut", "s"] },
		{ key: "piercing", value: ["piercing", "pierce", "stab", "p"] },
		{ key: "bludgeoning", value: ["bludgeoning", "bludgeon", "club", "beat", "b"] },
		{ key: "wounds", value: ["wounds", "wound", "critical", "crit", "wnd"] }
	]
}

function isdamageType(t) {
	return damageTypes().some(s => s.value.includes(t.toLowerCase()));
}

function getConditionBreakdown(htm, cond) {
	let condition = "";
	const RGX_COND = /(\w+)\s+(?:for\s+)?(\d+d\d+|\d+)\s+(minutes|rounds|minute|round|turns|hours|weeks|rnds|mins|turn|trns|hour|days|week|rnd|min|trn|hrs|day|wks|hr|wk|r|m|t|h|d|w)/i;
	const rslt = htm.match(RGX_COND);

debugger

	if (rslt) {
		condition = {
			effect: rslt[0],
			name: rslt[1],
			duration: rslt[2],
			units: durations().find(entry => entry.value.includes(rslt[3].toLowerCase())).key||null,
			mult: 1,
			timing: ""
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
		fltrd = cond.find(f => htm.includes(f));
		if (fltrd) {
			condition = {
				effect: fltrd,
				name: fltrd,
				duration: -1,
				units: "",
				mult: 1,
				timing: ""
			}
		}
	}
	const timing = getTiming(htm, condition.name);
	condition.timing = timing;
	return condition;
}

function getTiming(htm, txt, part) {
	// 	locate a condition, an effect or a damage type
	//	one of { initial: 'i', secondary: 's', effect: 'e' }
	regex = RegExp(txt);	// does not include 'i' for case indifference
	RGX_INI = /initial/i;
	RGX_SEC = /secondary/i;
	let arr = [], rslt = "";
	const srcs = foundry.utils.parseHTML(htm);
	for (let src of srcs) {
		if (typeof part === "undefined" ) {
			part = txt;
		}
		if (!src.nextSibling.textContent.includes(part)) continue;
		let idx = src.nextSibling.textContent.toLowerCase().search(regex);
		if (idx !== -1) {
			//	<txt> is in this Node
			let i = src.innerText.search(RGX_INI);
			let s = src.innerText.search(RGX_SEC);
			if (typeof part === "undefined") {
				part = txt;
			}
			if (i !== -1) { 		//}) && src.outerText.toLowerCase().includes("initial")) {
				rslt = "i";
			} else if (s !== -1) {	//} && src.outerText.toLowerCase().includes("secondary")) {
				rslt = "s";
			} else {
				rslt = "e";
			}
		}
	}
	return rslt;
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

function extractEffect(htm) {
	let arr = [], eff = "";
	const rslt = getEachEffect(htm);
	if (rslt) {
		for (let r of rslt) {
			eff = getEffectBreakdown(r, htm);
			arr.push(eff);
		}
	}
	return arr;
}

function getEachEffect(htm) {
	const RGX_EA_EFF = /(\d+(?:d\d+)?)\s+(str|dex|con|int|wis|cha|acid|cold|electricity|fire|sonic|magic|force|negative|positive)(?:\s+damage)?/gi;
	let rslt = "";
	rslt = htm.match(RGX_EA_EFF);
	return rslt;
}

function getEffectBreakdown(txt, htm) {
	const RGX_EFF_BRKD = /(?<number>\d+(?:d\d+)?)\s+(str|dex|con|int|wis|cha|acid|cold|electricity|fire|sonic|magic|force|negative|positive)(?:\s+damage)?/i;
	let rslt = null;
	const srcs = txt.match(RGX_EFF_BRKD);
	if (srcs) {
		rslt = {
			effect: txt,
			ability: srcs[2].toLowerCase(),
			amount: srcs[1],
			timing: ""
		}
		rslt.timing = getTiming(htm, rslt.ability, txt);
	}
	return rslt;
}

function extractCure(d) {
	const TXT_CURE = "<strong>Cure</strong> 1 save";
	let htm = "", fltrd = "";
	let rslt = extractFromHTML(d, "Cure");
	if (!rslt) {
		htm = TXT_CURE;
	} else {
		htm = rslt;
	}
	const RGX_CURE = /<(\w+)>Cure<\/\1>\s+(\d+)\s+(consecutive\s+)?(save[s]?)/i;
	fltrd = htm.match(RGX_CURE);
	const consec = htm.toLowerCase().includes("consecutive");
	if (fltrd) {
		rslt = {
			html: fltrd[0],
			savesNeeded: Number(fltrd[2]),
			consecutive: ((!consec) ? -1 : 0)
		};
	} else {
		rslt = null;	
	}
	return rslt;
}

function includeCureValueLine(d, r, c, v) {
	const lineCnV = "<p>" + c.html + "; " + v + "</p>";
	let rslt = "";
	for (let l of d) {
		if (!r) {
			//	No "Cure" line exists, have to insert after last "Effect" line.
			if (l.innerText.toLowerCase().includes("effect")) {
				rslt += l.outerHTML + lineCnV;
			} else {
				rslt += l.outerHTML;
			}
		} else {
			//	Replace existing "Cure" line with new <lineCnV>.
			if (l.innerText.toLowerCase().includes("cure")) {
				rslt += lineCnV;
			} else {
				rslt += l.outerHTML;				
			}
		}
	}
	return rslt;
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
			html: "<em>Only occurs once.</em>",
			duration: 0,
			units: "none"
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

function createChangesData(d, e, f) {
	//	CREATE a new <changes> object for each type of damage listed in Details
	//		SET <target> to damage type (mostly an ability)
	//		SET <formula> to number or in case of dice; "-floor(random() * [ size of dice ] + 1) +@dFlags.poison(poison name).(target)
	//		ENSURE <operator> is "add"
	//		LOOP as needed
	const changes = [];
	//	Language dependent
	const TXT_CHG_INIT = "[Initital]";
	const TXT_CHG_SEC = "[Secondary]";

	for (let effect of e) {
		if (!damageTypes().find(f => f.key === effect.ability)) {
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
			formula = `-${amount}`;
			let timing = (effect.timing === "i") ? TXT_CHG_INIT : (effect.timing === "s") ? TXT_CHG_SEC : "";
			if (f.duration !== 0 && effect.timing !== "i") {
				//	cumulative damage kept
				formula =  `(${formula} + ${dFlags})`;
			}
			formula += timing;
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
		if (isAbility(effect.ability)) {
			//	only add in actual "abilities"
			buffData.system.flags.dictionary[effect.ability] = 0;
		}
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
	const TXT_EFF_NOTE = "<strong>Effect:</strong> ";
	const TXT_EFF_NOTE_APPLY = "@Apply[REPLACE_EFFECT_WITH_BUFF_UUID]";
	const TXT_INI_NOTE = "<strong>Initial:</strong> ";
	const TXT_INI_NOTE_APPLY = "@Apply[REPLACE_INITIAL_WITH_BUFF_UUID]";
	const TXT_SEC_NOTE = "<strong>Secondary:</strong> ";
	const TXT_SEC_NOTE_APPLY = "@Apply[REPLACE_SECONDARY_WITH_BUFF_UUID]";
	let ieTrip = false, icTrip = false, seTrip = false, scTrip = false, eeTrip = false, ecTrip = false;
	let effect = "", cond = "";
	let effectNote = TXT_NOTE_START;
	if (c) {
		cond = _buildConditionPortion(c);
	}
	if (o) {
		effectNote += o.html;
	} 
	if (i) {
		effectNote += TXT_INI_NOTE;
		if (e) {
			for (let eff of e) {
				if (eff.timing === "i") {
					if (isAbility(eff.ability)) {
						ieTrip = true;
						effectNote += TXT_INI_NOTE_APPLY;
					}
				}
			}
		}
		if (c && cond.timing === "i") {
			icTrip = true;
			if (ieTrip) {
				effectNote += " and ";
			}
			effectNote += cond.content;
		}
	} 
	if (s) {
		if (ieTrip || icTrip) {
			effectNote += "<br>";
		}
		effectNote += TXT_SEC_NOTE;
		if (e) {
			for (let eff of e) {
				if (eff.timing === "s") {
					if (isAbility(eff.ability)) {
						seTrip = true;
						effectNote += TXT_SEC_NOTE_APPLY;
					}
				}
			}
		}
		if (c && cond.timing === "s") {
			scTrip = true;
			if (seTrip) {
				effectNote += " and ";
			}
			effectNote += cond.content;
		}
	}
	if (!i && !s) {
		effectNote += TXT_EFF_NOTE;
		if (e) {
			eeTrip = true;
			effectNote += TXT_EFF_NOTE_APPLY;
		}
		if (cond) {
			ecTrip = true;
			if (eeTrip) {
				effectNote += "<br>";
			}
			effectNote += cond.content;
		}
	}
	effectNote += "</span>";
	return effectNote;
}

function _buildConditionPortion(c) {
	const TXT_COND_START = `@Condition[${c.name}`;
	const TXT_COND_DUR = ";duration=";
	let rslt = "";
	let txtCond = TXT_COND_START;
	if (c) {
		if (c.duration === -1) {
			//	no duration present
			txtCond += "]";
		} else if (c.mult !== 1 && c.units === "round" && !Number.isInteger(c.duration)) {
			//	die expression present
			txtCond += TXT_COND_DUR + c.duration + "*" + c.mult + "]";
		} else {
			//	regular amount/time
			txtCond += TXT_COND_DUR + c.duration + " " + c.units + "]";
		}
		rslt = {
			content: txtCond,
			timing: c.timing
		}
	}
	return rslt;
}
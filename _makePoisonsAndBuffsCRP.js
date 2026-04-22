const _VERSION = '0.4.33';
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
	const UUID_CURE_CHK = "Compendium.crp-contents.crp-macros.Macro.wEGLTOmr7iSa5E3l";
	const UUID_TOGGLE_CHK = "Compendium.crp-contents.crp-macros.Macro.0kwyj53zVj6I6rKs";

	let srcs = '', fltrd = '', rslt = '', msg = '', obj = [];

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
	
/*	REMOVE the wrapping tags. ---------------------------------------------- */
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
		const name = "Aconite root";
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
		result = await countOccurrences(rslt, obj);
		if (!result) {
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
	const REPLACE_THIS_WITH_BUFF_UUID = "REPLACE_THIS_WITH_BUFF_UUID";

	const ATTR_UKN_NAME = "system.unidentified.name";
	const ATTR_UKN_DESC = "system.description.unidentified";
	const ATTR_KNWN_DESC = "system.description.value";
	const ATTR_KNWN_PRC = "system.price";
	const ATTR_FLDR = "folder";
	const ATTR_PACK = "pack";
	const ATTR_ITM_IDNT = "system.identified";
	const ATTR_ITM_CARRIED = "system.carried";
	const ATTR_ITM_EQP = "system.equipped";
	const ATTR_ITM_SYS_TAG = "system.tag";
	const ATTR_ITM_STS_DSRC = "_stats.duplicateSource";
	const ATTR_ITM_STS_CSRC = "_stats.compendiumSource";
	const ATTR_ITM_ACT_NOTE_EFF = "system.actions.0.notes.effect.0";
	const ATTR_ITM_ACT_SAV_DESC = "system.actions.0.save.description";
	const ATTR_EFF_NOTE = "system.effectNotes.0";
	const ATTR_QUICKBAR = "system.showInQuickbar";
	
	const TXT_UNK_NAME = "Vial of liquid";
	const TXT_UNK_DESC = "<p>Some liquid in a vial.</p>";
	const TXT_CURE = "<strong>Cure</strong> 1 save";
	const TXT_NOTE_START = `<span style="font-size:1.2em">`;
	const TXT_NOTE_APPLY = " @Apply[" + REPLACE_THIS_WITH_BUFF_UUID + "]<br>";
	
	const RGX_LST_P = /<\/p>$/;
	
	for (const s of srcs) {
		let descHTML = "", itemName = "", buffName = "";
		let cure = "", frequency = "", price = "", effect = "", onset = "";
		let secondary = "", primary = "", condition = "";

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

/*	SET <Unidentified Name> to "Vial of liquid". --------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_UKN_NAME, TXT_UNK_NAME);
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_UKN_NAME, "] not set to:", TXT_UNK_NAME);
		}

/*	SET <Superficial Details> to "Some liquid in a vial. ------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_UKN_DESC, TXT_UNK_DESC);
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_UKN_DESC, "] not set to:", TXT_UNK_DESC );
		}

/*	SET	<equipped> to FALSE. ----------------------------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_ITM_EQP, false);
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_EQP, "] not set to:", false );
		}

/*	SET <carried> to FALSE. ------------------------------------------------ */
		result = await foundry.utils.setProperty(itemData, ATTR_ITM_CARRIED, false);
		if (!result) {
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
		result = extractFromHTML(descHTMLParsed, "Cure");
		if (!result) {
			cure = await extractCure(TXT_CURE);
		} else {
			cure = await extractCure(result);
		}

/*	-------	BUILD "Cure; Value" line. -------------------------------------- */
		if (!descHTML.includes('Cure')) {			
			descHTML = descHTML + "<p>" + cure.html + "; " + TXT_VALUE + "</p>";
		} else {
			descHTML = descHTML.replace(RGX_LST_P, ("; " + TXT_VALUE)) + "</p>";
		}

/*	---	SET updated <Identified Properties> -------------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_KNWN_DESC, descHTML);
		if (!result) {
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
		result = extractFromHTML(descHTMLParsed, "Frequency");
		frequency = await extractFrequency(result);
		if (!frequency) {
			const WRN_MSG_FREQ = `Could not locate any "Frequency" information from item description.`;
			console.warn(_VERSION, WRN_MSG_FREQ );
		}

/*	---	POPULATE <savingThrowEffect>. -------------------------------------- */
		const savingThrowEffect = TXT_NOTE_START + frequency.html + "<br>" + cure + "</span>";

/*	---	SET <savingThrowEffect>. ------------------------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_ITM_ACT_SAV_DESC, savingThrowEffect);
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_ACT_SAV_DESC, "] not set to:", savingThrowEffect );
		}

/*	CLEAR any pre-existing <actionEffect>. --------------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_ITM_ACT_NOTE_EFF, "");
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_ACT_NOTE_EFF, "] not set to:", " " );
		}

/*	SET <identified> flag to FALSE. ---------------------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_ITM_IDNT, false);
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_IDNT, "] not set to:", false );
		}

/*	SET destination <folder> within Compendium ----------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_FLDR, CRP_FLDR_ITM_PSN);
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_FLDR, "] not set to:", CRP_FLDR_ITM_PSN );
		}

/*	SET <duplicateSource> to originating item UUID. ------------------------ */
		result = await foundry.utils.setProperty(itemData, ATTR_ITM_STS_DSRC, itemUuid);
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_ITM_STS_DSRC, "] not set to:", savingThrowEffect );
		}

/*	SET <pack> to proper Compendium. --------------------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_PACK, CRP_ITEMS);
		if (!result) {
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
		result = extractFromHTML(descHTMLParsed, "Onset").replace(`; ${frequency.html}`, '');
		if (result) {
			onset = extractOnset(result);
		}

/* 	---	EXTRACT "Primary". ------------------------------------------------- */
		result = extractFromHTML(descHTMLParsed, "Primary");
		if (result) {
			primary = extractPrimary(result);
		}

/* 	---	EXTRACT "Secondary". ----------------------------------------------- */
		result = extractFromHTML(descHTMLParsed, "Secondary");
		if (result) {
			secondary = extractSecondary(result);
		}

/* 	---	EXTRACT "Effect". -------------------------------------------------- */
		result = extractFromHTML(descHTMLParsed, "Effect");
		if (result) {
			effect = extractEffect(result);
/* 	-------	CHECK if "Effect" has a "Condition". --------------------------- */
			if (hasCondition( result, conditions )) {
/* 	-----------	EXTRACT "Condition". --------------------------------------- */
				condition = getConditionBreakdown(result);
			}
		}

/* 	---	POPULATE <effectNote>. --------------------------------------------- */
		let effectNote = TXT_NOTE_START + onset.html + TXT_NOTE_APPLY + "</span>";
	
/*
	CREATE a new BUFF item placed in "Compendium.crp-contents.crp-items" in 
		folder "BUFFS", subfolder "Poisons".
*/

/* 	---	CREATE an instance of [ItemPF]. ------------------------------------ */
		let buff = await new pf1.documents.item.ItemPF({
			name: `Poison (${itemName.toLowerCase()})`,
			type: "buff",
			img: itemData.img,
			_id: randomID(16),
		});
		if (_VERBOSE) {
			console.log(_VERSION, 'buff', buff);
		}

/*
	---	SET buffUuid of associated Poison Item to newly created BUFF buffUuid. 
*/

/* 	-------	CREATE <buffUuid>. --------------------------------------------- */
		const buffUuid = "Compendium." + CRP_ITEMS + ".Item." + buff._id;

/*	-------	SET <system.tag> to 'poison' ----------------------------------- */
		result = await foundry.utils.setProperty(buff, ATTR_ITM_SYS_TAG, 'poison');

/* 	-------	UPDEATE Item <effectNote> with <buffUuid>. --------------------- */
		effectNote = await effectNote.replace(REPLACE_THIS_WITH_BUFF_UUID, buffUuid);

/* 	-------	SET <effectNote> in <itemData>. -------------------------------- */
		result = await foundry.utils.setProperty(itemData, ATTR_EFF_NOTE, effectNote);
		if (!result) {
			console.warn(_VERSION, "itemData property [", ATTR_EFF_NOTE, "] not set to:", effectNote );
		}

/* 	---	EXTRACT the data structure from <buff> for further processing. ----- */
//		let buffData = await game.items.fromCompendium(buff);

/*	---	SET <description> to same description from <item>. ----------------- */
		result = await foundry.utils.setProperty(buff, ATTR_KNWN_DESC, descHTML);
		if (!result) {
			console.warn(_VERSION, "buff property [", ATTR_KNWN_DESC, "] not set to:", result );
		}

/*	---	SET <pack> to proper Compendium. ----------------------------------- */
		try {
			result = await foundry.utils.setProperty(buff, ATTR_PACK, CRP_ITEMS);
		} catch (error) {
			console.warn(_VERSION, "buff property [", ATTR_PACK, "] not set to:", CRP_ITEMS );
		}

/*	---	SET <folder> to proper Folder in the Compendium. ------------------- */
		try {
			result = await foundry.utils.setProperty(buff, ATTR_FLDR, CRP_FLDR_BFF_PSN);
		} catch (error) {
			console.warn(_VERSION, "buff property [", ATTR_FLDR, "] not set to:", CRP_FLDR_BFF_PSN );
		}

/*	---	SET <showInQuickbar> to TRUE. -------------------------------------- */
		result = await foundry.utils.setProperty(buff, ATTR_QUICKBAR, true);
		if (!result) {
			console.warn(_VERSION, "buff property [", ATTR_QUICKBAR, "] not set to:", true );
		}

/*	---	CREATE two new <action> objects, one for "Save" one for "Cure". ----- */
		const TXT_ACT_TYP_SAV = "save";
		const TXT_ACT_TYP_OTH = "other";
		let actSave = new pf1.components.ItemAction({ 
			name: "Save", 
			key: randomID(16), 
			actionType: TXT_ACT_TYP_SAV,
			img: buff.img 
		});
		let actCure = new pf1.components.ItemAction({ 
			name: "Cured", 
			key: randomID(16), 
			actionType: TXT_ACT_TYP_OTH,
			img: buff.img 
		});
	
/*	-------	SET "Save" <tag> to "save". ------------------------------------ */
		const ATTR_ACT_TAG = "tag";
		const TXT_ACT_TAG_SAV = "save";
		try {
			await foundry.utils.setProperty(actSave, ATTR_ACT_TAG, TXT_ACT_TAG_SAV);
		} catch (error) {
			console.warn(error, _VERSION, "Buff:", buff.name, ", Action:", actSave.name, ", may have failed to set <tag> to:", TXT_ACT_TAG_SAV);
		}
	
/*	-------	SET "Save" <activation.type> to "nonaction". ------------------- */
		const TXT_ACT_TYP_NON = "nonaction";
		const ATTR_ACT_ACTV_TYP = "activation.type";
		result = foundry.utils.setProperty(actSave, ATTR_ACT_ACTV_TYP, TXT_ACT_TYP_NON);
		if (!result) {
			console.warn(_VERSION, "Buff:", buff.name, ", Action:", actSave.name,  ", may have failed to set <activation.type> to:", TXT_ACT_TYP_NON);
		}

/*	-------	SET "Save" <save> to <itemData.system.actions.0.save> ----- */
		const ATTR_ITM_ACT_SAV = "system.actions.0.save";
		const ATTR_ACT_SAV_DC = "save.dc";
		const ATTR_ACT_SAV_DESC = "save.description";
		const ATTR_ACT_SAV_TYP = "save.type";
		console.log(savingThrowEffect);
		const saveFromItemData = foundry.utils.getProperty( itemData, ATTR_ITM_ACT_SAV );
		try {
			await foundry.utils.setProperty(actSave, ATTR_ACT_SAV_DC, saveFromItemData.dc);
			await foundry.utils.setProperty(actSave, ATTR_ACT_SAV_DESC, saveFromItemData.description);
			await foundry.utils.setProperty(actSave, ATTR_ACT_SAV_TYP, saveFromItemData.type);
		} catch (error) {
			console.warn(error, _VERSION, "Buff:", buff.name, ", Action:", actSave.name,  ", failed to set <save> to:", saveFromItemData);
		}

/*	-------	SET  "Cured" <tag> to "cure". ---------------------------------- */
		const TXT_ACT_TAG_CURE = "cure";
		try {
			await foundry.utils.setProperty(actCure, ATTR_ACT_TAG, TXT_ACT_TAG_CURE);
		} catch (error) {
			console.warn(error, _VERSION, "Buff:", buff.name, ", Action:", actCure.name, ", failed to create action:", actSave.name);
		}

/*	-------	SET "Cured" <activation.type> to "nonaction". ------------------ */
		result = foundry.utils.setProperty(actCure, ATTR_ACT_ACTV_TYP, TXT_ACT_TYP_NON);
		if (!result) {
			console.warn(_VERSION, "Buff:", buff.name, ", Action:", actCure.name, ", failed to set <activation.type>:", TXT_ACT_TYP_NON);
		}

/*	---	WRITE <actSave> to <buffData> -------------------------------------- */
		// 	doesn't seem to carry <save> info over so will apply <actSave> to
		//	<buff> itself.
		try {
			result = await buff.actions.set(actSave._id, actSave);
//			result = await buffData.system.actions.push(actSave);
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff.name, ", Action:", actSave.name, ", failed to write.");
			return;
		}

/*	---	WRITE <actCure> to <buffData> -------------------------------------- */
		// 	doesn't seem to carry <save> info over so will apply <actCure> to
		//	<buff> itself.
		try {
			result = await buff.actions.set(actCure._id, actCure);
//			result = await buffData.system.actions.push(actCure);
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff.name, ", Action:", actCure.name, ", failed to write.");
			return;
		}

/*	---	CREATE <buffData> from <buff> ------------------------------------ */
		let buffData = "";
		try {
			buffData = await game.items.fromCompendium(buff);
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buff, ", failed to extract <buffData>.");			
		}
		await buffData.system.actions.push(actSave);
		await buffData.system.actions.push(actCure);
		
/*	---	LOG <buffData> if _VERBOSE ----------------------------------------- */
		if (_VERBOSE) {
			console.log(_VERSION, '<buffData>:', buffData);
		}

/* 	
	---	SET "on-use" macro "buffCureCheck" to "Compendium.crp-contents.crp-macros.Macro.wEGLTOmr7iSa5E3l"
*/

/* 
	---	SET "on-toggle" macro "buffToggleCheck" to "Compendium.crp-contents.crp-macros.Macro.0kwyj53zVj6I6rKs"
*/

	if (_SHOW) debugger
		
/*	WRITE new Item in Compendium ------------------------------------------- */
		try {
			result = await Item.create(itemData, { pack: CRP_ITEMS, folder: CRP_FLDR_ITM_PSN, source: ("Compendium." + CRP_ITEMS + ".Folder." + CRP_FLDR_ITM_PSN) });
		} catch (error) {
			console.error(error, _VERSION, "Item:", itemData.name, "failed to create.");
			return;
		}
		if (_VERBOSE) {
			console.log(_VERSION, 'create item result:', result);
		}

/*	WRITE new Buff in Compendium ------------------------------------------- */	
		try {
			result = await Item.create(buffData, { pack: CRP_ITEMS, folder: CRP_FLDR_BFF_PSN, source: ("Compendium." + CRP_ITEMS + ".Folder." + CRP_FLDR_BFF_PSN) });
		} catch (error) {
			console.error(error, _VERSION, "Buff:", buffData.name, "failed to create.");
			return;
		}
		if (_VERBOSE) {
			console.log(_VERSION, 'create buff results:', result);
		}
	}

return;

//	CREATE a new BUFF item placed in "Compendium.crp-contents.crp-items" in folder "BUFFS", subfolder "Poisons"
	//	SET itemUuid of associated Poison Item to newly created BUFF itemUuid.
	//	COPY over <details> from Poison Item and write to <Identified Properties>.
	//	SET "on-use" macro "buffCureCheck" to "Compendium.crp-contents.crp-macros.Macro.wEGLTOmr7iSa5E3l"
	//	SET "on-toggle" macro "buffToggleCheck" to "Compendium.crp-contents.crp-macros.Macro.0kwyj53zVj6I6rKs"
	//	CREATE two new <action> objects, on for "Save" one for "Cure"
	const actSave = new pf1.components.ItemAction({ name: "Save", key: randomID(16), actionType: "save", img: buffData.img });
	const actCure = new pf1.components.ItemAction({ name: "Cured", key: randomID(16), actionType: "other", img: buffData.img });
	//		SET "Save" <tag> to "save".
	result = foundry.utils.setProperty(actSave, "tag", "save");
	if (!result) {
		console.error(_VERSION, "Buff:", buffData.name, "failed to create action:", actSave.name);
		return;
	}
	//		SET  "Cured" <tag> to "cure".
	result = foundry.utils.setProperty(actCure, "tag", "cure");
	if (!result) {
		console.error(_VERSION, "Buff:", buffData.name, "failed to create action:", actSave.name);
		return;
	}
	//		SET 
	//	CREATE a new <changes> object for each type of damage listed in Details
	//		SET <target> to damage type (mostly an ability)
	//		SET <formula> to number or in case of dice; "-floor(random() * [ size of dice ] + 1) +@dFlags.poison(poison name).(target)
	//		ENSURE <operator> is "add"
	//		LOOP as needed
	//	CREATE dictionary items for;
	//		<frequencyUnits> (String) {"" for inifinity, "round" for rnds, "turn" for turns, "hour" for hrs, "day" for days}, pulled from "Details".
	//		<frequencyDuration> (Number), pulled from "Details".
	//		<consecutiveSaves> (Number) { -1 if not present, 0 otherwise }, pulled from "Details".
	//		<savesNeeded> (Number) { 1 if not present, ohterwise pulled from "Details"}.
	//		<savesMade> (Number) { 0 }.
	//		<unitsPassed> (Number) { 0 }.
	//		<target> (Number) { 0 }, one for each entry in <changes> above.
	
return

function countOccurrences(arr) {
	return arr.reduce((acc, element) => {
		obj.push(new NameOccursCRP(element.name, (acc[element.name] || 0) + 1 ));
		acc[element.name] = (acc[element.name] || 0) + 1;
		return acc;
		},
		{}
	); // Initialize accumulator as empty object
}

function NameOccursCRP(t, n) {
	this.name = t;
	this.occurs = n;
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

function getConditionBreakdown(eff) {
	let cond = "";
	const RGX_COND = /(\w+)\s+for\s+(\d+(?:d\d+)?)\s+(minutes|rounds|minute|round|turns|hours|weeks|rnds|mins|turn|trns|hour|days|week|rnd|min|trn|hrs|day|wks|hr|wk|r|m|t|h|d|w)\b/i;
	const rslt = eff.match(RGX_COND);
	if (rslt) {
		cond = {
			effect: rslt[0],
			name: rslt[1],
			duration: rslt[2],
			units: durations().find(entry => entry.value.includes(rslt[3].toLowerCase())).key||null,
			mult: 1
		};
		if ((cond.duration.includes("d")) && (cond.units !== "round")) {
			//	We have a die equation that only resolves as "rounds" from
			//	the Enricher.  Get the <mult> for the "units" key from the 
			//	<conditions> dataset and update <cond.mult>.  Units need to
			//	be set to "rounds".
			cond.mult = durations().find(entry => entry.key === cond.units).mult||null;
			cond.units = "round";
		}
	}
	return cond;
}

function extractEffect(htm) {
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

function getEachEffect(eff) {
	const RGX_EA_EFF = /(\d+(?:d\d+)?\s+\w+\s+damage)/gi;
	return eff.match(RGX_EA_EFF);
}

function getEffectBreakdown(txt) {
	const RGX_EFF_BRKD = /(?<number>\d+(?:d\d+)?)\s+(?<word>\w+)/i;
	const rslt = txt.match(RGX_EFF_BRKD);
	if (rslt) {
		return {
			effect: txt,
			ability: rslt[2].toLowerCase(),
			amount: rslt[1]
		}
	}
	return null;
}

function extractCure(htm) {
	const RGX_CURE = /<(?:[^>]+)>Cure<\/(?:[^>]+)>\s(\d+)\ssave[s]?/i;
	const rslt = htm.match(RGX_CURE);
	if (rslt) {
		return {
			html: rslt[0],
			savesNeeded: Number(rslt[1])
		}
	}
	return null;
}

function extractPrimary(htm) {
	return null;
}

function extractSecondary(htm) {
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
	}
	return null;
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

function getFrequencyBreakdown(HTML) {
	const RGX_FREQ = /<strong>Frequency<\/strong>\s*([^<]+)/;
	return HTML.match(RGX_FREQ);
}

function objects() {
	/* ---- object definition for 'useAction' macro ---------------------------------------	*/
	let myObj1 = {
		category: "use",
		hidden: false,
		img: "modules/game-icons-net-font/svg/movement-sensor.svg",
		name: "useAction",
		type: "macro",
		value: "Macro.VgwfQ1Hk2rC4NOXB",
		_id: ""
	}
// Compendium.world.crp-macros.Macro.VgwfQ1Hk2rC4NOXB	
/* ----	object definition for 'updateCastings' macro ----------------------------------	*/
	let myObj2 = { 
		category: "postUse", 		// watch capital on 'U'
		hidden: false, 
		img: "icons/magic/life/crosses-trio-red.webp", 
		name: "updateCastings", 
		type: "macro", 
		value: "Macro.A1aJCl2GXOksQe8J", 
		_id: "" 
	}

}
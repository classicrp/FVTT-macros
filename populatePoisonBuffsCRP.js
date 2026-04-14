const _VERSION = '0.1.6';
const _SHOW = true;		// 	debug point flag
const _VERBOSE = true;	//	console.log() flag
const _PAUSED = true;	//	pause at specified point flag
const _TEST = true;		//	test mode flag
const _MEMTEST = true;	//	virtual memory heap dump flag
/*  
	Special Thanks: With help from the crew on Discord::FVTT#macro-polo; 
					@Micheal, @Zhell and mentions to @Freeze amd @Flix for 
					spectating in this latest round of Code Golf.  Fore!
*/
	if (_SHOW) debugger
	const crlf = String.fromCharCode(13).concat(String.fromCharCode(10));
/*
	GET Poison items from non-CRP Compendium packs.
*/
	let srcs = '', fltrd = '', rslt = '', obj = [];
	if (_TEST) {
	//	_TEST CASE "Dragon bile"
		const name = "Aconite root";
		const myPack = "crp-contents.crp-items";
		//	this handles a specific request that returns all copies in Compendiums
		srcs = await game.packs?.filter(f => f.title.toLowerCase().includes('item')).map(g => g.index.getName(name)).filter(g => (typeof g !== 'undefined'));
		
	} else {
		//	this handles the top set of items with each index for a Compendium,
		//	that needs to be manually filtered.
		srcs = await game.packs?.filter(f=> f.title.toLowerCase().includes('item')).map(g => g.index);
		//	returns a Collection of Collections
		for (const c of srcs) {
			for (const s of c) {
				if (s.type === 'consumable' && s.system.subType === 'poison') {
					rslt.push(s);
				}
			}
		}
		await rslt.sort(function(a, b){
			let x = a.name.toLowerCase();
			let y = b.name.toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});
		await countOccurrences(rslt, obj);
		fltrd = obj.filter(f => f.occurs > 1);
		if (_VERBOSE) console.log(_VERSION, 'fltrd:', fltrd, crlf, 'rslt:', rslt);
		srcs = await rslt.filter(a => !fltrd.some(b => b.name === a.name));
	}
	if (_MEMTEST) {
		rslt = null;
		fltrd = null;
		obj = null;
	}
	if (_VERBOSE) console.log(_VERSION, 'srcs:', srcs);
/*
	CREATE a copy of Poison item in "Compendium.crp-contents.crp-items" in folder "ITEMS", 
		subfolder "Poisons" for each not already there.
*/
//	Paths
	const UKN_NAME = "Vial of liquid";
	const UKN_NAME_ATTR = "system.unidentified.name";
	const UKN_DESC = "<p>Some liquid in a vial.</p>";
	const UKN_DESC_ATTR = "system.description.unidentified";
	const KNW_DESC_ATTR = "system.description.value";
	const KNW_PRICE_ATTR = "system.price";
	const SAV_NOTE_ATTR = "system.actions[0].notes.effect[0]";
	
	let knwDesc = "";
	for (const s of srcs) {
		const uuid = s.uuid;
		if (_VERBOSE) console.log(_VERSION, "uuid", uuid);
		const item = await fromUuid(uuid);
		if (_VERBOSE) console.log(_VERSION, "item", item);
		const itemData = game.items.fromCompendium(item);
		if (_VERBOSE) console.log(_VERSION, "itemData", itemData);
		
		//	SET <Unidentified Name> to "Vial of liquid".
		foundry.utils.setProperty(itemData, UKN_NAME_ATTR, UKN_NAME);
		//	SET <Superficial Details> to "Some liquid in a vial."
		foundry.utils.setProperty(itemData, UKN_DESC_ATTR, UKN_DESC);
		//	GET <Identified Properties>
		//		ADD at top "<h3>" + <Item.name> + "</h3>"
		//		INSERT after "Cure..." - "</p>" + "; <b>Value</b> " + <price> + " gp.</p>"
		knwDesc = foundry.utils.getProperty(itemData, KNW_DESC_ATTR);
		const header = `<h3>${itemData.name}</h3>`;
		knwDesc = header + knwDesc;
		if (!knwDesc.includes('Cure')) {
			const cure = `<p><strong>Cure</strong> 1 save; <strong>Value</strong> ${itemData[KNW_PRICE_ATTR]} gp.</p>`;
			knwDesc = knwDesc + cure;
		} else {
			const cure = `; <strong>Value</strong> ${itemData[KNW_PRICE_ATTR]} gp.</p>`;
			knwDesc = knwDesc.replace(/<\/p>$/, `; <strong>Value</strong> ${itemData[KNW_PRICE_ATTR]} gp.</p>`);
		}
		foundry.utils.setProperty(itemData, KNW_DESC_ATTR, knwDesc);
		//	SET <action['Use'].SavingThrowEffect> = <span style="font-size:1.2em"><b>Frequency:</b> " + (frequency from details) + "<br><b>Cure:</b> " + 
		//		(cure from details OR 1 if none exists there) + " save(s)</span>"
		
		//	await Item.create(itemData, {parent: actor});
		if (_SHOW) debugger
	}

return;


	//	SET <effectNotes> = "<span style="font-size:1.2em"><b>Effect:</b> + effect from details + @Apply[ (place uuid for the poison's buff here)]<br> + 
	//		IF a secondary item exists add "<b>Secondary:</b> " + 
	//		IF a Condition exists, add; "@Condition[ (condition lowercase name)" + ";duration=" + Set duration as a die roll/number only for "rnds"
	//				content (if you want it to last random "m" minutes, "t" turns, "h" hours, "d" days, then multilpy by
	//				10 for "m",
	//				100 for "t", 
	//				600 for "h" 
	//				14400 for "d" )
	//				OR number + "m" or "t" or "h" or "d" + "]</span>"
	//	SET <action['Use'].SavingThrowEffect> = <span style="font-size:1.2em"><b>Frequency:</b> " + (frequency from details) + "<br><b>Cure:</b> " + 
	//		(cure from details OR 1 if none exists there) + " save(s)</span>"
	
//	CREATE a new BUFF item placed in "Compendium.crp-contents.crp-items" in folder "BUFFS", subfolder "Poisons"
	//	SET uuid of associated Poison Item to newly created BUFF uuid.
	//	COPY over <details> from Poison Item and write to <Identified Properties>.
	//	SET "on-use" macro "buffCureCheck" to "Compendium.crp-contents.crp-macros.Macro.wEGLTOmr7iSa5E3l"
	//	SET "on-toggle" macro "buffToggleCheck" to "Compendium.crp-contents.crp-macros.Macro.0kwyj53zVj6I6rKs"
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
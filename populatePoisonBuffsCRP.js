const version = '0.0.8';
const show = true;
const verbose = true;
const paused = true;
const test = false;

	if (show) debugger
//	TEST CASE "Dragon bile"
	let srcs = '', fltrd = '', rslt = [];
	if (test) {
		const name = "Dragon bile";
		const pack = "crp-contents.crp-items";
		//	this handles a specific request that returns all copies in Compendiums
		rslt = await game.packs?.filter(f => f.title.toLowerCase().includes('item')).map(g => g.index.getName(name)).filter(g => (typeof g !== 'undefined'));
		
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
		const fltrd = countOccurrences(rslt);
		if (verbose) console.log('fltrd:', fltrd);
	}
	if (verbose) console.log('rslt:', rslt);
	if (show) debugger

return;

	const uuid = srcs.uuid;
	// if (verbose) console.log(version, "uuid", uuid);
	const item = await fromUuid(uuid);
	if (verbose) console.log(version, "item", item);
	const itemData = game.items.fromCompendium(item);
	if (verbose) console.log(version, "itemData", itemData);
//	await Item.create(itemData, {parent: actor});

//	GET Poison items from non-CRP Compendium packs.

//	CREATE a copy of Poison item in "Compendium.crp-contents.crp-items" in folder "ITEMS", subfolder "Poisons" for each not already there.
	//	SET <Unidentified Name> to "Vial of liquid".
	//	SET <Superficial Details> to "Some liquid in a vial."
	//	GET <Identified Properties>
	//		ADD at top "<h3>" + <Item.name> + "</h3>"
	//		INSERT after "Cure..." - "</p>" + "; <b>Value</b> " + <price> + " gp.</p>"
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
		acc[element.name] = (acc[element.name] || 0) + 1;
		return acc;
		},
		{}
	); // Initialize accumulator as empty object
}
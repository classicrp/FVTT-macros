/*
	==========================================================================
	Macro Title: Spell Reset Daily Castings Macro for Foundry VTT PF1e
	Author: classicrp, @raydenx (https://github.com/classicrp)
	Last updated 2026-06-19
	License: MIT License
	
	Description:
	Allows the GM or Player to reset the 'castings' flag on each spell back
	to zero for the day.  Meant to be used with Spell Points for "primary"
	spells.  Will also reset the amount of Spell Points the actor has back
	to its maximum value (since the existing "Rest" option does not cover
	the optional "Spell Points" rules).
	
	Usage: Run the macro from the character's spell casting class feature
	(i.e. Wizard Spells) by executing the "Reset" option.
	Foundry Version: v12+ / v13.351
	
	Dictionary: Source Feature must have "spellbook" defined as one of;
				{"primary" , "secondary", "tertiary", "spelllike"}
  	<actor> is passed in directly from the activating feature. Required in
    order to set the dictionary value on said item.
	Returns: null
	NOTE: don't reference dictionary .value itself as it gets stored as Object
			instead of Number.
	==========================================================================
*/

	const curVer = "v2.28";
	const head = `Macro.spellResetDailyCastings(${curVer}): `;
	let msg = "";
	let failState = false;
	const _deleteScriptCalls = "Compendium.crp-contents.crp-macros.Macro.WzUVhGzEHPyY67kY";
	//"WzUVhGzEHPyY67kY";
//	=========================================================

    if (action.tag !== "reset") {
        //  not this macro
        return;
    }

//debugger

	let attr = "system.flags.dictionary.castings";
	let level = -1;
	let mflag = false;

	//	get the name of the spellbook we want
	const spBook = item.getItemDictionaryFlag('spellbook');
	//system.flags.dictionary.spellbook;	//	i.e. 'primary'
	const spBookTag = item.system.tag;
	//	grab all spellbook spells on actor
	let spells = await actor._itemTypes.spell;
	//	filter spells to only include the requested spellbook, sort be level
	let mspells = await spells.filter(s => ( s.system.spellbook === spBook ))
		.sort(function(a, b){
			let x = a.system.level;
			let y = b.system.level;
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});

	let spBookSrc = await actor.system.attributes.spells.spellbooks[spBook].spellPoints.maxFormula;	
	//	i.e. '@resources.witchSpells.value'

/* ---- Check that we are using correct amount for spellbook total spell points -------	*/
	if (spBookSrc.includes(".value")) {
		//	an older iteration, change to <.max>
		spBookSrc = spBookSrc.replace(".value", ".max");
		mflag = true;
	} else if (spBookSrc.includes(".vigor")) {
		spBookSrc = `@resources.${spBookTag}.max`;
		mflag = true;
	}
	if (mflag) {
		const spAttr = `system.attributes.spells.spellbooks.${spBook}.spellPoints.maxFormula`;
		await actor.update({ [spAttr]: spBookSrc });
		console.log(`${actor.name}: Spellbook (${spBook}) updated to correct max spellPoint formula.`);
	}
/* ----	object definition for 'spellPoints' -------------------------------------------	*/
	const spellPoints = {
		cost: ""
	}

/* ---- object definition for 'useAction' macro ---------------------------------------	*/
	let myObj1 = {
		category: "use",
		hidden: false,
		img: "modules/game-icons-net-font/svg/movement-sensor.svg",
		name: "useAction",
		type: "macro",
		value: "Compendium.crp-contents.crp-macros.Macro.VgwfQ1Hk2rC4NOXB",
		_id: ""
	}
	
/* ----	object definition for 'updateCastings' macro ----------------------------------	*/
	let myObj2 = { 
		category: "postUse", 		// watch capital on 'U'
		hidden: false, 
		img: "icons/magic/life/crosses-trio-red.webp", 
		name: "updateCastings", 
		type: "macro", 
		value: "Compendium.crp-contents.crp-macros.Macro.A1aJCl2GXOksQe8J", 
		_id: "" 
	}

	let fZero = false, fOne = false, fTwo = false;
	const m1n = myObj1.name, m2n = myObj2.name;
	const lm = await fromUuid(_deleteScriptCalls);
	//game.macros.get(_deleteScriptCalls);

//debugger;
//	code to update a meter.					
/*	let dot = "", char = "#";
	let j = 0, numSpells = mspells.length;
*/		
	for (const s of mspells) {
/*		let percentage = Math.floor((j + 1) / numSpells) * 100;
		dot = `( ${char.repeat(percentage)} )`;   
		ui.notifications.info(`Please wait while updating ${actor.name}'s spellbook<br/>${dot}!`);
		j++;
*/
/* ---- Grab each spell in the spellbook ----------------------------------------------	*/
		// s = s.toObject();
debugger
		spells = true;
		let mitem = actor.items.get(s._id);
		if (level !== s.system.level) {
			level = s.system.level;
		}
//		if (level !== 2) continue;
		console.warn("Now working on Level:", level, s.name);

/* ---- See if the 'spellPoints' object is present ------------------------------------	*/
		//	see if spell points are correctly set on spell
		if (foundry.utils.isEmpty(s.system.spellPoints)) {
			//	they are not, add them to the spell
			if (!foundry.utils.isEmpty(s.spellPoints)) {
				//	another failed iteration that needed cleaning
				delete s.spellPoints;
			}
			s.system.spellPoints = spellPoints;
			mitem.update({ ["system"]: spellPoints });
			console.log(`${actor.name} (${s.system.spellbook}): ${s.name}[${level}] added 'spellPoints' to spell.`);
		}

/* ---- See that any manual entry for 'spellPoint' cost is removed --------------------	*/			
		if ((s.system.spellPoints.cost !== "") && (!foundry.utils.isEmpty(s.system.spellPoints.cost))) {
			//  an older copy of the spell, update to use default SP costs
			s.system.spellPoints.cost = "";
			mitem.update({ ["system.spellPoints.cost"]: "" });
			console.log(`${actor.name} (${s.system.spellbook}): ${s.name}[${level}] changed spell cost to default.`);
		}

/* ---- Update dictionary item 'castings' to be zero ----------------------------------	*/
		let mcast = s.getItemDictionaryFlag('castings');
		if (foundry.utils.isEmpty(mcast)) {	
			// 	add in the dictionary name/value pair
			mcast = 1;
			console.log(`${actor.name} (${s.system.spellbook}): ${s.name}[${level}] added dictionary item 'castings'.`);
		} else { 
			//	dictionary item already exists on spell, set back to 0
			if (mcast > 0) {
				console.log(`${actor.name} (${s.system.spellbook}): ${s.name}[${level}] resetting 'castings' for a new day.`);
			}
		}
		if (mcast > 0) {
			s.setItemDictionaryFlag('castings', 0);
		}
			
/* ---- Now check that the proper macros are present ----------------------------------	*/
/*		Issues: 1. 	Having a malformed macro present.  When it is removed, it resets the 
					stack size so iteration should really be called again.
				2.	Having multiple copies of the same macro.  Need to remove one and 
					again iteration should be called again.
*/
/*
		if (typeof s.scriptCalls !== "undefined") {
		//	another legacy Issue 
			delete s.scriptCalls;
			mitem.update({ ["scriptCalls"]: null });
			console.log( `${actor.name} (${s.system.spellbook}): ${s.name}[${level}] cleaned up leftovers.` );
		}
*/		

		let detect = ""
		let mscripts = s.system.scriptCalls;

		if (foundry.utils.isEmpty(mscripts)) {
		//	we have no collection present
//debugger
		/*	CREATE <scriptCalls> in <buff> ------------------------------------- */
			try {
				await pf1.components.ItemScriptCall.create(createScriptCallData(), { parent: mitem })
			} catch (error) {
				console.error(error,"Spell:", s.name, ", Action: [ createScriptCallData() ], failed to write.");
				return;
			}

		} else {
			fZero = hasMalformed( mscripts );
			if (fZero) {
			//	remove the malformed macros
				detect = "malformed";
				while ( hasMalformed( mscripts )) {
					fixMalformed( mscripts, s.scriptCalls );
					repairArray( mscripts );
				}
				console.log( `${actor.name} (${s.system.spellbook}): ${s.name}[${level}] fixed ${detect} macro(s).` );
			} 
			fOne = hasDuplicate( mscripts, m1n );
			if (fOne) {
			//	remove the duplicate macro at current "index", restart the search
				detect = "duplicate";
				if (removeDuplicate( mscripts, m1n )) {
					repairArray( mscripts );
					console.log( `${actor.name} (${s.system.spellbook}): ${s.name}[${level}] removed ${detect} macro.` );
				}
			}
			fTwo = hasDuplicate( mscripts, m2n );				
			if (fTwo) {
			//	remove the duplicate macro at current "index", restart the search
				detect = "duplicate";
				if (removeDuplicate( mscripts, m2n )) {
					repairArray( mscripts );
					console.log( `${actor.name} (${s.system.spellbook}): ${s.name}[${level}] removed ${detect} macro.` );
				}
			}
			await pf1.components.ItemScriptCall.create(createScriptCallData(), { parent: mitem })
//			if (!hasMatch( mscripts, m1n )) {
//			//	first macro missing
//				detect = "nothing";
//				fOne = true;
//				myObj1._id = foundry.utils.randomID(8);
//				await mitem.scriptCalls.set(myObj1._id, myObj1);
//				console.log( `${actor.name} (${s.system.spellbook}): ${s.name}[${level}] added macro 'useAction'.` );
//				
//			}
//			
//			if (!hasMatch( mscripts, m2n )) {
//			//	second macro missing
//				detect = "nothing";
//				fTwo = true;
//				myObj2._id = foundry.utils.randomID(8);
//				await mitem.scriptCalls.set(myObj2._id, myObj2);
//				console.log( `${actor.name} (${s.system.spellbook}): ${s.name}[${level}] added macro 'updateCastings'.` );
//			}
//			*/
		} 
		// if (fZero || fOne || fTwo) {
		//	update whole .scriptCalls
//		mitem.update({ ["system.scriptCalls"]: mscripts });
//		console.log( `${actor.name} (${s.system.spellbook}): ${s.name}[${level}] updated.` );
		// }	
		detect = "";
		//	reset the variables for macro checking
		fZero = false;
		fOne = false;
		fTwo = false;
//debugger;
	}

/* ---- Catch up on made Promises -----------------------------------------------------
	promiseStack.forEach( async p => {
		await p;
	});
	promiseStack = null;
*/
	
//debugger;

/* ---- Update the Feature and spellbook spellPoints value to max ---------------------	*/
	attr = `system.attributes.spells.spellbooks.${spBook}.spellPoints.value`;
	const maxSP = item.system.uses.max;
	//	reset feature (auto every day)
	await item.update({ ["system.uses.value"]: maxSP }); //	keep in for testing-for now
	//	reset spell points for spellbook
	await actor.update({ [attr]: maxSP });

	return;

/* ---- Helper functions --------------------------------------------------------------	*/

	function hasMalformed(a) {
		let result = false;
		for (i = 0; i < a.length; i++) {
			if (typeof a[i] === "undefined") {
				result = true;
			} else if (a[i].name === "") {
				result = true;
			}
		};
		return result;
	}

	function fixMalformed(a, c) {
		let result = false;
		let col = "";
		for (i = 0; i < a.length; i++) {
			if (typeof a[i] === "undefined") {
			//	an empty set that repairArray() will fix
				result = true;
			} else if (detectMalformed(a[i].name)) {
			//	see if the other array is good and patch

				if (typeof c !== "undefined") {
				//	use the collection to repair
					col = c.get(a[i]._id);
					if (a[i].category === "") {
						a[i].category = col.category;
					}
					if (a[i].hidden === "") {
						a[i].hidden = false;
					}
					if (a[i].img === null) {
						a[i].img = col.img;
					}
					if (a[i].name === "") {
						a[i].name = col.name;
					}
					if (a[i].type === "") {
						a[i].type = "macro";
					}
					if (a[i].value === "") {
						a[i].value = col.value;
					}

				} else {
					delete a[i];
				}
				result = true;
			}	
		}
		return result;
	}
	
	function detectMalformed(t) {
		return (t === "");
	}

	function hasDuplicate(a, t) {
		const cDuplicates = a.filter(s => (s.name === t));
		const result = (cDuplicates.length > 1);
		return result;
	}
	
	function removeDuplicate(a, t) {
		let result = false;
		for (i = 0; i < numDuplicates(a, t); i++) {
			delete a[i];
			result = true;
		};
		return result;
	}

	function numDuplicates(a, t) {
		const cDuplicates = a.filter(s => (s.name === t));
		const result = (cDuplicates.length - 1);
		return result;
	}
	
	function hasMatch(a, t) {
		const cMatch = a.filter(s => (s.name === t));
		const result = (cMatch.length === 1);
		return result;
	}
	
	function repairArray(a) {
	//	take the original array and shuffle it around until our object is last
	//	this should re-index the array
		a.reverse();
		a.sort();
		if (hasMalformed(a)) {
			a.pop();
		}
		return;
	}
	
function createScriptCallData() {
	/* object definitions for 'useAction' and 'updateCastings' macros -- */
	const result = [
		{
			category: "use",
			hidden: false,
			img: "modules/game-icons-net-font/svg/movement-sensor.svg",
			name: "useAction",
			type: "macro",
			value: "Compendium.crp-contents.crp-macros.Macro.VgwfQ1Hk2rC4NOXB",
			_id: foundry.utils.randomID(8)
		},
		{
			category: "postUse", 		// watch capital on 'U'
			hidden: false, 
			img: "icons/magic/life/crosses-trio-red.webp", 
			name: "updateCastings", 
			type: "macro", 
			value: "Compendium.crp-contents.crp-macros.Macro.A1aJCl2GXOksQe8J", 
			_id: foundry.utils.randomID(8)
		}
	];
	return result;
}
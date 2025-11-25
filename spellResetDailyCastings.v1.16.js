/*
	==========================================================================
	Macro Title: Spell Reset Daily Castings Macro for Foundry VTT PF1e
	Author: classicrp, @raydenx (https://github.com/classicrp)
	Last updated 2025-11-22
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
		
  	<actor> is passed in directly from the activating feature. Required in
    order to set the dictionary value on said item.
	returns: void
	NOTE: don't reference dictionary .value itself as it gets stored as Object
			instead of Number.
	==========================================================================
*/

	const curVer = "v1.16";
	const head = `Macro.spellResetDailyCastings(${curVer}): `;
	let msg = "";
	let failState = false;
//	=========================================================

	let attr = "system.flags.dictionary.castings";
	let level = -1;
	let mspells = await actor.items.toObject().filter(s => s.system.spellbook === "primary");
		
	mspells.forEach(s => {
		// grab each primary spell

/* if (s.name === "Mending") {
	debugger;
} */

			spells = true;

			if (level !== s.system.level) {
				level = s.system.level;
			}
			if ((s.system.spellPoints.cost !== "") && (s.system.spellPoints.cost !== null)) {
				//  an older copy of the spell, update to use default SP costs
				s.system.spellPoints.cost = "";
			}

			if (s.system.flags.dictionary.castings === null) {	
				// 	add in the dictionary name/value pair
				s.system.flags.dictionary.castings = 0;
				console.log(`${actor.name} (${s.system.spellbook}): ${s.name}[${level}] added dictionary item 'castings'.`);
			} else { 
				//	dictionary item already exists on spell, set back to 0
				s.system.flags.dictionary.castings = 0;
				console.log(`${actor.name} (${s.system.spellbook}): ${s.name}[${level}] resetting 'castings' for a new day.`);
			}
//		}
	});
	await actor.update({ ["items"]: mspells });

	attr = "system.attributes.spells.spellbooks.primary.spellPoints.value";
	const maxSP = item.system.uses.max;
	await actor.update({ [attr]: maxSP });

	return;
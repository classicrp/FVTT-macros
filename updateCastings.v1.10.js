/*
	==========================================================================
	Macro Title: Update Castings Macro for Foundry VTT PF1e
	Author: classicrp, @raydenx (https://github.com/classicrp)
	Last updated 2025-11-24
	License: MIT License
	
	Description:
	Inspects the last Chat Message to see if the actor "rolled a natural 1"
	on a spell attack or if they failed an ASF check while casting. This
	is designed to be used with the "Spell Fumble" option.
	
	Usage: Called from macro "checkForSpellFumbleAndASF" to see if an attack
	spell rolled a "1" or the character failed their "Arcane Spell Failure"
	check while casting in armour.
	
	Foundry Version: v12+ / v13.351
		
	<item> is passed in directly from the calling spell. Required in order to
	set the dictionary value on said item.
	returns: null
	NOTE: don't reference dictionary .value itself as it gets stored as Object
			instead of Number.
	==========================================================================
*/

	const curVer = "v1.10";
	const head = `Macro.updateCastings(${curVer}): `;
	let msg = "";
	let failState = false;
//	=========================================================

	const attr = `system.flags.dictionary.castings`;
    const mItem = actor.items.get(item.id);
	const curVal = Number(foundry.utils.getProperty(mItem, attr));
    let newVal = curVal;

	if (failState) {
	  msg = "Not working as expected"
	  console.log(head + msg);
	  return;
	}

    if(mItem.sl == 0) {
    //  no extra charge  
    } else {
    	newVal += 1;
    }

	await item.update({ [attr]: newVal });
	
debugger;
//	second part, update spell points to proper source.
/*	we need to know which spell tab we are casting from, then
	get the max spell points formula for said tab, then
	update the source of the spell points.
*/
	const book = item.system.spellbook;		//	'primary'
	const bookSP = actor.system.attributes.spells.spellbooks.primary.spellPoints.maxFormula;	//	'@resources.witchSpells.value'
	const spSource = actor._itemTypes.feat[9].name			//	'Witch Spells'
	
// 	actor.attributes.spells.spellbooks.primary.spellPoints.maxFormula

return;
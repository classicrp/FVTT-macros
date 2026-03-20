/*
	==========================================================================
	Macro Title: Update Castings Macro for Foundry VTT PF1e
	Author: classicrp, @raydenx (https://github.com/classicrp)
	Last updated 2025-11-26
	License: MIT License
	
	Description:
	Called from the 'post-use' section of a spell.  Meant to keep track of the
	number of times in a single "day" that this spell was cast. Works with the
	dictionary setting "castings" on every spell that uses spell points.  In-
	cremented upon use (costs more spell points to repeatedly cast the same 
	spell in a "day.")
	
	Usage: Called from macro "updateCastings" in the spell's 'post-use' section
	so no extra effort is required.  Drag macro from World Compendium or Macros
	directly onto the 'Post-Use' Script Section of the Advanced Tab.
	
	Foundry Version: v13+ / v13.351
		
	NOTE: don't reference dictionary <.value> itself as it gets stored as Object
		instead of Number.

	<actor> is passed in directly from the calling spell. Required in order to
	set the dictionary value on said item.
	<item> is passed in directly from the calling spell. Required in order to
	set the dictionary value on said item.
	Returns: null
	==========================================================================
*/

	const curVer = "v1.14";
	const head = `Macro.updateCastings(${curVer}): `;
	let msg = "";
	let failState = false;
//	=========================================================

 debugger;

	let attr = "system.flags.dictionary.castings";
    let mItem = item.toObject();
	const spBook = mItem.system.spellbook;	//	i.e. 'primary'
	const spBookSrc = actor.system.attributes.spells.spellbooks[spBook].spellPoints;	//	i.e. '@resources.witchSpells.value'

	if (failState) {
	  msg = "Not working as expected"
	  console.log(head + msg);
	  return;
	}

	if (spBookSrc.useSystem) {
	//	actor's spellbook uses spell points, continue
		if (!mItem.system.atWill) {
		//	we are only concerned about spell points so just ignore at-will

			const curVal = mItem.system.flags.dictionary.castings;
			let newVal = Number(curVal);
			
			if(mItem.sl == 0) {
			//  no extra charge  
			} else {
			//	increase castings
				newVal += 1;
			}
			mItem = null;		//	flush

			await item.update({ [attr]: newVal });
	
		}		
	}

	await updateSpellPoints(spBookSrc, actor, shared);

	return;

	function updateSpellPoints(tsource, actor, shared) {
		//	second part, update spell points to proper source.

		//	grab the spell point formula for this spellbook
		let maxSP = tsource.maxFormula;				
		maxSP = maxSP.toLowerCase();
		maxSP = maxSP.replace("@resources.", "");
		maxSP = maxSP.replace("spells.max", "");
		maxSP = maxSP.at(0).toUpperCase() + maxSP.substring(1, (maxSP.length)) + " Spells";
		//	put it into a useable string so we can grab the 'parent' feature
		let spSource = actor._itemTypes.feat.getName(maxSP);	// i.e.	'Witch Spells'
		const spCost = shared.totalChargeCost;
		const srcValue = spSource.system.uses.value;
		attr = "system.uses.value";
		const spNewVal = srcValue - spCost;
		await actor.items.get(spSource.id).update({ [attr]: spNewVal });
		spSource = null;	//	flush
		
	}
//	version: 0.3.4
const show = true;
let src = "", rslt = "", skip = true;
const act = action.tag;
const name = action.name;
const note = ['@Use[Elemental Fist#Stop]'];

if (act !== "clear") {
	const mCl = actor.classes;
	//  only Monk can use
	if (typeof mCl.monk !== "undefined") {
		rslt = "@classes.monk.level";
	} else if (typeof mCl.gestalt !== "undefined") {
		if (mCl.gestalt.name.toLowerCase().includes('monk')) {
			rslt = "@classes.gestalt.level";
		}
	} else {
		return;
	}
	const cond = {
		_id: foundry.utils.randomID(16),
		default: true,
		modifiers: [{
			_id: foundry.utils.randomID(16),
			type: "untyped",
			damageType: [act],
			formula: `(floor(${rslt} / 4))d6[Elemental Fist]`,
			target: "damage",
			subTarget: "attack_0", //"allDamage",
			critical: "nonCrit"
		}],
		name: `${name}`
	};
	if (show) console.log("new conditional:", cond);

	rslt = await item.addItemBooleanFlag("elemental_fist");
	if (show) console.log('boolean flag "elemental_fist" added:', rslt);

	rslt = await item.addItemBooleanFlag("bonus_conditional-modifiers");
	if (show) console.log('boolean flag "bonus_conditional-modifiers" added:', rslt);

	rslt = await item.addItemBooleanFlag("bonus_footnote");
	if (show) console.log('boolean flag "bonus_footnote" added:', rslt);

	rslt = await item.setItemDictionaryFlag("energy", act);
	if (show) console.log(`dictionary flag "energy" added "${act}":`, rslt);

	src = await deepClone(item.flags['ckl-roll-bonuses']);
	if (typeof src !== "undefined") {

		/*	TARGET WEAPONS  */
		if (show) debugger
		for (i=0; i < src.target_weapon.length; i++) {
			let weap = actor.items.get(src.target_weapon[i]);
			if (show) console.log(weap);
			rslt = await weap.update({ ['system.effectNotes']: note });
			if (show) console.log(rslt, weap);
		}
		
		/*	BONUS CONDITIONAL MODIFIERS	 */
		const bcm = {
			["bonus_conditional-modifiers"]: []
		};
		const fn = `<em>Elemental Fist (<strong>${act}</strong>) active.</em>`;
		
		rslt = await bcm['bonus_conditional-modifiers'].push(cond);
		if (show) console.log(`set conditional modifier to be added":`, bcm);
        
		if (typeof src['bonus_conditional-modifiers'] !== "undefined") {
          //  it is already there
			src['bonus_conditional-modifiers'].push(cond);        
			src['bonus_footnote'] = fn;
		
		} else {
			// trouble
			if (show) console.log('Little Trouble - no "bonus_conditional-modifiers"');
        }
        rslt = await item.update({ [`flags.ckl-roll-bonuses`]: src });
		if (show) console.log(`updated item document:`, rslt);
		
	} else {
		//	trouble
		if (show) console.log('BIG TROUBLE - no src');
	}
} else {
	
	src = await deepClone(item.flags['ckl-roll-bonuses']);
	if (typeof src !== "undefined") {
	
		rslt = await item.removeItemBooleanFlag("elemental_fist");
		if (show)
			console.log(`boolean flag "elemental_fist" removed:`, rslt);

		rslt = await item.removeItemBooleanFlag("bonus_conditional-modifiers");
		if (show)
			console.log('boolean flag "bonus_conditional-modifiers" removed:', rslt);

		rslt = await item.removeItemBooleanFlag("bonus_footnote");
		if (show)
			console.log('boolean flag "bonus_footnote" removed:', rslt);

		rslt = await item.setItemDictionaryFlag("energy", "");
		if (show)
			console.log(`dictionary flag "energy" cleared:`, rslt);

		/*	TARGET WEAPONS  */
		for (i=0; i < src.target_weapon.length; i++) {
			let weap = actor.items.get(src.target_weapon[i]);
			if (show) console.log(weap);
			rslt = await weap.update({ ['system.effectNotes']: [] });
			if (show) console.log(rslt, weap);
		}


		rslt = await item.update({	[`flags.ckl-roll-bonuses.bonus_footnote`]: "" });
		if (show)
			console.log(`removed footnote:`, rslt);

		src = Array.from(item.flags["ckl-roll-bonuses"]["bonus_conditional-modifiers"]);
		if (show)
			console.log("current array of Roll Bonuses conditional modifers:", src);

		for (let i = 0; i < src.length; i++) {
			rslt = await src.pop();
			if (show)
				console.log("removed conditional from array:", rslt);
			skip = false;
		}
		if (!skip) {
			rslt = await item.update({
				[`flags.ckl-roll-bonuses.bonus_conditional-modifiers`]: src
			});
			if (show)
				console.log('updated the "item" sheet:', rslt);
		}
	}
}
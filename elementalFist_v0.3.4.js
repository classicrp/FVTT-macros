const _VERSION = '0.3.5';
const _HEAD = "Macro.elementalFist v" + _VERSION;
const _SHOW = true;
const _VERBOSE = true;

const act = action.tag;
const name = action.name;
const note = ['@Use[Elemental Fist#Stop]'];
let src = "", rslt = "", skip = true;

const ATTR_FLGS_CRB_BCM = "flags.ckl-roll-bonuses.bonus_conditional-modifiers";
const ATTR_FLGS_CRB_BFN = "flags.ckl-roll-bonuses.bonus_footnote";
const ATTR_FLGS_CRB = "flags.ckl-roll-bonuses";
const ATTR_FLG_CRB = "ckl-roll-bonuses";
const ATTR_FLG_BCM = "bonus_conditional-modifiers";
const ATTR_FLG_BFN = "bonus_footnote";
const ATTR_SYS_ENT = "system.effectNotes";
const ATTR_BFLG_EFST = "elemental_fist";
const ATTR_DFLG_NRG = "energy";

const CLSS_MNK_LVL = "@classes.monk.level";
const CLSS_GSTL_LVL = "@classes.gestalt.level";

if (act !== "clear") {
	const mCl = actor.classes;
	//  only Monk can use
	if (typeof mCl.monk !== "undefined") {
		rslt = CLSS_MNK_LVL;
	} else if (typeof mCl.gestalt !== "undefined") {
		if (mCl.gestalt.name.toLowerCase().includes('monk')) {
			rslt = CLSS_GSTL_LVL;
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
	if (_VERBOSE) console.log("new conditional:", cond);

	rslt = await item.addItemBooleanFlag(ATTR_BFLG_EFST);
	if (_VERBOSE) console.log(`boolean flag "${ATTR_BFLG_EFST}" added:`, rslt);

	rslt = await item.addItemBooleanFlag(ATTR_FLG_BCM);
	if (_VERBOSE) console.log(`boolean flag "${ATTR_FLG_BCM}" added:`, rslt);

	rslt = await item.addItemBooleanFlag(ATTR_FLG_BFN);
	if (_VERBOSE) console.log(`boolean flag "${ATTR_FLG_BFN}" added:`, rslt);

	rslt = await item.setItemDictionaryFlag(ATTR_DFLG_NRG, act);
	if (_VERBOSE) console.log(`dictionary flag "${ATTR_DFLG_NRG}" added "${act}":`, rslt);

	src = await deepClone(item.flags[ATTR_FLG_CRB]);
	if (typeof src !== "undefined") {

		/*	TARGET WEAPONS  */
		if (_SHOW) debugger
		for (i=0; i < src.target_weapon.length; i++) {
			let weap = actor.items.get(src.target_weapon[i]);
			if (_VERBOSE) console.log(weap);
			rslt = await weap.update({ [ATTR_SYS_ENT]: note });
			if (_VERBOSE) console.log(rslt, weap);
		}
		
		/*	BONUS CONDITIONAL MODIFIERS	 */
		const bcm = {
			[ATTR_FLG_BCM]: []
		};
		const fn = `<em>Elemental Fist (<strong>${act}</strong>) active.</em>`;
		
		rslt = await bcm[ATTR_FLG_BCM].push(cond);
		if (_VERBOSE) console.log(`set conditional modifier to be added":`, bcm);
        
		if (typeof src[ATTR_FLG_BCM] !== "undefined") {
          //  it is already there
			src[ATTR_FLG_BCM].push(cond);        
			src[ATTR_FLG_BFN] = fn;
		
		} else {
			// trouble
			console.warn(_HEAD, `Little Trouble - no ${ATTR_FLG_BCM}`);
        }
        rslt = await item.update({ [ATTR_FLGS_CRB]: src });
		if (_VERBOSE) console.log(`updated item document:`, rslt);
		
	} else {
		//	trouble
		console.error(_HEAD, 'BIG TROUBLE - no src');
		return;
	}
} else {
	
	src = await deepClone(item.flags[ATTR_FLG_CRB]);
	if (typeof src !== "undefined") {
	
		rslt = await item.removeItemBooleanFlag(ATTR_BFLG_EFST);
		if (_VERBOSE) console.log(`boolean flag "${ATTR_BFLG_EFST}" removed:`, rslt);

		rslt = await item.removeItemBooleanFlag(ATTR_FLG_BCM);
		if (_VERBOSE) console.log(`boolean flag ${ATTR_FLG_BCM} removed:`, rslt);

		rslt = await item.removeItemBooleanFlag(ATTR_FLG_BFN);
		if (_VERBOSE) console.log(`boolean flag "${ATTR_FLG_BFN}" removed:`, rslt);

		rslt = await item.setItemDictionaryFlag(ATTR_DFLG_NRG, "");
		if (_VERBOSE) console.log(`dictionary flag "${ATTR_DFLG_NRG}" cleared:`, rslt);

		/*	TARGET WEAPONS  */
		for (i=0; i < src.target_weapon.length; i++) {
			let weap = actor.items.get(src.target_weapon[i]);
			if (_VERBOSE) console.log(weap);
			rslt = await weap.update({ [ATTR_SYS_ENT]: [] });
			if (_VERBOSE) console.log(rslt, weap);
		}


		rslt = await item.update({	[ATTR_FLGS_CRB_BFN]: "" });
		if (_VERBOSE) console.log(`removed footnote:`, rslt);

		src = Array.from(item.flags[ATTR_FLG_CRB][ATTR_FLG_BCM]);
		if (_VERBOSE) console.log("current array of Roll Bonuses conditional modifers:", src);

		for (let i = 0; i < src.length; i++) {
			rslt = await src.pop();
			if (_VERBOSE) console.log("removed conditional from array:", rslt);
			skip = false;
		}
		if (!skip) {
			rslt = await item.update({
				[ATTR_FLGS_CRB_BCM]: src
			});
			if (_VERBOSE) console.log('updated the "item" sheet:', rslt);
		}
	}
}
const _VERSION = '0.1.7';
const _SHOW = false;
const _HEAD = `Macro.bareCriticals(${_VERSION})`;

/*	Changes chat output for an attack by removing all formula data that is
	not strictly a Die (or Dice) roll(s).  Does not currently include extras
	from the [Roll Bonuses] module or anything other than default system.
*/

const ATTR_CHAT_ATZ_ATK = "attacks.0.chatAttack";
const ATTR_DMG_TOT = "damage.total";
const ATTR_CRITDMG_TOT = "critDamage.total";
const ATTR_CRITDMG_HLF = "critDamage.half";
const ATTR_CRIT_DMG = "critDamage";
const ATTR_ROLLS = "rolls";
const ATTR_FRML = "_formula";
const ATTR_TRMS = "terms";
const ATTR_TRMS_TOT = "terms.0.total";
const ATTR_TOT = "_total";
const ATTR_OPT_TYP = "options.type";

let rslt = null;
let srcs = await foundry.utils.getProperty(shared, ATTR_CHAT_ATZ_ATK);
let sum = await foundry.utils.getProperty(srcs, ATTR_DMG_TOT);

if (_SHOW) debugger
let rolls = srcs[ATTR_CRIT_DMG][ATTR_ROLLS];
const len = rolls.length;
for (let i = 0; i < len; i++) {
	let rolled = 0, length = 0, fltrd = [];
	let r = rolls[i];
	let type = foundry.utils.getProperty(r, ATTR_OPT_TYP);
	if (type === "crit") {
		//	"crit" line specifically, keep as is
		await fltrd.push(r[ATTR_FRML]);
	} else {
		//	Match <rolls> formula to only include die expression
		if (r[ATTR_FRML].includes('sizeRoll')) {
			//	sizeRoll must be present, [Roll] is optional
			const RGX_SIZRL = /\bsizeRoll\([\d,]+\)(?:\[Roll\])/i;
			fltrd = r[ATTR_FRML].match(RGX_SIZRL);
		} else {
			//	[Roll] must be present for this capture
			const RGX_NRML = /\b(?:\d+d\d+|\d+)\[Roll\]/i;
			fltrd = r[ATTR_FRML].match(RGX_NRML);
		}
	}
	if (isEmpty(fltrd)) {
		await delete rolls[i];
		continue;
	}

	//	Change <rolls> formula to that of dice rolls only
	rslt = await foundry.utils.setProperty(r, ATTR_FRML, fltrd.at(0));
	length = r[ATTR_TRMS].length;
	for (let n = length; n !== 1; n--) {
		//	remove all <terms> not a die roll
		await r[ATTR_TRMS].pop();
	}
	//	Set current <terms> total to include only dice rolls
	rolled = await foundry.utils.getProperty(r, ATTR_TRMS_TOT);
	rslt = await foundry.utils.setProperty(r, ATTR_TOT, rolled);
	//	Increase <sum> with new total 
	sum += rolled;
}
await fixRolls(rolls);
rslt = await foundry.utils.setProperty(srcs, ATTR_CRITDMG_TOT, sum);
rslt = await foundry.utils.setProperty(srcs, ATTR_CRITDMG_HLF, Math.floor(sum/2));
await collectLikeRolls(rolls);

return

function fixRolls(r) {
	let rslt = "";
	let len = r.length;
	rslt = r.sort();
	for (let n = 0; n < len; n++) {
		if (isEmpty(r[n])) {
			// delete it
			r.pop();
		}
	}
	return
}

function collectLikeRolls(a) {
debugger
	const len = a.length;
	let sum = 0;
	for (let i = 0; i < len; i++) {
		//	step through each one and compare to next ones
		let frml = a.at(i).formula;
		let indicies = a.forEach(getMatchingIndices(frml));
		let fltrd = a.filter(f => f.index === indicies);
		let number = fltrd.length;
		if (fltrd && number > 1) {
			//	We have multiples of current index
			if (frml.at(1) === "d") {
				//	Die expression
				frml.replace(frml.at(0), fltrd.length.toString());
			} else if (frml.includes("sizeRoll")) {
				frml.replace(frml.at(9), fltrd.length.toString());
			}
			a[0].terms[0].results[0].result
		}
		let rslt = checkOtherRolls(a, i, frml);
		if (rslt !== i) {
			//	this will be the matching index
		}
	}
	return
}

function checkOtherRolls(a, idx, t) {
	const len = 0;
	return idx;
}

function getMatchingIndicies(frml, item, index) {
debugger
	let rslt = [];	
	if (item.formula === frml) {
		rslt.push(index);
	}
	return rslt;
}
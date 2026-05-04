const _VERSION = '0.1.9';
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
const ATTR_TRMS_RSLT = "terms.0.results.0.result";
const ATTR_TRMS_NMBR = "terms.0._number";
const ATTR_TRMS_OPT_FLV = "terms.0.options.flavor";
const ATTR_TRMS_EXP = "terms.0.expression";
const ATTR_TOT = "_total";
const ATTR_OPT_TYP = "options.type";

let rslt = null;
let fltrd = null;
let frml = "";
let indices = [];
let srcs = await foundry.utils.getProperty(shared, ATTR_CHAT_ATZ_ATK);
let sum = await foundry.utils.getProperty(srcs, ATTR_DMG_TOT);

if (_SHOW) debugger
let rolls = srcs[ATTR_CRIT_DMG][ATTR_ROLLS];
const len = rolls.length;
for (let i = 0; i < len; i++) {
	fltrd = [];
	let rolled = 0;
	let length = 0;
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
	let sum = 0;
	let current = null;
	const len = a.length;
	for (let i = 0; i < len; i++) {
		//	step through each one and compare to next ones
		current = a[i];
		if (isEmpty(current)) continue;
		frml = current[ATTR_FRML];
		indices = [];
		fltrd = [];
		rslt = a.forEach(getMatchingIndices);
		let number = fltrd.length;
		if (fltrd && number > 1) {
			//	We have multiples of current index
			let newFrml = "";
			if (frml.at(1) === "d") {
				//	Die expression
				newFrml = frml.replace(frml.at(0), number.toString());
			} else if (frml.includes("sizeRoll")) {
				newFrml = frml.replace(frml.at(9), number.toString());
			}
			//	Set combined <._formula> on first index
			rslt = foundry.utils.setProperty(current, ATTR_FRML, newFrml);
			//	Set new <._number> of dice on first index
			rslt = foundry.utils.setProperty(current, ATTR_TRMS_NMBR, number);			
			//	Set combined dice rolls <.result> on first index
			sum = getTermsAmount(fltrd, ATTR_TRMS_RSLT);
			rslt = foundry.utils.setProperty(current, ATTR_TRMS_RSLT, sum);
			//	Set combined dice rolls <._total> on first index
			rslt = foundry.utils.setProperty(current, ATTR_TRMS_TOT, sum);
			//	Set <.terms.0.options.expression> to new dice expression on first index
			let flv = foundry.utils.getProperty(current, ATTR_TRMS_OPT_FLV);
			let exprs = newFrml.replace(`[${flv}]`, "");
			rslt = foundry.utils.setProperty(current, ATTR_TRMS_EXP, exprs);
			//	Now delete the other copies
			let tbr = indices.filter(f => f !== i);
			for (let t of tbr) {
				delete a[t];
			}
debugger
			
		}
	}
	return
}

function getMatchingIndices(item, index) {
	if (item[ATTR_FRML] === frml) {
		indices.push(index);
		fltrd.push(item);
	}
	return;
}

function getTermsAmount(a, attr) {
	let sum = 0;
	for (const me of a) {
		sum += foundry.utils.getProperty(me, attr);
	}
	return sum;
}
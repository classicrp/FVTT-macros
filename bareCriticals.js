const _VERSION = '0.1.1';
const _SHOW = true;

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
const ATTR_DIE_TOT = "terms.0.results.0.result";
const ATTR_TOT = "_total";

let rslt = null;
let srcs = await foundry.utils.getProperty(shared, ATTR_CHAT_ATZ_ATK);
let sum = await foundry.utils.getProperty(srcs, ATTR_DMG_TOT);

if (_SHOW) debugger
for (let s of srcs[ATTR_CRIT_DMG][ATTR_ROLLS]) {
	//	Match <rolls> formula to only include die expression
	let fltrd = s[ATTR_FRML].match(/\b(?:\d+d\d+|\d+)\[Roll\]/i).at(0);
	//	Change <rolls> formula to that of dice rolls only
	rslt = await foundry.utils.setProperty(s, ATTR_FRML, fltrd);
	let length = s[ATTR_TRMS].length;
	for (let n = length; n !== 1; n--) {
		//	remove all <terms> not a die roll
		await s[ATTR_TRMS].pop();
	}
	//	Set current <terms> total to include only dice rolls
	const rolled = await foundry.utils.getProperty(s, ATTR_DIE_TOT);
	rslt = await foundry.utils.setProperty(s, ATTR_TOT, rolled);
	//	Increase <sum> with new total 
	sum += rolled;
}
rslt = await foundry.utils.setProperty(srcs, ATTR_CRITDMG_TOT, sum);
rslt = await foundry.utils.setProperty(srcs, ATTR_CRITDMG_HLF, Math.floor(sum/2));

return
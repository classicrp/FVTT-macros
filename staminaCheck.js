// See if it has been 1 minute since last use, if so reset
// the uses of Stamina.

const iMax = item.system.uses.max;
const iAttr = `system.uses.value`;
const tThen = item.system.flags.dictionary.time; 
const tSec = Math.floor(game.time.components.second);
const tMin = game.time.components.minute;
const tHr = game.time.components.hour;
const tNow = (tHr * 3600) + (tMin * 60) + tSec;
const tAttr = `system.flags.dictionary.time`;
const tDiff = tNow - tThen;
// debugger;
let iVal = item.system.uses.value;

if (tDiff>600) {
	// now a turn (10 minutes) later, save the old timestamp 
	// and increase Stamina by 1 until Max.
	await item.update({ [tAttr]: tNow });
	iVal = Math.min(iVal + 1, iMax);
	await item.update({ [iAttr]: iVal });
} else {
	// still the same minute good to keep counting uses of Stamina
}
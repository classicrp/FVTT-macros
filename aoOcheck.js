// See if we are in a combat and the same round, otherwise
// reset the uses of AoO.

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

if (tDiff>6) {
	// now a different round save the old timestamp and reset AoO count
	await item.update({ [tAttr]: tNow });
	await item.update({ [iAttr]: iMax });
} else {
	// still the same round good to keep counting uses of AoO
}
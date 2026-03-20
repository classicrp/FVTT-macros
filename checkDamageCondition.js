/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-04
	==========================================================================
	<style> is a string arg passed in to determine the output format.
	returns: formatted string date

*/
const curVer = 'v1.01';
const head = `Macro.checkHealthConditions(${curVer}): `;
let msg = '';
let failure = Boolean(false);

debugger;
let lm = '';
let wind = '';
let wound = '';
if (state) {
// turned on
	// sse if we have taken damage first
    lm = await game.macros.getName("checkWinded");
    wind = await lm.execute({ actor: actor });
    lm = await game.macros.getName("checkWounded");
    wound = await lm.execute({ actor: actor });
} else {
    // turn it back on
	// wait for some delay before toggling.
/*    const attr = 'system.active';
	await item.update({ [attr]: true }); */
};

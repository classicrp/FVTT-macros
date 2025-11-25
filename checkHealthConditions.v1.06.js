/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-14
	==========================================================================
	<item> is the item object launching the request.
	<state> determines if the buff is active
	sets flags on <item> to show status
	returns: void
	==========================================================================
	ISSUES: No longer a buff so has no <state> anymore, faked by passing `true`

*/
const curVer = 'v1.06';
const head = `Macro.checkHealthConditions(${curVer}): `;
let msg = '';
let failState = Boolean(false);
const state = true;

debugger;
let lm = '';
let attr = '';
let wind = Boolean(false);
let wound = Boolean(false);

if (typeof state == "undefined") {
//	we did not get here the proper way, get out
	console.log(head + msg);
	failState = true;

} else if (state) {
// turned on
	// sse if we have taken damage first
    lm = await game.macros.getName("checkWinded");
    wind = await lm.execute({ actor: actor, item: item, state: state});
	attr = 'system.flags.healthCondition.winded';
	await item.update({ [attr]: twind });
    lm = await game.macros.getName("checkWounded");
    wound = await lm.execute({ actor: actor, item: item, state: state });
	attr = 'system.flags.healthCondition.wounded'; 
	await item.update({ [attr]: wound });
	
} else {
// turned off
	// wait for some delay before toggling.
/*    const attr = 'system.active';
	await item.update({ [attr]: true }); */
};

return failState;
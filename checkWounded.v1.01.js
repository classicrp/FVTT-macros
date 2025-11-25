/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-04
	==========================================================================
	<item> is the item object launching the request.
	<state> determines if the buff is active
	sets flags on <item> to show status
	returns: boolean
	==========================================================================
	ISSUES: No longer a buff so has no <state> anymore, faked by passing `true`

*/
const curVer = 'v1.01';
const head = `Macro.checkWounded(${curVer}): `;
let msg = '';
let failure = Boolean(false);

if (actor.system.attributes.wounds.value <= actor.system.attributes.wounds.threshold) {
// wound threshhold exceeded
	const who = actor.name;
	const cond = "&#64;Condition[staggered]";
	const msg = `<span style='font-family: Arial, sans-serif; font-size: 1.1em'>${who} has 0 Vigor left. Now ${cond}.`;
	ui.chat.processMessage(msg);
	await game.modules.get("dfreds-convenient-effects").api.toggleEffect({effectId: "ce-wounded"});
	failure = true;
}
return failure;
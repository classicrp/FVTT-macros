/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-04
	==========================================================================
	<item> is the item object launching the request.
	<state> determines if the buff is active
	sets flags on <item> to show status
	returns: void
	==========================================================================
	ISSUES: No longer a buff so has no <state> anymore, faked by passing `true`

*/
const curVer = 'v1.01';
const head = `Macro.checkWinded(${curVer}): `;
let msg = '';
let failure = Boolean(false);

if (actor.system.attributes.vigor.value <= 0) {
// vigor limit exceeded
	const who = actor.name;
	const cond = "&#64;Condition[fatigued]";
	const msg = `<span style='font-family: Arial, sans-serif; font-size: 1.1em'>${who} has 0 Vigor left. Now</span> ${cond}.`
	ui.chat.processMessage(msg);
	await game.modules.get("dfreds-convenient-effects").api.toggleEffect({effectId: "ce-winded"});
	failure = true;
};

return failure;
/*	==========================================================================
	author: classicrp, raydenx
	date: 2026-02-10
	==========================================================================
	<item> is the item object launching the request.
	<state> determines if the buff is active
	sets flags on <item> to show status
	returns: boolean
	==========================================================================
	ISSUES: No longer a buff so has no <state> anymore, faked by passing `true`

*/
const curVer = 'v1.06';
const head = `Macro.checkWounded(${curVer}): `;
let msg = '';
let failure = false;
let wounds = actor.system.attributes.wounds.value;
let thresh = actor.system.attributes.wounds.threshold;

if (wounds <= thresh) {
// wound threshhold exceeded
	const wounded = item.system.flags.boolean.wounded;
	if (wounded) return true;

	const who = actor.name;
	const cond = "&#64;Condition[staggered]";
	const msg = `<span style='font-family: Arial, sans-serif; font-size: 1.1em'>${who} has exceeded thier <em>Wound threshold</em> and is now ${cond}.</span>`;
	ui.chat.processMessage(msg);
	await game.modules.get("dfreds-convenient-effects").api.toggleEffect({effectId: "ce-wounded"});
	failure = true;
} else if (wounds > thresh) {
	debugger
	let srcs = actor.effects.contents.filter(e => e.name === "Wounded");
	if (typeof srcs === 'undefinded' || srcs.length === 0) return;
	let key = srcs[0].id;
	actor.effects.delete(key);
	actor.update();
}

return failure;
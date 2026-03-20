/*	==========================================================================
	author: classicrp, raydenx
	date: 2026-02-10
	==========================================================================
	<item> is the item object launching the request.
	<state> determines if the buff is active
	sets flags on <item> to show status
	returns: void
	==========================================================================
	ISSUES: No longer a buff so has no <state> anymore, faked by passing `true`

*/
const curVer = 'v1.07';
const head = `Macro.checkWinded(${curVer}): `;
let msg = '';
let failure = false;
let vigor = actor.system.attributes.vigor.value;

if (vigor === 0) {
// vigor limit exceeded
	const winded = item.system.flags.boolean.winded;
	if (winded) return true;

	const who = actor.name;
	const cond = "&#64;Condition[fatigued]";
	const msg = `<span style='font-family: Arial, sans-serif; font-size: 1.1em'>${who} has <em>no Vigor</em> left and is now ${cond}.</span>`
	ui.chat.processMessage(msg);
	await game.modules.get("dfreds-convenient-effects").api.toggleEffect({effectId: "ce-winded"});
	failure = true;
} else if (vigor > 0) {
	debugger
	let srcs = actor.effects.contents.filter(e => e.name === "Winded");
	if (typeof srcs === 'undefinded'  || srcs.length === 0) return;
	let key = srcs[0].id;
	actor.effects.delete(key);
	actor.update();
}
return failure;
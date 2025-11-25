/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-13
	==========================================================================
	<item> is the item object launching the request.
	<state> determines if the buff is active
	sets flags on <item> to show status
	returns: void
	==========================================================================
	ISSUES: No longer a buff so has no <state> anymore, faked by passing `true`

*/
const curVer = 'v1.13';
const head = `Macro.useAction(${curVer}): `;
let msg = '';
let failState = Boolean(false);

debugger;
if (arguments[6].conditionals.length > 0) {
//	some conditions were chosen, see if any have (+1 action)
//	in the name.
	const sel = arguments[6].conditionals;
	const cond = shared.action.conditionals;
	sel.forEach(s => {
		if (cond.get(s).name.includes('+1 action')) {
		//	we need to increase var 'cur' when we get there
			msg = "+1";
		}
	});
}

if (actor.inCombat) {
	// We really only care if we are in combat
	const actItem = await actor.items.getName('Actions');
	const attr = 'system.uses.value';
	const acts = await foundry.utils.getProperty( actItem, attr );

	if (acts >= 1) {
		// see if the 'Use' will be more acts than available
		const cur = await item.actions.get(action._id).activation.cost;
		if (msg == "+1") {
		//	a conditional selection increased the action cost
			cur += 1;
		}
		/*	this added in since non-actions are showing cost 1 by default
			so we need to check that only "action" types are used.
		*/
		const ctype = await item.actions.get(action._id).activation.type;
		if (ctype !== 'action') {
			failState = true;
		} else {
			if (cur > acts) {
				msg = `Not enough Actions left this round for ${item.name}`;
				await output(head, msg);

			} else {
				// deduct the cost of the action

				// test for two-weapon true
				if (item.system.flags.boolean.twoWeapon) {
					// don't take one off
				} else {
					const lftOvr = acts - cur;
					await actItem.update({ [attr]: lftOvr });
				}
			}
		}
	} else {
		// not enough actions, abort!
		msg = `No Actions left this round`;
		await output(head, msg);
	}
} else if (item.type == 'spell') {
	// not interested in acts 'out-of-combat' but have to let action finish 
	// in order to deduct spell points or a useage
};

function output(head, msg) {
	ui.notifications.warn(msg);
	failState = true;
	console.log(head + msg);
	throw 'done';
}
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
const curVer = 'v1.13';
const head = `Macro.checkHealthConditions(${curVer}): `;
let msg = '';
let failState = false;
const state = true;

debugger
let lm = '';
let attr = '';
let wind = false;
let wound = false;

if (typeof state == "undefined") {
//	we did not get here the proper way, get out
	console.log(head + msg);
	failState = true;
	return;
}

if (state) {
// turned on
	// sse if we have any Vigor left
    lm = fromUuidSync('Macro.CosbZXvozXVqklPG');
    wind = await lm.execute({ actor: actor, item: item, state: state});
	attr = 'system.flags.boolean.winded';
	await item.update({ [attr]: wind });
	// see if we exceeded our Wound threshold	
	lm = fromUuidSync('Macro.eUThCVwI2ERHcByA');
    wound = await lm.execute({ actor: actor, item: item, state: state });
	attr = 'system.flags.boolean.wounded'; 
	await item.update({ [attr]: wound });
	
	const who = actor.name;
	let cond = '';
	const vigor = actor.system.attributes.vigor.value;
	const halfV = Math.floor(actor.system.attributes.vigor.max / 2);
	const maxV = actor.system.attributes.vigor.max;
	const wounds = actor.system.attributes.wounds.value;
	const maxW = actor.system.attributes.wounds.max;
	const thresh = actor.system.attributes.wounds.threshold;

	if (!wind && !wound) {
		if (vigor === maxV && wounds === maxW) {
			cond = 'untouched!';
		} else if ( (vigor < maxV) && (vigor >= halfV) && (wounds === maxW) ) {
			cond = 'just scratched.';
		} else if ( (vigor < maxV) && (vigor >= halfV) && (wounds > thresh) ) {
			cond = 'minorly hurt.';
		} else if ( (vigor < halfV) && (vigor > 0) && (wounds <= maxW) && (wounds > thresh) ) {
			cond = 'moderately hurt.';
		}
	} else {
		if ( (vigor === 0) && (wounds > thresh) ) {
			cond = 'seriously hurt.';
		} else if ( (vigor === 0) && (wounds <= thresh) ) {
			cond = 'critically hurt.';
		} else if ( (vigor === 0) && (wounds <= 0) ) {
			cond = 'dying.'
		}
	}
	msg = `<span style='font-family: Arial, sans-serif; font-size: 1.1em'>${who}'s health status is <b>${cond}</b></span>`;
	ui.chat.processMessage(msg);
	
} else {
// turned off
	// wait for some delay before toggling.
/*    const attr = 'system.active';
	await item.update({ [attr]: true }); */
};

return failState;
/*	==========================================================================
	author: classicrp, raydenx
	date: 2026-04-01
	==========================================================================
	<item> is the item object launching the request.
	<state> determines if the buff is active
	sets flags on <item> to show status
	returns: void
	==========================================================================
	Logic:
	did I use the serrated edge?
		n: 	done
		y:	do I have a target selected?
			n:	done
			y:	did I hit?
				n: 	check for Nat 1
					n: check if it is the same target
						n: reset bleed to 0, clear target
						y: done
					y: reset bleed to 0, clear target
						( AND? backlash existing bleed to Fade as Vigor?, Wounds?, Bleed for 1 round? )
				y:	have I hit this target before?
					n: 	apply bleed to target { set bleed to 1, save target }
					y: 	increment bleed update target
//
// Must be checked in Post-Use as chatData does not exist yet.
// Remove footnote as it holds the previous bleed amount, or add 1 to it?  
// Try that first.

*/
const curVer = 'v1.0.9';
const head = `Macro.feedMe(${curVer}): `;
let msg = '';
let failure = false;
const state = true;
const show = true;

// Check that the serrated edge was used
if (action.tag == 'havokGash') {
    	
	if (show) debugger
    // check that there was a target selected
    if (shared.chatAttacks[0].targets !== null) {
        // there is a target
		
		const vAc = Number( shared.chatData["flags.vsAC.targets"][0].ac.normal );
		const vRoll = Number( shared.chatAttacks[0].attack.natural );
		const vTotal = Number( shared.chatAttacks[0].attack.total );
		
		// get the current and stored targets
		let dWho = item.getItemDictionaryFlag('who');
		const vTarget = shared.targets[0].document.actorId;
		
		// check to see if we rolled a `Nat 1`
		if (shared.chatAttacks[0].attack.isNat1) {
			// scrub the local data, Havok needs to start over
			await item.setItemDictionaryFlag('bleed', 0);
			await item.setItemDictionaryFlag('who', '');

		} else if (vTotal >= vAc) {
			// we have hit the target's normal AC
		
			if (dWho !== '') {
				// see if our saved target and current target match

				if (dWho === vTarget) {
					// same target, make it bleed more!
					let blood = Number(item.getItemDictionaryFlag('bleed'));
					(shared.chatAttacks[0].attack.isCrit) ? blood += 3 : blood++;
					await item.setItemDictionaryFlag('bleed', blood );
					// apply buff to target again
					
				} else {
					// logic breaks here---what if they aren't the same target
					await item.setItemDictionaryFlag('bleed', 1);
					await item.setItemDictionaryFlag('who', vTarget );
					dWho = vTarget;
				}
				
			} else {
				// replace existing target (if any), remember and start bleed at 1
				await item.setItemDictionaryFlag('bleed', 1);
				await item.setItemDictionaryFlag('who', vTarget );
				dWho = vTarget;
			}
		// We missed
		}
		if (dWho !== vTarget) {
		//	this is a new target, clear the fields
			await item.setItemDictionaryFlag('bleed', 0);
			await item.setItemDictionaryFlag('who', '');
		}
	// No target
	}
// Not using serrated edge
}
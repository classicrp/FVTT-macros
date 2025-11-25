/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-04
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
const curVer = 'v1.06';
const head = `Macro.feedMe(${curVer}): `;
let msg = '';
let failure = Boolean(false);
const state = true;

// Check that the serrated edge was used
if (action.tag == `havokGash`) {
    	
	const pBleed = `system.flags.dictionary.bleed`;
	const pWho = `system.flags.dictionary.who`;

    // check that there was a target selected
    if (shared.chatAttacks[0].targets !== null) {
        // there is a target
		
		const vAc = Number( shared.chatData["flags.vsAC.targets"][0].ac.normal );
		const vRoll = Number( shared.chatAttacks[0].attack.d20.results[0].result );
		const vTotal = Number( shared.chatData.system.rolls.attacks[0].attack.total );
		// get the current and stored targets
		const dWho = foundry.utils.getProperty(item, pWho);
		const vTarget = shared.targets[0].document.actorId;

//		debugger;
		
		// check to see if we rolled a `Nat 1`
		if (vRoll == 1) {
			// scrub the local data, Havok needs to start over
			await item.update({ [pBleed]: `0` });
			await item.update({ [pWho]: `` });

		} else if (vTotal >= vAc) {
			// we have hit the target's normal AC
		
			if (dWho !== ``) {
				// see if our saved target and current target match

				if (dWho == vTarget) {
					// same target, make it bleed more!
					
					let blood = Number(foundry.utils.getProperty(item, pBleed));
					blood += 1;
					await item.update({ [pBleed]: blood });
					// apply buff to target again
					
				} else {
					// logic breaks here---what if they aren't the same target
					await item.update({ [pBleed]: `1` });
					await item.update({ [pWho]: vTarget });
				}
				
			} else {
				// replace existing target (if any), remember and start bleed at 1
				await item.update({ [pBleed]: `1` });
				await item.update({ [pWho]: vTarget });
			}
		// We missed
		}
		if (dWho !== vTarget) {
		//	this is a new target, clear the fields
			await item.update({ [pBleed]: `0` });
			await item.update({ [pWho]: `` });
		}
	// No target
	}
// Not using serrated edge
}
/*	==========================================================================
	author: classicrp, raydenx
	date: 2026-04-01
	==========================================================================
	<item> is the item object launching the request.
	<state> determines if the buff is active
	sets flags on <item> to _SHOW status
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
let msg = String();
let failure = false;
const state = true;
const _SHOW = true;

// Check that the serrated edge was used
if (action.tag == "havokGash") {
    	
	if (_SHOW) debugger
    // check that there was a target selected
    if (shared.chatAttacks[0].targets.size) {
        // there is a target
		
		const vAc = parseInt( shared.chatData["flags.vsAC.targets"][0].ac.normal );
		const vRoll = parseInt( shared.chatAttacks[0].attack.natural );
		const vTotal = parseInt( shared.chatAttacks[0].attack.total );
		
		// get the current and stored targets
		let dWho = item.getItemDictionaryFlag("who");
		const vTarget = shared.targets[0].document.actorId;
		
		// check to see if we rolled a `Nat 1`
		if (shared.chatAttacks[0].attack.isNat1) {
			// scrub the local data, Havok needs to start over
			await item.setItemDictionaryFlag("bleed", 0);
			await item.setItemDictionaryFlag("who", "");
			//	Make a second roll, on a second `Nat 1` do crit damage
			let damage = item.system.actions?.[1].ability.critMult;
//			const bites = await new Roll("d20").evaluate();
			const bites = { total: 1 };
			const usesOptWV = game.settings.get( "pf1", "healthConfig" ).pc.rules.useWoundsAndVigor;
			let chkCrit = false;
			let bleed = new actor.statuses.constructor();
			bleed.add("bleed");
			if (bites.total === 1) {
				//	Critical fumble
				chkCrit = true;
				msg = `${actor.name}, you pissed Havok off, it bites you "hard!"`;
				await ui.notifications.warn(msg);
				if (!usesOptWV) damage *= 2;
			} else {
				//	Just a fumble
				msg = `${actor.name}, you missed. Havok bites you instead.`;
				await ui.notifications.warn(msg);
			}
			if (chkCrit && usesOptWV) {
				//	Wound damage plus Bleed
				if (!actor.statuses.has("bleed")) {
					//	This sets but does not update actor
					await actor.update({ ["statuses"]: bleed });
//					await actor.statuses.add("bleed");
				}
				const curWounds = foundry.utils.getProperty(actor, "system.attributes.wounds.value");
				await actor.update({ ["system.attributes.wounds.value"]: Math.max((curWounds - damage), 0) }); 

			} else if (chkCrit && !usesOptWV) {
				//	Double HP damage plus bleed
				if (!actor.statuses.has("bleed")) {
					//	This sets but does not update actor
					await actor.update({ ["statuses"]: bleed });
//					await actor.statuses.add("bleed");
				}
				const curHP = foundry.utils.getProperty(actor, "system.attributes.hp.value");
				await actor.update({ ["system.attributes.hp.value"]: Math.max((curHP - damage), 0) }); 

			} else if (!chkCrit && usesOptWV) {
				//	Vigor damage
				const curVigor = foundry.utils.getProperty(actor, "system.attributes.vigor.value");
				await actor.update({ ["system.attributes.vigor.value"]: Math.max((curVigor - damage), 0) }); 

			} else if (!chkCrit && !usesOptWV) {
				//	HP damage
				const curHP = foundry.utils.getProperty(actor, "system.attributes.hp.value");
				await actor.update({ ["system.attributes.hp.value"]: Math.max((curHP - damage), 0) }); 

			} else {
				//	WTF?
			}
			
		} else if (vTotal >= vAc) {
			// we have hit the target's normal AC
		
			if (dWho !== "") {
				// see if our saved target and current target match

				if (dWho === vTarget) {
					// same target, make it bleed more!
					let blood = parseInt(item.getItemDictionaryFlag("bleed"));
					(shared.chatAttacks[0].attack.isCrit) ? blood += 3 : blood++;
					await item.setItemDictionaryFlag("bleed", blood );
					// apply buff to target again
					
				} else {
					// logic breaks here---what if they aren't the same target
					await item.setItemDictionaryFlag("bleed", 1);
					await item.setItemDictionaryFlag("who", vTarget );
					dWho = vTarget;
				}
				
			} else {
				// replace existing target (if any), remember and start bleed at 1
				await item.setItemDictionaryFlag("bleed", 1);
				await item.setItemDictionaryFlag("who", vTarget );
				dWho = vTarget;
			}
		// We missed
		}
		if (dWho !== vTarget) {
		//	this is a new target, clear the fields
			await item.setItemDictionaryFlag("bleed", 0);
			await item.setItemDictionaryFlag("who", "");
		}
	
	} else {
		// No target
		msg = `No target selected.  Automation not applied, have the GM manually check for "Bleed".`;
		await ui.notifications.warn(msg);
	}
} else {
	// Not using serrated edge
};
// Post-Use Condition

// 	How to fire sound bites through code:
//	`await foundry.audio.AudioHelper.play({src: "path/to/sound.ext", volume: 0.3});`
//
// 	----------
// 	Feedback
// 	----------
	const curVer = 'v1.12';
	const head = `Macro.fadeRevolverPost(${curVer}): `;
	const msg = '';
	const failure = false;

if (action.tag == `attack`) {
	// only care about attack events
//	debugger;
	
	// lookup the contents of the chatroll to see if a `Misfire` took place
	const isMisfire = shared.chatData.system.rolls.attacks[0].ammo.misfire;
	
	if (isMisfire) {

		// lookup item boolean
		const isBroken = item.system.broken;
		// tell where to find item HP
		const attr = `system.hp.value`;
		// get current item HP
		let	curHP = foundry.utils.getProperty( item, attr );

		if (isBroken) {
			// second `Misfire`, weapon is destroyed
		    ui.notifications.error(`Your ${item.name} has "Misfired" a second time. Ouch!`);
			chatMessage(`<p><span style="font-family: Arial">${actor.name}&apos;s <i>${item.name}</i> has <b>exploded</b> causing @Damage[1d8;vigor]{1d8 Vigor}  and @Damage[2;wounds]{2 Wounds}. It is now <b>destroyed</b>.</span></p>`);
			const destroyed = `system.flags.dictionary.destroyed`;
			await item.update({	[destroyed]: 'true' });
			curHP = 0;
			// Play the sound for revolver blowing up
			const path = "systems/ars/sounds/magic/spell-fireball.mp3";
			await foundry.audio.AudioHelper.play({src: path, volume: 0.7});
		} else {
			// first `Misfire`, weapon is broken
		    ui.notifications.warn(`Your ${item.name} has "Misfired" and is now 'broken'.`);
			chatMessage(`<p><span style="font-family: Arial">${actor.name}&apos;s <i>${item.name}</i> has suffered a <b>misfire</b> and could use a <b>quick repair</b>.</span></p>`);
			const broken = `system.broken`;
			await item.update({	[broken]: true });	
			const fired = `system.flags.dictionary.firedRevolver`;
			let shots = 0;
			await item.update({	[fired]: shots });
			curHP = Math.floor(curHP / 2);
			// Play the sound for the revolver misfiring
			const path = "worlds/pf1e/sbcimport/weapons/Revolver/double-dry-fire-364847.mp3";
			await foundry.audio.AudioHelper.play({src: path, volume: 0.7});
		}
		await item.update({	[attr]: curHP });
		shared.reject;
	}
	
	const path = "worlds/pf1e/sbcimport/weapons/Revolver/single-pistol-gunshot-33-37187.mp3";
	await foundry.audio.AudioHelper.play({src: path, volume: 0.7});
}

function chatMessage(messageContent) {
	if (messageContent !== '') {
		let chatData = {
			user: game.user.id,
			speaker: ChatMessage.getSpeaker(),
			content: messageContent,
		};
		ChatMessage.create(chatData, {});
	}
}
// Use Condition
//
// 	How to fire sound bites through code:
//	`await foundry.audio.AudioHelper.play({src: "path/to/sound.ext", volume: 0.3});`
//
// 	----------
// 	Feedback
// 	----------
	const curVer = 'v1.13';
	const head = `Macro.fadeRevolverUse(${curVer}): `;
	const msg = '';
	const failState = false;

//  debugger;
if (item.system.flags.dictionary.destroyed !== `false`) {
	// the gun is beyond hope
    ui.notifications.info(`Your ${item.name} is currently broken and cannot be used until fully repaired.`);
	// not clean but prevents the roll from happening anyway
	shared.chatMessage = false;
	throw `Done`;

} else if (item.system.equipped !== true && action.tag !== `equip`) {
	// you have to equip the gun to use it
    ui.notifications.info(`Your ${item.name} is not currently equipped.`);
	// not clean but prevents the roll from happening anyway
	shared.chatMessage = false;
	throw `Done`;
}

if (action.tag == `reload` || action.tag == `attack`) {
	const flagPath = `system.flags.dictionary.firedRevolver`;
	let shots = Number(foundry.utils.getProperty(item, flagPath));
	if (action.tag == `reload`) {
		shots = 0;
		// if we have a sound for reloading revolver, do it here
		const path = "worlds/pf1e/sbcimport/weapons/Revolver/clean-revolver-reload-6889.mp3";
		await foundry.audio.AudioHelper.play({src: path, volume: 0.7});

	} else {
		shots += 1;
	}
	await item.update({ [flagPath]: shots });

} else if (action.tag == `equip`) {
	// tell where to find item HP
	const attr = `system.equipped`;
	await item.update({	[attr]: true });	
	// chatMessage(`<p><span style="font-family: Arial">${actor.name}&apos;s <i>${item.name}</i> is now <b>equipped<b>.</span></p>`);
	// if we have a sound for equipping the revolver, do it here

} else if (action.tag == `reprevolver`) {
	//	Call on "Quick Clear" to get the job done.
	
	/*-			CONFIGURATION			-*/
    const targetMacro = "useAction";
    const commandOverride = `My: Quick Clear`;
    
    /*-			COMMAND					-*/
    if (typeof shared !== "undefined")
    	event.args = arguments;
    window.macroChain = [commandOverride || this.name].concat(window.macroChain ?? []);
    await game.macros.getName(targetMacro)?.execute({
    	actor,
    	token,
		item
    });

/*	// tell where to find item HP
	const attr = `system.hp.value`;
	const max = `system.hp.max`;
	// get current item HP
	let	curHP = foundry.utils.getProperty( item, max );
	// change the HP back to full
	await item.update({	[attr]: curHP });	
	// if we have a sound for repairing the revolver, do it here
	const path = "worlds/pf1e/sbcimport/weapons/Revolver/revolver-chamber-spin-ratchet-sound-90521.mp3";
	await foundry.audio.AudioHelper.play({src: path, volume: 0.7});
	
	const broken = `system.broken`;
	// change status of `broken` to false
	await item.update({	[broken]: false });	
	// chatMessage(`<p><span style="font-family: Arial">${actor.name}&apos;s <i>${item.name}</i> is <b>repaired<b>.</span></p>`);
*/
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
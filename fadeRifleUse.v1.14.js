// Use Condition
//
// 	How to fire sound bites through code:
//	`await foundry.audio.AudioHelper.play({src: "path/to/sound.ext", volume: 0.3});`
//
// 	----------
// 	Feedback
// 	----------
	const curVer = 'v1.14';
	const head = `Macro.fadeRifleUse(${curVer}): `;
	const msg = '';
	const failState = false;

if (item.system.flags.dictionary.destroyed !== `false`) {
	// the gun is beyond hope
    ui.notifications.warn(`Your ${item.name} is currently broken and cannot be used until fully repaired.`);
	// not clean but prevents the roll from happening anyway
	shared.chatMessage = false;

} else if (item.system.equipped !== true && action.tag !== `equip` ) {
	// you have to equip the gun to use it
    ui.notifications.info(`Your ${item.name} is not currently equipped.`);
	// not clean but prevents the roll from happening anyway
	shared.chatMessage = false;
	
} else if (action.tag == `clip` || action.tag == `cartridge` || action.tag == `attack`) {
	// check to see if we shot or reloaded
	const flagPath = `system.flags.dictionary.firedRifle`;
	let shots = Number(foundry.utils.getProperty(item, flagPath));
	if (action.tag == `attack`) {
		shots += 1;
		// Play the sound for the rifle firing
//		const path = "worlds/pf1e/sbcimport/weapons/Rifle/rifle-mosinnagant-short-7-62x54r-close-06.mp3";
//		await foundry.audio.AudioHelper.play({src: path, volume: 0.7});
	} else if (action.tag == `clip`) {
		shots = 0;
		// Play the sound for the rifle reloading with clip
		const path = "worlds/pf1e/sbcimport/weapons/Rifle/mosin-nagant-bolt-fast-104031.mp3";
		await foundry.audio.AudioHelper.play({src: path, volume: 0.7});
	} else if (action.tag == `cartridge`) {
		shots = 0;
		// Play the sound for the rifle firing
		const path = "worlds/pf1e/sbcimport/weapons/Rifle/mosin-nagant-bolt-action-cycle-71670.mp3";
		await foundry.audio.AudioHelper.play({src: path, volume: 0.7});		
	}
	await item.update({ [flagPath]: shots });

} else if (action.tag == `equip`) {
	// tell where to find item HP
	const attr = `system.equipped`;
	await item.update({	[attr]: true });	
	// chatMessage(`<p><span style="font-family: Arial">${actor.name}&apos;s <i>${item.name}</i> is now <b>equipped<b>.</span></p>`);
	
} else if (action.tag == `reprifle`) {
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
	// chatMessage(`<p><span style="font-family: Arial">${actor.name}&apos;s <i>${item.name}</i> is <b>repaired<b>.</span></p>`);
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

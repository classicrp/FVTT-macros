/**
*
*/
let msg = String();
const soundPath = "worlds/pf1e/sbcimport/weapons/Revolver/clean-revolver-reload-6889.mp3";

//  debugger
let isDestroyed = item.getItemDictionaryFlag("destroyed");
if (isDestroyed !== "false") {
	/* old v1.12: item.system.flags.dictionary.destroyed */
	// the gun is beyond hope
	msg = `${actor.name}, your ${item.name} is currently broken and cannot be used until fully repaired.`;
	await handleError(shared, msg);
	return null;

} else if (item.system.equipped !== true && action.tag !== "equip") {
	// you have to equip the gun to use it
	msg = `${actor.name}, your ${item.name} is not currently equipped.`;
	await handleError(shared, msg);
	return null;
}

if (action.tag == "reload" || action.tag == "attack") {
	let shots = parseInt(item.getItemDictionaryFlag("fired"));

	if (action.tag == "reload") {
debugger
		shots = 0;
		//	Get current shots left
        const shotsCur = item.system.uses.value;
		// 	Get maximum shots available
        const shotsMax = item.system.uses.max;
		//  How many bullets do we need to "reload"
        let diff = shotsMax - shotsCur;
		//  Get the item ID for "ammo" used
        const ammoID = item.system.ammo.default;
		//  Get the actual "ammo" object
        const ammo = await actor.items.get(ammoID);
		//  Find out how much ammo is left
        const availAmmo = getProperty(ammo, "system.quantity");
		let newAvail = availAmmo;
        if (!availAmmo) {
			msg = `${actor.name}, you have no "${ammo.name}" remaining.`;
			await handleError(shared, msg);
			return null;
        } else if (diff > availAmmo) {
			//  Set remaining "ammo" to zero
            newAvail = 0;
			diff = Math.min((shotsCur + availAmmo), shotsMax);
			msg = `${actor.name}, your ${item.name} is using the last (${availAmmo}) of your ${ammo.name}.`;
            ui.notifications.warn(msg);
        } else {
			//	Remove an appropriate amount from "ammo"
			newAvail -= diff;
			diff = shotsMax;
		}
//        await setProperty(ammo, "system.uses.value", newAvail);  //  remove enough ammo to refill charges
		await ammo.update({ ["system.quantity"]: newAvail });
        await item.update({ ["system.uses.value"]: diff });
//        await setProperty(item, "system.uses.value", diff);  //  set charges to maximum.
		// if we have a sound for reloading revolver, do it here
		await foundry.audio.AudioHelper.play({src: soundPath, volume: 0.7});

	} else {
		shots += 1;
	}
	await item.setItemDictionaryFlag("fired", shots);

} else if (action.tag == "equip") {
	await item.update({	["system.equipped"]: true });	
	// chatMessage(`<p><span style="font-family: Arial">${actor.name}&apos;s <i>${item.name}</i> is now <b>equipped<b>.</span></p>`);
	// if we have a sound for equipping the revolver, do it here

} else if (action.tag == "repair") {
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
};

function chatMessage(messageContent) {
	if (messageContent !== "") {
		let chatData = {
			user: game.user.id,
			speaker: ChatMessage.getSpeaker(),
			content: messageContent,
		};
		ChatMessage.create(chatData, {});
	}
};

function handleError(shared, message) {
	ui.notifications.error(message);
	// not clean but prevents the roll from happening anyway
	shared.chatMessage = false;
	shared.reject;	// new: v1.13
	throw "Done";
	return;			// new: v1.13
};
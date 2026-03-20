// Use Condition for PF1e items

// Barebones test of Combat equipment to see if we can use it strait away

if (item.system.flags.dictionary.destroyed !== `false`) {
	// the item has 0 HP
    ui.notifications.warn(`Your ${item.name} is currently broken and cannot be used until fully repaired.`);
	// not clean but prevents the roll from happening anyway
	throw `Done`;

} else if (item.system.equipped !== true && action.tag !== `equip` ) {
	// you have to equip the gun to use it
    ui.notifications.info(`Your ${item.name} is not currently equipped.`);
	// not clean but prevents the roll from happening anyway
	throw `Done`;

} else if (action.tag == `equip`) {
	// need a `Use` option called `Equip` with the .tag `equip`
	const attr = `system.equipped`;
	await item.update({	[attr]: true });
}

// Todo:  A test of all items `in hand` to see if we can `equip`


shared.chatAttacks[0].attack._total
shared.chatData["flags.vsAC.targets"][0].ac.normal

shared.chatAttacks[0].targets == null   // there is no target

[0].value.document.actorId
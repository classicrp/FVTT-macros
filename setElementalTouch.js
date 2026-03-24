let element = '', rslt = '';
if ((action.tag === 'acid') || (action.tag === 'cold') || (action.tag === 'fire')) {
  element = action.tag; 
} else if (action.tag === 'electric') {
  element = 'electricity';
} else {
  shared.reject = true;
  return;
}
let itmName = `Elemental Touch (${element})`;
let buff = await actor._itemTypes.buff.filter(b => b.name === n).at(0);
if (typeof buff === 'undefined') {
	let itmData = await getBuff(itmName);
	await Item.create(itmData, {parent: actor});
	buff = await actor._itemTypes.buff.filter(b => b.name === itmName).at(0);
}

debugger
const cl = shared.chatAttacks[0].rollData.cl;  //  item.casterLevel;
const sl = shared.chatAttacks[0].rollData.sl;  //  item.system.level;
// const ablMod = actor.system.abilities[`${item.spellbook.ability}`].mod;
const dc = shared.chatAttacks[0].rollData.dc;  //  10 + sl + ablMod;
// acid: Attack causes 1 point of ongoing acid damage/rnd for [[floor(@cl/3)]] rounds. The target must make a @Save[fortitude;dc=19] save or be @Condition[sickened;dur=@item.level] during ongoing acid damage.
// cold: Target must make a @Save[fortitude;dc=18] or be @Condition[fatigued;dur=@cl].  A creature that is already fatigued suffers no additional effect.
// electric: `Target must make a @Save[fort;dc=${dc}] save or be @Condition[staggered;dur=1].`
// fire: Your hands ignite and shed light as a torch. Your touch may cause targets to catch on fire.
let footnote = '', ongoingAcid = '';
if (action.tag === 'acid') {
	itmName = 'Ongoing Acid Damage';
	duration = Math.floor(cl / 3);
	ongoingAcid = await actor._itemTypes.buff.filter(b => b.name === n).at(0);
	if (typeof ongoingAcid === 'undefined') {
		let itmData = await getBuff(itmName);
		await Item.create(itmData, {parent: actor});
		ongoingAcid = await actor._itemTypes.buff.filter(b => b.name === itmName).at(0);
		rslt = await ongoingAcid.setItemDictionaryFlag('duration', duration);
}
    footnote = `Causes 1 point of @Apply[${itmName};target] per rnd for [[floor(${cl}/3)]] rnds. The target must make a @Save[fortitude;dc=${dc}] save or be @Condition[sickened;dur=${Math.floor(${cl}/3)}] during ongoing acid damage.`;
	
} else if (action.tag === 'cold') {
    footnote = `Target must make a @Save[fortitude;dc=18] or be @Condition[fatigued;dur=@cl].  A creature that is already fatigued suffers no additional effect.`;
} else if (action.tag === 'electric') {
    footnote = `<p>Target must make a @Save[fort;dc=${dc}] save or be @Condition[staggered;dur=1].</p>`;
} else if (action.tag === 'fire') {
    footnote = `Your hands ignite and shed light as a torch. Your touch may cause targets to catch on fire.`;
}

await buff.setFlag('ckl-roll-bonuses', 'bonus_footnote', footnote); // flags.ckl-roll-bonuses.bonus_footnote
await buff.update({ 'system.level': cl });
await buff.setActive(true);

return;

function getBuff(n) {
	// get get the buff in the world compendium
	const pack = 'world.buffs';
	const uuid = game.packs.get(pack).index.getName(n).uuid;
	const item = fromUuidSync(uuid);
	const itemData = game.items.fromCompendium(item);
	return itemData;
}
const version = '0.2.5';
const show = true;

//	Declarations
let element = '', rslt = '', itm = '', itmName = '', itmData = '', pack = '', uuid = '';

//	Get action used
if ((action.tag === 'acid') || (action.tag === 'cold') || (action.tag === 'fire')) {
  element = action.tag; 
} else if (action.tag === 'electric') {
  element = 'electricity';
} else {
  shared.reject = true;
  return;
}

if (show) debugger;

//	Get the spell buff associated with said action
itmName = `Elemental Touch (${element})`;
let buff = await actor._itemTypes.buff.filter(b => b.name === itmName).at(0);
if (typeof buff === 'undefined') {
	pack = 'world.buffs';
	uuid = await game.packs.get(pack).index.getName(itmName).uuid;
	itm = await fromUuid(uuid);
	itmData = await game.items.fromCompendium(itm);
	await Item.create(itmData, {parent: actor});
	buff = await actor._itemTypes.buff.filter(b => b.name === itmName).at(0);
}

//	Get spell details from chatData
const cl = shared.chatAttacks[0].rollData.cl;  //  item.casterLevel;
const sl = shared.chatAttacks[0].rollData.sl;  //  item.system.level;
const dc = shared.chatAttacks[0].rollData.dc;  //  10 + sl + ablMod;
let footnote = '';
if (action.tag === 'acid') {
	//  Set the 
	itmName = 'Ongoing Acid Damage';
	duration = Math.floor(cl / 3);
	let ongoingAcid = await actor._itemTypes.buff.filter(b => b.name === itmName).at(0);
	if (typeof ongoingAcid === 'undefined') {
		pack = 'world.buffs';
		uuid = await game.packs.get(pack).index.getName(itmName).uuid;
		itm = await fromUuid(uuid);
		itmData = await game.items.fromCompendium(itm);
		await Item.create(itmData, {parent: actor});
		ongoingAcid = await actor._itemTypes.buff.filter(b => b.name === itmName).at(0);
	}
	rslt = await ongoingAcid.setItemDictionaryFlag('duration', duration);
    rslt = await ongoingAcid.setItemDictionaryFlag('damage', '1');
    footnote = `<p><span style="font-size: 1.1em"><strong>Elemental Touch:</strong> Causes 1 point of @Apply[${itmName};target] per rnd for [[floor(${cl}/3)]] rnds. The target must make a @Save[fort;dc=${dc}] save or be @Condition[sickened;dur=${duration}] during ongoing acid damage.</span></p>`;
	
} else if (action.tag === 'cold') {
    footnote = `<p><span style="font-size: 1.1em"><strong>Elemental Touch:</strong>Target must make a @Save[fort;dc=${dc}] or be @Condition[fatigued;dur=${cl}].  A creature that is already fatigued suffers no additional effect.</span></p>`;
} else if (action.tag === 'electric') {
    footnote = `<p><span style="font-size: 1.1em"><strong>Elemental Touch:</strong>Target must make a @Save[fort;dc=${dc}] save or be @Condition[staggered;dur=1].</span></p>`;
} else if (action.tag === 'fire') {
    footnote = `<p><span style="font-size: 1.1em"><strong>Elemental Touch:</strong>Your hands ignite and shed light as a torch. Your touch may cause targets to catch on fire.</span></p>`;
}

shared.chatAttacks[0].effectNotesHTML = footnote;
// await buff.setFlag('ckl-roll-bonuses', 'bonus_footnote', footnote); // flags.ckl-roll-bonuses.bonus_footnote
// await buff.update({ 'system.level': cl });
await buff.setActive(true);

return;
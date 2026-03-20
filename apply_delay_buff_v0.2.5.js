//	version: 0.2.5
//  Set show on or off
const show = true;
if (!token)
	return ui.notifications.warn("Must select a token first!");
if (show) debugger;
//  Get the user input
const quantity = await getAmount();
if (!quantity)
	return;
const who = token.actor.name;
const what = quantity.strItem;

/*
//  PAUSE (if needed)
const pauseTime = 3000;
await new Promise(r => setTimeout(r, pauseTime));
 */
//  See if we already have the buff
let buff = actor._itemTypes.buff.getName("Delay");
if (!buff) {
	//  Get a new copy, update and activate
	const name = "Delay";
	const pack = "world.buffs";
	const uuid = game.packs.get(pack).index.getName(name).uuid;
	buff = await fromUuid(uuid);
	const itemData = game.items.fromCompendium(buff);
	if (show) {
		console.log(itemData);
		debugger
	}
	itemData.system.level = quantity.numItem;
	itemData.system.active = true;
	itemData.system.flags.dictionary.who = who;
	itemData.system.flags.dictionary.what = what;
	await Item.create(itemData, { parent: token.actor });
	
} else {
	//	Just update the existing copy
	await buff.setItemDictionaryFlag("who", who);
	await buff.setItemDictionaryFlag("what", what);
	await foundry.utils.setProperty(buff, "system.level", quantity.numItem);
	await foundry.utils.setProperty(buff, "system.active", true);	
}
return

function getAmount() {
	const { DialogV2 } = foundry.applications.api;
	const { StringField, NumberField } = foundry.data.fields;

	const strItemField = new StringField({
		label: "Tracking what?",
		initial: "",
	}).toFormGroup({}, { name: "strItem" }).outerHTML;
	if (show) console.log("strItemField:", strItemField);

	const numItemField = new NumberField({
		label: "Rounds of Delay:",
		initial: 1,
		min: 1,
		step: 1,
	}).toFormGroup({}, { name: "numItem" }).outerHTML;
	if (show) console.log("numItemField:", numItemField);

	const quantity = DialogV2.wait({
		window: {
			title: "Add a delay",
			icon: "strItem",
			icon: "numItem"
		},
		content: `${strItemField} ${numItemField}`,
		buttons: [{
			label: "Ok",
			icon: "strItem",
			icon: "numItem",
			callback: (_, button) => new FormDataExtended(button.form).object,
		}],
		rejectClose: false,
		modal: true
	});
	return quantity;
}

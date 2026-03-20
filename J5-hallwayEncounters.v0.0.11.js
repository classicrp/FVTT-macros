//	version 0.0.11

let skip = false;
let rslt = item.getItemDictionaryFlag("timer");

debugger

if (!item.system.active && rslt === "on") {
	console.log("false", "on");
// timer auto turned off with flag armed
	let dies = await new Roll("1d20").evaluate();
	if (dies.total <= 5) {
	// 25% chance to have an encounter
		const ids = ["N4CPOgbUybMQrVqg"];  // ...", "...", "..."];

		const rollTables = ids.map(id => ({ value: id, label: game.tables.get(id).name }));
		const inputs = Array.fromRange(1, 1).map(n => {
			const input = foundry.applications.fields.createSelectInput({
				name: `table${n}`,
				options: rollTables,
				blank: false,
			});
			return foundry.applications.fields.createFormGroup({
			input,
			label: `Table ${n}`,
			}).outerHTML;
		}).join("");

		const result = await foundry.applications.api.Dialog.input({
			content: inputs,
			window: { title: "Table Draw" },
		});
		if (!result) return;

		for (const k of Array.fromRange(1, 1)) {
			const table = game.tables.get(result[`table${k}`]);
			await table.draw();
		}
		await item.setItemDictionaryFlag("timer", "off");
		return;
	} else {
		msg = `<span style="font-family: Arial, sans serif; font-size: 1.1em">No <b><em>Hallway Encounter</em></b> at this time.</span>`;
		await ui.chat.processMessage(msg);
	}
	await item.setActive(true);
} else if (!item.system.active && rslt === "off") {
	//	turned off
	console.log("false", "off");
	skip = true;
	return;
} else if (item.system.active && rslt === "on") {
	//	running normally
	console.log("true", "on");
	skip = true;
	return;
} else if (item.system.active && rslt === "off") {
	//	turned on manually
	console.log("true", "off");
	skip = false;
} else {
	console.log("Can't get here from there!");
}
	
if (!skip) {
	/**
	* Premade simple dialog with a return value.
	* after user clicks button, confirmation will be boolean for yes/no
	*/
	const { Dialog } = foundry.applications.api;
	const confirmation = await Dialog.confirm({
		window: { title: 'Hallway Encounters' },
		content: `<p><span style="font-size: 1.2em">Continue with encounter timer?</span></p>`,
		modal: true,
	});
	console.log(confirmation);
//debugger
// do something with confirmation
	if (!confirmation) {
		await item.setItemDictionaryFlag("timer", "off");
		await item.setActive(false);
	} else {
		await item.setItemDictionaryFlag("timer", "on");
		await item.setActive(true);
	}
}
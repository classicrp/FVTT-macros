console.log("Macro.sw_losememories: active");
let succeeded = false;
let srcs = "", rslt = "", dies = "", tmp = "", itm = "";
let loc = 0, nextcount = 0;
const types = {
	wea: "weapon",
	spl: "spell",
	fea: "feat",
	skl: "skill"
}

// debugger

/*
	Pull "memories" from the list, store in the buff, then "deactivate" on actor
*/
	//	start drawing from memories
	let i = count;
	do {
		/* here we remove "memory" from list and store in dictionary */
		srcs = `1d${memories.length}`;
		dies = await new Roll(srcs).evaluate();
		loc = dies.total - 1;
		rslt = memories.at(loc);
		tmp = (rslt.type === "skl") ? pf1.config.skills[rslt.name] : rslt.name;
		msg += `<span style="font-family: Arial, sans serif; font-size: 1.0em">${types[rslt.type].capitalize()}: ${tmp}</span>\n`;
		nextcount = item.getItemDictionaryFlag("items") || 0;
		
		if (rslt.type === "wea") {
		//	Weapon proficiency
			nextcount++;
			await item.setItemDictionaryFlag("items", nextcount);
			tmp = (count < 10) ? "0" + nextnextcount.toString() : nextnextcount.toString();
			itm = actor.items.get(rslt.id);
			await item.setItemDictionaryFlag(`item${tmp}`, rslt);
			await itm.update({ ["system.proficient"]: false });
			await delete memories[loc];
			await memories.sort();
			await memories.pop();

		} else if (rslt.type === "spl") {
		//	Spell prepared
			nextcount++;
			await item.setItemDictionaryFlag("items", nextcount);
			tmp = (count < 10) ? "0" + nextcount.toString() : nextcount.toString();
			itm = actor.items.get(rslt.id);
			await item.setItemDictionaryFlag(`item${tmp}`, rslt);
			await itm.update({ ["system.preparation.value"]: 0 });
			await delete memories[loc];
			await memories.sort();
			await memories.pop();
		
		} else if (rslt.type === "fea") {
		//	Feat available
			nextcount++;
			await item.setItemDictionaryFlag("items", nextcount);
			tmp = (count < 10) ? "0" + nextcount.toString() : nextcount.toString();
			itm = actor.items.get(rslt.id);
			await item.setItemDictionaryFlag(`item${tmp}`, rslt);
			await itm.update({ ["system.disabled"]: true });
			await delete memories[loc];
			await memories.sort();
			await memories.pop();
		
		} else if (rslt.type === "skl") {
		//	Skill rank
			nextcount++;
			await item.setItemDictionaryFlag("items", nextcount);
			tmp = (count < 10) ? "0" + nextcount.toString() : nextcount.toString();
			await item.setItemDictionaryFlag(`item${tmp}`, rslt);
			await actor.update({ [`system.skills.${rslt.name}.rank`]: 0 });
			await delete memories[loc];
			await memories.sort();
			await memories.pop();
		
		} else {
		//  what?
			msg = "Problem with the source item array. Contains corrupt data.";
			console.log(`${head} ${msg}`);
			shared.rejected = true;
			succeeded = false;
			return succeeded;
		}
		
		i--;
	}
	while (i > 0);
	await ui.chat.processMessage(msg);
	
return true
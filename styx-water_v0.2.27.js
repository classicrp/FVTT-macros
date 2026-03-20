/*	
	==========================================================================
	Author: classicrp, raydenx
	Date: 2026-01-01
	==========================================================================
	<actor> is the actor the buff (item) resides in
	<item> is the item object (buff) launching the request.
	Returns: boolean
	==========================================================================
*/
const curVer = 'v0.2.27';
const head = `Macro.styx-water(${curVer}): `;
let msg = '';
let succeeded = false;
/*
	Declarations
*/
let count = 0, rslt =  0, loc = 0;
let itm = "", dies = "", srcs = "", tmp = "";
const types = {
	wea: "weapon",
	spl: "spell",
	fea: "feat",
	skl: "skill"
}
const listObj = {
	type: "",
	name: "",
	id: "",
	value: ""
}
let listA = [];

debugger

if (actor.itemTypes.spell.length === 0 && actor.itemTypes.weapon.length === 0 && actor.itemTypes.feat.length === 0) {
//	can only happen on a "blank" actor like 'Styx Water Timer'
	ui.notifications.error(`${actor.name} is not a valid actor!`);
	return;
}

tmp = await item.getItemDictionaryFlag("clock");

if (item.system.level === 0) {
//	applied to actor but not yet Activated
	srcs = "1d4";
	dies = await new Roll(srcs).evaluate();
	count = dies.total;		//  dice[0].results[0].result;
	await item.update({ ["system.level"]: count });
}

if (tmp === "off") {
	//	Manually activated, turn the clock on
	await item.setItemDictionaryFlag("clock", "on");
	tmp = await item.getItemDictionaryFlag("clock");
}

if (tmp === "on") {
	
	if (action === null) {
	//	applied to actor but not yet Activated
		
		if (Number(item.getItemDictionaryFlag("items")) === 0) {
		//	first time through so ask what to apply
		
			tmp = "styx-water";
			/*-			CONFIGURATION			-*/
			const targetMacro = "useAction";
			const commandOverride = `My: ${tmp}`;
		
			/*-			COMMAND					-*/
			if (typeof shared !== "undefined")
				event.args = arguments;
			window.macroChain = [commandOverride || this.name].concat(window.macroChain ?? []);
			await game.macros.getName(targetMacro)?.execute({
				actor,
				token,
				item
			});

			msg = "Activated without choosing the use case."
			console.log(`${head} ${msg}`);
			shared.rejected = true;
			return;
		} else {
		//	just making sure that the buff is active
			return;
		}
	}
/*
	Determine how many "memories" are affected
*/
	if (action.tag === "splashed") {
	//	1d3 random
		await item.addItemBooleanFlag("splashed");
		await item.removeItemBooleanFlag("immersed");
		srcs = "1d3";
		tmp = 15;
		dies = await new Roll(srcs).evaluate();
		count = dies.total;		//  dice[0].results[0].result;
		msg =`<span style="font-family: Arial, sans serif; font-size: 1.0em">${actor.name}, a splash from the river Styx has caused you to forget [rslt] skills, spells and/or feats.</span>\n`
		console.log(srcs, count, msg);

	} else if (action.tag === "immersed") {
	//	2d4 random
		await item.removeItemBooleanFlag("splashed");
		await item.addItemBooleanFlag("immersed");
		srcs = "2d4";
		tmp = 20;
		dies = await new Roll(srcs).evaluate();
		count = dies.total;		// dice[0].results[0].result;
		msg =`<span style="font-family: Arial, sans serif; font-size: 1.0em">${actor.name}, being in the river Styx has caused you to forget [rslt] skills, spells and/or feats.</span>\n`
		console.log(srcs, count, msg);

	} else {
	//	huh?
		msg = "An unknown action tag was selected.  No dice roll made.";
		console.log(`${head} ${msg}`);
		shared.rejected = true;
		return succeeded;
	}

	dies = null;
	
	rslt = await actor.rollSavingThrow('will', {skipDialog:false, chatMessage:true, dc:tmp});
	if (!rslt) return;		// dialog was aborted
	
	itm = await actor.items.getName("styx-water");
	if (rslt.rolls[0].isSuccess) {
	//	Succeeded saving throw. No further effect.
		await ui.notifications.info("No worries mate!");
		shared.rejected = false;
		succeeded = true;
		//	turn off the buff
		await item.setActive(true);
		if (action.tag === "immersed"  && typeof itm !== "undefined") {
		//	turn off timer
			await itm.setItemDictionaryFlag("clock", "off");
			await itm.setActive(false);
		}
	
	} else {
	//	Failed saving throw. See how bad and continue.
		if (rslt.rolls[0].isNat1) {
			await ui.notifications.warn("Ouch! This will not be pleasant.");
			count = count * 2;
		}
		msg = msg.replace("[rslt]", count);
		
		if (action.tag === "immersed") {
		//	turn on timer
			tmp = (typeof itm !== "undefined") ? await itm.setActive(true) : null;
			if (tmp === null) {
			//	apply the timer buff
				/*-			CONFIGURATION			-*/
				const targetMacro = "applyBuff";
				const commandOverride = "#Item.HLqA2PyatxCtCIuC";

				/*-			COMMAND					-*/
				if (typeof shared !== "undefined")
				event.args = arguments;
				window.macroChain = [commandOverride || this.name].concat(window.macroChain ?? []);
				await game.macros.getName(targetMacro)?.execute({
					actor,
					token
				});
				itm = await actor.items.getName("styx-water");
			}
			await itm.setItemDictionaryFlag("clock", "on");
		}
	}
				
	if (count > 0 && !succeeded) {
/*
	Build the master list of "memories"
*/
		/*	for weapons, we set proficient = false  */
		let wea = actor._itemTypes.weapon.filter(i => i.system.proficient === true);
		wea.forEach (w => {
			let O = listObj.constructor();
			O.type = "wea";
			O.name = w.name;
			O.id = w.id;
			O.value = w.system.proficient;
			listA.push(O);
		});
		wea = null;

		/*	for spells, we set prepared = false  */
		let spl = actor._itemTypes.spell.filter(i => i.system.spellbook === "primary" && i.system.preparation.value > 0);
		if (typeof spl !== "undefined") {
		// check if spl is undefined or empty for non-casters	
			spl.forEach (s => {
				let O = listObj.constructor();
				O.type = "spl";
				O.name = s.name;
				O.id = s.id;
				O.value = s.system.preparation.value;
				listA.push(O);
			});
			spl = null;
		}
		
		/*	for feats, we set disabled = true  */
		let fea = actor._itemTypes.feat.filter(i => i.subType === "feat" && i.system.disabled === false);
		fea.forEach (f => {
			let O = listObj.constructor();
			O.type = "fea";
			O.name = f.name;
			O.id = f.id;
			O.value = f.system.disabled;
			listA.push(O);
		});
		fea = null;

		let skl = actor.system.skills;
		for (let s in skl) {
			let O = listObj.constructor();
			O.type = "skl";
			O.name = s;
			O.id = s;
			O.value = skl[s].rank;
			if (O.value > 0) {
			//	only interested in learned skills
				listA.push(O);
			}
		}
		skl = null;

/*
	Pull "memories" from the list, store in the buff, then "deactivate" on actor
*/
	//	start drawing from listA
		let i = count;
		do {
			/* here we remove "memory" from list and store in dictionary */
			srcs = `1d${listA.length}`;
			dies = await new Roll(srcs).evaluate();
			loc = dies.total - 1;
			rslt = listA.at(loc);
			tmp = (rslt.type === "skl") ? pf1.config.skills[rslt.name] : rslt.name;
			msg += `<span style="font-family: Arial, sans serif; font-size: 1.0em">${types[rslt.type].capitalize()} ${tmp}</span>\n`;
			count = item.getItemDictionaryFlag("items") || 0;
			
			if (rslt.type === "wea") {
			//	Weapon proficiency
				count++;
				await item.setItemDictionaryFlag("items", count);
				tmp = (count < 10) ? "0" + count.toString() : count.toString();
				itm = actor.items.get(rslt.id);
				await item.setItemDictionaryFlag(`item${tmp}`, rslt);
				await itm.update({ ["system.proficient"]: false });
				await delete listA[loc];
				await listA.sort();
				await listA.pop();

			} else if (rslt.type === "spl") {
			//	Spell prepared
				count++;
				await item.setItemDictionaryFlag("items", count);
				tmp = (count < 10) ? "0" + count.toString() : count.toString();
				itm = actor.items.get(rslt.id);
				await item.setItemDictionaryFlag(`item${tmp}`, rslt);
				await itm.update({ ["system.preparation.value"]: 0 });
				await delete listA[loc];
				await listA.sort();
				await listA.pop();
			
			} else if (rslt.type === "fea") {
			//	Feat available
				count++;
				await item.setItemDictionaryFlag("items", count);
				tmp = (count < 10) ? "0" + count.toString() : count.toString();
				itm = actor.items.get(rslt.id);
				await item.setItemDictionaryFlag(`item${tmp}`, rslt);
				await itm.update({ ["system.disabled"]: true });
				await delete listA[loc];
				await listA.sort();
				await listA.pop();
			
			} else if (rslt.type === "skl") {
			//	Skill rank
				count++;
				await item.setItemDictionaryFlag("items", count);
				tmp = (count < 10) ? "0" + count.toString() : count.toString();
				await item.setItemDictionaryFlag(`item${tmp}`, rslt);
				await actor.update({ [`system.skills.${rslt.name}.rank`]: 0 });
				await delete listA[loc];
				await listA.sort();
				await listA.pop();
			
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
		
	} else {
	//	check for count not a positive integer
		if (!count > 0) {
			msg = "Dice roll returned a non-positive integer.";
			console.log(`${head} ${msg}`);
			shared.rejected = true;
			succeeded = false;
			return succeeded;
		}
	}
	
}

return succeeded;
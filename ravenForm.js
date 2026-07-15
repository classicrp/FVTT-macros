// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime

/*	==========================================================================
	author: classicrp, @raydenx
	date: 2025-11-06
	==========================================================================
	<actor> is passed in directly from the Feature. required in order to
	effect the changes caused by changing shape.
	<token> is passed in directly from the Feature. required in order to
	effect the changes caused by changing shape.
	returns: boolean

	from Discord::FVTT#macro-polo @thatlonelybugbear:
	```
	const newItem = await fromUuid('uuid of the new item');
	const newItemData = game.items.fromCompendium(newItem);
	for (const actor of game.actors) {
	  const item = actor.items.getName('name of the item to be replaced');
	  if (item) {
		await item.delete();
		await actor.createEmbeddedDocuments('Item', [newItemData]);
	  }
	}
	```
*/
	const curVer = '20200715-1616';
	const head = `Macro.ravenForm(${curVer}): `;
	let msg = '';
	let failure = Boolean(false);
	//	========================================================= //

	const poisonAttr = 'system.disabled';
	const getPoison = 'items.getName("Poison")'
	let itemPoison = actor.items.getName('Poison');	// ItemFeatPF
	const actorAttr = 'img';
	const actorImp = 'worlds/pf1e/sbcimport/1_6_Malekith_Ravensende-Darkholme.jpg';
	const actorRaven = 'worlds/pf1e/sbcimport/1_3_Malekith_Ravensende-Darkholme.jpg';
	const tokenAttr = 'texture.src';
	const tokenImp = 'worlds/pf1e/sbcimport/1_7_Malekith_Ravensende-Darkholme.png';
	const tokenRaven = 'worlds/pf1e/sbcimport/1_5_Malekith_Ravensende-Darkholme.png';
	const flyAttr = 'system.attributes.speed.fly.base';				// 50ft || 40ft (but 60 due to shape change)
	const landAttr = 'system.attributes.speed.land.base';			// 20ft || 10ft
	const manAttr = 'system.attributes.speed.fly.maneuverability';	// "perfect" || "average" (but 'good' due to shape change)
	const llAttr = 'system.traits.senses.ll.enabled';				// low-light vision, true || false
	const sidAttr = 'system.traits.senses.sid';						// see-in-the-dark, true || false
	const lsAttr = 'system.traits.senses.ls.value';					// life sense (since SID doesn't actually work, 60ft || 0ft
	const pack = "crp-contents.crp-items";
	const stingUuid = game.packs.get(pack).index.getName('Sting').uuid;
	const beakUuid = game.packs.get(pack).index.getName('Beak').uuid;

	if (state) {
		// RAVEN fly 40' average
		// Turned on, now we disable *Poison* and *Sting*, enable *Beak*, set images to *Raven*,
		//		enable low-light vision, disable see-in-the-dark and set life-sense to 0.
		await itemPoison.update({ [poisonAttr]: true });  			// this works
		await actor.update({ [flyAttr]: 60 });						// this works
		await actor.update({ [manAttr]: 'good' });				// this works
		await actor.update({ [actorAttr]: actorRaven });			// this works
		await actor.update({ [landAttr]: 10 });						// this works
		await actor.update({ [llAttr]: true });
		await actor.update({ [sidAttr]: false });
		await actor.update({ [lsAttr]: 0 });
		await token.document.update ({ [tokenAttr]: tokenRaven });	// this works
		//	Add 'Beak'
		const beak = await fromUuid(beakUuid);
		const beakData = game.items.fromCompendium(beak);
		await Item.create(beakData, {parent: actor});
		//	Remove 'Sting'
		const sting = await actor.items.find(i => i._stats.compendiumSource === stingUuid && i.name === 'Sting');
		if (typeof sting !== "undefined") {
			await sting.delete();
		}

	} else {
		// IMP fly 50' perfect 
		// Turned off, now we enable *Poison* and *Sting*, disable *Beak* and set images back to *Imp*
		//		disable low-light vision, enable see-in-the-dark and set life-sense to 60.
		await itemPoison.update({ [poisonAttr]: false });  			// this works
		await actor.update({ [flyAttr]: 50 });						// this works
		await actor.update({ [manAttr]: 'perfect' });				// this works
		await actor.update({ [actorAttr]: actorImp });				// this works
		await actor.update({ [landAttr]: 20 });						// this works
		await actor.update({ [llAttr]: false });
		await actor.update({ [sidAttr]: true });
		await actor.update({ [lsAttr]: 60 });
		await token.document.update ({ [tokenAttr]: tokenImp });	// this works
		//	Add 'Sting'
		const sting = await fromUuid(stingUuid);
		const stingData = game.items.fromCompendium(sting);
		await Item.create(stingData, {parent: actor});
		//	Remove 'Beak'
		const beak = await actor.items.find(i => i._stats.compendiumSource === beakUuid && i.name === 'Beak');
		if (typeof beak !== "undefined") {
			await beak.delete();
		}
	}

return failure;
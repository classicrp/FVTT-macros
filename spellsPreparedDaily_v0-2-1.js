/*
	==========================================================================
	Macro Title: Spells Prepared Daily Macro for Foundry VTT PF1e
	Author: classicrp, @raydenx (https://github.com/classicrp)
	Last updated 2026-03-16
	License: MIT License
	
	Description:
	Allows the GM or Player to output to chat the number of spell that the
	character can prepare each day.  Will list if they have a bonus Spell
	per spell level due to domain, school, patron, bloodline, etc.
	
	Usage: Run the macro from the character's spell casting class feature
	(i.e. Wizard Spells) by executing the "Prepares" option.
	Foundry Version: v12+ / v13.351
	
	Dictionary: Source Feature must have "spellbook" defined as one of;
				{"primary" , "secondary", "tertiary", "spelllike"}
  	<actor> is passed in directly from the activating feature. Required in
    order to set the dictionary value on said item.
	Returns: output to chat.
	==========================================================================
*/
	const curVer = "v0.2.1";
	const head = `Macro.spellsPreparedDaily(${curVer}): `;
	let msg = "";
	let failState = false;
//	=========================================================

    if (action.tag !== "prepare") {
        //  not this macro
        return;
    }

//debugger;

//	build array from school in Dictionary

	//	get the name of the spellbook we want
	const spBook = await item.getItemDictionaryFlag('spellbook');	//	i.e. 'primary'
	let spBookSrc = await deepClone(actor.system.attributes.spells.spellbooks[spBook]);
	const spBookAttr = `system.attributes.spells.spellbooks.${spBook}`;
	const saSLCAttr = `autoSpellLevelCalculation`;
	const saSLAttr = `autoSpellLevels`;
	const sSPUSAttr = `spellPoints.useSystem`;

	// 	set this to use normal spell progression so we can read configured settings
	spBookSrc[saSLAttr] =  true;		// this disables <bsPUS>
	spBookSrc[saSLCAttr] =  true;		// this disables <bsPUS>
	await actor.update({ [spBookAttr]: spBookSrc });
	//	have to reload <spBookSrc>
	spBookSrc = await deepClone(actor.system.attributes.spells.spellbooks[spBook]);
	let baSLC = await spBookSrc.autoSpellLevelCalculation;
	let baSL = await spBookSrc.autoSpellLevels;
	let bsPUS = await spBookSrc.spellPoints.useSystem;
	
	const bAbil = await spBookSrc.ability;
	const bAbilMod = await actor.system.abilities[bAbil].mod;
	
	let bClass = await item.system.associations.classes[0];
	const bCl = await spBookSrc.cl.total;
	const bsPM = await spBookSrc.spellPreparationMode;
	const bSpells = await spBookSrc.spells;
	let bOut = [], i = 0, zAllot = 0, bPoints = 0, bSlots = 0, zCasts = 0;
	let sDomain = "", sHTML = "", sOut = "";
	let tBase = 0, tBonus = 0, tDomain = 0;
	if (bClass.includes("Witch")) {
		sDomain = "Patron";
	} else if (bAbil === "wis") {
		sDomain = "Domain";
	} else {
		sDomain = "School";
	}
	
	const sTitle = "Prepare spells per level (incl. Spell Points)";
	const msgHeader = `<div class="pf1 chat-card item-card" data-actor-id="${actor.name}" data-item-id="${item.name}" data-action-id="${item.actions?.name}"><header class="card-header type-color type-spell flexrow"><h3 class="item-name" style="text-align: center; text-shadow: 2px 2px 2px black; font-weight: normal; font-size: 1.5em;">${sTitle}</h3></header></div><div><section style="font-size:0.9em">`;
	let msgMid = `<ul class="dice-rolls">`;
		
	for ( i = 0; i < 10; i++ ) {
		let s = bSpells[`spell${i}`];
		let abil = 0;
		if (i === 0) {
			abil = bAbilMod;
			zCasts = bAbilMod + 4 + s.domain.max;
			zAllot = (bCl === 1) ? 3 : 4;
			sOut = `${i}: ${zAllot}[Base] + ${abil}[Bonus] + ${s.domain.max}[${sDomain}] = ${zCasts}[Total].`;
			bOut.push(sOut);
			msgMid += `<li>${sOut}</li>`;
			
		} else {	
			if (s.base !== 0) {
			//	active spell slots
				abil = s.casts.max - s.base;
				zCasts = s.base + abil + s.domain.max;
				bPoints += (zCasts * i);
				tBase += (s.base * i);
				tBonus += (abil * i);
				tDomain += (s.domain.max * i);
				sOut = `${i}: ${s.base}[Base] + ${abil}[Bonus] + ${s.domain.max}[${sDomain}] = ${zCasts}[Total].`
				bOut.push(sOut);
				msgMid += `<li>${sOut}</li>`;
			} else {
				if (bSlots === 0) {
				//	this is the maximum spell level that can be cast
					bSlots = i - 1;
				}
			}
		
		}
		if (!bSlots) {
			console.log(bOut[i]);
		}
	}
	let msgBot = `</ul>`;
	const bSP = `Spell Points: ${bPoints}, Max spell level: ${bSlots}.`;
	const bForm = `${tBase}[Base] + ${tBonus}[Bonus] + ${tDomain}[${sDomain}]`;
	msgBot += msgBot + `<p>${bSP}</p><p>${bForm}</p></section></div>`;
	//	make sure we have the latest formula, and use charges set to zero.
	await item.update({ ["system.uses.maxFormula"]: bForm });
	await item.update({ ["system.uses.autoDeductChargesCost"]: 0 });
	//	now update the actual spell book page
	
	console.log(bSP + " " + bForm);

	// set this back to use spell points system
	spBookSrc[saSLAttr] =  false;
	spBookSrc[saSLCAttr] =  false
	await actor.update({ [spBookAttr]: spBookSrc });

	// reload to force setting attributes, weird but does not work properly otherwise 
	spBookSrc = await deepClone(actor.system.attributes.spells.spellbooks[spBook]);
	spBookSrc[sSPUSAttr] = true;
	spBookSrc.spellPoints.maxFormula = bForm;
	await actor.update({ [spBookAttr]: spBookSrc });

	sHTML = msgHeader + msgMid + msgBot;
	shared.chatAttacks[0].effectNotesHTML = await sHTML;
//	await ui.chat.processMessage(sHTML);
	//	set this back last
	return
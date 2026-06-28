/*
	==========================================================================
	Macro Title: Spells Prepared Daily Macro for Foundry VTT PF1e
	Author: classicrp, @raydenx (https://github.com/classicrp)
	Last updated 2026-06-27
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
	const curVer = "v0.3.0";
	const head = `Macro.spellsPreparedDaily(${curVer}): `;
	let msg = "";
	let failState = false;
    const VERBOSE = 4;
    const LF = String.fromCharCode(10);
//	=========================================================
//debugger
    if (action.tag !== "prepare") {
        //  not this macro
        return;
    }

//	build array from school in Dictionary
debugger
	//	get the name of the spellbook we want
	const spBook = await item.getItemDictionaryFlag('spellbook');	//	i.e. 'primary'
	const spBookSrc = await deepClone(actor.system.attributes.spells.spellbooks[spBook]);
    const splbkD = createSpellbookObject();
	splbkD.spellclass = spBookSrc.name.toLowerCase() || item.system.associations.classes[0].toLowerCase();
	splbkD.cl = spBookSrc.cl.total;
	splbkD.preptype = spBookSrc.spellPreparationMode;
    splbkD.type = spBookSrc.casterType;
	splbkD.ability = spBookSrc.ability;
	splbkD.ablMod = actor.system.abilities[splbkD.ability].mod;
    splbkD.kind = spBookSrc.kind;
    splbkD.domain = spBookSrc.domainSlotValue;

	const spBookAttr = `system.attributes.spells.spellbooks.${spBook}`;

    const spellinfo = getSpellinfoData(splbkD);

	const bSpells = await spBookSrc.spells;
	let bOut = [], i = 0, zAllot = 0, splPoints = 0, bSlots = 0, zCasts = 0;
	let sDomain = "", sHTML = "", sOut = "", temp = null;
	let tBase = 0, tBonus = 0, tDomain = 0;

    const sTitle = "Prepare spells per level (incl. Spell Points)";
	const msgHeader = `<div class="pf1 chat-card item-card" data-actor-id="${actor.name}" data-item-id="${item.name}" data-action-id="${item.actions?.name}"><header class="card-header type-color type-spell flexrow"><h3 class="item-name" style="text-align: center; text-shadow: 2px 2px 2px black; font-weight: normal; font-size: 1.5em;">${sTitle}</h3></header></div><div><section style="font-size:0.95em">`;
	let msgMid = `<ul class="dice-rolls">`;
		
	for ( i = 0; i < 10; i++ ) {
        if (foundry.utils.isEmpty(spellinfo[3].prepPD[i])) continue;
        if (i === 0) {
            tBase = spellinfo[0].prepPD[i] || 0;
            tBonus = spellinfo[1].prepPD[i] || 0;
            tDomain = spellinfo[2].prepPD[i] || 0;
            zCasts = spellinfo[3].prepPD[i] || 0;
            sOut = `${i}: ${tBase}[Base] + ${tBonus}[Bonus] + ${tDomain}[${spellinfo[2].name}] = ${zCasts}[Total].`;
			bOut.push(sOut);
			msgMid += `<li>${sOut}</li>`;
			
		} else {	
			//	active spell slots
                let zC = spellinfo[3].prepPD[i] || 0;
				zCasts += (zC * i);
                let tBa = spellinfo[0].prepPD[i] || 0;
				tBase += (tBa * i);
                let tBo = spellinfo[1].prepPD[i] || 0;
				tBonus += (tBo * i);
                let tDo = spellinfo[2].prepPD[i] || 0;
				tDomain += (tDo * i);
                sDomain = spellinfo[2].name;
				splPoints += zCasts;
				sOut = `${i}: ${tBa}[Base] + ${tBo}[Bonus] + ${tDo}[${sDomain}] = ${zC}[Total].`;
				bOut.push(sOut);
				msgMid += `<li>${sOut}</li>`;		
		}
		console.log("Breakdown:", bOut[i]);
	}
    let msgBot = `</ul>`;
	const bSP = `Spell Points: ${zCasts}, Max spell level: ${spellinfo.length}.`;
	const bForm = `${tBase}[Base] + ${tBonus}[Bonus] + ${tDomain}[${sDomain}]`;
	msgBot += msgBot + `<p>${bSP}</p><p>${bForm}</p></section></div>`;
	//	make sure we have the latest formula, and use charges set to zero.
    await item.update({ ["system.uses.maxFormula"]: bForm });
	await item.update({ ["system.uses.autoDeductChargesCost"]: 0 });
	await actor.update({ [`system.attributes.spells.spellbooks.${spBook}.spellPoints.maxFormula`]: bForm });
	
	//	now update the actual spell book page
	
	console.log(bSP + " " + bForm);
/*
	// set this back to use spell points system
	spBookSrc[saSLAttr] =  false;
	spBookSrc[saSLCAttr] =  false
	await actor.update({ [spBookAttr]: spBookSrc });

	// reload to force setting attributes, weird but does not work properly otherwise 
	spBookSrc = await deepClone(actor.system.attributes.spells.spellbooks[spBook]);
	spBookSrc[sSPUSAttr] = true;
	spBookSrc.spellPoints.maxFormula = bForm;
	await actor.update({ [spBookAttr]: spBookSrc });
*/
	sHTML = msgHeader + msgMid + msgBot;
	shared.chatAttacks[0].effectNotesHTML = await sHTML;
//	await ui.chat.processMessage(sHTML);
	//	set this back last
	return;
	
function getSpellinfoData(splbkD) {
/*	splbkD ("spellbookData" object)
*/
	if (VERBOSE >= 4) {
		console.log("getSpellinfoData() passed:", LF, 
			"actor:", actor);
	}
	//	HANDLE SPELLINFO
	//	Get BASE caster info
	const result = [];
	const spellCPD = pf1.config.casterProgression.castsPerDay[splbkD.preptype][splbkD.type][splbkD.cl];
	const maxSpellLvl = spellCPD.length - 1;
	const spellPPD = pf1.config.casterProgression.spellsPreparedPerDay[splbkD.preptype][splbkD.type][splbkD.cl];
	const base = createSpellinfoObject();
	base.spellclass = splbkD.spellclass;
	base.name = "Base";
	if (spellPPD[0] === null) spellCPD[0] = null;
	if (spellCPD) base.castPD = spellCPD;
	if (spellPPD) base.prepPD = spellPPD;
	result.push(base);
	//	Get BONUS spell info
	const bonus = createSpellinfoObject();
	bonus.spellclass = splbkD.spellclass;
	bonus.name = "Bonus";
	const bonusCPD = getSpellAbilityBonuses(splbkD.ablMod, maxSpellLvl, true);
	if (bonusCPD) {
		if (spellCPD[0] === null) bonusCPD[0] = null;
		bonus.castPD = bonusCPD;
		bonus.prepPD = bonusCPD;
	}
	result.push(bonus);
	//	Get School, Domain, Patron, etc. info
	const domain = createSpellinfoObject();
	let temp = "";
	if (splbkD.spellclass === "witch") {
		temp = "Patron";				
	} else if (splbkD.spellclass === "bard") {
		temp = "College";				
	} else if (splbkD.spellclass === "sorcerer") {
		temp = "Bloodline";				
	} else if (splbkD.kind === "alchemy") {
		temp = "Field";
	} else if (splbkD.kind === "arcane") {
		temp = "School";
	} else if (splbkD.kind === "divine") {
		temp = "Domain";
	} else if (splbkD.kind === "psionic") {
		temp = "Discipline";
	} else if (splbkD.kind === "psychic") {
		temp = "Discipline";
	} else {
        console.error("Unknown kind:", splbkD.kind);
        return;
    }
	domain.spellclass = splbkD.spellclass;
	domain.name = temp;
debugger
	if (splbkD.domain) {
		for (let i = 0; i <= maxSpellLvl; i++) {
			if (i === 0) {
				domain.castPD.push(0);
				domain.prepPD.push(0);					
			} else {
				domain.castPD.push(1);
				domain.prepPD.push(1);
			}
		}
	}
	result.push(domain);
	const total = summarizeSpellinfoData(result);
	result.push(total);
	if (VERBOSE >= 3) console.log("getSpellinfoData()", result);
	return result;
};

function getSpellAbilityBonuses(mod, max, opt) {
/*	mod (ability.modifier 'ablMod' Number),
*	max (maximum spell level Number),
* 	opt ("optional rules" Boolean)
*/
/*
	Table 1-3: Ability Modifiers and Bonus Spells
				SPELL LEVEL
	SCORE MOD	0	1	2	3	4	5	6	7	8	9
			0	—	—	—	—	—	—	—	—	—	—
	12-13	1	—	1	—	—	—	—	—	—	—	—
	14-15	2	—	1	1	—	—	—	—	—	—	—
	16-17	3	—	1	1	1	—	—	—	—	—	—
	18-19	4	—	1	1	1	1	—	—	—	—	—
	20-21	5	—	2	1	1	1	1	—	—	—	—
	22-23	6	—	2	2	1	1	1	1	—	—	—
	24-25	7	—	2	2	2	1	1	1	1	—	—
	26-27	8	—	2	2	2	2	1	1	1	1	—
	28-29	9	—	3	2	2	2	2	1	1	1	1
	30-31	10	—	3	3	2	2	2	2	1	1	1
	32-33	11	—	3	3	3	2	2	2	2	1	1
	34-35	12	—	3	3	3	3	2	2	2	2	1
	36-37	13	—	4	3	3	3	3	2	2	2	2
	38-39	14	—	4	4	3	3	3	3	2	2	2
	40-41	15	—	4	4	4	3	3	3	3	2	2
	42-43	16	—	4	4	4	4	3	3	3	3	2
	44-45	17	—	5	4	4	4	4	3	3	3	3
			18	-	5	5	4	4	4	4	3	3	3
			19	-	5	5	5	4	4	4	4	3	3
			20	-	5	5	5	5	4	4	4	4	3

	a. no bonuses for zero level spells.
	b. starting bonus formula: ceil(MOD/4), gives starting bonus for 1st level.
	c. MOD determines how many spell levels get bonuses, max 9.
	d. For each increased spell level, decrease MOD by 1 and apply starting bonus formula.
*/
	if (VERBOSE >= 4) {
		console.log("getSpellAbilityBonuses() passed:", LF, 
			"mod:", mod, LF, 
			"max:", max, LF, 
			"opt:", opt);
	}
	const result = [];
	if (mod === 0) return result;
	let calc = 0;
	for (let lvl = 0; lvl <= max; lvl++) {
		if (lvl === 0) {
			//  if using "homebrew option", zero level spells
			//	get a prepare/known bonus equal to ceil(MOD/3).
			if (opt) calc = Math.ceil(mod/3);
		} else {
			calc = Math.ceil((mod - lvl + 1)/4);
		}
		result.push(calc);
	}
	if (VERBOSE >= 3) console.log("getSpellAbilityBonuses()", result);
	return result;
};

function createSpellinfoObject() {
	const result = {
		spellclass: "",
		name: "",
		castPD: [],
		prepPD: []
	}
	return result;
};

function createSpellbookObject() {
	const result = {
		tag: "",			//	src.system.tag
		name: "",			//	gestalt?.class || src.name (capitalized) 
//									=== act.system.attributes.spells.spellbooks ??.label || .name
		spellclass: "",		//	gestalt?.tag || src.system.tag (lowercase)
		spellbook: "",		//	act.system.attributes.spells.spellbooks?
		archetype: "",		//	gestalt?.archetype || archetype
		concentration: "",	//	act.system.attributes.spells.spellbooks ??.concentration
		cl: 0,				//	act.system.attributes.spells.spellbooks? ?.cl
		clnotes: "",		//	//	act.system.attributes.spells.spellbooks? ?.clNotes
		baseDCFormula: "",	//	act.system.attributes.spells.spellbooks? ?.baseDCFormula
		baseDCOut: 0,		//	derived
		spellinfo: [],		//	derived
		spells: [],			//	act._itemTypes.spell? => act._itemTypes.spell?.system.spellbook? === spellbook
		cloffset: "",		//	act.system.attributes.spells.spellbooks? ?.castPerDayAllOffsetFormula
		ability: "",		//	act.system.attributes.spells.spellbooks? ?.ability
		ablMod: 0,			//	derived
		cnotes: "",			//	act.system.attributes.spells.spellbooks ??.concentrationNotes
		asf: false,			//	act.system.attributes.spells.spellbooks ??.arcaneSpellFailure
		domain: 0,			//	act.system.attributes.spells.spellbooks ??.domainSlotValue
		kind: "",			//	act.system.attributes.spells.spellbooks ??.kind
		type: "",			//	act.system.attributes.spells.spellbooks ??.casterType
		preptype: "",		//	act.system.attributes.spells.spellbooks ??.spellPreparationMode
		splPtsMax: 0,		//	act.system.attributes.spells.spellbooks ??.spellPoints.value
		rClose: 0,			//	act.system.attributes.spells.spellbooks ??.range.close
		rMedium: 0,			//	act.system.attributes.spells.spellbooks ??.range.medium
		rLong: 0,			//	act.system.attributes.spells.spellbooks ??.range.long
		spellpoints: false,	//	act.system.attributes.spells.spellbooks ??.spellPoints.useSystem
		cantrips: false,	//	act.system.attributes.spells.spellbooks ??.hasCantrips
		prepared: true,		//	act.system.attributes.spells.spellbooks ??.prepared
		psychic: false,		//	act.system.attributes.spells.spellbooks ??.psychic
		psionic: false,		//	derived: for now
		pure: true,			//	act.system.attributes.spells.spellbooks ??.pure
		spontaneous: false	//	act.system.attributes.spells.spellbooks ??.spontaneous
	}
	return result;
};

function summarizeSpellinfoData(result) {
/*	result ("spellinfo" object)
*/
	if (VERBOSE >= 4) {
		console.log("summarizeSpellinfoData() passed:", LF, 
			"result:", result);
	}
	let total = null, fltrd = "";
	//	summarize spellinfo data
	for (let i = 0; i < result.length; i++) {
		if (i === 0) {
			//	Copy "base" values
			total = createSpellinfoObject();
			total.name = "Total";
			//	FUCK! This was assigning a pointer to the original BASE data!
			//total.spellclass = result[i].spellclass;
			//total.castPD = result[i].castPD;
			//total.prepPD = result[i].prepPD;
			total.spellclass = deepClone(result[i].spellclass);
			total.castPD = deepClone(result[i].castPD);
			total.prepPD = deepClone(result[i].prepPD);
		} else {
			for (let j = 0; j < result[i].castPD.length; j++) {
				let _is = (j === 0 && total.castPD[0] === Infinity);
				//if (_is) total.castPD[0] = "i";
				if (!_is) {
					let cast = result[i].castPD[j];
					let existing = total.castPD[j];
					if (typeof cast === 'number' && typeof existing === 'number') {
						total.castPD[j] = existing + cast;
					}
				}
				_is = (j === 0 && total.prepPD[0] === null);	
				if (!_is) {
					let prep = result[i].prepPD[j];
					let existing = total.prepPD[j];
					if (typeof prep === 'number' && typeof existing === 'number') {
						total.prepPD[j] = existing + prep;
					}
				} else {
					// set Infinity to null since cantrips/orisons can't be cast
					if (total.castPD[0] === Infinity) total.castPD[0] = null;
				}
			}
		}
	}
	if (VERBOSE >= 3) console.log("summarizeSpellinfoData()", total);
	return total;
};
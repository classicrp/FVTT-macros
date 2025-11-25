// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime

 debugger;

//	========================================================= //
//  author: classicrp, raydenx
//	date: 2025-11-01
const curVer = 'v1.20';
const head = `Macro.impPoison(${curVer}): `;
let msg = '';
let failure = Boolean(false);
//	========================================================= //

//  location of the Roll Data Changes formula
const itmAttr = "system.changes.0.formula";
let itmDmg = await Number(foundry.utils.getProperty(item, itmAttr));

//  location and value of target actor's current constitution
const actAttr = "system.abilities.con.base";
const conBase = await foundry.utils.getProperty(actor, actAttr);

//  dictionary locations
const effect = "system.flags.dictionary.effect";
const curEff = await Number(foundry.utils.getProperty(item, effect));
const saves = "system.flags.dictionary.saves";
const curSav = await Number(foundry.utils.getProperty(item, saves));

//	if all set items are 0 then this is the first time through
let firstPass = itmDmg + curEff + curSav;

let conNew = 0;
let rollDmg = 0;

if (itmDmg == 0) {
// no effect currently active
	itmDmg = curEff;
};

if (state) {
// toggled on

	//  need to check save first as it could bypass damage
	if (firstPass == 0) {
		const lm = await game.macros.getName('impPoisonCheck');
		await lm.execute({ actor: actor, item: item, state: state, args: firstPass });
	};

	let dies = await new Roll("1d4").evaluate({async: true});
	let rollDmg = dies.total;
	let mult = 1;
	if (args) {
	//	A critical failure occurred during the check
		mult = 2;
	};
    conNew = conBase + (itmDmg - (mult * rollDmg));
  
    if (conNew <= 0) {
    // You have died!
        conNew = -conBase;
		//  more <code> to address this state

    } else {
	// ok to apply full penalty
	
		if (curEff == 0) {
		//  First time through, apply effect to buff formula
			conNew = -(mult * rollDmg);
		} else {
		//  we are stacking effects
			conNew = itmDmg - (mult * rollDmg);
		};

	};
	await item.update({ [effect]: conNew });
	await item.update({ [itmAttr]: conNew });

} else {
    // toggled off
    // remove penalty and reset save count and effect
    conNew = 0;
	if (actor.items.has('Imp Poison')) {
		await item.update({ [saves]: conNew });
		await item.update({ [effect]: conNew });
		await item.update({ [itmAttr]: conNew });
	} else {
	//  already deleted in impPoisonCheck
	};
};

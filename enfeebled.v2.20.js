// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime

/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-16
	==========================================================================
*/
const curVer = 'v2.20';
const head = `Macro.enfeebled(${curVer}): `;
let msg = '';
let failState = Boolean(false);
//	========================================================= //

//  value of the Roll Data Changes formula
const frmAttr = "system.changes.0.formula";
const frmVal = await foundry.utils.getProperty(item, frmAttr);

//  value of the actor's current strength
/*	cannot use <.total> as it is subject to change with buff effect
	use <.base> instead -- yes this may miss positive buffs
	only matters if effect stacks over multiple saves, otherwise
	just use <.total> or <.undrained> 
*/

const strAttr = "system.abilities.str.undrained";
const strVal = await foundry.utils.getProperty(actor, strAttr);

//	value of the dictionary stored
const effAttr = "system.flags.dictionary.effect";
const effVal = await foundry.utils.getProperty(actor, effAttr);

let strNew = 0;
let result;

//  it seems that when auto posted to an actor, duration is converted to a Number
//  we want it kept as a formula for when the <level> changes
const durAttr = "system.duration.value";
const durForm = "@item.level";
await item.update({ [durAttr]: durForm });

/*  CASES ====================================================================
	A. Touch attack was a critical success [CS] -- handled by actual attack
	B. Saving Throw was a critical failure [CF] -- double the dice roll
	C. Saving Throw was a regular failure [F] -- as is
	D. Saving Throw was a regular success [S] -- half total penalty
	E. Saving Throw was a critical success [CS] -- half of half penalty
	END CASES ================================================================ 
*/

debugger;
/*
system.changes.0 {
	_id = random(16),
	formula = " # ",
	operator = "add" or "set",
	priority = 0 (default),
	target = "strPen",
	type = "untyped",
*/
//	system.changes.0.formula

if (state) {
// toggled on

	//  to collect the result of the inspected saving throw
	let saveStatus = '';
	
	const lm = await game.macros.getName("checkLastChatSavingThrow");
	saveStatus = await lm.execute({ actor: actor, item: item });

	if (saveStatus !== null) {

/*	BEGIN APPLY PENALTY SECTION =========================================== */
		let dies = await new Roll("1d6").evaluate({async: true});
		let mult = 1;
		if (saveStatus == 'CF') { 
			mult = 2; 
		};
		let strPen = -((mult * dies.total) + Math.min(5, Math.floor(item.system.level / 2)));

		if (saveStatus == 'CF' || saveStatus == 'F') {
		//	save failed so apply penalty
			strNew = strVal + strPen;
			if (strNew <= 0) {
			// limit str min to 1
				strNew = -(strVal - 1);
			} else {
			// take full penalty
				strNew = strPen;
			};
			
		} else if (saveStatus == 'S') {
			//	Success case, ceil() not floor() because negative
			strNew = -Math.max(Math.floor(Math.abs(strPen) / 2), 1);
		} else {
			//	Critical Success case, ceil() not floor() because negative
			strNew = -Math.max(Math.floor(Math.abs(strPen) / 4), 1);
		};
		//	apply the penalty
		await item.update({ [frmAttr]: strNew });
		//	update dictionary value
		await item.update({ [effAttr]: strNew });
	};
/*	END APPLY PENALTY SECTION ============================================= */

} else {
// toggled off
	const lm = await game.macros.getName("getCurrentLongDate");
	const ldate = await lm.execute();
	console.log(ldate);
	msg = `<p style="font-family: Arial, sans-serif; font-size: 1.1em;">The effects of <em>${item.name}</em> have expired on <strong>${actor.name}</strong></p>`;
	ui.chat.processMessage(msg);
	//	remove the buff
	await item.delete()
};

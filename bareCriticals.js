const _VERSION = '0.2.6';
const _VERBOSE = true;
const _SHOW = true;
const _HEAD = `Macro.bareCriticals(${_VERSION})`;

/*	Changes chat output for an attack by removing all formula data that is
	not strictly a Die (or Dice) roll(s).  Does not currently include extras
	from the [Roll Bonuses] module or anything other than default system.
*/

	const ATTR_CHAT_ATK = "chatAttacks";
	const ATTR_DMG_TOT = "damage.total";
	const ATTR_CRITDMG_TOT = "critDamage.total";
	const ATTR_CRITDMG_HLF = "critDamage.half";
	const ATTR_CRIT_DMG = "critDamage";
	const ATTR_ROLLS = "rolls";
	const ATTR_FRML = "_formula";
	const ATTR_TRMS = "terms";
	const ATTR_EVAL = "_evaluated";
	const ATTR_TRMS_EVAL = "terms.0._evaluated";
	const ATTR_TRMS_TOT = "terms.0.total";
	const ATTR_TRMS_RSLT = "terms.0.results.0.result";
	const ATTR_TRMS_NMBR = "terms.0._number";
	const ATTR_TRMS_OPT_FLV = "terms.0.options.flavor";
	const ATTR_TRMS_EXP = "terms.0.expression";
	const ATTR_TOT = "_total";
	const ATTR_DATA = "data";
	const ATTR_OPTS = "options";
	const ATTR_OPT_TYP = "options.type";
	const ATTR_OPT_DMGTYP = "options.damageType";

	const RGX_SZRL = /(sizeRoll\(([^)]+)\)(?:\[([^\]]+)\])?)/i;
	const RGX_ROLL = /\b(?:\d+d\d+|\d+)\[Roll\]/i;

	let rslt;
	let fltrd;
	let frml;
	let type;
	let rolls;
	let len;
	let indices = [];
	let sum;
	let chkSZRL = false;
	let srcs = await foundry.utils.getProperty(shared, ATTR_CHAT_ATK);
	result = [];

//	if (_SHOW) debugger
	
	for (let s of srcs) {
		rolls = s[ATTR_CRIT_DMG][ATTR_ROLLS];
		len = rolls.length;
		sum = await foundry.utils.getProperty(s, ATTR_DMG_TOT);
		for (let i = 0; i < len; i++) {
			fltrd = [];
			let rolled = 0;
			let length = 0;
			let r = rolls[i];
			type = foundry.utils.getProperty(r, ATTR_OPT_TYP);

			if (type === "crit") {
				//	"crit" line specifically, keep as is
				rslt = await fltrd.push(r[ATTR_FRML]);

			} else {
				//	Match <rolls> formula to only include die expression

				if (r[ATTR_FRML].includes('sizeRoll')) {
					//	sizeRoll must be present, [Roll] is optional
					fltrd = r[ATTR_FRML].match(RGX_SZRL);
					chkSZRL = true;

				} else {
					//	[Roll] must be present for this capture
					fltrd = r[ATTR_FRML].match(RGX_ROLL);
					chkSZRL = false;
				}
			}
			if (foundry.utils.isEmpty(fltrd)) {
				rslt = await delete rolls[i];
				continue;
			}

			//	Change <rolls> formula to that of dice rolls only
			rslt = await foundry.utils.setProperty(r, ATTR_FRML, fltrd.at(0));
			length = r[ATTR_TRMS].length;
			for (let n = length; n !== 1; n--) {
				//	remove all <terms> not a die roll
				await r[ATTR_TRMS].pop();
			}
		}
		rslt = await collectLikeRolls(srcs, rolls);
		if (rslt.length > 0) {
		//	Only do this section if rolls were combined
			//	await reroll(rolls);
			if (_VERBOSE) console.log("Before:", rolls);
			len = rolls.length;
			for (let n = 0; n < len; n++) { 
				if (foundry.utils.isEmpty(rolls[n])) continue;
				const drd = await getDamageRollData(rolls[n]);
				//	Make a new roll based on changes
				//	.DamageRoll(e, t, s) where e = formula, t = data, s = options
				let roll = await new pf1.dice.DamageRoll(
					drd.formula, 
					drd.data,
					drd.options
				).evaluate();
				if (_VERBOSE) console.log("New Roll:", roll);
				//	Update the whole roll
				rslt = await delete rolls[n];
				rslt = await rolls.push(roll);
			}
			if (_VERBOSE) console.log("After:", rolls);
			rslt = await fixRolls(rolls);
			let critDmg = await getPropertySum(rolls, ATTR_TOT);
			let dmgTot = foundry.utils.getProperty(s, ATTR_DMG_TOT);
			sum = critDmg + dmgTot;
			rslt = await foundry.utils.setProperty(s, ATTR_CRITDMG_TOT, sum);
			if (_VERBOSE) console.log("Fixed and Updated:", rolls);
		}
		if (_SHOW) debugger
	}
return

function fixRolls(r) {
	let rslt = "";
	let len = r.length;
	rslt = r.sort();
	for (let n = 0; n < len; n++) {
		if (foundry.utils.isEmpty(r[n])) {
			// delete it
			r.pop();
		}
	}
	return
}

function collectLikeRolls(s, a) {
	let sum = 0;
	let current = null;
	let promise = [];
	const len = a.length;
	if (_SHOW) debugger
	for (let i = 0; i < len; i++) {
		//	step through each one and compare to next ones
		current = a[i];
		if (foundry.utils.isEmpty(current)) continue;
		frml = current[ATTR_FRML];
		indices = [];
		fltrd = [];
		rslt = a.forEach(getMatchingIndices);
		let number = fltrd.length;
		if (fltrd && number > 1) {
			//	We have multiples of current index
			let newFrml = "";
			if (frml.at(1) === "d") {
				//	Die expression
				newFrml = frml.replace(frml.at(0), number.toString());
				chkSZRL = false;
			} else if (frml.includes("sizeRoll")) {
				//	sizeRoll() expression
				newFrml = frml.replace(frml.at(9), number.toString());
				chkSZRL = true;
			}			
			//	Set combined <._formula> on first index
			rslt = foundry.utils.setProperty(current, ATTR_FRML, newFrml);
			//	Set new <._number> of dice on first index
			if (!chkSZRL) {
				// <
				rslt = foundry.utils.setProperty(current, ATTR_TRMS_NMBR, number);
			}
/*
			//	Set combined dice rolls <.result> on first index
			sum = getPropertySum(fltrd, ATTR_TRMS_RSLT);
			rslt = foundry.utils.setProperty(current, ATTR_TRMS_RSLT, sum);
			
			
			//	Set combined dice rolls <._total> on first index
			rslt = foundry.utils.setProperty(current, ATTR_TOT, sum);

			//	Set <.terms.0.options.expression> to new dice expression on first index
			let flv = foundry.utils.getProperty(current, ATTR_TRMS_OPT_FLV);
			let exprs = newFrml.replace(`[${flv}]`, "");
			rslt = foundry.utils.setProperty(current, ATTR_TRMS_EXP, exprs);
			

			//	Re-evaluate the current <roll>
			result.push(pf1.dice.DamageRoll
				.safeRoll({
					formula: newFrml,
					dataObject: current
				})
			);	//, rollData: current} ));
*/			
			promise.push(current.evaluate({ formula: newFrml }));
			//	Now delete the other copies
			let tbr = indices.filter(f => f !== i);
			for (let t of tbr) {
				delete a[t];
			}			
		}
	}
	return promise;
}

function getMatchingIndices(item, index) {
	if (item[ATTR_FRML] === frml) {
		indices.push(index);
		fltrd.push(item);
	}
	return;
}

function getPropertySum(a, attr) {
	let sum = 0;
	for (const me of a) {
		sum += foundry.utils.getProperty(me, attr);
	}
	return sum;
}

function getDamageRollData(r) {
	//	Grab the needed data from the current <roll>
	return {
		formula: foundry.utils.getProperty(r, ATTR_FRML),
		options: foundry.utils.getProperty(r, ATTR_OPTS),
		data: foundry.utils.getProperty(r, ATTR_DATA)
	}
}
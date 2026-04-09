const version = '0.1.0';
const verbose = true;
const show = true;
// Passed in: cmsg [ChatMessagePF], made [Number], needed [Number], consecutive [Boolean], 
//				damage (Array of [BuffDamageCRP {target, stored, rolled, total}]).

let rslt = await checkSave(cmsg.rolls[0], made, needed, consecutive, damage);
return rslt;

function checkSave(roll, made, need, consec, dmg) {
//	non-destructive function utilizing passed-in values
	let sav = made, mult = 1;
	let cf = false, cs = false;
	if (show) debugger
	if (roll.isNat20) {
	//	critical success, halve the penalty
		if (verbose) console.log(version, "Save was a critical success");
		sav++
		if (sav >= need) {
			if ((consec > -1) && (consec >= need)) {
				cf = true;
			}
			cs = true;
			mult = 0;
		} else {
			cs = true;
			mult = 1/2;
		}
		
	} else if (roll.isNat1){
	//	critical failure, double the penalty
		if (verbose) console.log(version, "Save was critical failure");
		cf = false;
		cs = false;
		mult = 2;
		
	} else if (roll.isSuccess) {
	//	normal success, update the dictionary
		if (verbose) console.log(version, "Save was a success");
		sav++
		if (sav >= need) {
			if ((consec > -1) && (consec >= need)) {
				cf = true;
			}
			cs = true;
			mult = 0;
		} else {
			cf = false;
			cs = true;
			mult = 1;
		}
		
	} else if (roll.isFailure) {
	// normal failure, update the penalty
		if (verbose) console.log(version, "Save was a failure");
		cf = false;
		cs = false;
		mult = 1;
	}
	// now handle damage
	for (const d of damage) {
		if (mult === 0) {
			d.stored = d.total;
			d.rolled = mult;
		} else {
			d.rolled = Math.ceil(d.rolled * mult);
			d.total = d.rolled + d.stored;
		}
	}
	return new CheckResultCRP(cf, cs, sav, damage);
}

function CheckResultCRP(cf, cs, sav, dmg) {
	this.chkFinished = cf;
	this.chkSaved = cs;
	this.saves = sav;
	this.damage = dmg;
}
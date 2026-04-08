const version = '0.0.5';
const verbose = true;
const show = true;
// Passed in: cmsg [chatMessagePF], made [Number], needed [Number], consecutive [Boolean], 
//				damage (Array of [BuffDamageCRP {target, stored, rolled, total}]).

debugger
let rslt = checkSave(cmsg, made, needed, consecutive, damage);
return rslt;

function checkSave(r, s, n, c, dmg) {
//	non-destructive function utilizing passed-in values
	let sav = s, mult = 1;
	let cf = false, cd = false, cs = false;
	if (show) debugger
	if (r.isNat20) {
	//	critical success, halve the penalty
		if (verbose) console.log(version, "Save was a critical success");
		sav++
		if (sav >= n) {
		//  finished
			cf = true;
			cd = false;
			cs = false;
			mult = 0;
		} else {
			cf = false;
			cs = true;
			cd = true;
			mult = 1/2;
		}
		
	} else if (r.isNat1){
	//	critical failure, double the penalty
		if (verbose) console.log(version, "Save was critical failure");
		cf = false;
		cs = false;
		cd = true;
		mult = 2;
		
	} else if (r.isSuccess) {
	//	normal success, update the dictionary
		if (verbose) console.log(version, "Save was a success");
		sav++
		if (sav >= n) {
		//  finished
			cf = true;
			cs = false;
			cd = false;
			mult = 0;
		} else {
			cf = false;
			cs = true;
			cd = true;
			mult = 1;
		}
		
	} else if (r.isFailure) {
	// normal failure, update the penalty
		if (verbose) console.log(version, "Save was a failure");
		cf = false;
		cs = false;
		cd = true;
		mult = 1;
	}
	// now handle damage
	for (const d of damage) {
		if (mult === 0) {
			d.stored = mult;
			d.rolled = mult;
			d.total = mult;
		} else {
			d.rolled = Math.ceil(d.rolled * mult);
			d.total = d.rolled + d.stored;
		}
	}
	return new checkResultCRP(cf, cs, sav, damage);
}

function checkResultCRP(cf, cs, sav, dmg) {
	this.finished = cf;
	this.saved = cs;
	this.number = sav;
	this.damage = dmg;
}
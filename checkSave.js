const version = '0.0.3;
const verbose = true;
const show = true;

debugger
if (args) {
	// cmsg, made, needed, damage[];
	
}
return

function checkSave(r, s, n, nd, sd) {
//	non-destructive function utilizing passed-in values
	let sav = s, totdmg = 0;
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
			totdmg = 0;
		} else {
			cf = false;
			cs = true;
			cd = true;
			totdmg = Math.ceil(nd / 2) + sd;
		}
		
	} else if (r.isNat1){
	//	critical failure, double the penalty
		if (verbose) console.log(version, "Save was critical failure");
		cf = false;
		cs = false;
		cd = true;
		totdmg = (2 * nd) + sd;
		
	} else if (r.isSuccess) {
	//	normal success, update the dictionary
		if (verbose) console.log(version, "Save was a success");
		sav++
		if (sav >= n) {
		//  finished
			cf = true;
			cs = false;
			cd = false;
			totdmg = 0;			
		} else {
			cf = false;
			cs = true;
			cd = true;
			totdmg = nd + sd;
		}
		
	} else if (r.isFailure) {
	// normal failure, update the penalty
		if (verbose) console.log(version, "Save was a failure");
		cf = false;
		cs = false;
		cd = true;
		totdmg = nd + sd;
	}
	// not the array I want
	return new CSresult(cf, cs, sav, cd, totdmg);
}

function CSresult(cf, cs, sav, cd, td) {
	this.finished = cf;
	this.saved = cs;
	this.number = sav;
	this.damage = cd;
	this.total = td;
}
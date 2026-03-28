const version = '0.1.6';
const verbose = true;
const show = true;

const savesNeeded = 2;
let chkFinished = false, chkSaved = false, chkDamage = false;
let rslt = '', newDamage = 0, totDamage = 0;
let saved = await Number(item.getItemDictionaryFlag('saved'))||0;
const storDamage = await Number(item.getItemDictionaryFlag('damage'))||0;

if ((typeof state !== 'undefined' && state) || (typeof action !== 'unidentified' && action.tag === 'check')) {
	//	see if there is a save out there
	if (show) debugger
	let target = token.document._id;
	const lm = await game.macros.getName("getChatIdForLastType");
	const cmsg = await lm.execute({ ctype: 'check' });
	if (cmsg) {
		if (show) debugger
		const roll = cmsg.rolls[0];
		// negative values so 'remove' stored value
		newDamage = item.changes.contents[0].value - storDamage;	
		rslt = await checkSave(roll, saved, savesNeeded, newDamage, storDamage);
		if (rslt) {
		//	extract results
			chkFinished = rslt.finished;
			chkSaved = rslt.saved;
			chkDamage = rslt.damage;
			saved = rslt.number;
			totDamage = rslt.total;
		}
	} else {
		await ui.notifications.warn(`Could not find a recent save for ${token.name}`);
	}

} else if (typeof action !== 'unidentified' && action) {	
	if (action.tag === 'save') {
		// check the results
		if (show) debugger
		let count = 0;
		do {
			count++;
			// Pause for x milliseconds
			const pauseTime = 1000;
			await new Promise(r => setTimeout(r, pauseTime));
			//	check for a save
			if (typeof shared.rollData.rolls !== 'undefined') {
				break;
			}
			console.log(version, "count:", count);
		} 
		while (count < 10);
		//	get local roll values		
	}
}
if (chkFinished) {
	await stopPoison();
} else {
	if (chkSaved) await item.setItemDictionaryFlag('saved', saved);
	if (chkDamage) await item.setItemDictionaryFlag('damage', totDamage);
}

return

function stopPoison() {
//	shuts down the buff and zeroes dictionary values
	if (show) debugger
	const _saved = item.setItemDictionaryFlag('saved', 0);
	const _damage = item.setItemDictionaryFlag('damage', 0);
	const _active = item.setActive(false);
	return (_active && _saved === 0 && _damage === 0);
}

function checkSave(r, s, n, nd, sd) {
//	non-destructive function utilizing passed-in values
	let a = [], sav = s, totdmg = 0;
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
			cs = true;
			cd = true;
			totdmg = Math.ceil(nd / 2) + sd;			
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
	a.push( ["finshed", cf], ["saved", cs], ["number", sav], ["damage", cd], ["total", totdmg] );
	return a;
}
const version = '0.1.2';
const verbose = true;
const show = true;
const saves = 2;

let saved = await Number(item.getItemDictionaryFlag('saved'))||0;
const storDamage = await Number(item.getItemDictionaryFlag('damage'))||0;
let chkSaved = false, chkDamage = false;
let rslt = '', newDamage = 0, totDamage = 0;

if (typeof state !== 'undefined' && state) {
	//	see if there is a save out there
	let target = token.document._id;
	const lm = await game.macros.getName("getChatIdForLastType");
	const cmsg = await lm.execute({ ctype: 'check' });
	if (cmsg) {
		if (show) debugger
		// negative values so 'remove' stored value
		newDamage = item.changes.contents[0].value - storDamage;	
		if (cmsg.rolls[0].isNat20) {
			//	special success, halve the penalty
			if (verbose) console.log("critical success");
			saved++
			chkSaved = true;
			if (saved >= saves) {
				//  finished
				rslt = await stopPoison();
				return;
			} else {
				chkDamage = true;
				totDamage = Math.ceil(newDamage / 2) + storDamage;
			}
			
		} else if (cmsg.rolls[0].isNat1){
			//	special failure, double the penalty
			if (verbose) console.log("critical failure");
			chkDamage = true;
			totDamage = (2 * newDamage) + storDamage;
			
		} else if (cmsg.rolls[0].isSuccess) {
			//	normal success, update the dictionary
			if (verbose) console.log("success");
			saved++
			if (saved >= saves) {
				//  finished
				rslt = await stopPoison();
				return;
			} else {
				chkSaved = true;
				chkDamage = true;
				totDamage = newDamage + storDamage;
			}
			
		} else if (cmsg.rolls[0].isFailure) {
			// normal failure, update the penalty
			if (verbose) console.log("failure");
		}
		if (chkDamage) await item.setItemDictionaryFlag('damage', totDamage);
		if (chkSaved) await item.setItemDictionaryFlag('saved', saved);
	}
	if (show) debugger

} else if (typeof action !== 'unidentified' && action) {	
	if (action.tag === 'save') {
		// check the results
		if (show) debugger
		let count = 0;
		while (count < 10) {
			count++;
			// Pause for x milliseconds
			const pauseTime = 1000;
			await new Promise(r => setTimeout(r, pauseTime));
			//	check for a save
			let rslt = shared.message.system.rolls;
			console.log("count", count);
		} 
	}
}
return

function stopPoison() {
	if (show) debugger
	const _active = item.setActive(false);
	const _saved = item.setItemDictionaryFlag('saved', 0);
	const _damage = item.setItemDictionaryFlag('damage', 0);
	return (_active && _saved === 0 && _damage === 0);
}
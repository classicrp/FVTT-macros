const version = '0.0.5';
const verbose = true;
const show = true;
if (typeof state === 'undefined' || !state) return;
let saves = await item.getItemDictionaryFlag('saves');
let damage = await item.getItemDictionaryFlag('damage');
if (!action) {
	//	see if there is a save out there
	let target = token.document._id;
	const lm = await game.macros.getName("getChatIdForLastType");
	const cmsg = await lm.execute({ ctype: 'check' });
	if (cmsg) {
		if (cmsg.rolls[0].isNat20) {
			//	special success, halve the penalty
			if (verbose) console.log("critical success");
		} else if (cmsg.rolls[0].isNat1){
			//	special failure, double the penalty
			if (verbose) console.log("critical failure");
		} else if (cmsg.rolls[0].isSuccess) {
			//	normal success, update the dictionary
			if (verbose) console.log("success");
			await item.setItemDictionaryFlag('saves', saves++);
		} else if (cmsg.rolls[0].isFailure) {
			// normal failure, update the penalty
			if (verbose) console.log("failure");
		}
	}
	if (show) debugger
	
} else if (action.tag === 'save') {
	// check the results
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
debugger
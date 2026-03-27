const version = '0.0.4';
if (typeof state === 'undefined' || !state) return;
let saves = await item.getItemDictionaryFlag('saves');
let damage = await item.getItemDictionaryFlag('damage');
if (!action) {
	//	see if there is a save out there
	let target = token.document._id;
	const lm = await game.macros.getName("getChatIdForLastType");
	const cmsg = await lm.execute({ ctype: 'check' });
	console.log("cmsg", cmsg);
	debugger
	
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
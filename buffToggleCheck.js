const version = '0.2.4';
const show = false;
const verbose = true;
const GETCHATIDFORLASTTYPE = 'Compendium.crp-contents.crp-macros.Macro.AJukQPfiRAiOBj1x';

let chkDone = false, chkSaved = false;

// Pause for x milliseconds
const pauseTime = 150;
await new Promise(r => setTimeout(r, pauseTime));

let units = await Number(item.getItemDictionaryFlag('units'));
let chatId = await item.getItemDictionaryFlag('lastSaveId')||'';
let cmsg = '', lm = '', rslt = '';

if (!state) {
	// this will turn off every <frequencyPerUnit> per <frequencyUnits> for <frequencyDuration>.
	// <frequencyUnits> are as follows [infinity: "", turn: "turn", mins: "minute", rnds: "round", hrs: "hour"]
	// increment the units and turn back on
	const dur = await Number(item.getItemDictionaryFlag('frequencyDuration'));
    const savesMade = await Number(item.getItemDictionaryFlag('savesMade'));
    const savesNeeded = await Number(item.getItemDictionaryFlag('savesNeeded'));
	
	units++;
	chkDone = await checkUnits(units, dur);
    chkSaved = await checkDuration(savesMade, savesNeeded);
	
	if (!chkDone && !chkSaved) {
		await item.setItemDictionaryFlag('units', units);
		if (verbose) console.log(version, "units:", units);
		if (item.system.tags.includes('poison')) {
			//  handle poison damage increases, check current value and save
			//  also need to handle saves and making multiples
			await item.actions.contents.find(f => f.tag === 'save').use();
			for (let i=0; i<50; i++) {
				await ui.notifications.info('Looking for recent save'.concat(String('.').repeat(i)));
				// Pause for x milliseconds at a time - about 10s for search
				const pauseTime = 200;
				await new Promise(r => setTimeout(r, pauseTime));
				//	get the result of the save
				let	lm = await fromUuid(GETCHATIDFORLASTTYPE);
				cmsg = await lm.execute({ ctype: 'check', actor: actor, chatId: chatId, shared: shared });
				if (cmsg) break;
			}
			for (let i=0; i < item.system.changes.length; i++) {
            	if (show) debugger
				const target = item.changes.contents[i].target;
				const value = item.changes.contents[i].value;
				if (verbose) console.log(version, target, value);
				await item.setItemDictionaryFlag(target, value);	
			}
		}
		await item.setActive(true);
	}
	if (chkDone && chkSaved) {
		// we are done
		await item.setItemDictionaryFlag('units', 0);
		await item.setItemDictionaryFlag('lastSaveId', '');
		await item.setItemDictionaryFlag('savesMade', 0);
		if (item.system.tags.includes('poison')) {
			//  leave damage until cured
		}
    }
} else {
	if (units === 0) {
	//	buff just toggled on for first time, see if a save exists
	ui.notifications.info(`Collecting saving throw for ${actor.name}`);
	lm = await fromUuid(GETCHATIDFORLASTTYPE);
	cmsg = await lm.execute({ ctype: 'check', actor: actor, chatId: chatId, shared: shared });
	if (cmsg) {
		chatId = cmsg._id;
		await item.setItemDictionaryFlag('lastSaveId', chatId);		
		console.log(version, cmsg);
		// now see if save was a success
		debugger
		return;
		}
	}

}
return

function checkUnits(a, b) {
	return (a <= b) ? false : true;
}

function checkDuration(a, b) {
	return (a < b) ? false : true;
}
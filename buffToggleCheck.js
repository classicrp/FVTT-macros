const version = '0.1.11';
const show = false;
const verbose = true;
const GETCHATIDFORLASTTYPE = 'Compendium.crp-contents.crp-macros.Macro.AJukQPfiRAiOBj1x';

let chkDone = false, chkSaved = false;

if (!state) {
	// this will turn off every <frequencyPerUnit> per <frequencyUnits> for <frequencyDuration>.
	// <frequencyUnits> are as follows [infinity: "", turn: "turn", mins: "minute", rnds: "round", hrs: "hour"]
	// increment the units and turn back on
	let units = await Number(item.getItemDictionaryFlag('units'));
	const dur = await Number(item.getItemDictionaryFlag('frequencyDuration'));
    const savesMade = await Number(item.getItemDictionaryFlag('savesMade'));
    const savesNeeded = await Number(item.getItemDictionaryFlag('savesNeeded'));
	const chatId = await item.getItemDictionaryFlag('lastSaveId')||'';
	let cmsg = '';
	units++;
	chkDone = await checkUnits(units, dur);
    chkSaved = await checkDuration(savesMade, savesNeeded);
	
	if (!chkDone && !chkSaved) {
		await item.setItemDictionaryFlag('units', units);
		if (verbose) console.log(version, "units:", units);
        chkDone = true;
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
			if (cmsg) {
              await item.setItemDictionaryFlag('lastSaveId', cmsg._id);
              console.log(version, cmsg);
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
	if (chkDone || chkSaved) {
		// we are done
		await item.setItemDictionaryFlag('units', 0);
		await item.setItemDictionaryFlag('lastSaveId', '');
		if (item.system.tags.includes('poison')) {
			//  leave damage until cured
		}
    }
}

function checkUnits(a, b) {
	return (a <= b) ? false : true;
}

function checkDuration(a, b) {
	return (a < b) ? false : true;
}
const version = '0.3.1';
const show = true;
const verbose = true;
const paused = true;
const GETCHATIDFORLASTTYPE = 'Compendium.crp-contents.crp-macros.Macro.AJukQPfiRAiOBj1x';
const CHECKSAVE = 'Compendium.crp-contents.crp-macros.Macro.xFjVPT4MkdLpoTXM';

let chkDone = false, chkSaved = false;

if (paused) {
	// Pause for x milliseconds
	const pauseTime = 150;
	await new Promise(r => setTimeout(r, pauseTime));
}
let unitsPassed = await Number(item.getItemDictionaryFlag('unitsPassed'));
const unit = await item.getItemDictionaryFlag('frequencyUnit');
const dur = await Number(item.getItemDictionaryFlag('frequencyDuration'));
let chatId = await item.getItemDictionaryFlag('lastSaveId')||'';
let savesMade = await Number(item.getItemDictionaryFlag('savesMade'));
const savesNeeded = await Number(item.getItemDictionaryFlag('savesNeeded'));
let cmsg = '', lm = '', rslt = '', damage = [];

if (!state) {
	// this will turn off every <frequencyPerUnit> per <frequencyUnit> for <frequencyDuration>.
	// <frequencyunitsPassed> are as follows [infinity: "", turn: "turn", mins: "minute", rnds: "round", hrs: "hour"]
	// increment the unitsPassed and turn back on
	
	chkDone = await checkUnitsPassed(unitsPassed, dur);
	if (!chkDone) unitsPassed++;
    chkSaved = await checkDuration(savesMade, savesNeeded);
	
	if (!chkDone && !chkSaved) {
		await item.setItemDictionaryFlag('unitsPassed', unitsPassed);
		if (verbose) console.log(version, unitsPassed, "/", unit + "(s)", "of", dur, unit + "(s)");
		if (item.system.tags.includes('poison')) {
			//  handle poison damage increases, check current value and save
			//  also need to handle saves and making multiples
			rslt = await item.actions.contents.find(f => f.tag === 'save').use({ chatMessage: false });
			if (show) debugger
			for (let i=1; i<=50; i++) {
				msg = 'Looking for recent save'.concat(String('.').repeat(i));
				await ui.notifications.info(msg);
				if (paused) {
					// Pause for x milliseconds at a time - about 10s for search
					const pauseTime = 200;
					await new Promise(r => setTimeout(r, pauseTime));
				}
				//	get the result of the save
				let	lm = await fromUuid(GETCHATIDFORLASTTYPE);
				cmsg = await lm.execute({ ctype: 'check', actor: actor, chatId: chatId, shared: shared });
				if (cmsg) break;
			}
			// get current damage info
			for (const c of item.changes.contents) {
				//  get stored values first
				rslt = await collectDamageInfo(c)
				damage.push(rslt);
				// do this last after checking with <checkSave>
				await item.setItemDictionaryFlag(rslt.target, rslt.totVal);
			}
		}
		await item.setActive(true);
	}
	if (chkDone && chkSaved) {
		// we are done
		await item.setItemDictionaryFlag('unitsPassed', 0);
		await item.setItemDictionaryFlag('lastSaveId', '');
		await item.setItemDictionaryFlag('savesMade', 0);
		if (item.system.tags.includes('poison')) {
			//  leave damage until cured
		}
    }
} else {
	if (unitsPassed === 0) {
		//	buff just toggled on for first time, see if a save exists
		ui.notifications.info(`Collecting saving throw for ${actor.name}`);
		lm = await fromUuid(GETCHATIDFORLASTTYPE);
		cmsg = await lm.execute({ ctype: 'check', actor: actor, chatId: chatId });
		if (cmsg) {
			chatId = cmsg._id;
			await item.setItemDictionaryFlag('lastSaveId', chatId);	
			rslt = await Number(item.getItemDictionaryFlag('consecutiveSaves'));
			const consecutiveSaves = (rslt === -1) ? false : true;
			if (verbose) console.log(version, cmsg);
			// get current damage info
			for (const c of item.changes.contents) {
				//  get stored values first
				rslt = await collectDamageInfo(c)
				damage.push(rslt);
				// do this last after checking with <checkSave>
				await item.setItemDictionaryFlag(rslt.target, rslt.totVal);
			}
			// now see if save was a success
			lm = await fromUuid(CHECKSAVE);
			rslt = await lm.execute({ cmsg: cmsg, made: savesMade, needed: savesNeeded, consecutive: consecutiveSaves, damage: damage });
			if (rslt) {
				if (verbose) console.log('rslt:',rslt);
			}
		}
	}
}
return

function checkUnitsPassed(a, b) {
	return (a < b) ? false : true;
}

function checkDuration(a, b) {
	return (a < b) ? false : true;
}

function BuffDamageCRP(t, sv, nv, tv) {
	this.target = t;
	this.stored = sv;
	this.rolled = nv;
	this.total = tv;
}

function collectDamageInfo(c) {
	const target = c.target;
	const storVal = item.system.flags.dictionary[target];
	const totVal = c.value;
	const rolledVal = totVal + storVal;
	if (verbose) console.log(version, target, "old:", storVal, "roll:", rolledVal, "tot:", totVal);
	return new BuffDamageCRP(target, storVal, rolledVal, totVal);
}
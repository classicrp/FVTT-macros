const version = '0.3.11';
const show = true;
const verbose = true;
const paused = true;
const GETCHATIDFORLASTTYPE = 'Compendium.crp-contents.crp-macros.Macro.AJukQPfiRAiOBj1x';
const CHECKSAVE = 'Compendium.crp-contents.crp-macros.Macro.xFjVPT4MkdLpoTXM';

let chkDone = false, chkSaved = false, chkFinished = false;
let cmsg = '', lm = '', rslt = '', damage = [];

let unitsPassed = await Number(item.getItemDictionaryFlag('unitsPassed'))||0;
const unit = await item.getItemDictionaryFlag('frequencyUnit')||'';
const dur = await Number(item.getItemDictionaryFlag('frequencyDuration'))||1;
let chatId = await item.getItemDictionaryFlag('lastSaveId')||'';
let savesMade = await Number(item.getItemDictionaryFlag('savesMade'))||0;
const savesNeeded = await Number(item.getItemDictionaryFlag('savesNeeded'))||1;
let consecutiveSaves = await Number(item.getItemDictionaryFlag('consecutiveSaves'))||-1;

if (!state) {
	// this will turn off every <frequencyPerUnit> per <frequencyUnit> for <frequencyDuration>.
	// <frequencyunitsPassed> are as follows [infinity: "", turn: "turn", mins: "minute", rnds: "round", hrs: "hour"]
	// increment the unitsPassed and turn back on
	
	unitsPassed++;
	chkDone = await checkUnitsPassed(unitsPassed, dur);
    chkSaved = await checkDuration(savesMade, savesNeeded);
	
	if (!chkDone && !chkSaved) {
		await item.setItemDictionaryFlag('unitsPassed', unitsPassed);
		if (verbose) console.log(version, unitsPassed, "/", unit + "(s)", "of", dur, unit + "(s)");
		if (item.system.tags.includes('poison')) {
			//  handle poison damage increases, check current value and save
			//  also need to handle saves and making multiples
			rslt = await item.actions.contents.find(f => f.tag === 'save').use({ chatMessage: true, skipDialog: true });
			if (!rslt) return;  // cancelled
			if (show) debugger

			for (let i=1; i<=50; i++) {
				msg = 'Looking for recent save'.concat(String('.').repeat(i));
				ui.notifications.info(msg);
				if (paused) {
					// Pause for x milliseconds at a time - about 10s for search
					const pauseTime = 200;
					await new Promise(r => setTimeout(r, pauseTime));
					if (verbose) console.log('Delay:', i, "of", 50, "max");
				}
				//	get the result of the save
				lm = await fromUuid(GETCHATIDFORLASTTYPE);
				cmsg = await lm.execute({ ctype: 'check', actor: actor, chatId: chatId });
				if (cmsg) break;
			}
			// get current damage info
			// PROBLEM: Damage will not update until AFTER item is set ACTIVE.
			for (const c of item.changes.contents) {
				//  get stored values first
				rslt = await collectDamageInfo(c)
				damage.push(rslt);
				// do this last after checking with <checkSave>
				await item.setItemDictionaryFlag(rslt.target, rslt.total);
			}
			// now see if save was a success
			lm = await fromUuid(CHECKSAVE);
			rslt = await lm.execute({ cmsg: cmsg, made: savesMade, needed: savesNeeded, consecutive: consecutiveSaves, damage: damage });
			if (rslt) {
				if (verbose) console.log('rslt:', rslt);
				chkFinished = rslt.chkFinished;
				chkSaved = rslt.chkSaved;
				chkDone = rslt.chkDone;
				await item.setItemDictionaryFlag('savesMade', rslt.saves);
			}
		}
		await item.setActive(true);
	}
	if (chkDone && chkSaved) {
		// we are done
		await item.setItemDictionaryFlag('unitsPassed', 0);
		await item.setItemDictionaryFlag('lastSaveId', '');
		await item.setItemDictionaryFlag('savesMade', 0);
		if (chkFinished) {
			if (item.system.tags.includes('poison')) {
				//  leave damage until cured
				for (const c of item.changes.contents) {
					await item.setItemDictionaryFlag(c.target, 0);
				}
			}
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
				if (verbose) console.log('rslt:', rslt);
				chkFinished = rslt.chkFinished;
				chkSaved = rslt.chkSaved;
				chkDone = rslt.chkDone;
				await item.setItemDictionaryFlag('savesMade', rslt.saves);
			}
		}
	}
}
return

function checkUnitsPassed(a, b) {
	return ((a < b) ? false : true);
}

function checkDuration(a, b) {
	return ((a < b) ? false : true);
}

function BuffDamageCRP(t, sv, rv, tv) {
	this.target = t;
	this.stored = sv;
	this.rolled = rv;
	this.total = tv;
}

function collectDamageInfo(c) {
	const target = c.target;
	const storVal = Number(item.system.flags.dictionary[target])||0;
	const totVal = c.value;
	const rolledVal = totVal + storVal;
	if (verbose) console.log(version, target, "old:", storVal, "roll:", rolledVal, "tot:", totVal);
	return new BuffDamageCRP(target, storVal, rolledVal, totVal);
}
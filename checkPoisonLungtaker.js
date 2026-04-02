const version = '0.2.7';
const verbose = true;
const show = true;
const GETCHATIDFORLASTTYPE = 'Compendium.crp-contents.crp-macros.Macro.AJukQPfiRAiOBj1x';

const savesNeeded = 2, diceNumber = 1, diceSize = 6;
let chkFinished = false, chkSaved = false, chkDamage = false, actionSave = false, stateSave = false;
let rslt = '', chatId = '', newDamage = 0, totDamage = 0;
let saved = await Number(item.getItemDictionaryFlag('saved'))||0;
const storDamage = await Number(item.getItemDictionaryFlag('damage'))||0;

if (typeof state !== 'undefined' && !state) {
	chkFinished = true;
	if (typeof shared.category !== 'undefined') {
	//	buff is being deleted
		if (shared.category === 'toggle') return;
	}
}
if (typeof state !== 'undefined' && state) stateSave = true;
if (typeof action !== 'undefined' && action !== null && action.tag === 'save') actionSave = true;
	
if (actionSave || stateSave) {
	//	see if there is a save out there
//	if (show) debugger
	let cmsg = '', itm = '', itmName = '', itmData = '', pack = '', uuid = '';
//	itmName = 'getChatIdForLastType';
//	pack = 'crp-contents.crp-macros';
//	rslt = await game.packs.get(pack).index.getName(itmName).uuid;
//	rslt = await game.packs.get(pack).index.find(f => f.name === 'getChatIdForLastType').uuid;
//	if (rslt) {
		const lm = await fromUuid(GETCHATIDFORLASTTYPE);
//		itmData = await game.macros.fromCompendium(lm);
//		const lm = await game.macros.getName();
		let count = 0;
		do {
			rslt = await item.getItemDictionaryFlag(`chatId${count}`)||'';
			if (rslt !== '') chatId = rslt;
			count++;
		} 
		while (rslt !== '');
		if (chatId) {
			if (stateSave) {
				cmsg = await lm.execute({ state: state, item: item, ctype: 'check', chatId: chatId, shared: shared })||'';
			} else {
				cmsg = await lm.execute({ action: action, item: item, ctype: 'check', chatId: chatId, shared: shared })||'';				
			}
		} else {
			if (stateSave) {
				cmsg = await lm.execute({ state: state, item: item, ctype: 'check', shared: shared })||'';
			} else {
				cmsg = await lm.execute({ action: action, item: item, ctype: 'check', shared: shared })||'';
			}
		}
//	}
	if (cmsg !== '' && !cmsg.shared.rejected) {	
		const roll = cmsg.rolls[0];
		// negative values so 'remove' stored value
		if (typeof state === 'undefined') {
		//	we are using an action so need to manually roll {diceNumber}d{diceSize}	
			newDamage = -diceNumber * Math.floor(Math.random() * diceSize + 1);
		} else {
			if (show) debugger
			newDamage = item.changes.contents[0].value - storDamage;	
		}
		rslt = await checkSave(roll, saved, savesNeeded, newDamage, storDamage);
		if (rslt) {
		//	extract results
			chkFinished = rslt.finished;
			chkSaved = rslt.saved;
			chkDamage = rslt.damage;
			saved = rslt.number;
			totDamage = rslt.total;
			chatId = cmsg._id;
		}
	} else {
		if (cmsg.shared.rejected) return;
		await ui.notifications.warn(`Could not find a recent save for ${token.name}`);
	}

} else if (typeof action !== 'undefined' && action) {	
	if (show) debugger
	if (action.tag === 'save') {
		// check the results
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
	await item.setItemDictionaryFlag('saved', 0);
	await item.setItemDictionaryFlag('damage', 0);
	for (let i = 0; i <= 2; i++) {
		await item.setItemDictionaryFlag(`chatId${i}`, '');
	}
	await item.setActive(false);
} else {
	if (chkSaved) await item.setItemDictionaryFlag('saved', saved);
	if (chkDamage) await item.setItemDictionaryFlag('damage', totDamage);
	await item.setItemDictionaryFlag(`chatId${saved}`, chatId);
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
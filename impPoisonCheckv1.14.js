//	========================================================= //
//  author: classicrp, raydenx
//	date: 2025-11-02
const curVer = 'v1.14';
const head = `Macro.impPoisonCheck(${curVer}): `;
let msg = '';
let failure = Boolean(false);
//	========================================================= //

// debugger;

	let criticalFailure = Boolean(false);
//	create a pointer to the `ChatMessage` collection
	const cmsgs = await game.collections.get("ChatMessage");
//	find the last index of the 0 based collection array
	const lmsg = cmsgs.contents.length - 1
//	grab the last chat message
	const cmsg = await cmsgs.contents[lmsg];
	const cActor = cmsg.speaker.actor;
	const cScene = cmsg.speaker.scene;
	const cToken = cmsg.speaker.token;
	
	//  check to see there are rolls available
	if (cmsg.type == `check`) {
	//  this is a saving throw, ability or skill check result
	
	//  title
		const cTitle = cmsg.rolls[0].options.flavor;
	//  die roll
		const cRoll = cmsg.rolls[0].d20.results[0].result;
	//  added to die roll
		const cBonus = cmsg.rolls[0].bonus;					
	//  full result
		const cTotal = cmsg.rolls[0].total;
	//  save DC
		const cDc = cmsg.rolls[0].dc;

		` RESULT SET {
		cActor: "0SIB86serNtgWC15"
		cBonus: 5
		cDc: 22
		cRoll: 19
		cScene: "adWP2CxsosNCfLtP"
		cTitle: "Fortitude Saving Throw"
		cToken: "9MTBO13K5ZppOcT6"
		cTotal: 24
		} `
		
		const curActor = game.actors.get(cActor);
		const curBuff = curActor.items.getName('Imp Poison');
		const savAttr = 'system.flags.dictionary.saves';
		const curSav = await Number(foundry.utils.getProperty(curBuff, savAttr)); 
		let saves = 0;
		
		if (cTotal >= cDc) {
		//	Success, now see how good it was
			if (cRoll == 20) {
			//	Critical Success, count as 2 saves
				saves = 2;
				failure = false;
			} else if (cRoll != 1) {
			//	Success, counts as 1 save
				saves = 1;
				failure = false;
			} else {
			//  Critical Failure but Success = Failure
				if (curSav != 0) {
				//  Saves go back to zero - must be consecutive
					saves = -curSav;
				};
				failure = true;
			};
		} else {
		//  Failure, now see how bad it was
			if (cRoll == 20) {
			//  Failure but Critical Success = Success
				saves = 1;
				failure = false;
			} else if (cRoll != 1) {
			//	Failure, no save
				if (curSav != 0) {
				//  Saves go back to zero - must be consecutive
					saves = -curSav;
				};
				failure = true;
			} else {
			//  Critical Failure
				if (curSav != 0) {
				//  Saves go back to zero - must be consecutive
					saves = -curSav;
				};
				criticalFailure = true;
				//  worse still, the effect is doubled
//				const effAttr = 'system.flags.dictionary.effect';
//				const curEff = await Number(foundry.utils.getProperty(curBuff, effAttr)); 
//				await curBuff.update({ [effAttr]: (2 * curEff) });

//				const frmAttr = "system.changes.0.formula";
//				let frmDmg = await Number(foundry.utils.getProperty(item, frmAttr));
//				await curBuff.update({ [frmAttr]: (2 * frmDmg) });		
				failure = true;
			};			
		};
		saves = curSav + saves;
		await curBuff.update({ [savAttr]: saves });
		if (failure) {
		//  yeah double negative, we failed save
			const lm = await game.macros.getName('impPoison');
			await lm.execute({ actor: curActor, item: curBuff, state: curBuff.system.active, args: criticalFailure });
		} else {
		//  see if we got 2 saves
			if (saves > 1) {
			//  delete the buff
				await curBuff.delete();
				//  congrats, you beat it
				msg = `<p style="font-family: Arial, sans-serif; font-size: 1.2em;">${curActor.name} has beaten the dreaded ${curBuff.name}.</p>`;
				ui.chat.processMessage(msg);
			};
		};
	} else {
	//  this is not a saving throw result
		failure = true;
		msg = 'Tried to examine a non-check chatMessage.';
		console.log(head + msg);
		throw 'done';
	};


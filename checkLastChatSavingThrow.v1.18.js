// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime

/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-15
	==========================================================================
	<item> is passed in directly from the calling macro. required in order to
	set the dictionary value on said item.
	returns: a string result, one of { 'CF', 'F', 'S', 'CS', '' }
*/
	const curVer = 'v1.18';
	const head = `Macro.checkLastChatSavingThrow(${curVer}): `;
	let msg = '';
	let failState = Boolean(false);
	//	========================================================= //

/*	CHECK SECTION ========================================================
	we need to check the result of the saving Throw by looking at the
	results of the last [chatMessage] we have; expecting it to be the
	saving throw.
*/

	//  to collect the result of the inspected saving throw
	let saveStatus = '';
	let cmsg = null;
	let lm = null;
	
	lm = await game.macros.getName("getChatIdForLastType");
	cmsg = await lm.execute({ ctype: 'check' });
	//	value of the dictionary stored

	//  check to see there are rolls available
	if (typeof cmsg == "undefined") {
		failState = true;
	} else if (cmsg == null) {
		failState = true;
	} else {
		if (cmsg.rolls !== null) {
			//  this is a saving throw, ability or skill check result
			const dicAttr = "system.flags.dictionary.chatId";
			/*	if item is not passed in then lookup the item of the 
				originating message
			*/
			if (typeof item == "undefined") {
			//	go get the item
				const cmi = cmsg.system.reference.substring("ChatMessage.".length, cmsg.system.reference.length);
				lm = await game.macros.getName("getChatIdForLastType");
				const rmsg = await lm.execute({ ctype: cmi });
debugger;
				/* 	rmsg.system.actor 		// 	Actor.tPis1bRmFuPFq4Gw
					rmsg.system.item.id		//	YAAkjSId0Ht2iwWV
					now get the item on said actor
				*/
				const actorId = rmsg.system.actor.substring("Actor.".length, rmsg.system.actor.length);
				const itemId = rmsg.system.item.id;
				const mitem = game.actors.get(actorId).items.get(itemId);
				await mitem.update({ [dicAttr]: cmsg._id });

			} else {
				await item.update({ [dicAttr]: cmsg._id });
			}
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

			if (cTotal >= cDc) {
			//	Success, now see how good it was
				if (cRoll == 20) {
				//	Critical Success
					saved = true;
					saveStatus = 'CS';
				} else if (cRoll != 1) {
				//	Success
					saved = true;
					saveStatus = 'S';
				} else {
				//  Critical Failure but Success = Failure
					saved = false;
					saveStatus = 'F';
				};
			} else {
			//  Failure, now see how bad it was
				if (cRoll == 20) {
				//  Failure but Critical Success = Success
					saved = true;
					saveStatus = 'S';
				} else if (cRoll != 1) {
				//	Failure
					saved = false;
					saveStatus = 'F';
				} else {
				//  Critical Failure
					saved = false;
					saveStatus = 'CF'
				};			
			};
		} else {
			//	not the correct message type available
			//	TITLE WILL NOT BE DEFINED IF TYPE <> 'CHECK', SEE WHAT THE 'TITLE' OF CMSG ACTUALLY IS.
			
			msg = `<p style="font-family: Arial, sans-serif; font-size: 1.1em;">Could not read the results of the <em>${item.name}</em> for <strong>${actor.name}</strong></p>`;
			ui.notifications.warn(msg);
			console.log(head + msg.slugify());
			failState = true;
		}
	}
/*	END CHECK SECTION ===================================================== */
	return saveStatus;
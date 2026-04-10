/*	==========================================================================
	author: classicrp, @raydenx
	date: 2026-04-10
	==========================================================================
	Special thanks to Discord::FVTT#macro-polo @joaquinp98 for setting me right
	on how to use 'typeof()'
	<ctype> is passed in directly from the calling macro. the value of 'ctype' 
	determines the type of chat message to look for OR a chatMessage ID.
	<args> *optional, is used to pass the current search position to itself 
	recursively.
	returns: a chat message object
	
	TEST code
	```
	const lm = await game.macros.getName("getChatIdForLastType");
	result = await lm.execute({ ctype: "action" });
	await ui.notifications.info(result);
	```
*/
	const version = 'v0.4.7';
	const head = `Macro.getChatIdForLastType(${version}): `;
	let msg = '';
	let failure = false;
	let show = false;
	let verbose = true;
	//	========================================================= //
	const GETCHATIDFORLASTTYPE = 'Compendium.crp-contents.crp-macros.Macro.AJukQPfiRAiOBj1x';

debugger

	let myresult = "";

//	need to put in a stop search criteria
	let cmsg = null;
	let lm = null;
	const mtypes = ["action", "check", "spell"];
	if (mtypes.includes(ctype)) {
		let msg = '';

		if (show) debugger
		const srcs = game.messages.contents.filter(f => (f.type === ctype) && (actor._id === speaker.actor)).sort(function(a, b){
			let x = a.timestamp;
			let y = b.timestamp;
			if (x < y) {return 1;}
			if (x > y) {return -1;}
			return 0;
		});
		if (srcs.length === 0) {
			//	no matching documents
			msg = `Could not find a saving throw for ${actor.name}.`;
			await ui.notifications.warn(msg);
			if (verbose) console.log(head, msg);
		} else {
			//	see if this one matches the <chatId> and if it does
			for (const c of srcs) {
			// see if this is the we may want this one
				if (typeof (chatId) !== 'undefined') {
					if (chatId === c._id) {
					//	we already used this one, ask to make a save then check again
					//	msg = `${actor.name} needs to make a new save before checking the roll.`;
					//	await ui.notifications.warn(msg);
					//	if (verbose) console.log(head, msg);
						return chatId;
					}
                }
				cmsg = c;
				break;
			}
		}	
		if (ctype === "action") {
		//	this has a save
			if (cmsg.system.save === null) {
			// this is an 'action' with no <.save> data, recurse
				lm = await await fromUuid(GETCHATIDFORLASTTYPE);
				myresult = await lm.execute({ args: n, ctype: ctype, chatId: chatId, shared: shared });
			} else {
				myresult = cmsg;
			};

		} else if (ctype === "check") {
		//	this has a roll
			if (cmsg.rolls.length === 0) {
			// this is a 'check' with no <.rolls> data, recurse
				lm = await await fromUuid(GETCHATIDFORLASTTYPE);
				myresult = await lm.execute({ args: n, ctype: ctype, chatId: chatId, shared: shared });
			} else {
				myresult = cmsg;
			};

		} else {
		//	currently only looking for chat types 'action' and 'chat' so...
		//	being here is a mistake.
			msg = "You can't get there from here!"
			ui.notifications.error(msg);
			if (verbose) console.log(head + msg);
			myresult = "";
		};
	} else {
	//	for now, assume that ctype is a chatMessage._Id
		cmsg = await game.messages.get(ctype);
		myresult = cmsg;
	}
	return myresult
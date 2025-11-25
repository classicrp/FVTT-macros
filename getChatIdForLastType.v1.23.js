/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-15
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
	ui.notifications.info(result);
	```
*/
	const curVer = 'v1.23';
	const head = `Macro.getChatIdForLastType(${curVer}): `;
	let msg = '';
	let failure = Boolean(false);
	//	========================================================= //

debugger;

	let myresult = "";
	let n = 0;

	if (typeof args!== "undefined") {
		// last index from recursion
		n = Number(args) - 1;
	} else {
		// new search
		n = -1;
	}

	let cmsg = null;
	let lm = null;
	const mtypes = ["action", "check", "spell"];
	if (mtypes.includes(ctype)) {

		do {
			if (game.messages.contents.at(n).type = `${ctype}`) {
			// we want this one	
				break;
			} else {
			// check the next one
				n -= 1;
			}
		}
		while (Math.abs(n) >= game.messages.contents.length);
		
		cmsg = await game.messages.contents.at(n);
	
		if (ctype == "action") {
		//	this has a save
			if (cmsg.system.save == null) {
			// this is an 'action' with no <.save> data, recurse
				lm = await game.macros.getName("getChatIdForLastType");
				myresult = await lm.execute({ args: n, ctype: ctype });
			} else {
				myresult = cmsg;
			};

		} else if (ctype == "check") {
		//	this has a roll
			if (cmsg.rolls.length == 0) {
			// this is a 'check' with no <.rolls> data, recurse
				lm = await game.macros.getName("getChatIdForLastType");
				myresult = await lm.execute({ args: n, ctype: ctype });
			} else {
				myresult = cmsg;
			};

		} else {
		//	currently only looking for chat types 'action' and 'chat' so...
		//	being here is a mistake.
			msg = "You can't get there from here!"
			ui.notifications.error(msg);
			console.log(head + msg);
			myresult = "";
		};
	} else {
	//	for now, assume that ctype is a chatMessage._Id
		cmsg = await game.messages.get(ctype);
		myresult = cmsg;
	}
	return myresult;
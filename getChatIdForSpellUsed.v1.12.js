/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-03
	==========================================================================
	Special thanks to Discord::FVTT#macro-polo @joaquinp98 for setting me right
	on how to use 'typeof()'
	<args> are passed in directly from the calling macro in the event of
	recursion.
	look for the last type == 'action' chat message that has a 'save' 
	component.
	
*/
const curVer = 'v1.12';
const head = `Macro.getChatIdForSpellUsed(${curVer}): `;
let msg = '';
let failure = Boolean(false);
//	========================================================= //

debugger;

let n = 0;

if (typeof args!== "undefined") {
	// last index from recursion
	n = Number(args) - 1;
} else {
	// new search
	n = -1;
}

let cmsg = null;

while (game.messages.contents.at(n).type != 'action') {
	n -= 1;
};
cmsg = await game.messages.contents.at(n);

if (cmsg.system.save == null) {
	// still not the correct id, recurse
	const lm = await game.macros.getName('getChatId');
	result = await lm.execute({ args: n });
} else {
	result = cmsg.id;
};

//  only type == 'action' have titles
// msg = cmsg.title + `: found at index (${n}).`;
// ui.notifications.info(msg);
return result;
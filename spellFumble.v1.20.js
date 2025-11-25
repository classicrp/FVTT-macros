/*
	==========================================================================
	Macro Title: Spell Fumble Macro for Foundry VTT PF1e
	Author: classicrp, @raydenx (https://github.com/classicrp)
	Last updated 2025-11-24
	License: MIT License
	
	Description:
	Inspects the last Chat Message to see if the actor "rolled a natural 1"
	on a spell attack or if they failed an ASF check while casting. This
	is designed to be used with the "Spell Fumble" option.
	
	Usage: Called from macro "checkForSpellFumbleAndASF" to see if an attack
	spell rolled a "1" or the character failed their "Arcane Spell Failure"
	check while casting in armour.
	
	Foundry Version: v12+ / v13.351
		
  	<actor> is passed in directly from the activating feature. Passed to
	.rollCL for context.
	returns: void
 	Note: Instead of "evaluate" --> "roll" can be used they seem identical 
	==========================================================================
*/

	const curVer = 'v1.20';
	const head = `Macro.spellFumble(${curVer}): `;
	let msg = '';
	let failState = false;
//	=========================================================

debugger;

	// let dies = await new Roll(formula).evaluate({async: true});
	if (typeof args === "unidentified") {
		failState = true
		msg = `Level was not passed in via "args."`;
		console.log(head + msg);
		return null;
	}
	const spCheck = 10 + Number(args);

	// returns ChatMessagePF
	const mChat = await actor.rollCL('primary', {skipdialog: false, dc: spCheck});

	if (typeof mChat === "undefined") {
	//	something happened to the dialog, likely cancelled
		failState = true;
		msg = "Something happened to the dialog, likely cancelled.";
		
		return null;
	} 

	//	collect the minimum info
	const mTotal = mChat.rolls[0]._total;	

	let state = "";
	let col = 'black';

	const success = (mTotal >= spCheck);

	if (!success) {
		// call macro to pull a result
		const lm = await game.macros.getName("pullFromRollTable(4-6)");
		await lm.execute({speaker: actor.name});
	}
	return null;
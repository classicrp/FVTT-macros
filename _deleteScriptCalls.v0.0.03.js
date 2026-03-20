//	{ collection, key }
/*
	==========================================================================
	Macro Title: Delete Script Calls Macro for Foundry VTT PF1e
	Author: classicrp, @raydenx (https://github.com/classicrp)
	Last updated 2025-11-26
	License: MIT License
	
	Description:
	Allows the GM or Player to remove a duplicate or malformed entry in
	the Collection 'scriptCalls' of a Spell.
	
	Usage: None. Called directly by macro "spellResetDailyCastings".
	
	Foundry Version: v12+ / v13.351
	
	<collection> is passed in directly from the activating feature. Required in
    order to remove an embedded macro.
	<key> is passed in to specify which macro we are removing.
	
	Returns: boolean
	==========================================================================
*/
	const curVer = "v0.0.03";
	const head = `Macro._deleteScriptCalls(${curVer}): `;
	let msg = "";
	let failState = false;
//	=========================================================

	failState = await collection.delete(key);

return failState;
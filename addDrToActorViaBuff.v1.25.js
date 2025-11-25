/*	==========================================================================
	author: classicrp, @raydenx
	date: 2025-11-08
	==========================================================================
	<actor> is passed in directly from the calling spell. Required in order to
	set the damage reduction value on said item.
	returns: void
	NOTE: thanks to @websterguy, Discord::FVTT#pf1e for 'reminding' me that
		.update requires an object.
	==========================================================================
*/

	const curVer = 'v1.24';
	const head = `Macro.addDrToActorViaBuff(${curVer}): `;
	let msg = '';
	let failState = Boolean(false);
//	=========================================================

	const baseAttr = "system.traits.dr";
	const refActor = actor.toObject();
	const DR = refActor.system.traits.dr;
	
/*	DR is an object with these two elements; { 
		custom: a string,
		value: [] an array
	}
*/

//	attribute for custom DR 
	const cAttr = "custom";
//////////////////////////////////////////////////////////////////////////////////////
//	CHANGES FOR CUSTOM DR 															//
//////////////////////////////////////////////////////////////////////////////////////
//	this is the string value you change for a custom DR, comma separated for more 	//
//	than one or left blank ("") if not using it.									//
	let cVal = "3/Ooze"																
//////////////////////////////////////////////////////////////////////////////////////

/* 	For standard entries the must have the following components
		amount: this will be your DR value.
		operator: boolean { true is or, false is and }  // use for two types
		types: a zero based array of 1 or more descriptors from the following
		list ( as these are hardcoded in "pf1e" ); {
				"None", "Bludgeoning", "Piercing", "Slashing", "Lawful", 
				"Chaotic", "Good", "Evil", "Adamantine", "Silver", "Cold Iron",
				"Epic", "Magic" }
			
	//	the following translates to DR "10/slashing or piercing".
*/

//	attribute for the array of known DR
	const vAttr = "value";
//////////////////////////////////////////////////////////////////////////////////////
//	CHANGES FOR KNOWN DR 															//
//////////////////////////////////////////////////////////////////////////////////////
// 	change this number to the amount you want for DR.  set to 0 (zero) if you are 	//
//	not	using a known DR.															//
	const myAmount = 0;																
//////////////////////////////////////////////////////////////////////////////////////
// 	set these strings to the types needed, if you just wanted one type then replace //
//	'Piercing' with your preferred option and remove the comma and 'Slashing',		//
//	remember to use lowercase.  If not using a known type, replace with [].			//
	const myTypes = [];										
//////////////////////////////////////////////////////////////////////////////////////
// 	true = Or, false = And.  If not using a known type, just leave it as the value	//
//	defaults to 'true' regardless.													//
	const myOperator = true;														
//////////////////////////////////////////////////////////////////////////////////////
	
//	we build the values into an object
	const myObj = { amount: myAmount, types: myTypes, operator: myOperator };

	let attr = "";

	if (state) {
	// 	the buff is turned on

//	check the custom value first
		if (DR.custom.length !== 0) {
		/* 	we need to append the data to the existing values and add a comma
			if necessary
		*/
			if (DR.custom.includes(cVal)) {
			//	there is already a copy on the actor 
				msg = `There is already a copy of ${cVal} detected.`
				console.log(head + msg);
				cVal = "";
			} else {
			//	add it to the existing string 
				cVal = DR.custom + ", " + cVal;
			}
		}
	// 	we add the value into the string
		if (cVal.length !== 0) {
			await foundry.utils.setProperty(DR, cAttr, cVal);
		}

	//	check that we want to add a known value
		if (myObj.amount === 0 && myObj.types.length === 0) {
		//	we don't
			msg = "We are not assigning a known DR."
			console.log(head + msg);
		
		} else {
		//	make sure its not already there
			if (getObjectIndex(DR.value, myObj) === -1) {
			//	not found so add the object DR to the array
				await DR.value.push(myObj);
			}
		}

	} else {
	//	the buff is turned off
		//	see if we have an entry in custom: 
		let aVal = DR.custom;
		const aLoc = aVal.search(cVal);
		if (aLoc !== -1) {
		//	there is a custom component 
			if (aVal.length !== 0) {
			/* 	we need to remove the data from the existing values and remove a comma
				if necessary
			*/
				if (aVal.length === cVal.length && aVal.length !== 0) {
				//	the buff is the only entry just set it back to an empty string 
					cVal = "";
				} else {
				//	replace it with empty string 
					if (aLoc === 0) {
					//	start of the string, comma at end of our entry	
						cVal += ", ";
					} else {
					//	somewhere later in the string, comma before our entry 
						cVal = ", " + cVal;
					};
					cVal = aVal.replace(cVal, "");
				}
				await foundry.utils.setProperty(DR, cAttr, cVal);
			} else {
			//	nothing to do here 
				msg = "Custom value is already empty."
				console.log(head + msg);
			};
		};

/*  Now the array */
		if (DR.value.length === 0) {
		//	there are no entries in the array, we are done 
		} else {
		//	we want to remove the correct item out of the array 
			let foundAt = getObjectIndex(DR.value, myObj);
			if (foundAt !== -1) {
				delete DR.value[foundAt];
				//	now fix the array
				await repairArray(DR.value);
			}
		};
	}
	//	let everything catch up
	await actor.update({'system.traits.dr': DR});

return;	

function getObjectIndex(fArr, fObj) {
//	take the original array and compare to our object 
	let i = -1;
	let finalPos = -1;
	fArr.forEach(o => {
		i++; 
		if (o.amount === fObj.amount && o.operator === fObj.operator) {
		//	we have a potential match 
			if (fObj.types.length > 1) {
			//	2 types to compare 
				if (o.types.includes(fObj.types[0]) && o.types.includes(fObj.types[1])) {
				// full match	
					finalPos = i;
				};
					
			} else if (o.types.includes(fObj.types[0])) {
			//  1 type comparison matches 
				finalPos = i;
			};
		};
	});
	return finalPos;
}

function repairArray(fArr) {
//	take the original array and shuffle it around until our object is last 

//	this should re-index the array
	fArr.sort();
	fArr.reverse();
	fArr.sort();
	fArr.pop();
	
	return;
}
/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-09
	==========================================================================
	<item> is passed in directly from the calling spell. Required in order to
	set the dictionary value on said item.
	returns: void
	NOTE: don't reference dictionary .value itself as it gets stored as Object
			instead of Number.
*/

	const curVer = 'v1.12';
	const head = `Macro.spellSheetModifier(${curVer}): `;
	let msg = '';
	let failState = false;
//	=========================================================

	const attr = `system.flags.dictionary.castings`;

	let myObj1 = {
		category: "use",
		hidden: false,
		img: "modules/game-icons-net-font/svg/movement-sensor.svg",
		name: "useAction",
		type: "macro",
		value: "Macro.VgwfQ1Hk2rC4NOXB",
		_id: ""
	}

	let myObj2 = { 
		category: "postUse", 		// watch capital on 'U'
		hidden: false, 
		img: "icons/magic/life/crosses-trio-red.webp", 
		name: "updateCastings", 
		type: "macro", 
		value: "Macro.A1aJCl2GXOksQe8J", 
		_id: "" 
	}

	let spells = false;
	let skipOne = false;
	let skipTwo = false;
	
//	Grab each actor
	game.actors.forEach(o => {
	//	grab each actor in the world
		spells = false;
		
//		if (o.type == 'npc' && o.name == 'Samaritha Beldusk') {
//		if (o.type == 'character' && o.name == 'Malekith') {
		if (o.type == 'character' || o.type == 'npc') {
		// if it is a character
			let level = -1;
			let oSpells = o._itemTypes.spell;
		
			oSpells.forEach(s => {
				let mySpell = s.toObject();

			// grab each primary spell
				if (s.system.spellbook !== 'secondary' || s.system.spellbook !== 'tertiary' || s.system.spellbook !== 'spell-like') {
				// 	assume this is the primary spellbook
					spells = true;

					if (level !== s.system.level) {
						level = s.system.level;
					}

					if (s.system.flags.dictionary.castings == null) {	
					// 	add in the dictionary name/value pair
						s.update({ [attr]: 0 });
						console.log(`${o.name}: ${s.name}[${level}] added dictionary item 'castings'`);

					} else { 
					//	already exists on spell
						console.log(`${o.name}: ${s.name}[${level}] already has dictionary item 'castings'`);
					}
					
					let myCalls = mySpell.system.scriptCalls;
					myCalls.forEach(m => {
					//	there are macros already present
						if (m.name == myObj1.name) {
						//	first macro is already present
							skipOne = true;
						} else if (m.name == myObj2.name) {
							skipTwo = true;
						}
					});
debugger;					
					if (!skipOne) {
					//	first macro
						myObj1._id = foundry.utils.randomID(8);
						mySpell.system.scriptCalls.push(myObj1);
						console.log(`${o.name}: ${s.name}[${level}] added macro 'useAction'.`);

					} 
					if (!skipTwo) {
					//	second macro
						myObj2._id = foundry.utils.randomID(8);
						mySpell.system.scriptCalls.push(myObj2);
						console.log(`${o.name}: ${s.name}[${level}] added macro 'updateCastings'.`);
					}

					if (!skipOne || !skipTwo) {
					//	update real spell.scriptCalls
						s.update({'system.scriptCalls': mySpell.system.scriptCalls });
					} else {
					//	they are already present
						console.log(`${o.name}: ${s.name}[${level}] already has both macros.`);			
					}					
				}
				//	reset the variables for macro checking
				skipOne = false;
				skipTwo = false;
			});
		}
/*		if (spells) {
			msg = msg.substring(0, msg.length-2 );
		}
		msg += '</p>';
		console.log(msg); 
*/
	//	await actor.update('', o);
	});


// s.system.spellPoints.cost
// s.system.flags.dictionary.${name}
// new s.scriptCalls.constructor()

/*	uuid of 'updateCastings' Macro.A1aJCl2GXOksQe8J
	uuid of 'useAction' Macro.VgwfQ1Hk2rC4NOXB

 	structure for .scriptCalls array of objects:
	object {
		category: "postuse" or "use",
		hidden: false,
		img: " image path ",
		name: "name",
		type: "macro",
		value: " macro uuid ",
		_id: unique short id
	}	
*/


console.clear();
const _VERBOSE = 0;
const _NUMBERTOROMAN = {1:"i", 2:"ii", 3:"iii", 4:"iv", 5:"v", 6:"vi", 7:"vii", 8:"viii", 9:"ix", 10:"x"};  //  packageInventoryData()
const _SPELLMODIFIERS = ["lesser", "minor", "improved", "greater", "major", "supreme", "mass", "communal"];  //  elementalSchoolSpells()

const notif = ui.notifications.info( "Beginning updates", { permanent: true, progress: true, pct: 0 } );

//	Look for packs that have "Items"
const packs = game.packs.contents.filter( f=> f.metadata.type === "Item" );
notif.update({ message: "Item Compendiums identified" });
//	Put your specific `.name` contents here
const target = "elemental school";
const wanted = await getWantedUuids( packs, target, notif );
let rslt;
//	If the filtered Array has contents, continue
if ( !wanted.length ) {
	notif.remove();
	ui.notifications.error( `No Class Features with "${target}" in name were found!.` );
	return;
}
let elementalList = Array();
notif.update({ message: "Collecting Spells from feature...", pct: 0 });
let count = 0, ratio = 0, max = wanted.length;
for ( const w of wanted ) {
	//	Grab the `uuid` for the "feature" from the Compendium
	let local = await fromUuid( w.uuid );  //  remains in main to allow sync pull from Compendium
	ratio = Math.floor( count / max * 100 ) / 100;
	notif.update({ pct: ratio });
	local = local.toObject();
	rslt = await getSpellsFromWantedUuids( local, w.uuid, notif );
	if ( rslt.length ) {
		if ( elementalList.length ) {
			elementalList = elementalList.concat( rslt );
		} else {
			elementalList = rslt;
		}
	}
	rslt = null;
	count++;
}

notif.update({ pct: 0 });
//	Add spell UUIDs to the generated "elementalList"
await getSpellUuids( packs, elementalList, notif );
console.info( `Updated "elementalList"`, elementalList );

//	Get a list of unknown "spells" listed in the source feature
const unknowns = await elementalList.filter( f=> f.uuid === "" );
if ( unknowns.length ) {
	let msg = `<h3>Unknowns Spells Found</h3><p></p>`;
	unknowns.forEach( e=> {
		msg += `<p><span style="font-family: Arial; font-size: 1.1em">
			<strong>Pack:</strong> ${e.pack}</br>
			<strong>Class Feature:</strong> ${e.feature}</br>
			<strong>Level:</strong> ${e.level}</br>
			<strong>Spell:</strong> ${e.spell}</span></p>`;
	});
	await ChatMessage.implementation.create({
		content: msg,
	});
	console.warn( "Spells with no matching UUID", unknowns );
}
let listForSpellUpdates = await getListForSpellUpdates( elementalList, notif );

count = 0, ratio = 0, max = listForSpellUpdates.length;
notif.update({ message: "Updating Spells", pct: ratio });
for ( let ul of listForSpellUpdates ) {
	//	see if a uuid exists for the spell
	let spell = await fromUuid( ul.uuid );    //  remains in main to allow sync pull from Compendium
	ratio = Math.floor( count / max * 100 ) / 100;
	let success = Boolean();
	try {
		await spell.update({ ["system.learnedAt.elementalSchool"]: ul.elementalSchool });
		success = true;
	} catch ( error ) {
		error = 0;
		success = false;
	}
	notif.update({ pct: ratio });
	//	Update the memory list
	ul.updated = success;
	console.log( `Updated Spell "${ul.spell}" with Elemental School data:`, ul.elementalSchool, `Succeeded? ${success}` );
	count++;
}

notif.remove();
ui.notifications.success( "Completed Updates!" );
const successes = await checkForSuccess( listForSpellUpdates );
if ( successes ) {
	let msg = `<h3>Spells Updated Success</h3><p></p>`;
	rslt = Object.entries( successes )
			.map( m=> ({ state: m[0], count: m[1] }));
	rslt.forEach( e=> {
		msg += `<p><span style="font-family: Arial; font-size: 1.1em">
				<strong>${e.state}:</strong> ${e.count} of ${listForSpellUpdates.length}</span></p>`;
	});
	await ChatMessage.implementation.create({
		content: msg,
	});	
};

function checkForSuccess( listForSpellUpdates ) {
	const result = listForSpellUpdates
		.flatMap( m=> (m.updated === true))
		.reduce( (acc, updated)=> {
			acc[updated] = ( acc[updated] || false ) + 1;
			return acc;
		}, {});
	console.info( "Success rate:", result );
	return result;
};

function getListForSpellUpdates( elementalList, notif ) {
	let result = Array();
	//	Do a count by "spell" to provide number of occurrences
	notif.update({ message: "Collecting same Spells...", pct: 5 });
	const duplicates = elementalList
						.filter( f=> f.uuid !== "" )
						.flatMap( m => m.spell )
						.reduce( (acc, spell) => {
							acc[spell] = ( acc[spell] || 0 ) + 1;
							return acc;
						}, {});
	//	Prep an object array with properties needed to proceed with updates
	notif.update({ message: "Collating Spell data...", pct: 10 });
	const shorterList = Object.entries(duplicates)
					.map( m=> ({ spell: m[0], count: m[1], elementalSchool: {}, uuid: "", updated: false }));
	//	Update the missing properties from the original "elementalList"

	notif.update({ message: "Assembling final Spell list", pct: 15 });
	for ( let sh of shorterList ) {
		let count = 0, start = 15, ratio = 0, max = shorterList.length;
		let rslt = elementalList.filter( f=> f.spell === sh.spell );
		ratio = ( Math.floor( count / max * 100 ) + start ) / 100;
		notif.update({ pct: ratio });
		rslt.forEach( e=> {
			if ( count === 0 ) sh.uuid = e.uuid;
			if ( foundry.utils.isEmpty( sh.elementalSchool ) ) {
				//	first occurance
				sh.elementalSchool = e.elementalSchool;
			} else {
				//	append the current object from "e" to "sh"
				Object.assign( sh.elementalSchool, e.elementalSchool );
			}
			count++
		});
		result.push( sh );
	}
	if ( _VERBOSE >= 5 ) console.info( "getListForSpellUpdates()", result );
	return result;
};

function getSpellsFromWantedUuids( local, uuid, notif ) {
/*	Grabs the item for each provided "UUID" and parses through the description
*		looking for a list of spells associated with the feature item that the 
*		UUID represents.
*
*	@params; 	{object array} - "local", `toObject()` version of an [ItemFeatPF],
*				{string} - "uuid", the UUID of the source Compendium.
*
*	@returns; 	{object array} - a array of objects containing source feature, 
*								level and spell name || an empty array.
*/
	if ( !local ) return null;
	const result = Array();
	//	Grab the "pack" used
	const packinfo = uuid.split(".");
	const pack = packinfo[1] + "." + packinfo[2];
	//	Grab the description field
	let desc = local.system.description.value;
	//	Parse the HTML text
	let parsed = parseHTML( desc );
	let spellList = Array();
	for ( const p of parsed ) {
		//	As long as the description contains a "Spell" header 
		//	followed by a list of "spells by level"
		if ( p.innerText === "Spells" ) {
			let cNodes = p.nextSibling.childNodes;
			cNodes.forEach( e=> {
				//	Add to Array the HTML and @UUID stripped text
				spellList.push( removeHTMLandUUID( e.outerText ) );
			})
			break;
		}
	}
	notif.update({ message: `Collecting Spells from Class Feature "${local.name}"` });
	//	Strip out the "target" reference
	const elementName = local.name.replace( " Elemental School", "" ).trim();
	spellList.forEach( e=> {
		//  Break up each record of the "spellList" array
		//	The first split based on "-" separates the level from the listed spells
		const levels = e.split("-");
		//	Grab the number from the "level" side
		let level = parseInt( levels[0].trim(), 10 );
		//	Break the listed spells side by ","
		const spells = levels[1].split(",");
		for ( let i=0; i < spells.length; i++ ) {
			let spell = spells[i].trim();
			//  Problems with spell variants including "," in the spell
			//  such as "lesser", "greater", "mass", etc. which need to
			//  be appended to the previous record
			if ( _SPELLMODIFIERS.includes( spell ) ) {
				//  This is one of the spell variants
				if ( i > 0 ) {
					//	The first spell of any list should not already
					//	have a variant tag
					let previous = spells[i-1].trim();
					//	Update the current "result" set before returning
					let fltrd = result
						.filter( f=> f.school === elementName 
								 && f.spell === previous );
					//  Always grab the last (highest level) spell
					fltrd[fltrd.length - 1].spell += ", " + spell;
					//	Clear the current spell which is just a variant tag
					spell = "";
				}
			}
			if ( spell ) {
				//	Now we check for numbers in the spell
				let nums = spell.split(" "), num = 0;
				for ( const n of nums ) {
					num = parseInt( n );
					if ( !isNaN( num ) ) break;
				}
				if ( num ) {
				//  We have a bad "Roman" numeral, fix it
					spell = spell.replace( num.toString(), _NUMBERTOROMAN[num] );
				}
				//  Create a record object for the current "spell" listed
				let record = {
					pack: pack,
					feature: local.name,
					featureUuid: uuid,
					school: elementName,
					elementalSchool: {
						[elementName]: level
					},
					level: level,
					spell: spell,
					uuid: String()
				}
				//	Add the spell to the output array
				result.push( record );
			}
		}
	});
	if ( _VERBOSE >= 5 ) console.info( `getSpellsFromWantedUuids(${elementName})`, result );
	return result;
};

function getWantedUuids( packs, target ) {
/*	Removes all HTML and @UUID coding from a provided text block.
*
*	@params; 	{object array} - "packs", an array of [CompendiumCollections],
*				{string} - "target", the specific item text that needs inclusion.
*
*	@returns; 	{object array} - a array of uuid's matching the request.
*/
	const result = Array();
	let count = 0, ratio = 0, max = packs.size || packs.length;
	notif.update({ message: `Grabing Class Features ("${target}")` });
	packs.forEach( pack=> {
		//	Grab only the "Feats"
		ratio = Math.floor( count / max * 100 ) / 100;
		const srcs = pack.index.contents.filter( f=> f.type === "feat" );
		if ( srcs.length ) {
			//	Filter down to "Class Features" and specific name requirements
			//	in my case, I also filter out my compendium duplicates (the ones
			//	that I've already fixed for my campaigns)
			//	Only return the "UUID"
			let fltrd = srcs.filter( f=> !foundry.utils.isEmpty( f.system )
									 && f.system.subType === "classFeat"
									 && f.name.toLowerCase().includes( target )
									 && !f.uuid.includes( "crp-contents" ) )
							.sort( function(a,b) {
								let x=a.name, y=b.name;
								return (x<y)?-1:(x>y)?1:0;})
							.map( m=> ({ uuid: m.uuid }));
			if ( fltrd.length ) {
				//	Add each filtered record into an Array
				fltrd.forEach( h=> {
				result.push( h );          
			});
		  }
		}
		notif.update({ pct: ratio});
		count++;
	});
	if ( _VERBOSE >= 5 ) console.info( "getWantedUuids()", result );
	return result;
};

function getSpellUuids( packs, elementalList, notif ) {
/*	Go through Compendia to find the spell matching the list and update
*	the `uuid` in the list. A missing UUID indicates an issue with the original
*	feature spell list in the description that will need a manual fix.
*
*	@params		{object array} - "packs", an array of [CompendiumCollections],
*				{object array} - "elementalList", the working record set.
*
*	@returns	{null} - "elementalList" is updated with `uuid` in place.
*/
	for ( const pack of packs ) {
		notif.update({ message: `Collecting Spell UUIDs from "${pack.metadata.label}"`, pct: 0 });
		//	Grab only the "Spells"
		const srcs = pack.index.contents.filter( f=> f.type === "spell" );
		if ( !srcs.length ) continue;
		//	Filter down to "Spells" and any specific name requirements
		//	in my case, I also filter out my compendium duplicates (the ones
		//	that I've already fixed for my campaigns)
		const fltrd = srcs.filter( f=> !foundry.utils.isEmpty( f.system )
								 && !f.uuid.includes( "crp-contents" ))
						.map( m=> ({name: m.name, uuid: m.uuid}) );
		if ( fltrd.length ) {
			//	Add each filtered record into an Array
			let count = 0, ratio = 0, max = fltrd.length
			fltrd.forEach( h=> {
				ratio = Math.floor( count / max * 100 ) / 100;
				notif.update({ pct: ratio });
				let rslt = elementalList.filter( e=> e.spell === h.name.toLowerCase() );
				if ( rslt.length ) {
					for ( let r of rslt ) {
						//	For all matching records in "elementalList"
						r.uuid = h.uuid;
					}
				}
				count++;
			});
		}
	}
	if ( _VERBOSE >= 5 ) console.info( "getSpellUuids()" );
	return;
};

function removeHTMLandUUID( htmlText, state, joiner ) {
/*	Removes all HTML and @UUID coding from a provided text block.
*
*	@rarams; 	{string} - "htmlText", a block of encoded text,
*				{boolean} - `state`: true = "short" (only returns 1st paragraph), false = "full" (returns whole text),
*				{string} - "joiner", paragraph separator.
*
*	@returns; 	{string} - text stripped of all HTML and @UUID coding.
*/
	if ( _VERBOSE >= 7 ) {
		console.log( "removeHTMLandUUID() passed:", _LF,
			"htmlText:", htmlText );
	}
	if ( foundry.utils.isEmpty( htmlText ) || htmlText === "" ) return htmlText;
	let result = "", srcs = Array(), output = Array(), temp = "";
	let parsed = foundry.utils.parseHTML( htmlText );
	if (( foundry.utils.isEmpty( parsed ) || !parsed ) && htmlText.includes( "@UUID" ) ) {
        parsed = { innerText: htmlText };
    } else {
        return htmlText;
    }
	if ( Array.isArray( parsed ) && parsed.length ) {
		//	An Array already so just assign
		srcs = parsed;
	} else {
		//	Not an Array
   		srcs.push( parsed );
	}
	for ( let i = 0; i < srcs.length; i++ ) {
		//	picked apart based on line.
		let local = srcs[i].innerText;
		while ( local && local.includes( "@UUID" )) {
			//	we have @UUID[]{} text in here.
			temp = local.replace( /@UUID\[[^\]]+\]\{([^}]+)\}/, "$1" );
			if ( local === temp ) {
				//	nothing happened, we are missing the {text} part
				//	lookup the actual UUID for name
				const REGEX = /(@UUID\[([^\]]+)\])/;
				let match = local.match( REGEX );
				let name = fromUuidSync( match[2] ).name;
				local = local.replace( match[1], name.toLowerCase() );
			} else {
				local = temp;
			}
		}
		output.push( local );
		if ( !state && i === 0 ) break;
	}
	result = output.filterJoin( joiner );
	if ( _VERBOSE >= 6 ) console.info( "removeHTMLandUUID()", result );
	return result;
};

console.clear();
const _VERBOSE = 5;
const _NUMBERTOROMAN = {1:"i", 2:"ii", 3:"iii", 4:"iv", 5:"v", 6:"vi", 7:"vii", 8:"viii", 9:"ix", 10:"x"};  //  packageInventoryData()
const _SPELLMODIFIERS = ["lesser", "minor", "improved", "greater", "major", "supreme", "mass", "communal"];  //  elementalSchoolSpells()

//	Look for packs the have "Items"
const packs = game.packs.contents.filter(f=> f.metadata.type === "Item");
//	Put your specific `.name` contents here
const target = "elemental school";
const wanted = await getWantedUuids(packs, target);
let rslt;
//	If the filtered Array has contents, continue
if (!wanted.length) return;
let elementalList = Array();
for (const eSchool of wanted) {
	//	Grab the `uuid` for the "feature" from the Compendium
	let local = await fromUuid(eSchool.uuid);
	local = local.toObject();
	rslt = getSpellsFromWantedUuids(local, eSchool.uuid);
	if (rslt.length) {
		if (elementalList.length) {
			elementalList = elementalList.concat(rslt);
		} else {
			elementalList = rslt;
		}
	}
	rslt = null;
}
const refinedList = refineElementalList(elementalList);
await getSpellUuids( packs, elementalList );
console.info(`Updated "elementalList"`, elementalList);
const unknowns = Array();
for (const el of elementalList) {
	//	see if a uuid exists for the spell
	if (!el.uuid) {
		//	make a note of the "bad" record
		unknowns.push(el);
		//	skip and continue
		continue;
	}
	const record = Object();
	setProperty(record, el.school, el.level);
	let spell = await fromUuid(el.uuid);
//	await spell.update({ ["system.learnedAt.elementalSchool"]: record });
//    break;  // verify first one is written correclty
//	await setProperty(spell, "system.learnedAt.elementalSchool", record);
}
console.warn("Spells with no matching UUID", unknowns);

function refineElementalList(elementalList) {
	let result = Array();
debugger
	const duplicates = elementalList
							.flatMap(m => m.spell)
							.reduce((acc, spell) => {
								acc[spell] = (acc[spell] || 0) + 1;
								return acc;
							}, {});
	result = Object.entries(duplicates)
				.map(m=> ({ spell: m[0], count: m[1] }))
				.filter(f=> f.count > 1)
				.sort(function(a,b) {
					let x=a.spell, y=b.spell;
					return (x<y)?-1:(x>y)?1:0;
				});

/*
	const fltrd = elementalList
					.sort(function(a,b) {
						let x=a.spell, y=b.spell;
						if (x < y) return -1;
                        if (x > y) return 1;
                        setProperty(a.elementalSchool, b.school, b.level);
						return 0;
					});
*/
	return result;
};

function getSpellsFromWantedUuids(local, uuid) {
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
	if (!local) return null;
	const result = Array();
	//	Grab the "pack" used
	const packinfo = uuid.split(".");
	const pack = packinfo[1] + "." + packinfo[2];
	//	Grab the description field
	let desc = local.system.description.value;
	//	Parse the HTML text
	let parsed = parseHTML(desc);
	let spellList = Array();
	for (const p of parsed) {
		//	As long as the description contains a "Spell" header 
		//	followed by a list of "spells by level"
		if (p.innerText === "Spells") {
			let cNodes = p.nextSibling.childNodes;
			cNodes.forEach(e=> {
				//	Add to Array the HTML and @UUID stripped text
				spellList.push(removeHTMLandUUID(e.outerText));
			})
			break;
		}
	}
	//	Strip out the "target" reference
	const elementName = local.name.replace(" Elemental School", "").trim();
	spellList.forEach(e => {
		//  Break up each record of the "spellList" array
		//	The first split based on "-" separates the level from the listed spells
		const levels = e.split("-");
		//	Grab the number from the "level" side
		let level = parseInt(levels[0].trim(), 10);
		//	Break the listed spells side by ","
		const spells = levels[1].split(",");
		for (let i=0; i < spells.length; i++) {
			let spell = spells[i].trim();
			//  Problems with spell variants including "," in the spell
			//  such as "lesser", "greater", "mass", etc. which need to
			//  be appended to the previous record
			if (_SPELLMODIFIERS.includes(spell)) {
				//  This is one of the spell variants
				if (i > 0) {
					//	The first spell of any list should not already
					//	have a variant tag
					let previous = spells[i-1].trim();
					//	Update the current "result" set before returning
					let fltrd = result
						.filter(f=> f.school === elementName 
								 && f.spell === previous);
					//  Always grab the last (highest level) spell
					fltrd[fltrd.length - 1].spell += ", " + spell;
					//	Clear the current spell which is just a variant tag
					spell = "";
				}
			}
			if (spell) {
				//	Now we check for numbers in the spell
				let nums = spell.split(" "), num = 0;
				for (const n of nums) {
					num = parseInt(n);
					if (!isNaN(num)) break;
				}
				if (num) {
				//  We have a bad "Roman" numeral, fix it
					spell = spell.replace(num.toString(), _NUMBERTOROMAN[num]);
				}
				//  Create a record object for the current "spell" listed
				let record = {
					pack: pack,
					feature: (local.name),
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
				result.push(record);
			}
		}
	});
	if (_VERBOSE >= 5) console.info(`getSpellsFromWantedUuids(${elementName})`, result);
	return result;
};

function getWantedUuids(packs, target) {
/*	Removes all HTML and @UUID coding from a provided text block.
*
*	@params; 	{object array} - "packs", an array of [CompendiumCollections],
*				{string} - "target", the specific item text that needs inclusion.
*
*	@returns; 	{object array} - a array of uuid's matching the request.
*/
	const result = Array();
	packs.forEach(pack=> {
		//	Grab only the "Feats"
		const srcs = pack.index.contents.filter(f=> f.type === "feat");
		if (srcs.length) {
			//	Filter down to "Class Features" and specific name requirements
			//	in my case, I also filter out my compendium duplicates (the ones
			//	that I've already fixed for my campaigns)
			//	Only return the "UUID"
			let fltrd = srcs.filter(f=> !foundry.utils.isEmpty(f.system)
									 && f.system.subType === "classFeat"
									 && f.name.toLowerCase().includes(target)
									 && !f.uuid.includes("crp-contents"))
							.sort(function(a,b) {
								let x=a.name, y=b.name;
								return (x<y)?-1:(x>y)?1:0;})
							.map(m=> ({uuid: m.uuid}));
			if (fltrd.length) {
				//	Add each filtered record into an Array
				fltrd.forEach(h=> {
				result.push(h);          
			});
		  }
		}
	});
	if (_VERBOSE >= 5) console.info("getWantedUuids()", result);
	return result;
};

function getSpellUuids( packs, elementalList ) {
/*	Go through Compendia to find the spell matching the list and update
*	the `uuid` in the list. A missing UUID indicates an issue with the original
*	feature spell list in the description that will need a manual fix.
*
*	@params		{object array} - "packs", an array of [CompendiumCollections],
*				{object array} - "elementalList", the working record set.
*
*	@returns	{null} - "elementalList" is updated with `uuid` in place.
*/
	for (const pack of packs) {
		//	Grab only the "Spells"
		const srcs = pack.index.contents.filter(f=> f.type === "spell");
		if (!srcs.length) continue;
		//	Filter down to "Spells" and specific name requirements
		//	in my case, I also filter out my compendium duplicates (the ones
		//	that I've already fixed for my campaigns)
		const fltrd = srcs.filter(f=> !foundry.utils.isEmpty(f.system)
								 && !f.uuid.includes("crp-contents"))
						.map(m=> ({name: m.name, uuid: m.uuid}));
		if (fltrd.length) {
			//	Add each filtered record into an Array
			fltrd.forEach(h=> {
				let rslt = elementalList.filter(e=> e.spell === h.name.toLowerCase());
				if (rslt.length) {
					for (let r of rslt) {
						//	For all matching records in "elementalList"
						r.uuid = h.uuid;
					}
				}
			});
		}
	}
	if (_VERBOSE >= 5) console.info("getSpellUuids()");
	return;
};

function updateSpellsWithElementalSchools( spell, el ) {
/*	Update Compendium spells' `system.learnedAt.elementalSchool`
*	properties with the `school: level` combo from list for each spell.
*
*	@params		{object} - "spell", the matching [ItemSpellPF] for record,
*				{object} - "el", specific record of "elementalList",
*				 
*	@returns	{boolean} - true if no error occurs.
*/
	const record = Object();
	setProperty(record, el.school, el.level);
	let result = setProperty(spell, "system.learnedAt.elementalSchool", record);
	if (_VERBOSE >= 4) console.info(`updateSpellsWithElementalSchools(Spell: "${el.spell}" {${el.school}: ${el.level}}`, result);
	return result;
};

function removeHTMLandUUID(htmlText, state, joiner) {
/*	Removes all HTML and @UUID coding from a provided text block.
*
*	@rarams; 	{string} - "htmlText", a block of encoded text,
*				{boolean} - `state`: true = "short" (only returns 1st paragraph), false = "full" (returns whole text),
*				{string} - "joiner", paragraph separator.
*
*	@returns; 	{string} - text stripped of all HTML and @UUID coding.
*/
	if (_VERBOSE >= 7) {
		console.log("removeHTMLandUUID() passed:", _LF,
			"htmlText:", htmlText);
	}
	if (foundry.utils.isEmpty(htmlText) || htmlText === "") return htmlText;
	let result = "", srcs = Array(), output = Array(), temp = "";
	let parsed = foundry.utils.parseHTML(htmlText);
	if ((foundry.utils.isEmpty(parsed) || !parsed) && htmlText.includes("@UUID")) {
        parsed = { innerText: htmlText };
    } else {
        return htmlText;
    }
	if (Array.isArray(parsed) && parsed.length) {
		//	An Array already so just assign
		srcs = parsed;
	} else {
		//	Not an Array
   		srcs.push(parsed);
	}
	for (let i = 0; i < srcs.length; i++) {
		//	picked apart based on line.
		let local = srcs[i].innerText;
		while (local && local.includes("@UUID")) {
			//	we have @UUID[]{} text in here.
			temp = local.replace(/@UUID\[[^\]]+\]\{([^}]+)\}/, '$1');
			if (local === temp) {
				//	nothing happened, we are missing the {text} part
				//	lookup the actual UUID for name
				const REGEX = /(@UUID\[([^\]]+)\])/;
				let match = local.match(REGEX);
				let name = fromUuidSync(match[2]).name;
				local = local.replace(match[1], name.toLowerCase());
			} else {
				local = temp;
			}
		}
		output.push(local);
		if (!state && i === 0) break;
	}
	result = output.filterJoin(joiner);
	if (_VERBOSE >= 6) console.info("removeHTMLandUUID()", result);
	return result;
};
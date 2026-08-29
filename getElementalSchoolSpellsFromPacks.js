console.clear();
debugger
const _VERBOSE = 5;
const _NUMBERTOROMAN = {1:"i", 2:"ii", 3:"iii", 4:"iv", 5:"v", 6:"vi", 7:"vii", 8:"viii", 9:"ix", 10:"x"};  //  packageInventoryData()
const _SPELLMODIFIERS = ["lesser", "minor", "improved", "greater", "major", "supreme", "mass", "communal"];  //  elementalSchoolSpells()

const packs = game.packs.contents.filter(f=> f.metadata.type === "Item");
const target = "elemental school";
const wanted = Array();
packs.forEach(pack=> {
    const srcs = pack.index.contents.filter(f=> f.type === "feat");
    if (srcs.length) {
      let fltrd = srcs.filter(f=> !foundry.utils.isEmpty(f.system)
                			   && f.system.subType === "classFeat"
                               && f.name.toLowerCase().includes(target)
                               && !f.uuid.includes("crp-contents"))
                      .sort(function(a,b) {
                          let x=a.name, y=b.name;
                          return (x<y)?-1:(x>y)?1:0; })
					  .map(m=> ({uuid: m.uuid}));
      if (fltrd.length) {
        fltrd.forEach(h=> {
          wanted.push(h);          
        });
      }
    }
});

if (wanted.length) {
    let spellList;
    for (const eSchool of wanted) {
        let local = await fromUuid(eSchool.uuid);
        local = local.toObject();
        if (local) {
			let desc = local.system.description.value;
			let parsed = parseHTML(desc);
			spellList = Array();
			for (const p of parsed) {
				if (p.innerText === "Spells") {
					let cNodes = p.nextSibling.childNodes;
					cNodes.forEach(e=> {
						spellList.push(removeHTMLandUUID(e.outerText));
					})
					break;
				}
			}
			let elementalList = Array();
			const elementName = local.name.replace(" Elemental School", "").trim();
			spellList.forEach(e => {
				//  now break up each record of spellList
				const levels = e.split("-");
				let level = parseInt(levels[0].trim(), 10);
				const previous = Array();
				const spells = levels[1].split(",");
				for (let i=0; i < spells.length; i++) {
					let spell = spells[i].trim();
					//  problem with spell variants including "," in the spell
					//  such as "lesser", "greater", "mass", etc. which need to
					//  be appended to the previous record
					if (_SPELLMODIFIERS.includes(spell)) {
						//  update previos record
						if (i > 0) {
							let fltrd = elementalList.filter(f=> f.spell === spells[i-1].trim());
							//  always grab the last (highest level—last) spell
							fltrd[fltrd.length - 1].spell += ", " + spell;
							spell = "";
						}
					}
					if (spell) {
						let nums = spell.split(" "), num = 0;
						for (const n of nums) {
							num = parseInt(n);
							if (!isNaN(num)) break;
						}
						if (num) {
						//  we have a bad "roman" numeral, fix it
							spell = spell.replace(num.toString(), _NUMBERTOROMAN[num]);
						}
						//  create a record object for the current "spell" listed
						let record = {
							school: elementName,
							level: level,
							spell: spell
						}
						elementalList.push(record);
					}
				}
			});
			console.info(elementName, elementalList);
		}
    }
};

function removeHTMLandUUID(htmlText, state, joiner) {
/*	Removes all HTML and @UUID coding from a provided text block.
*	@Params; 	{String} - "htmlText", a block of encoded text,
*				{Boolean} - `state`: true = "short" (only returns 1st paragraph), false = "full" (returns whole text),
*				{String} - "joiner", paragraph separator.
*	@Returns; 	{String} - text stripped of all HTML and @UUID coding.
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
		//	An Array so set
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
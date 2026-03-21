const version = '1.7.5';
const show = false;
const verbose = false;
if (verbose) console.log("version:", version);
if (action.tag === `swstop`) {
	//	Turn off any active "shadowweapon" buffs
debugger
	await clearDictionary();
	const actBuffs = await actor._itemTypes.buff.filter(b => b.system.tags.includes('shadowweapon') && b.system.active);
	for (const a of actBuffs) {
		await a.setFlag('ckl-roll-bonuses', 'target_weapon', []);
		await a.setActive(false);		// (!a.isActive);
	}
	return;
}

//	CLASS DATA
let maxbonusOneWeap = 0, maxbonusTwoWeap = 0, enhbonusOneWeap = 0, enhbonusTwoWeap = 0, allowedNumOfWeaps = 1, actualNumOfWeaps = 0, newMaxOne = 0, newMaxTwo = 0;

//	only Fighter (Gloomblade) ?? can use
/*
    At 1st level, A gloomblade can create a shadowy weapon in a free hand as a move action. This can take the form of any melee weapon with which he is proficient. A gloomblade can have only one shadow weapon in existence at a time; creating a new shadow weapon causes an existing shadow weapon to vanish. At 3rd level, the shadow weapon acts as a magic weapon with a +1 enhancement bonus; this bonus increases by 1 for every 4 levels a gloomblade has beyond 2nd, to a maximum enhancement bonus of +5 at 18th level.
    At 7th level, a gloomblade can create (and maintain) two shadow weapons at a time as a move action; if he does, each weapon has an enhancement bonus 1 lower than normal. If a gloomblade creates only one weapon, it gains a weapon special ability of his choice (chosen upon creation); the ability must be valid for the shadow weapon's weapon type and must be chosen from defending, flaming, frost, keen, ghost touch, merciful, shock, thundering, or vicious. (Additional special abilities might qualify, at the GM's discretion.)
    At 11th level, a gloomblade's shadow weapons each gain their full enhancement bonus if he creates two weapons. If a gloomblade creates only one shadow weapon, it gains additional weapon special abilities; the total effective bonus of these abilities cannot exceed +3. The gloomblade can now choose from the of anarchic, axiomatic, flaming burst, icy burst, holy, shocking burst, unholy, and wounding weapon special abilities as well as those from the list above.
    At 15th level, a gloomblade's shadow weapons each gain magic weapon special abilities with a total effective bonus of +2 per weapon. If a gloomblade creates only one shadow weapon, its magic weapon special abilities cannot exceed a total effective bonus of +5. The gloomblade adds brilliant energy, dancing, and speed to the options he can choose as weapon special abilities for his shadow weapon.
*/
const level = await hasArchetype(actor, "fighter", "gloomblade");

//	RULE IMPLEMENTATION MECHANICS
if (level) {
	enhbonusOneWeap = ((level >= 3) ? 1 : 0) + Math.floor((level - 2) / 4);
	if (level >= 7 && level < 11) {
		maxbonusOneWeap = 1;
		enhbonusTwoWeap = enhbonusOneWeap - 1;
		allowedNumOfWeaps = 2;
	} 
	else if (level >= 11 && level < 15) {
		maxbonusOneWeap = 3;
		enhbonusTwoWeap = enhbonusOneWeap;
		allowedNumOfWeaps = 2;
	}
	else if (level >= 15) {
		maxbonusOneWeap = 5;
		maxbonusTwoWeap = 2;
		allowedNumOfWeaps = 2;
	}
} else {
	return;
}

//	WEAPON DATA
const weapTypes = "mwak";
let skip = false;
let weaps = deepClone(actor._itemTypes.attack.filter(e => (e.system.subType === "weapon" && e.name.toLowerCase().includes('shadow weapon'))));
if (verbose) console.log("weaps:",weaps);
const weap = {
	id: "",
	name: "",
	type: "",
};
let fWeap = []
for (const w of weaps) {
	let o = weap.constructor();
	if (w.actions.size !== 0) {
		o.id = w._id;
		o.name = w.name;
		skip = true;
		for (let i=0; i < w.system.actions.length; i++) {
			if (weapTypes.includes(w.system.actions[i].actionType)) {
				if (typeof o.type === "undefined") {
					o.type = w.system.actions[i].actionType;
				} else {
					if (!o.type.includes(w.system.actions[i].actionType)) {
						//  only want one copy of each
						o.type = o.type.concat((i < w.system.actions.length) ? ", " : "");
						o.type = o.type.concat(w.system.actions[i].actionType);
					}
				}
				skip = skip && false;
			} else {
				skip = skip && true;
			}
		}
	} else {
		//  no attack actions present, skip this one
		skip = true;
	}
	if (!skip) {
		fWeap.push(o);
    }
}

//	BUFF DATA
const buffs = await deepClone(actor._itemTypes.buff.filter(b => b.system.tags.includes('shadowweapon') && b.system.level > 0 && b.system.level <= maxbonusOneWeap).concat(actor._itemTypes.buff.filter(b => b.system.tags.includes('shadowweapon') && (b.system.tags.includes(`${enhbonusOneWeap}`) || b.system.tags.includes(`${enhbonusTwoWeap}`)) && b.system.level === 0)));
if (verbose) console.log("buffs:", buffs);
const buff = {
	id: "",
	name: "",
	feature: "",
	cost: 0,
	type: "",
	tag: ""
};
let fBuff = [], wBuff = [];
for (const b of buffs) {
	let o = buff.constructor();
	o.id = b._id;
	o.name = b.name.replace(' (shadow weapon)', '');
	o.feature = b.system.tags[0];
	o.cost = b.system.level;
	o.type = b.system.tags.filter(t => t.toLowerCase() !== 'shadowweapon' && t.toString().length !== 1).toString();
	o.enh = Number(b.system.tags.filter(t => t.toString().length === 1).toString())||0;
	fBuff.push(o);
}
wBuff = await deepClone(fBuff);

//	HTML BUILDING
let dHtml = "";
const sMO = (maxbonusOneWeap===0) ? '-': `+${maxbonusOneWeap}`;
const sMT = (maxbonusTwoWeap===0) ? '-': `+${maxbonusTwoWeap}`;
/*
 	<dTop> should be a numeric display only, not an input field
*/
const dTop = `
	<div class="form-group">
		<label for="dialog-inert-label">Max Option Cost</label>
		<div class="form-fields" inert>
			<div name="maxBonusLabel" rootId="dialog-inert-label"><strong><em>1 Weapon:</em></strong> <strong>[</strong> ${sMO} <strong>]</strong>, <strong><em>2 Weapons:</em></strong> <strong>[</strong> ${sMT} <strong>]</strong></div>
		</div>
	</div>`;
/*	
	A selection of <wGrp> should refine the list in <bGrpOne> and <bGrpTwo> to only 
	include options that share the same attack ".type" { mwak, rwak, 
	twak }
*/
let wGrp = `
	<div class="form-group">
		<label for="dialog-multi-weapon">Weapon Select</label>
		<div class="form-fields">
			<multi-select name="weaponSelect" rootId="dialog-multi-weapon">
				${fWeap.reduce((acc,e)=>{
					if(actualNumOfWeaps <= allowedNumOfWeaps) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
					return acc;
				},``)}
            </multi-select>
		</div>
	</div>`;
/*	
	Possible multiple selections could exist for <bGrpOne> and <bGrpTwo>
	as the total cost of the options must be no more than the limit displayed 
	in <dTop> and set by "maxbonusOneWeap" or "maxbonusTwoWeap".
*/
let bGrpOne = `
	<div class="form-group">
		<label for="dialog-multi-buff-one">First Weapon Options</label>
		<div class="form-fields">
			<multi-select name="buffSelectOne" rootId="dialog-multi-buff-one">
				${fBuff.reduce((acc,e)=>{
					return acc+=`<option value="${e.id}">${e.name}</option>\n`;					
				},``)}
            </multi-select>
		</div>
	</div>`;
/*
*/
let bGrpTwo = `
	<div class="form-group">
		<label for="dialog-multi-buff-two">Second Weapon Options</label>
		<div class="form-fields">
			<multi-select name="buffSelectTwo" rootId="dialog-multi-buff-two">
				${fBuff.reduce((acc,e)=>{
					return acc+=`<option value="${e.id}">${e.name}</option>\n`;					
				},``)}
            </multi-select>
		</div>
	</div>`;
/*
*/
dHtml = dTop + wGrp + bGrpOne + bGrpTwo;

//	LAUNCH DIALOG
const response = await foundry.applications.api.Dialog.input({
	window: {title: `${actor.name}'s Arcane Pool Weapon Enhancement Selector`},
	content: dHtml,
	buttons: [
		{
			icon: 'fas fa-check',
			label: 'Accept',
			action: 'ok',
            callback: (event,button,dialog) =>
                new foundry.applications.ux.FormDataExtended(button.form).object
		},
		{
			icon: 'fas fa-times',
			label: 'Cancel',
			action: "cancel",
            callback: (event,button,dialog) => console.log("cancelled"),
			default: true
		}
	],
  	render: onRender,
	// close: (...args) => console.log(args, "This always is logged no matter which option is chosen"),
	modal: false, // if true user cannot click on anything outside the dialog window.
	id: "shadowweapon-application-dialog", // name as you want just make it unique and no spaces! needed for CSS selecting if you add a <style> </style> to the content.
	classes: [], // as with id.
	position: {
		width: "auto", // default "auto" and cant go narrower than 200 or wider than the screen width
		height: "auto" // default "auto", cant go narrower than the header height or longer than the screen height - hotbar height.
		// top: 100, // location on screen where the top of the dialog sits, default is in the center of the screen
		// left: 100 // location on screen where the left of the dialog sits, default is in the center of the screen
	}
});

//	RESPONSE TO INPUTS
//	now do something with it!
if (response === 'cancel') {
	shared.reject = true;
	return
} 

let msg = "";
//	Write response.weaponSelect[] ids to "weapon[n]" dictionary
msg = await setFootnote(response, fWeap, fBuff);
shared.chatAttacks[0].effectNotesHTML = msg;
if (show) debugger

for (let i = 0; i < response.weaponSelect.length; i++) {
	await item.setItemDictionaryFlag(`weapon${i+1}`, response.weaponSelect[i]);
	const activated = actor.items.get(response.weaponSelect[i]);
	await activated.addItemBooleanFlag('shadow_weapon');
}

//	Write response.buffSelectOne[] ids to "w1buff[n]" dictionary
for (let i = 0; i < response.buffSelectOne.length; i++) {
	await item.setItemDictionaryFlag(`w1buff${i+1}`, response.buffSelectOne[i]);
	const activated = actor.items.get(response.buffSelectOne[i]);
	//	have to bind the correct weapon now
    await activated.setFlag('ckl-roll-bonuses', 'target_weapon', response.weaponSelect);
	await activated.setActive(true);
}

for (let i = 0; i < response.buffSelectTwo.length; i++) {
	// if (show) debugger
	await item.setItemDictionaryFlag(`w2buff${i+1}`, response.buffSelectTwo[i]);
	const activated = actor.items.get(response.buffSelectTwo[i]);
	//	have to bind the correct weapon now
    await activated.setFlag('ckl-roll-bonuses', 'target_weapon', response.weaponSelect);
	await activated.setActive(true);
}

return

function clearDictionary() {
	if (show) debugger
    let rslt = [];
    rslt.push(item.getItemDictionaryFlag('weapon1'));
    rslt.push(item.getItemDictionaryFlag('weapon2'));
    let msg = '';
	for (const w of rslt) {
		const activated = actor.items.get(w);
        if (msg === '') {
            msg = `<p><span style="font-size: 1.1em"><strong>${activated.name}</strong>`;
        } else {
            msg = msg.concat(`, <strong>${activated.name}</strong>.</span></p>`);
        }
        activated.removeItemBooleanFlag('shadow_weapon');
	}
    shared.chatAttacks[0].effectNotesHTML = msg;
    item.update({ ['system.flags.dictionary']: [] });  
	return true;
}

function onRender(_event, app){
	if (typeof item === 'undefined') return;
	const html = app.element;
	let rslt = false;
	
	//	FIRST WEAPON MULTI-SELECT
	const dropBuffOne = html.querySelector("multi-select[name=buffSelectOne]")
	dropBuffOne.addEventListener("change", () => {
		const values = dropBuffOne.value;
		const cost = values.reduce((acc,e)=> fBuff.find(i=> e.includes(i.id)).cost + acc, 0);
		newMaxOne = 0;
		if (actualNumOfWeaps === 1) {
			newMaxOne = maxbonusOneWeap - cost;
		} else if (actualNumOfWeaps === 2) {
//debugger
			newMaxOne = maxbonusTwoWeap - cost;	
			if ( (newMaxOne < 0 && values.length === 1) || (newMaxOne === 0 && values.length > 1) ) {
				//	Have to clear options due to overspending
				for (j = 0; j < values.length; j++) {
					const first = fBuff.find(f => f.id === values[j]);
					dropBuffOne._value.delete(first.id);
				}
				newMaxOne = maxbonusTwoWeap;
				ui.notifications.warn(`You have overspent selected options due to 2 weapons being selected. Removing options.`);
			}
		}
		rslt = rebuildBuffOneInner(fBuff, actualNumOfWeaps, enhbonusOneWeap, maxbonusOneWeap, enhbonusTwoWeap, maxbonusTwoWeap, newMaxOne, true);
		dropBuffOne.querySelector("select").innerHTML = rslt;
	});
	
	//	SECOND WEAPON MULTI-SELECT
	const dropBuffTwo = html.querySelector("multi-select[name=buffSelectTwo]")
	dropBuffTwo.addEventListener("change", () => {
		const values = dropBuffTwo.value;
		const cost = values.reduce((acc,e)=> fBuff.find(i=> e.includes(i.id)).cost + acc, 0);
		newMaxTwo = 0;
		if (actualNumOfWeaps === 1) {
			newMaxTwo = maxbonusOneWeap - cost;
		} else if (actualNumOfWeaps === 2) {
			newMaxTwo = maxbonusTwoWeap - cost;			
		}
		rslt = rebuildBuffTwoInner(fBuff, actualNumOfWeaps, enhbonusTwoWeap, maxbonusTwoWeap, newMaxTwo, true);
		dropBuffTwo.querySelector("select").innerHTML = rslt;
	});

	//  WEAPON MULTI-SELECT
	const dropWeap = html.querySelector("multi-select[name=weaponSelect]")
	dropWeap.addEventListener("change", () => {
		// now the sneaky bit.  change contents of multi-select from a change in the single-select.
		actualNumOfWeaps = checkCurrentWeaps(dropWeap, actualNumOfWeaps);
		//if (show) ui.notifications.info(`Number of Weapons Selected: ${actualNumOfWeaps}`);
		fBuff = checkForWeaponDeselect(dropWeap, wBuff, fWeap, actualNumOfWeaps)
		// rebuild the needed html for all three multi-selects
		
		//	WEAPONS
		rslt = rebuildWeapsInner(actualNumOfWeaps, allowedNumOfWeaps, fWeap);
		dropWeap.querySelector("select").innerHTML = rslt;

		//	FIRST SELECT
		rslt = rebuildBuffOneInner(fBuff, actualNumOfWeaps, enhbonusOneWeap, maxbonusOneWeap, enhbonusTwoWeap, maxbonusTwoWeap, newMaxOne, false);
		dropBuffOne.querySelector("select").innerHTML = rslt;
		
		//	SECOND SELECT
		rslt = rebuildBuffTwoInner(fBuff, actualNumOfWeaps, enhbonusTwoWeap, maxbonusTwoWeap, newMaxTwo, false);
		dropBuffTwo.querySelector("select").innerHTML = rslt;

	});
}

function hasArchetype(actor, c, a) {
	let rslt = -1;
	// check for gloomblade template/class
	const act = actor.toObject();
	const clss = act.items.filter(f => f.system.subType === "base").concat(act.items.filter(f => f.system.subType === ("template" || "misc") && f.system.associations.classes !== []));
	if (verbose) console.log('list of classes and templates:', clss);
	rslt = clss.findIndex(f => f.system.subType === "base" && f.name.toLowerCase().includes(c));
	const mCl = clss.at(rslt).system.level;
	rslt = clss.find( f => f.system.subType === ("template" || "misc") && f.name.toLowerCase().includes(a));
	if (typeof rslt === "undefined")
		return ui.notifications.warn(`Could not find a ${c.titleCase()} (${a.titleCase()}`);
	return mCl;	
}

function checkCurrentWeaps(w, n) {
	let rslt = 0;
	if (w._value.size === 0) {
		//  Data was cleared
		rslt = 0;
	} else if (w._value.size < n) {
		rslt = n - 1;
	} else if (w._value.size === n) {
		//  No need to increment
		rslt = n;
	} else {
		rslt = n + 1;
	}
	return rslt;
}

function checkForWeaponDeselect(c, ba, wa, v) {
	let out = "";
	if (c._value.size === 0) {
		//	removed only selection
		out = ba;
	} else {
		const sValue = c.value[v - 1];
		const sType = wa.find( o => o.id === sValue).type;	
		out = ba.filter(f => f.type.includes(sType));
	}
	return out;
}

function rebuildWeapsInner(a, b, wa) {
	const inner = wa.reduce((acc,e)=>{
		if (a < b) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
		return acc;
	},`<option value=""></option>`);
	return inner;
}

function rebuildBuffOneInner(ba, n, eO, mO, eT, mT, nO, state) {
	const inner = ba.reduce((acc,e)=>{
		if (show) debugger
		if (state) {
			if( (n <= 1 && e.cost === 0 && e.enh === eO) || (n <= 1 && e.cost > 0 && e.cost <= mO && e.cost <= nO) ) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
			if( (n === 2 && e.cost === 0 && e.enh === eT) || (n === 2 && e.cost > 0 && e.cost <= mT && e.cost <= nO) ) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
		} else {
			if( (n <= 1 && e.cost === 0 && e.enh === eO) || (n <= 1 && e.cost > 0 && e.cost <= mO) ) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
			if( (n === 2 && e.cost === 0 && e.enh === eT) || (n === 2 && e.cost > 0 && e.cost <= mT) ) return acc+=`<option value="${e.id}">${e.name}</option>\n`;	
		}
		return acc;
	},`<option value=""></option>`);
//	if (verbose) console.log("First Select change:", inner);
	return inner;
}

function rebuildBuffTwoInner(ba, n, eT, mT, nT, state) {
	const inner = ba.reduce((acc,e)=>{
		if (show) debugger
		if (state) {
			if( (n === 2 && e.cost === 0 && e.enh === eT) || (n === 2 && e.cost > 0 && e.cost <= mT && e.cost <= nT) ) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
		} else {
			if( (n === 2 && e.cost === 0 && e.enh === eT) || (n === 2 && e.cost > 0 && e.cost <= mT) ) return acc+=`<option value="${e.id}">${e.name}</option>\n`;			
		}
		return acc;
	},`<option value=""></option>`);
//	if (verbose) console.log("Second Select change:", inner);
	return inner;
}

function setFootnote(r, w, b) {
	let rslt = "";
	const w1 = (typeof r.weaponSelect[0] !== "undefined") ? w.find(f => f.id === r.weaponSelect[0]).name : "";
	const w1b1 = (typeof r.buffSelectOne[0] !== "undefined") ? b.find(f => f.id === r.buffSelectOne[0]).name : "";
	const w1b2 = (typeof r.buffSelectOne[1] !== "undefined") ? b.find(f => f.id === r.buffSelectOne[1]).name : "";
	const w1b3 = (typeof r.buffSelectOne[2] !== "undefined") ? b.find(f => f.id === r.buffSelectOne[2]).name : "";
	const w1b4 = (typeof r.buffSelectOne[3] !== "undefined") ? b.find(f => f.id === r.buffSelectOne[3]).name : "";
	const w2 = (typeof r.weaponSelect[1] !== "undefined") ? w.find(f => f.id === r.weaponSelect[1]).name : "";
	const w2b1 = (typeof r.buffSelectTwo[0] !== "undefined") ? b.find(f => f.id === r.buffSelectTwo[0]).name : "";
	const w2b2 = (typeof r.buffSelectTwo[1] !== "undefined") ? b.find(f => f.id === r.buffSelectTwo[1]).name : "";
	const w2b3 = (typeof r.buffSelectTwo[2] !== "undefined") ? b.find(f => f.id === r.buffSelectTwo[2]).name : "";
	const w2b4 = (typeof r.buffSelectTwo[3] !== "undefined") ? b.find(f => f.id === r.buffSelectTwo[3]).name : "";
	rslt = (`<p><span style="font-size: 1.1em"><strong>${w1}:</strong>`)
		.concat(` <em>${w1b1}</em>`)
		.concat((w1b2 === "") ? w1b2: (`, <em>${w1b2}</em>`))
		.concat((w1b3 === "") ? w1b3: (`, <em>${w1b3}</em>`))
		.concat((w1b4 === "") ? w1b4: (`, <em>${w1b4}</em>`))
		.concat((w2 === "") ? w2: (`<br><strong>${w2}:</strong>`))
		.concat((w2b1 === "") ? w2b1: (` <em>${w2b1}</em>`))
		.concat((w2b2 === "") ? w2b2: (`, <em>${w2b2}</em>`))
		.concat((w2b3 === "") ? w2b3: (`, <em>${w2b3}</em>`))
		.concat((w2b4 === "") ? w2b4: (`, <em>${w2b4}</em>`))
		.concat(`</span></p>`);
	return rslt
}
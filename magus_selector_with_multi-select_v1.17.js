/*  version: 1.17  */
if (action.tag === `mapstop`) {
	//	Turn off any active "arcanepool" buffs
	const actBuffs = await actor._itemTypes.buff.filter(b => b.system.tag.includes('arcanepool') && b.system.active);
	await actBuffs.forEach(a => {
		a.setFlag('ckl-roll-bonuses', 'target_weapon', []);
		//a.update({ ['flags[ckl-roll-bonuses].target_weapon']: ''});
		a.setActive(false);		// (!a.isActive);
		//a.update({ ['system.active']: false });
	})
	await clearDictionary();
	return;
} else if (action.tag === `mapchange`) {
	await clearDictionary();
}
/*  
    these two declarations are for testing purposes outside of the 
    host feature's "on use" macro trigger. 
    START  */
//	const actor = game.actors.get('tPis1bRmFuPFq4Gw');	// Fade
//	const item = actor.items.get('mWMizo2jlZDyKzzh');	// arcanepool
/*  END    */

//	CLASS DATA
let maxcost = 0, level = 0;
const mCl = actor.classes;
//	only Magus ?? can use
/*
At 1st level, the magus gains a reservoir of mystical arcane energy that he can draw upon to fuel his powers and enhance his weapon. This arcane pool has a number of points equal to 1/2 his magus level (minimum 1) + his Intelligence modifier. The pool refreshes once per day when the magus prepares his spells.

At 1st level, a magus can expend 1 point from his arcane pool as a swift action to grant any weapon he is holding a +1 enhancement bonus for 1 minute. For every four levels beyond 1st, the weapon gains another +1 enhancement bonus, to a maximum of +5 at 17th level. These bonuses can be added to the weapon, stacking with existing weapon enhancement to a maximum of +5. Multiple uses of this ability do not stack with themselves.

At 5th level, these bonuses can be used to add any of the following weapon properties: dancing, flaming, flaming burst, frost, icy burst, keen, shock, shocking burst, speed, or vorpal. Adding these properties consumes an amount of bonus equal to the property's base price modifier (see the Magic Weapon Special Ability Descriptions). These properties are added to any the weapon already has, but duplicates do not stack. If the weapon is not magical, at least a +1 enhancement bonus must be added before any other properties can be added. These bonuses and properties are decided when the arcane pool point is spent and cannot be changed until the next time the magus uses this ability. These bonuses do not function if the weapon is wielded by anyone other than the magus.

A magus can only enhance one weapon in this way at one time. If he uses this ability again, the first use immediately ends.
*/
if (typeof mCl.magus !== "undefined") {
	level = mCl.magus.level;
	maxcost = 1 + Math.floor((level - 1) / 4);
} else if (typeof mCl.gestalt !== "undefined") {
	if (mCl.gestalt.name.toLowerCase().includes('magus')) {
		level = mCl.gestalt.level
		maxcost = 1 + Math.floor((mCl.gestalt.level - 1) / 4);
	}
} else {
	return;
}
item.update({ ['system.level']: maxcost });

//	WEAPON DATA
const weapTypes = "rwak, mwak, twak";
let skip = false;
const lastweap = item.getItemDictionaryFlag('weapon');
let weaps = actor._itemTypes.weapon;
const weap = {
	id: "",
	name: "",
	type: ""
};
let fWeap = []
weaps.forEach(w => {
	//debugger;
	let o = weap.constructor();
	if (w.actions.size !== 0) {
		o.id = w._id;
		o.name = w.name;
		o.type = w.actions.contents[0].actionType;
		if (weapTypes.includes(o.type)) {
			skip = false;
		} else {
			skip = true;
		}
	} else {
		//  no attack actions present, skip this one
		skip = true;
	}
	if (!skip) {
		fWeap.push(o);
    }
});

//	BUFF DATA
const buffs = actor._itemTypes.buff.filter(b => b.system.tag.includes('arcanepool') && b.system.level <= maxcost);
const buff = {
	id: "",
	name: "",
	feature: "",
	cost: 0,
	type: ""
};
let fBuff = [], wBuff = [];
buffs.forEach(b => {
	let o = buff.constructor();
	//  debugger;
	o.id = b._id;
	o.name = b.name.replace('ArcanePool: ', '');
	o.name = o.name.substring(0, o.name.length);
	o.feature = b.system.tags[0];
	o.cost = b.system.level;
	o.type = b.system.tags.toString().replace('arcanepool,', '');
	fBuff.push(o);
});
wBuff = fBuff;

//	HTML BUILDING
let dHtml = "";
/*
 	<dTop> should be a numeric display only, not an input field
*/
const dTop = `
	<div class="form-group">
		<label for="exampleInput">Max Cost</label>
		<div class="form-fields" inert>
			<div name="maxcost">${maxcost}</div>
		</div>
	</div>`;
/*	
	A selection of <wGrp> should refine the list in <bGrp> to only 
	include options that share the same attack ".type" { mwak, rwak, 
	twak }
*/
let wGrp = `
	<div class="form-group">
		<label for="weapon">Weapon Select</label>
		<div class="form-fields">
			<select name="weaponSelect">
				${fWeap.reduce((acc,e)=>{
					return acc+=`<option value="${e.id}">${e.name}</option>\n`;
				},``)}
            </select>
		</div>
	</div>`;
/*	
	Possible multiple selections could exist for <bGrp> as the total
	cost of the options must be no more than the limit displayed in
	<dTop> and set by "maxcost".
*/
let bGrp = `
	<div class="form-group">
		<label for="buff">Options Select</label>
		<div class="form-fields">
			<multi-select name="buffSelect">
				${fBuff.reduce((acc,e)=>{
					if(e.cost <= maxcost) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
					return acc;
				},``)}
            </multi-select>
		</div>
	</div>`;
dHtml = dTop + wGrp + bGrp;
// debugger

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
	id: "arcanepool-application-dialog", // name as you want just make it unique and no spaces! needed for CSS selecting if you add a <style> </style> to the content.
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
//debugger
//console.log(response);
if (response === 'cancel') {
	shared.chatMessage = false;
	return;
} 
//debugger
let weaponSelect = [];
await weaponSelect.push(response.weaponSelect);
const buffSelect = response.buffSelect;
const numBuffs = buffSelect.length;
await item.setItemDictionaryFlag('weapon', response.weaponSelect);
for (let i = 0; i < numBuffs; i++) {
	await item.setItemDictionaryFlag(`buff${i+1}`, buffSelect[i]);
	activated = actor.items.get(buffSelect[i]);
	//	have to bind the correct weapon now
	await activated.setFlag('ckl-roll-bonuses', 'target_weapon', weaponSelect);
	//await activated.update({ ['flags[ckl-roll-bonuses].target_weapon']: weaponSelect});
	await activated.setActive(true);
	//await activated.update({ ['system.active']: true });
}

function clearDictionary() {
//debugger
	item.setItemDictionaryFlag(`weapon`, '');
	for (let i = 0; i < 4; i++) {
		let buffN = `system.flags.dictionary.buff${i+1}`;  // `buff${i+1}`;
		//item.setItemDictionaryFlag(buffN, '');
		item.update({ [buffN]: ''});
	}
	shared.chatMessage = false;
	return
}

function onRender(_event, app){
	debugger
	if (typeof item === 'undefined') return;
	const html = app.element;
	const multi = html.querySelector("multi-select[name=buffSelect]")
	multi.addEventListener("change", () => {
//debugger
		const values = multi.value;
		const cost = values.reduce((acc,e)=> fBuff.find(i=> e.includes(i.id)).cost + acc, 0);
		const newMax = maxcost - cost;
		const inner = fBuff.reduce((acc,e)=>{
			if(e.cost <= newMax) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
			return acc;
		},`<option value=""></option>`);
		multi.querySelector("select").innerHTML = inner;
	});
	const single = html.querySelector("select[name=weaponSelect]")
	single.addEventListener("change", () => {
//debugger
		// now the sneaky bit.  change contents of multi-select from a change in the single-select.
		const sValue = single.value;
		const sType = fWeap.find(i=> i.id === sValue).type;	
		// filter full list of buffs based on weapon select
		fBuff = wBuff.filter(f => f.type.includes(sType));
		// rebuild the needed html
 		const inner = fBuff.reduce((acc,e)=>{
			if(e.type.includes(sType)) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
			return acc;
		},`<option value=""></option>`);
		// set the multi-select to the filtered buffs
		multi.querySelector("select").innerHTML = inner;
	});
}

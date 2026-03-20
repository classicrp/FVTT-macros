const version = '1.2.7';
const show = false;
const verbose = false;
if (verbose) console.log(version);

if (action.tag === `btstop`) {
	//	Turn off any active "BladeThirst" buffs
	const actBuffs = await actor._itemTypes.buff.filter(b => (b.system.tags.includes('bladethirst') && b.system.active));
	for (const a of actBuffs) {
		await a.setFlag('ckl-roll-bonuses', 'target_weapon', []);
		await a.setActive(false);		// (!a.isActive);
	}
	await clearDictionary();
	return;
} else if (action.tag === `btchange`) {
	await clearDictionary();
}

//	CLASS DATA
let maxcost = 0;
const level = await hasArchetype(actor, "bard", "arcane duelist");
if (level) {
	maxcost = 1 + Math.floor((level - 6) / 3);
} else {
	return;
}
if (verbose) console.log("maxcost:", maxcost);

//	WEAPON DATA
const weapTypes = "rwak, mwak, twak, save";
let skip = true;
const lastweap = await item.getItemDictionaryFlag('weapon');
let weaps = await deepClone(actor._itemTypes.weapon.filter(f => f.system.actions.length !== 0));
if (verbose) console.log('weaps:', weaps);
const weap = {
	id: "",
	name: "",
	type: ""
};
// if (show) debugger;
let fWeap = [];
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
					};
				};
				skip = skip && false;
			} else {
				skip = skip && true;
			};
		};
	} else {
		//  no attack actions present, skip this one
		skip = true;
	}
	if (!skip) {
		fWeap.push(o);
    }
//	if (verbose) console.log("Weapon Select Array:", fWeap);
}

//	BUFF DATA
const buffs = deepClone(actor._itemTypes.buff.filter(b => (b.system.tags.includes('bladethirst') && b.system.level <= maxcost)));
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
	//  debugger;
	o.id = b._id;
	o.name = b.name.replace(' (bladethirst)', '');
	o.feature = b.system.tags[0];
	o.cost = b.system.level;
	o.type = b.system.tags.filter(t => t.toLowerCase() !== 'bladethirst' && t.toString().length !== 1).toString();
	fBuff.push(o);
};
wBuff = await deepClone(fBuff);

//	HTML BUILDING
let dHtml = "";
/*
 	<dTop> should be a numeric display only, not an input field
*/
const dTop = `
	<div class="form-group">
		<label for="dialog-inert-label">Max Cost</label>
		<div class="form-fields" inert>
			<div name="maxcost" rootId="dialog-inert-label">${maxcost}</div>
		</div>
	</div>`;
/*	
	A selection of <wGrp> should refine the list in <bGrp> to only 
	include options that share the same attack ".type" { mwak, rwak, 
	twak }
*/
let wGrp = `
	<div class="form-group">
		<label for="dialog-select-weapon">Weapon Select</label>
		<div class="form-fields">
			<select name="weaponSelect" rootId="dialog-select-weapon">
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
		<label for="dialog-multi-buff">Options Select</label>
		<div class="form-fields">
			<multi-select name="buffSelect" rootId="dialog-multi-buff">
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
	window: {title: `${actor.name}'s Bladethirst Selector`},
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
	id: "bladethirst-application-dialog", // name as you want just make it unique and no spaces! needed for CSS selecting if you add a <style> </style> to the content.
	classes: [], // as with id.
	position: {
		width: "500", // default "auto" and cant go narrower than 200 or wider than the screen width
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
let weapon = [];
let msg = "";
shared.chatAttacks[0].effectNotesHTML = await msg;
if (typeof shared.__nasPendingAttackFootnotes !== 'undefined') {
	const pauseTime = 750;
	await new Promise(r => setTimeout(r, pauseTime));
}
if (show) debugger

await weapon.push(response.weaponSelect);
await item.setItemDictionaryFlag('weapon', response.weaponSelect);

const buffSelect = response.buffSelect;
const numBuffs = buffSelect.length;
for (let i = 0; i < numBuffs; i++) {
	await item.setItemDictionaryFlag(`buff${i+1}`, buffSelect[i]);
	activated = await actor.items.get(buffSelect[i]);
	//	have to bind the correct weapon now
	await activated.setFlag('ckl-roll-bonuses', 'target_weapon', weapon);
	//await activated.update({ ['flags[ckl-roll-bonuses].target_weapon']: weaponSelect});
	await activated.setActive(true);
	//await activated.update({ ['system.active']: true });
}

return

function clearDictionary() {
//debugger
	if (show) debugger
    item.update({ ['system.flags.dictionary']: [] });  
	shared.chatMessage = false;
	return
}

function onRender(_event, app){
//	debugger
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
	return
}

function hasArchetype(actor, c, a) {
//debugger
	let rslt = -1;
	const clss = deepClone(actor.items.filter(f => f.system.subType === "base").concat(actor.items.filter(f => f.system.subType === ("template" || "misc") && f.system.associations.classes !== [])));
	if (verbose) console.log('list of classes and templates:', clss);
	rslt = clss.findIndex(f => f.system.subType === "base" && f.name.toLowerCase().includes(c));
	const mCl = clss.at(rslt).system.level;
	rslt = clss.find( f => f.system.subType === ("template" || "misc") && f.name.toLowerCase().includes(a));
	if (typeof rslt === "undefined")
		return ui.notifications.warn(`Could not find a ${c.titleCase()} (${a.titleCase()}`);
	return mCl;	
}
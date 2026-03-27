// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime
const version = '0.6.3';
const show = false;
const twoweaponUse = 'Compendium.crp-contents.crp-macros.Macro.gOFO6ByH6vrt6g6e';
const useAction = 'Compendium.crp-content.crp-macros.Macro.VgwfQ1Hk2rC4NOXB';
let rslt = "";

// see if we have the buff, if not then go get it from Compendium
let buff = await actor._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0);
if (typeof buff === 'undefined') {
	// get get the buff in the world compendium  // Compendium.crp-pf1.crp-items.Item.jilPijFHUct7wB31
	const pack = 'crp-content.crp-items';
	const name = 'Two Weapon Use';
	const uuid = await game.packs.get(pack).index.getName(name).uuid;
	const item = await fromUuid(uuid);
	const itemData = game.items.fromCompendium(item);
	await Item.create(itemData, {parent: actor});
	//	now get that buff ready to use
	buff = await actor._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0);
	
}

if (action.tag === 'start') {
//	game.actors.get('tPis1bRmFuPFq4Gw')._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0)
	// Set your two weapons, must be 1h
	let weapon = [];
	const fWeap = await getOneHandedWeapons(actor);  
		// 	returns zero or array of two weapons
	for (const w of fWeap) {
		let srcs = actor.items.contents.find(f => f._id === w.id);	// find returns object, filter returns array
		const local  = await setWeaponToHaveUTWMacro(actor, srcs);
			//	returns updated copy of "local"
//		if (show) debugger
		if (local.length !== 0) {
			//	changes need to be made
//			await srcs.update({ ['system.scriptCalls']: []});
//			const pauseTime = 150;
//				//  add a slight delay to allow the system to "catch-up"
//			await new Promise(r => setTimeout(r, pauseTime));
			rslt = await srcs.update({ ['system.scriptCalls']: local});
		}
	}
		// 	make sure each weapon has the "useTwoWeapon" macro 1st, 
		//	"useAction" macro second.
	
	const maxcost = 2;
	let dHtml = await buildHTML(maxcost, fWeap);
	//	LAUNCH DIALOG
	const response = await foundry.applications.api.Dialog.input({
		window: {title: `${actor.name}'s Two Weapon Selector`},
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
		id: "two_weapon-application-dialog", // name as you want just make it unique and no spaces! needed for CSS selecting if you add a <style> </style> to the content.
		classes: [], // as with id.
		position: {
			width: "500", // default "auto" and cant go narrower than 200 or wider than the screen width
			height: "auto" // default "auto", cant go narrower than the header height or longer than the screen height - hotbar height.
			// top: 100, // location on screen where the top of the dialog sits, default is in the center of the screen
			// left: 100 // location on screen where the left of the dialog sits, default is in the center of the screen
		}
	});

	//	RESPONSE TO INPUTS
	if (response === 'cancel') {
		shared.chatMessage = false;
		return;
	}
	let msg = "";
	for (const w of response.weaponSelect) {
		//  need to set boolean flag on each Weapon
		let weap = actor.items.contents.find(f => f._id === w);
		rslt = await weap.addItemBooleanFlag('two_weapon');
		let name = weap.name;
		if (msg === "") {
			msg = `<p><span style="font-size: 1.1em"><strong>Weapons Selected:</strong> <em>${name}</em>, `;
		} else {
			msg += `<em>${name}</em>.</span></p>`;
		}
	}
	shared.chatAttacks[0].effectNotesHTML = await msg;
//	if (typeof shared.__nasPendingAttackFootnotes !== 'undefined') {
//		const pauseTime = 200;
//		await new Promise(r => setTimeout(r, pauseTime));
//	}
	//	update the buff to "target" the selected weapons
	rslt = await buff.setFlag('ckl-roll-bonuses','target_weapon', response.weaponSelect);
	rslt = await buff.setActive(true);
	if (show) debugger
	
} else if (action.tag === 'stop') {
	//	turn off the buff
	const targets = await buff.getFlag('ckl-roll-bonuses','target_weapon');
	for (const w of targets) {
		//  need to remove the boolean flag on each Weapon
		let weap = actor.items.contents.find(f => f._id === w);
		rslt = await weap.removeItemBooleanFlag('two_weapon');
	}
	rslt = await buff.unsetFlag('ckl-roll-bonuses','target_weapon');
	rslt = await buff.setItemDictionaryFlag('used', 0);
	rslt = await buff.update({ ['system.active']: false });
//	rslt = await buff.setActive(false); // this does not work
}
return;	// only small bits at a time

function getOneHandedWeapons(_a) {
	const weapTypes = "rwak, mwak, twak, save";
	let skip = true;
	let fWeap = [];
	let weaps = deepClone(_a._itemTypes.weapon.filter(f => (f.system.actions.length !== 0 && f.system.hands === 1)).concat(_a._itemTypes.attack.filter(f => (f.system.actions.length !== 0 ))));
	const weap = {
		id: "",
		name: "",
		type: ""
	};
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
	}
	return  fWeap;
}

function setWeaponToHaveUTWMacro(_a, s) {
	let skip = true;
	let local = deepClone(s.system.scriptCalls);
/*	Three options here. 
	[1] local.length === 0, no macros present -> this should be the else condition
	[2]	local.length < 2, one macro missing -> update the macros
	[3]	local.length === 2, verify the macros normally
*/
debugger
	let skipone = false, skiptwo = false;
	if (local.length === 0) {
		skip = false;
	} else  {
		//	see if it has the correct macros
		for (const l of local) {
			if (l.category === "use" && l.value === useTwoWeapons) {
				skipone = true;
			} else if (l.category === "use" && l.value === useAction) {
				skiptwo = true;
			} else {
				skip = false;					
			}
		}
		skip = skip && skipone && skiptwo;
	}
	if (!skipone) {
        //	get and add in to copy the "twoweaponUse" macro
        let uTW = buildUseTwoWeapons(twoweaponUse)
   		local.push(uTW);
    }
    if (!skiptwo) {
        //	get and add in to copy the "useAction" macro
  		let uA = buildUseAction(useAction);
   		local.push(uA);
    }
	if (skipone && skiptwo) {
		local = [];
	}
	if (show) debugger
	return local;
}

function buildHTML(m, w) {
	//	HTML BUILDING
	/*
		<dTop> should be a numeric display only, not an input field
	*/
	const dTop = `
		<div class="form-group">
			<label for="dialog-inert-label">Two Weapons</label>
			<div class="form-fields" inert>
				<div name="m" rootId="dialog-inert-label">${m}</div>
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
				<multi-select name="weaponSelect" rootId="dialog-select-weapon">
					${w.reduce((acc,e)=>{
						return acc+=`<option value="${e.id}">${e.name}</option>\n`;
					},``)}
				</multi-select>
			</div>
		</div>`;
	
	return dTop + wGrp;
}

function onRender(_event, app){
	if (typeof item === 'undefined') return;
	if (_event.eventPhase === 0) return;
	const html = app.element;
	const multi = html.querySelector("select[name=weaponSelect]")
	multi.addEventListener("change", () => {
//debugger
		// now the sneaky bit.  change contents of multi-select from a change in the single-select.
		const sValue = multi.value;
		const sType = fWeap.find(i=> i.id === sValue).type;	
		// rebuild the needed html
 		const inner = fWeap.reduce((acc,e)=>{
			if(e) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
			return acc;
		},`<option value=""></option>`);
		// set the multi-select to the filtered buffs
		multi.querySelector("select").innerHTML = inner;
	});
	return
}

function buildUseAction(m) {
/* ---- object definition for 'useAction' macro ---------------------------------------	*/
	const id = randomID(8);
	let o = {
		category: "use",
		hidden: false,
		img: "modules/game-icons-net/whitebackground/movement-sensor.svg",
		name: "useAction",
		type: "macro",
		value: m,
		_id: id
	}
	return o;
}
	
function buildUseTwoWeapons(m) {
/* ----	object definition for 'useTwoWeapons' macro ----------------------------------	*/
	const id = randomID(8);
	let o = { 
		category: "use",
		hidden: false, 
		img: "resource/35E/icons/feats/two-weapon-fighting.png", 
		name: "useTwoWeapons", 
		type: "macro", 
		value: m, 
		_id: id
	}
	return o;
}
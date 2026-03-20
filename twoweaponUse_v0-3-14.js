// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime
const version = '0.3.13';

//	game.actors.get('tPis1bRmFuPFq4Gw')._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0)
	let buff = actor._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0);
	if (typeof buff === 'undefined') {
		// get get the buff in the world compendium
		const pack = 'world.buffs';
		const name = 'Two Weapon Use';
		const uuid = game.packs.get(pack).index.getName(name).uuid;
		const item = await fromUuid(uuid);
		const itemData = game.items.fromCompendium(item);
		await Item.create(itemData, {parent: actor});
		//	now get that buff ready to use
		buff = actor._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0);
  	}
	// Set your two weapons, must be 1h
	let weapon = [];
	const fWeap = await getOneHandedWeapons(actor);  // returns zero or array of two weapons
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
debugger
		let name = fWeap.find(f => f.id === w).name;
		if (msg === "") {
			msg = `<p><span style="font-size: 1.1em">Weapons Selected: ${name}, `;
		} else {
			msg += `${name}.</span></p>`;
		}
	}
	shared.chatAttacks[0].effectNotesHTML = await msg;
	if (typeof shared.__nasPendingAttackFootnotes !== 'undefined') {
		const pauseTime = 200;
		await new Promise(r => setTimeout(r, pauseTime));
	}

debugger

	//	set the target weapons on the buff
	let rslt = await buff.setFlag('ckl-roll-bonuses','target_weapon', response.weaponSelect);	
	await item.setItemDictionaryFlag('weapon', response.weaponSelect);
	
//	if (!buff.isActive) return false;
	let used = Number(buff.getItemDictionaryFlag('used'));
	used++;
	if (used < 2) {
		let weapons = buff.getFlag('ckl-roll-bonuses','target_weapon');
		firstW = weapons[0];
		secondW = weapons[1];
		weapon = (item.id === firstW) ? actor.items.contents.filter(a => a.id === secondW).at(0).name : actor.items.contents.filter(a => a.id === firstW).at(0).name;
		await useAction(weapon);
		await buff.setItemDictionaryFlag('used', used);
		return true;
	} else {
	//	second weapon attack, rest count to zero	
		await buff.setItemDictionaryFlag('used', 0);	
		return false;
	}

return;	// only small bits at a time

function useAction(weapon) {
    /*-			CONFIGURATION			*/
    const targetMacro = "useAction";
    const commandOverride = `My: ${weapon}`;
    
    //			COMMAND					
    if (typeof shared !== "undefined")
    	event.args = arguments;
    window.macroChain = [commandOverride || this.name].concat(window.macroChain ?? []);
    game.macros.getName(targetMacro)?.execute();
  /*{
    	actor,
    	token
    });*/
	return
}

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

function buildHTML(maxcost, fWeap) {
	//	HTML BUILDING
	/*
		<dTop> should be a numeric display only, not an input field
	*/
	const dTop = `
		<div class="form-group">
			<label for="dialog-inert-label">Two Weapons</label>
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
				<multi-select name="weaponSelect" rootId="dialog-select-weapon">
					${fWeap.reduce((acc,e)=>{
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
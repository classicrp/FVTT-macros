const version = "1.3.8"
const show = false;
const verbose = false;

if (verbose) console.log(version);
//if (show) debugger
if (action.tag === `premoved`) {
	//	Turn off any active "Poison" buffs
	const actBuffs = await actor._itemTypes.buff.filter(b => b.system.tag.includes('poison') && b.system.active);
	await actBuffs.forEach(a => {
		//a.update({ ['flags[ckl-roll-bonuses].target_weapon']: ''});
		a.setActive(false);		// (!a.isActive);
		//a.update({ ['system.active']: false });
	})
	return;
	await item.setItemDictionaryFlag('poison', "");
}

shared.rejected = true;  // don't show the selector's card

//	POISON DATA
let skip = false;
let poisons = deepClone(actor._itemTypes.consumable.filter(p => p.system.subType === "poison"));
let maxSelected = 1;
// if (show) debugger
//if (show) return
let fPois = [];
poisons.forEach(p => {
	//debugger;
	fPois.push(new Poison(p._id, p.name, p.fullDescription));
});
if (verbose) console.log("Poison Data:", fPois)

//	HTML BUILDING
let dHtml = "";
/*	
	A selection of <pGrp> should refine the list in <bGrp> to only 
	include options that share the same attack ".type" { mwak, rwak, 
	twak }
*/
let tGrp = `
	<div class="form-group">
		<label for="dialog-output-effects">Effects</label>
		<div class="form-fields" inert>
			<textarea name="description" id="dialog-output-effects" style="width:450px; height:180px;"></textarea>
		</div>
	</div>`;

//			<div name="description"></div>

let pGrp = `
	<div class="form-group">
		<label for="dialog-input-poison">Poison Select</label>
		<div class="form-fields">
			<multi-select name="poisonSelect" id="dialog-input-poison">
				${fPois.reduce((acc,e)=>{
					if (true) return acc+=`<option value="${e.id}" title="${e.desc}">${e.name}</option>\n`;
					return acc;
				},``)}
            </multi-select>
		</div>
	</div>`;


let nGrp = tGrp;
if (verbose) console.log(pGrp, tGrp);

//	LAUNCH DIALOG
const response = await foundry.applications.api.Dialog.input({
	window: {title: `${actor.name}'s Poison Selector`},
	content: pGrp + nGrp,
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
	id: "poison-application-dialog", // name as you want just make it unique and no spaces! needed for CSS selecting if you add a <style> </style> to the content.
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
	shared.chatMessage = false;
	shared.reject = true;
	return;
}

//if (show) debugger
await item.setItemDictionaryFlag('poison', response.poisonSelect);

for (let i = 0; i < response.poisonSelect.length; i++) {
	//	Trigger the selected poison
	const poisBuff = poisons.find( f => f.id === response.poisonSelect[i] );
debugger
	const rslt = await poisBuff.use();
	const hText = await getHTMLpart( rslt.shared.chatData.content, '<h3 class="item-name">', '</h3>' );
	await poisBuff.setItemDictionaryFlag('messageId', hText );

// debugger

//  GET THE COMPENDIUM BUFF FOR POISON AND APPLY TO TARGET
/*
	const name = await fPois.find( f => f.id === response.poisonSelect[i]).name;
	const pack = "world.buffs";
	const uuid = await game.packs.get(pack).index.getName(`Poison (${name.toLowerCase()})`).uuid;  // this is to apply the buff to the target
	const sToken = await canvas.tokens.controlled[0];
	const sTarget = await Array.from(game.user.targets)[0];
	if ( !sToken ) return ui.notifications.warn("Select token first !");
	if ( !sTarget ) return ui.notifications.warn("Target token first !");
	//	Add it to the actor
	const sActor = await game.actors.get(sTarget.document.actorId);
	const itemData = await game.items.fromCompendium(poisBuff);
	await Item.create(itemData, {parent: sActor});
*/

}
return

function onRender(_event, app){
//	if (_event.eventPhase === 0) return;
	if (typeof item === 'undefined') return;
	const html = app.element;

	//  TEXTAREA
	const box = html.querySelector("textarea[name=description]")
	box.addEventListener("change", () => {
	});

	//	SELECT
	const single = html.querySelector("multi-select[name=poisonSelect]")
	single.addEventListener("change", () => {
//		if (show) debugger
		let sValue = "", found = "", sDeas = "", sName = "", inner = "";
		// now the sneaky bit.  change contents of multi-select from a change in the single-select.
		if (single.value.length === 0) {
			maxSelected = 1;
			box.innerHTML = "";
			skip = true;
		} else {
			maxSelected -= 1;
			skip = false;
		}
		if (!skip) {
			sValue = single.value.toString();
			found = fPois.find(f => f.id === sValue);
			sDesc = found.desc;
			sName = found.name;
			inner = removeHTML(sDesc);
			box.innerHTML = inner;
			if (verbose) console.log ("Name:", sName, "Value:", sValue, "Desc:", sDesc)
		}
		inner = fPois.reduce((acc,e)=>{
			if (maxSelected >= 0) return acc+=`<option value="${e.id}">${e.name}</option>\n`;
			return acc;
		},`<option value=""></option>`);
		if (verbose) console.log("Poison Select change:", inner);
		single.querySelector("select").innerHTML = inner;
		// rebuild the needed html
	});
	return
}

function removeHTML(htm) {
//	if (show) debugger
	let rslt = "", srcs = "";
	srcs = foundry.utils.parseHTML(htm);
	if (verbose) console.log("HTML source:", srcs);
	for (let i = 0; i < srcs.length; i++) {
		//	picked apart based on <p>
		let raw = srcs[i].innerHTML;
		const coded = foundry.utils.parseHTML(raw);
		if (verbose) console.log("HTML sub-source:", coded);
		if (typeof coded !== "undefined") { 
			if (typeof coded.length === "undefined") {
				//  only one instance present
				raw = raw.replaceAll( coded.outerHTML, `[${coded.outerText.toUpperCase()}]` );
			} else {
				for (let j =0; j < coded.length; j++) {
				//	picked apart based on <strong>... or other codes?
					raw = raw.replaceAll( coded[j].outerHTML, `[${coded[j].outerText.toUpperCase()}]` );
				}
			}
		}
		const crlf = String.fromCharCode(13).concat(String.fromCharCode(10));
		rslt += raw.concat(crlf);
	}
	if (verbose) console.log("Text:", rslt);
	return rslt;
}

function Poison(id, name, desc) {
	this.id = id;
	this.name = name;
	this.desc = desc;
}

function getHTMLpart(html, begin, end) {
	const hStart = html.indexOf(begin);
	const hEnd = html.indexOf(end, hStart);
	return html.substring(hStart + begin.length, end);
}
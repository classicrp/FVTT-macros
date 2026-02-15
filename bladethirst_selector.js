debugger; 

/*  
    these two declarations are for testing purposes outside of the 
    host feature's "on use" macro trigger. 
    START  */
	const actor = game.actors.get('tPis1bRmFuPFq4Gw');	// Fade
	const item = actor.items.get('mWMizo2jlZDyKzzh');	// Bladethirst
/*  END    */

const mCl = actor.classes;
let cl = 0;
for (const c in mCl) {
	console.log(`${c}: ${mCl[c].level}`);
	cl += Number(`${mCl[c].level}`);  
};
const maxcost = item.system.flags.dictionary.maxcost.replace('floor', 'Math.floor').replace('@cl', `${cl}`);
const lastweap = item.system.flags.dictionary.weapon;

let numcost = eval(maxcost);

const weaps = actor._itemTypes.weapon;
const weap = {
	id: "",
	name: "",
	type: ""
};
let fWeap = [];
const weapTypes = "rwak,mwak,twak";
let skip = false;
let dWeap = "", dBuff = "";
const br = "&nbsp;";
const tab = "\t";

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
		console.log(w);
        dWeap += tab.repeat(5) + `<option value="${o.id}; ${o.type}; ${o.name}">${o.name}</option>\n`;
    }
});
/*	Sample data
	WEAPONS: <fWeap>
	{id: 'dulDdGPDQ3R0qdPC', name: 'Sap', type: 'mwak'}
	{id: '8mG8Lubc6LDS3MXD', name: 'Nagant M1895 Revolver', type: 'rwak'}
	{id: 'UnZ55krCR2fjjqbD', name: 'Havok', type: 'mwak'}
	{id: 'iBKD1rIWVcgsOZUa', name: 'Mosin-Nagant M1891 Rifle', type: 'rwak'}
	{id: '8OZPgxD0UH77DQBN', name: 'Edge', type: 'mwak'}
	{id: 'MQ1C3Kh7pkzsCA7i', name: 'Blade Boot', type: 'mwak'}
	{id: 'cu7AHzgO5vppOg7c', name: 'Throwing Axe', type: 'twak'}
*/

const buffs = actor._itemTypes.buff;
let fBuff = [];
const buff = {
	id: "",
	name: "",
	feature: "",
	cost: 0,
	type: ""
};

buffs.forEach(b => {
	let o = buff.constructor();
	if (b.system.tag.includes('bladethirst')) {
		//  debugger;
		o.id = b._id;
		o.name = b.name.replace('Bladethirst: ', '');
		o.name = o.name.substring(0, o.name.length - 4);
		o.feature = b.system.tags[0];
		o.cost = b.system.level;
		o.type = b.system.tags.toString().replace('bladethirst,', '');
		fBuff.push(o);
		console.log(o);
        dBuff += tab.repeat(5) + `<option value="${o.id}; ${o.cost}; ${o.type}; ${o.name}">[${o.cost}] ${o.name}</option>\n`;
	}
});
/*	Sample data
	BLADTHIRST BUFFS: <fBuff>
	{id: 'WfazdZHuO1kBrDgH', name: '+1 Enhancement', feature: 'bladethirst', cost: 1, type: 'mwak,rwak,twak'}
	{id: 'D3W5vRe3qk9jFWnQ', name: '+2 Enhancement', feature: 'bladethirst', cost: 2, type: 'mwak,rwak,twak'}
	{id: 'yWxeyssh5gn2eiEQ', name: 'Defending', feature: 'bladethirst', cost: 1, type: 'mwak'}
	{id: 'QbcKGor45N6C3bTk', name: 'Distance', feature: 'bladethirst', cost: 1, type: 'rwak,twak'}
	{id: 'lcIFBPtBzsuKPIwb', name: 'Ghost Touch', feature: 'bladethirst', cost: 1, type: 'mwak,rwak,twak'}
	{id: 'LMJvQrNHXvcR63d9', name: 'Keen', feature: 'bladethirst', cost: 1, type: 'mwak,twak'}
	{id: 'p6B90547zcsspB4v', name: 'Mighty Cleaving', feature: 'bladethirst', cost: 1, type: 'mwak'}
	{id: 'kl1TRMWwJ72zHCq4', name: 'Returning', feature: 'bladethirst', cost: 1, type: 'twak'}
	{id: 'EfBl4qWhhX0biUmf', name: 'Shock', feature: 'bladethirst', cost: 1, type: 'mwak,rwak,twak'}
	{id: 'HS2MeKbG0SWgSCfJ', name: 'Shocking Burst', feature: 'bladethirst', cost: 2, type: 'mwak,rwak,twak'}
	{id: 'qnwGIdX5DFtTwYLb', name: 'Seeking', feature: 'bladethirst', cost: 1, type: 'rwak,twak'}
	{id: 'gcQa23gUupQbZZS9', name: 'Speed', feature: 'bladethirst', cost: 3, type: 'mwak,rwak'}
	{id: 'ybKuhJGDathkdXmt', name: 'Wounding', feature: 'bladethirst', cost: 2, type: 'mwak'}
*/

let dHtml = "";
const { Dialog } = foundry.applications.api;
/*
 	<dTop> should be a numeric display only, not an input field
*/
const dTop = `
	<div class="form-group">
		<label for="exampleInput">Max Cost</label>
		<div class="form-fields" inert>
			<input type="number" name="maxcost" placeholder=${numcost}>
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
			<select name="weaponSelect">\n
                ${dWeap}
            </select>
		</div>
	</div>`;
console.log(dWeap);
/*	
	Possible multiple selections could exist for <bGrp> as the total
	cost of the options must be no more than the limit displayed in
	<dTop> and set by "numcost".
*/
let bGrp = `
	<div class="form-group">
		<label for="buff">Options Select\n(cost, name)</label>
		<div class="form-fields">
			<select name="buffSelect">\n
                ${dBuff}
            </select>
		</div>
	</div>`;
console.log(dBuff);
/*
	<dBot> should display the names of the selected weapon from
	<wGrp> and the selected options from <bGrp> that total no 
	more than allocated in <dTop>
*/
let dBot = `
    <div class="form-group">
		<textarea name="selectedText" placeholder="Enter Text"></textarea>
	</div>`;
dHtml = dTop + wGrp + bGrp + dBot;
console.log(dHtml);

const data = await Dialog.wait({
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
	default: 'yes',
  	render: (event, dialog) => {
	/*	
		I thought this was where the work would occur for the selections 
		but it runs prior to any selection when <data> doesn't even exist
		yet.
	*/
		console.log("Register interactivity in the rendered dialog, passes the click event + the dialog instance, use dialog.element to get the html of the dialog.");
    },
	close: (...args) => console.log(args, "This always is logged no matter which option is chosen"),
	modal: false, // if true user cannot click on anything outside the dialog window.
	id: "bladethirst-application-dialog", // name as you want just make it unique and no spaces! needed for CSS selecting if you add a <style> </style> to the content.
	classes: [], // as with id.
	position: {
		width: "auto", // default "auto" and cant go narrower than 200 or wider than the screen width
		height: "auto" // default "auto", cant go narrower than the header height or longer than the screen height - hotbar height.
		// top: 100, // location on screen where the top of the dialog sits, default is in the center of the screen
		// left: 100 // location on screen where the left of the dialog sits, default is in the center of the screen
	}
});
console.log(data) // data is an object containing keys based on the name attributes of the inputs and selects.

debugger;

return
let succeeded = false;
console.log("Macro.sw_main: active");

debugger

//	DEFINE
const SW_ACTIVATED = 'fIpVB2r5wX1a4hQI';
const SW_RESTORE = 'qVpOU1Uo0IsVPwqH';

let srcs = item.getItemBooleanFlags();

//	GET TRIGGERS
let _TOGGLE = await item.isActive;
let _CLOCK = await (item.getItemDictionaryFlag("clock") === "on");
let _MEMORIES = await (Number(item.getItemDictionaryFlag("items")) !== 0);
let _LEVEL = (item.system.level != 0);
let _USECASE = (item.getItemBooleanFlags().length !== 0);
let _ACTION = (action !== null);

//	action can not equal null when paired with the 'Use' macro triggered

//	Dialog options will only return valid options as an abort does not activate the 'Use' macro trigger.
/*
*	So effectively there are only 3 states of interest from the action side.  The remaining "trigger" 
*	conditions above will have a bearing on subsequent activities.
*/
if (action.tag === "splashed") {
	//	ACTIVATE THE BUFF
	succeeded = await callMacro(SW_ACTIVATED);
	
} else if (action.tag === "immersed") {
	//	ACTIVATE THE BUFF
	succeeded = await callMacro(SW_ACTIVATED);

} else if (action.tag === "restore") {
	//	RECOVER 'MEMORIES' FROM BUFF
	succeeded = await recoverDialog();
	if (succeeded) {
		succeeded = await callMacro(SW_RESTORE);
	} else {
		succeeded = false;
	}
	
} else {
	//	not really possible but log it anyways
	console.warn(`Macro.sw_main: An unknown possibility has occurred! STATES: _TOGGLE=${_TOGGLE}, _CLOCK=${_CLOCK}, _MEMORIES=${_MEMORIES}, _LEVEL=${_LEVEL}, _USECASE=${_USECASE}, _ACTION=${_ACTION}`);
	return false;
}

return succeeded;

function callMacro(macro_id) {
	console.log(`STATES: _TOGGLE=${_TOGGLE}, _CLOCK=${_CLOCK}, _MEMORIES=${_MEMORIES}, _LEVEL=${_LEVEL}, _USECASE=${_USECASE}, _ACTION=${_ACTION}`);
	const m = game.macros.get(macro_id);
	const args = {actor: actor, item: item, shared: shared, action: action};
	const succeeded = m.execute(args);
	console.log("Macro success? ", succeeded);
	return succeeded;
}

function recoverDialog() {
	console.log(`STATES: _TOGGLE=${_TOGGLE}, _CLOCK=${_CLOCK}, _MEMORIES=${_MEMORIES}, _LEVEL=${_LEVEL}, _USECASE=${_USECASE}, _ACTION=${_ACTION}`);
	/*
	* Premade simple dialog with a return value.
	* after user clicks button, confirmation will be boolean for yes/no
	*/
	const { Dialog } = foundry.applications.api;
	const confirmation = Dialog.confirm({
		window: {title: 'Recover Lost Memories?'},
		content: `<p>Are you sure?</p>`,
	});
	return confirmation;
}
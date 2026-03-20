let succeeded = false;
console.log("Macro.sw_immersed: active");

debugger

//	DEFINE
const SW_SETLEVEL = 'z1N9OZ0XDWgkqV4S';
succeeded = await callMacro(SW_SETLEVEL);

return succeeded;

function callMacro(macro_id) {
	const m = game.macros.get(macro_id);
	const args = {actor: actor, item: item, shared: shared, action: action};
	const succeeded = m.execute(args);
	console.log(`Macro ${m.name}: success? `, succeeded);
	return succeeded;
}
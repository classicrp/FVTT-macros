let succeeded = false;
console.log("Macro.sw_setLevel: active");

// debugger

if (item.system.level === 0) {
//	applied to actor but not yet Activated
	let srcs = "1d4";
	let dies = await new Roll(srcs).evaluate();
	let count = dies.total;		//  dice[0].results[0].result;
	succeeded = await item.update({ ["system.level"]: count });
	//	turn on the clock
	let rslt = await item.getItemDictionaryFlag("clock");
	if (rslt === "off") {
		await item.setItemDictionaryFlag("clock", "on");
		succeeded = await item.getItemDictionaryFlag("clock");
	}
}

return succeeded;

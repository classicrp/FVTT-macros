	let succeeded = false;
	console.log("Macro.sw_splashed: active");

//	debugger

	//	DEFINE
	const SW_SETLEVEL = 'z1N9OZ0XDWgkqV4S';
	const SW_MEMORIES = 'XQQLeMr9c6fNlBSo';
	const SW_LOSEMEMORIES = 'DBLkzblVND1Zq7rF';
	let srcs = "", rslt = "", dies = "", msg = "";
	let dc = 0, count = 0;
	let memories = [];

	//	SET THE TIMER FOR THE BUFF
	succeeded = await callMacro(SW_SETLEVEL);

/*
	Determine how many "memories" are affected
*/
	if (action.tag === "splashed") {
	//	Takes away 1d3 random memories
	
		//	Set USECASE flag on BUFF
		await item.addItemBooleanFlag("splashed");
		await item.removeItemBooleanFlag("immersed");

		//	Set USECASE Parameters
		srcs = "1d3";
		dc = 15;
		dies = await new Roll(srcs).evaluate();
		count = dies.total;
		msg =`<span style="font-family: Arial, sans serif; font-size: 1.0em">${actor.name}, a splash from the river Styx has caused you to <b>forget</b> [rslt] (skills, spells and/or feats);</span>\n`
		succeeded = true;
		
	} else {
	//	wrong macro called
		succeeded = false;
	}
	
	dies = null;

//	Use makes a Saving Throw for their PC
	if (succeeded) {
		//	Saving Throw based on Parameters above
		rslt = await actor.rollSavingThrow('will', {skipDialog:false, chatMessage:true, dc:dc});
		if (!rslt) {
		//	Roll was aborted
			succeeded = false
		} else {
		//	Check Saving Throw result
			succeeded = rslt.rolls[0].isSuccess;
		}
	}
	if (succeeded) {
	//	Succeeded saving throw. No further effect for this USECASE
		await ui.notifications.info("No worries mate!");
		shared.rejected = false;
		succeeded = true;
		//	remove the BUFF
		await item.delete();
		
	} else {
	//	Failed saving throw. See how bad and continue.
		if (rslt.rolls[0].isNat1) {
		//	Critical failure
			await ui.notifications.warn("Ouch! This will not be pleasant.");
			//	Twice the amount of memories lost
			count = count * 2;
		}
		//	Update Chat message with correct amount
		msg = (count > 1) ? msg.replace("[rslt]", count.toString() + " memories"): msg.replace("[rslt]", "1 memory");
		succeeded = false;
	}

//	Collect Memories
	if (!succeeded) {
	//	Get the array of memories to choose from
		memories = await callMacro(SW_MEMORIES, [], 0, msg);
	}
	
//	Lose an amount of Memories based on above results
	if (memories.length !== 0) {
	//	We have some memories to draw from
		succeeded = await callMacro(SW_LOSEMEMORIES, memories, count, msg);
	} else {
	//	Must be an invalid actor	
		await ui.notifications.warn(`${actor.name} is not a valid character!`);
	}

return succeeded;

function callMacro(macro_id, arr, amnt, txt) {
	const m = game.macros.get(macro_id);
	const args = {actor: actor, item: item, memories: arr, count: amnt, msg: txt};
	const succeeded = m.execute(args);
	console.log(`Macro ${m.name}: success? `, succeeded);
	return succeeded;
}
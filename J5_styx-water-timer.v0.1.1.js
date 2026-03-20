//	version 0.0.9

let rslt = "", tmp = "", srcs = "", dies = "", msg = "", itm = "";
let count = 0, dc = 0;
let succeeded = false;
let memories = [];
const SW_RESTORE = 'qVpOU1Uo0IsVPwqH';
const SW_MEMORIES = 'XQQLeMr9c6fNlBSo';
const SW_LOSEMEMORIES = 'DBLkzblVND1Zq7rF';

debugger

itm = await actor.items.getName('styx-water');
if (itm.system.active) {
	rslt = await itm.getItemDictionaryFlag("clock");
	if (rslt === "on") {
		//	New instance of being "immersed"
		//	Takes away 2d4 random memories
		await itm.removeItemBooleanFlag("splashed");
		await itm.addItemBooleanFlag("immersed");
		srcs = "2d4";
		dc = 20;
		dies = await new Roll(srcs).evaluate();
		count = dies.total; // dice[0].results[0].result;
		msg = `<span style="font-family: Arial, sans serif; font-size: 1.0em">${actor.name}, being in the river Styx has caused you to <b>forget</b> [rslt] (skills, spells and/or feats);</span>\n`
		succeeded = true;
	}

	dies = null;

	//	User makes a Saving Throw for their PC
	if (succeeded) {
		//	Saving Throw based on Parameters above
		rslt = await actor.rollSavingThrow('will', {
			skipDialog: false,
			chatMessage: true,
			dc: dc
		});
		if (!rslt) {
			//	Roll was aborted
			succeeded = false;
		} else {
			//	Check Saving Throw result
			succeeded = rslt.rolls[0].isSuccess;
		}
	}
	if (succeeded) {
		//	Succeeded saving throw. No further effect for this USECASE
		await ui.notifications.info("No worries mate!");
		succeeded = await askDialog();
		if (succeeded) {
			//	See if any memories were lost
			rslt = Number(itm.getItemDictionaryFlag("items"));
			if (rslt) {
				//	See if the timer is still counting down
				rlst = itm.sytem.duration.value;
				if (rslt) {
					//	Still time on the counter
				} else {
					//	Timer is expired, ok to Restore
					succeeded = await callMacro(SW_RESTORE, itm, [], 0, "");
				}
			} else {
				//	Ok to delete the buffs
				succeeded = await itm.delete();
				succeeded = await item.delete();
			}
		}

	} else {
		//	Failed saving throw. See how bad and continue.
		if (rslt.rolls[0].isNat1) {
			//	Critical failure
			await ui.notifications.warn("Ouch! This will not be pleasant.");
			//	Twice the amount of memories lost
			count = count * 2;
		}
		//	Update Chat message with correct amount
		msg = (count > 1) ? msg.replace("[rslt]", count.toString() + " memories") : msg.replace("[rslt]", "1 memory");
		succeeded = false;
	}

	//	Collect Memories
	if (!succeeded) {
		//	Get the array of memories to choose from
		memories = await callMacro(SW_MEMORIES, itm, [], 0, msg);
	}

	//	Lose an amount of Memories based on above results
	if (memories.length !== 0) {
		//	We have some memories to draw from
		succeeded = await callMacro(SW_LOSEMEMORIES, itm, memories, count, msg);
	}
}

	return succeeded;

	function callMacro(macro_id, itm, arr, amnt, txt) {
		const m = game.macros.get(macro_id);
		const args = {
			actor: actor,
			item: itm,
			memories: arr,
			count: amnt,
			msg: txt
		};
		const succeeded = m.execute(args);
		console.log(`Macro ${m.name}: success? `, succeeded);
		return succeeded;
	}

	function askDialog() {
		/*
		 * Premade simple dialog with a return value.
		 * after user clicks button, confirmation will be boolean for yes/no
		 */
		const { Dialog } = foundry.applications.api;
		const confirmation = Dialog.confirm({
			window: {
				title: `Is ${actor.name} out of the River Styx?`
			},
			content: `<p>Are you sure?</p>`,
		});
		return confirmation;
	}

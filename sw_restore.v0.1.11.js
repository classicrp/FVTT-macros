//	Version: 0.1.11
/*	
*	Remember all lost "memories"
*/
	console.log("Macro.sw_restore: active");
/*
*	Definitions
*/
	let tmp = "", srcs = "", rslt = "", msg = "", itm = "";
	let loc = 0, count = 0;
	let succeeded = false;
	const types = {
		wea: "weapon",
		spl: "spell",
		fea: "feat",
		skl: "skill"
	}
/*
*	GET NUMBER-OF-ITEMS FLAG
*/		
	count = Number(item.getItemDictionaryFlag("items"));
/*
*	IF NOT EMPTY THEN
*/
	if (!count) {
		//	Nothing to restore
		succeeded = false;
  	} else {
		msg = `<h3><span style="font-family: Arial, sans serif; font-size: 1.0em">Remembered</span></h3>`;
		//	Check that the timer is not running first
		let toggle = item.isActive;
		let clock = (item.getItemDictionaryFlag("clock") === "on");
		if (toggle && clock) {
			//	Timer is still running according to buff, request override
			let duration = "";
			let start = SeasonsStars.api.worldTimeToDate(item.system.duration.start);
			let end = start;
			end.day += item.system.level;
			let timediff = game.time.calendar.difference(game.time.worldTime, end);
			//	coming back with weird numbers
			duration = `${timediff.day} day(s) ${timediff.hour} hour(s) ${timediff.minute} minute(s)`;
			console.log(duration);
			succeeded = await askDialog(duration)
		}
		if (succeeded) {
			for (let i = 1; i <= count; i++) {
	/*
	*		GET ITEMS STORED IN BUFF FLAGS
	*/
debugger	
				loc = (i < 10) ? "0" + i.toString() : i.toString();
				rslt = item.getItemDictionaryFlag(`item${loc}`);
				tmp = (rslt.type === "skl") ? pf1.config.skills[rslt.name] : rslt.name;
				msg += `<span style="font-family: Arial, sans serif; font-size: 1.0em"> ${types[rslt.type].capitalize()}: ${tmp}</span>\n`;
	/*
	*		ENABLE ITEMS ON ACTOR
	*/
				itm = actor.items.get(rslt.id);
				if (rslt.type === "wea") {
				//	restore weapon proficiency
					await itm.update({ ["system.proficient"]: rslt.value });
					succeeded = true;
						
				} else if (rslt.type === "spl") {
				//	restore spell preparation
					await itm.update({ ["system.preparation.value"]: rslt.value });
					succeeded = true;

				} else if (rslt.type === "fea") {
				//	restore disabled feat
					await itm.update({ ["system.disabled"]: rslt.value });
					succeeded = true;

				} else if (rslt.type === "skl") {
				//	restore skill rank
					await actor.update({ [`system.skills.${rslt.name}.rank`]: rslt.value });
					succeeded = true;

				} else {
					// what?
					console.warn("Macro.sw_restore: Problem identifying stored 'memory'.");
					succeeded = false;
				}
			/*
			*	Remove currently restored "memory" from BUFF
			*/
				if (succeeded) {
					await item.removeItemDictionaryFlag(`item${loc}`);
				}
			}
		/*
		*	Let User know what was restored
		*/
			await ui.chat.processMessage(msg);
			await item.setItemDictionaryFlag("items", 0);
		}
/*
*	DELETE BUFF(S)
*/
		if (succeeded) {
			itm = await actor.items.getName("immersed-countdown");
			if (typeof itm !== "undefined") {
				await itm.delete();
			}
			await item.delete();
			succeeded = true;
		}
	}

return succeeded;

	function askDialog(timeleft) {
		/*
		 * Premade simple dialog with a return value.
		 * after user clicks button, confirmation will be boolean for yes/no
		 */
		const { Dialog } = foundry.applications.api;
		const confirmation = Dialog.confirm({
			window: {
				title: `There is still ${timeleft} left.`
			},
			content: `<p>Are you sure?</p>`,
			modal: true
		});
		return confirmation;
	}
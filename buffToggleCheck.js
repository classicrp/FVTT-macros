const version = '0.1.1';
const show = true;
const verbose = true;
if (!item.system.active) {
	// this will turn off every <frequencyPerUnit> per <frequencyUnits> for <frequencyDuration>.
	// <frequencyUnits> are as follows [infinity: "", turn: "turn", mins: "minute", rnds: "round", hrs: "hour"]
	// increment the units and turn back on
	let units = await Number(item.getItemDictionaryFlag('units'));
	let dur = await Number(item.getItemDictionaryFlag('frequencyDuration'));
	units++;
	if (units <= dur) {
		await item.setItemDictionaryFlag('units', units);
		if (verbose) console.log(version, "units:", units);
		if (item.system.tags.includes('poison')) {
			//  handle poison damage increases, check current value and save
			//  also need to handle saves and making multiples
			for (let i=0; i < item.system.changes.length; i++) {
            	if (show) debugger
				const target = item.system.changes[i].target;
				const value = item.system.changes[i].value;
				if (verbose) console.log(version, targer, value);
				await item.setItemDictionaryFlag(target, value);	
			}
		}
		await item.setActive(true);
	} else {
		// we are done
		await item.setItemDictionaryFlag('units', 0);
		if (item.system.tags.includes('poison')) {
			//  handle poison damage increases, check current value and save
			for (let i=0; i < item.system.changes.length; i++) {
				await item.setItemDictionaryFlag(item.system.changes[i].target, 0);	
			}
		}
	}
}
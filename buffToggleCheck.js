const version = '0.0.4';
const show = true;
const verbose = true;
if (!item.system.active) {
	if (show) debugger
	// this will turn off every <frequencyPerUnit> per <frequencyUnits> for <frequencyDuration>.
	// increment the units and turn back on
	let units = await Number(item.getItemDictionaryFlag('units'));
	let dur = await Number(item.getItemDictionaryFlag('frequencyDuration'));
	units++;
	if (units <= dur) {
		await item.setItemDictionaryFlag('units', units);
		if (verbose) console.log(version, "units:", units);
		await item.setActive(true);
	} else {
		// we are done
		await item.setItemDictionaryFlag('units', 0);
	} 
}
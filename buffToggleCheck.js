const version = '0.0.2';
const show = true;
const verbose = true;
if (!item.system.active) {
  if (show) debugger
  // this will turn off every <frequencyPerUnit> per <frequencyUnits> for <frequencyDuration>.
  // decrement actual duration and turn back on
  let units = await Number(item.getItemDictionaryFlag('units'));
  let dur = await Number(item.getItemDictionaryFlag('frequencyDuration'));
  units++;
  if (units <= dur) {
    await item.setItemDictionaryFlag('units', units);
    if (verbose) console.log(version, "units:", units);
    const duration = deepClone(item.system.duration);
    duration.value = dur - units;
    await item.update({ 'system.duration': duration });
    await item.setActive(true);
  } else {
    // we are done
  }

  
  if (verbose) console.log(version);
}
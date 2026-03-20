const version = '0.2.13';
const timer = false;
const verbose = true;
if (typeof state === 'undefined') 
	return;
const start = startTime;
// read the "attached" weapon and adjust the range accordingly.
const act = actor.toObject();
const weapA = item.getFlag('ckl-roll-bonuses', 'target_weapon');
let rslt = "", weapItem = "", weap = "";

for (const w of weapA) {
	weap = await deepClone(act.items.find(f => f._id === w));
	if (state) {
		let rng = weap.system.actions[0].range.value;
        let units = weap.system.actions[0].range.units;
        let area = weap.system.actions[0].area;
        let msg = "";
        if (typeof area === 'undefined') {
            msg = `Range increased from: [[${rng}]] ${units} to: [[${rng * 2}]] ${units}.`
        } else {    
            msg = `Range increased from: [[${rng}]] ${units}-${area} to: [[${rng * 2}]] ${units}-${area}.`
        }
		rslt = await item.setFlag('ckl-roll-bonuses', 'bonus_ranged-increment-penalty-increment-range-offset', rng);
		if (verbose && !rslt) 
			console.warn("setFlag ['ckl-roll-bonuses']['bonus_ranged-increment-penalty-increment-range-offset']: failed");
		//	make changes to actual weapon
		weapItem = await actor.items.find(f => f._id === weap._id);
		rslt = await weapItem.addItemBooleanFlag('target_self');
		if (verbose && !rslt) 
			console.warn("addItemBooleanFlag ['target_self']: failed");
		rslt = await weapItem.addItemBooleanFlag('bonus_footnote');
		if (verbose && !rslt) 
			console.warn("addItemBooleanFlag ['target_self']: failed");
		rslt = await weapItem.setFlag('ckl-roll-bonuses', 'bonus_footnote', msg);
		if (verbose && !rslt) 
			console.warn("setFlag ['ckl-roll-bonuses']['bonus_footnote']: failed");
	} else {
		weapItem = await actor.items.find(f => f._id === weap._id);
		rslt = await item.setFlag('ckl-roll-bonuses', 'bonus_ranged-increment-penalty-increment-range-offset', 0);
		if (verbose && !rslt) 
			console.warn("setFlag ['ckl-roll-bonuses']['bonus_ranged-increment-penalty-increment-range-offset']: failed");	
		rslt = await item.setFlag('ckl-roll-bonuses', 'target_weapon', []);
		if (verbose && !rslt) 
			console.warn("setFlag ['ckl-roll-bonuses']['target_weapon']: failed");
		rslt = await weapItem.removeItemBooleanFlag('target_self');
		if (verbose && !rslt) 
			console.warn("removeItemBolleanFlag ['target_self']: failed");
		rslt = await weapItem.removeItemBooleanFlag('bonus_footnote');
		if (verbose && !rslt) 
			console.warn("removeItemBolleanFlag ['bonus_footnote']: failed");
		rslt = await weapItem.unsetFlag('ckl-roll-bonuses', 'bonus_footnote');
		if (verbose && !rslt) 
			console.warn("unsetFlag ['ckl-roll-bonuses']['bonus_footnote']: failed");
	}
}
if (timer) {
	const end = game.time.worldTime;
	const diff = end - start;
	console.log("State", state, "Start", start, "End", end, "Diff", diff);
}
return
// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime
debugger;

if (arguments[6].conditionals.length > 0) {
//	some conditions were chosen
const sel = arguments[6].conditionals;
const cond = shared.action.conditionals;
const mylist = ['Two-Weapon: Edge', 'Two-Weapon: Havok', 'Two-Weapon: Blade Boot', 'Two-Weapon: Unarmed', 'Two-Weapon: Revolver'];

const find2Weap = await getMyOtherWeapon(sel, cond, mylist);

if (find2Weap !== "") {
    const attr = `system.flags.boolean.twoWeapon`;
    console.log(`weapon: ${item.name}, ${find2Weap}`);
    await item.update({ [attr]: true });
    }

	let weapon = find2Weap.substring(12, find2Weap.length);
	//	rename to long weapon name
	if (weapon == 'Revolver') {
		weapon = 'Nagant M1895 Revolver';
	} else if (weapon == 'Unarmed') {
		weapon = 'Unarmed Strike';
	}

    /*-			CONFIGURATION			-*/
    const targetMacro = "useAction";
    const commandOverride = `My: ${weapon}`;
    
    /*-			COMMAND					-*/
    if (typeof shared !== "undefined")
    	event.args = arguments;
    window.macroChain = [commandOverride || this.name].concat(window.macroChain ?? []);
    await game.macros.getName(targetMacro)?.execute({
    	actor,
    	token
    });
}

function getMyOtherWeapon(tItem, tList, tValues) {
	
	let tName = '';
	tItem.forEach(i => {
		if (tList.has(i)) {
		//	get the name
			tName = tList.get(i).name;
			if (!tValues.includes(tName)) {
			//	we want to know
				tName = '';
			}
		}
	});
	return tName;
}
const version = '0.0.3';
let buff = actor._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0);
if (!buff.isActive) return false;
debugger
let used = Number(buff.getItemDictionaryFlag('used'));
used++;
if (used < 2) {
	let weapons = buff.getFlag('ckl-roll-bonuses','target_weapon');
	firstW = weapons[0];
	secondW = weapons[1];
	//	get second attack weapon
	weapon = (item.id === firstW) ? actor.items.contents.filter(a => a.id === secondW).at(0).name : actor.items.contents.filter(a => a.id === firstW).at(0).name;
	await useAction(weapon);
	await buff.setItemDictionaryFlag('used', used);
	return true;
} else {
	//	second weapon attack, rest count to zero	
	await buff.setItemDictionaryFlag('used', 0);	
	shared.rejected = true;
	return false;
}

function useAction(w) {
    /*-			CONFIGURATION			*/
    const targetMacro = "useAction";
    const commandOverride = `My: ${w}`;
    
    //			COMMAND					
    if (typeof shared !== "undefined")
    	event.args = arguments;
    window.macroChain = [commandOverride || this.name].concat(window.macroChain ?? []);
    game.macros.getName(targetMacro)?.execute();
  /*{
    	actor,
    	token
    });*/
	return
}
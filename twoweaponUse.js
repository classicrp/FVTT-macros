// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime
const version = '0.2.7';
debugger
//	game.actors.get('tPis1bRmFuPFq4Gw')._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0)
	const buff = actor._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0);
	if (!buff.isActive) return false;
	let used = Number(buff.getItemDictionaryFlag('used'));
	used++;
	if (used < 2) {
		firstW = buff.flags['ckl-roll-bonuses'].target_weapon[0];
		secondW = buff.flags['ckl-roll-bonuses'].target_weapon[1];
		weapon = (item.id === firstW) ? actor.items.contents.filter(a => a.id === secondW).at(0).name : actor.items.contents.filter(a => a.id === firstW).at(0).name;
		await useAction(weapon);
		await buff.setItemDictionaryFlag('used', used);
		return true;
	} else {
	//	second weapon attack, rest count to zero	
		await buff.setItemDictionaryFlag('used', 0);	
		return false;
	}

function useAction(weapon) {
    /*-			CONFIGURATION			*/
    const targetMacro = "useAction";
    const commandOverride = `My: ${weapon}`;
    
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
// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime
const _VERSION = '0.2.8';
const _SHOW = true;

let rslt = "";

if (_SHOW) debugger
//	game.actors.get('tPis1bRmFuPFq4Gw')._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0)
	const buff = actor._itemTypes.buff.filter(b => b.name === 'Two Weapon Use').at(0);
	if (!buff.isActive) return false;
	let used = Number(buff.getItemDictionaryFlag('used'));
	used++;
	if (used < 2) {
		const firstW = await foundry.utils.getProperty(buff, 'flags.ckl-roll-bonuses.target_weapon.0');
		const secondW = await foundry.utils.getProperty(buff, 'flags.ckl-roll-bonuses.target_weapon.1');
		const weapons = await actor.items.contents.filter(a => a.id === firstW).concat(actor.items.contents.filter(a => a.id === secondW));
		await buff.setItemDictionaryFlag('used', used);
		if (item.id === firstW) {
			rslt = weapons[1].use();
		} else {
			rslt = weapons[0].use();
		}
//		await useAction(weapon);
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
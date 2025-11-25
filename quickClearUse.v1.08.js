// Use Condition
//
/* 	Used a Call to Macro "useAction" from 'justice noon' to have the rifle or 
	revolver make the call to the feature directly.
	<actor> passed in from calling macro.
	<token> passed in from calling macro.
	<item> passed in from calling macro.
*/
/*	How to fire sound bites through code:
	`await foundry.audio.AudioHelper.play({src: "path/to/sound.ext", volume: 0.3});`
*/
// 	----------
// 	Feedback
// 	----------
	const curVer = 'v1.08';
	const head = `Macro.quickClearUse(${curVer}): `;
	const msg = '';
	const failState = false;

debugger;	

	// where to find item HP
	const attr = `system.hp.value`;
	const max = `system.hp.max`;
	const revolverName = `Nagant M1895 Revolver`;
	const rifleName = `Mosin-Nagant M1891 Rifle`;
	const isBroken = `system.broken`;
	let brokenVal = 0;		// use 1 for revolver, -1 for rifle 
	const revolver = await actor.items.getName(revolverName);
	const rifle = await actor.items.getName(rifleName);
	//	check if revolver is broken
	brokenVal = await foundry.utils.getProperty( revolver, isBroken );
	if (brokenVal) {
	//	the revolver is broken
		brokenVal = 1;
	} else {
		// check if rifle is broken
		brokenVal = await foundry.utils.getProperty( rifle, isBroken );
		if (brokenVal) {
		// the rifle is broken
			brokenVal = -1;
		} else {
		//	neither are broken
			failState = true;
			ui.notifications.info(`Neither of your firearms is broken.`);
			// not clean but prevents the roll from happening anyway
			shared.chatMessage = false;
			shared.reject = true;
			throw `Done`;
			return;
		}
	}

	//	lock which weapon we are interested in
	// 	const weapon = ((brokenVal == 1) ? { revolver.clone() } : { rifle.clone() });
	//	can't use clone to set values so...

	if (brokenVal == 1) {
	// 	revolver
	
		// get current item HP
		let	curHP = foundry.utils.getProperty( revolver, max );
		
		// change the HP back to full
		await revolver.update({ [attr]: curHP });	

		// if we have a sound for repairing the revolver, do it here
		const path = "worlds/pf1e/sbcimport/weapons/Revolver/revolver-chamber-spin-ratchet-sound-90521.mp3";
		await foundry.audio.AudioHelper.play({src: path, volume: 0.7});
	
		// change status of `broken` to false
		const broken = `system.broken`;
		await revolver.update({ [broken]: false });	
	// chatMessage(`<p><span style="font-family: Arial">${actor.name}&apos;s <i>${item.name}</i> is <b>repaired<b>.</span></p>`);
	} else {
	// 	rifle

		// get current item HP
		let	curHP = foundry.utils.getProperty( rifle, max );

		// change the HP back to full
		await rifle.update({ [attr]: curHP });	

		// if we have a sound for repairing the revolver, do it here
		const path = "worlds/pf1e/sbcimport/weapons/Rifle/caulking-gun-back-381411.mp3";
		await foundry.audio.AudioHelper.play({src: path, volume: 0.7});
	
		// change status of `broken` to false
		const broken = `system.broken`;
		await rifle.update({ [broken]: false });	
	}

	return;
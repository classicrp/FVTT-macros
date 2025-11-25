// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime

// 	----------
// 	Issues
//	need interactive dialogs to avoid assumptions and allow for user input.
//  also need to separate the logic and code!  So, instead of using `throw` to 'exit'_content
//  the macro. make use of Booleans to verify passed sections.
//  20251022-1811:
//		What and idiot. I am charging action costs in the item [ItemFeatPF::Move] already
//		and then double charging in code!!!  Removed in v1.15.  Added test for new extended
//		swim move 'mvSwimL' also as 'swim'.  Added move for 'jump' as 'mvJump'.
//	20251022-1843:
//		Brace errors when bringing into Foundry.  Then ln 274
//	20251023-1549:
//		`game.modules.get("dfreds-convenient-effects").api`
//		`actor.inCombat()` lets us know when to care about this stuff
//		`actor.appliedEffects[n]` is an array with all 'activeEffects' listed
//		`actor.temporaryEffects[n]` is an array with all 'activeEffects' listed
//	20251023-1823:
//		yeah had to go to Discord::FoundryVTT::modules where @roninseven put me right with
//		`game.modules.get("dfreds-convenient-effects").api.toggleEffect({effectId: 
//		"ce-running"})`
// 	----------
// 	in case the updates knock the action out-of-whack
	const thisAct = action.tag;
//	start benchmarking --- make sure game is running, pause screws up the benchmark!
	const startTime = (game.time.components.minute * 60) + game.time.components.second;

// 	----------
// 	Feedback
// 	----------
	const curVer = 'v1.21';
	const head = `Macro.useMoveAction(${curVer}): `;
	let msg = '';
	let failure = Boolean(false);

// 	----------
// 	<token>
// 	----------
// 	[tkmv] will correlate to one of the following movement options
// 	on the token.  These are mutually exclusive states [
//		'default', 'walk', 'fly', 'swim', 'burrow', 'crawl',
//		'climb', 'jump', 'blink'
//	]
	const tkmv = 'movementAction';
//	[tkelv] will examine the current token position above the
//	current Scene's "ground level". this impacts movement types
// 	available and are also mutually exclusive states [	
//		- value; below "ground level"; 'burrow', 'swim', 'climb'
//		0 value; "ground level"; 'walk', 'crawl', 'jump'
//		+ value; above "ground level"; 'fly', 'climb'
//	]
//  Note: 'blink' (teleport) doesn't really have representation
	const tkelv = 'elevation';
//	Let see which movement the token is currently set to
	const tkCurMv = await foundry.utils.getProperty(token, tkmv);

// 	----------
// 	<actor>
// 	----------
// 	get the actor's current number of [action points]
// 	don't use the resources() pool, go to the item source
// 	extra work but avoids whole 'duplicate resource' problem
// 	----------
//	use the actor to get to the correct item [ItemFeatPF::Actions]
	const actItem = await actor.items.getName('Actions');
//	drill down Item path to the actual value
	const attr = 'system.uses.value';
//	get uses of actions available (skip the resource pool)
	const acts = await foundry.utils.getProperty(actItem, attr);
//	movement conditions are mostly found on the <actor> using
//	the `actor.statuses.has()` function. the conditions
//	are not mutually exclusive and can be [
//		'fly', 'flat-footed', 'prone', 'burrow', 'swim'
//	]
//	other movement statuses use DFreds Convenient Effects. 
//	called via `activeEffect.getFlag('dfreds-convenient-effects', 
//		'{flagName}')` { DOESN'T WORK } but can also be viewed with
//	`Boolean(actor.effects.getName())` which will show true or
//	false if present or not.  These also impart  the condition 
//	'flat-tooted' onto <actor>.  activeEffects are also not 
//	mutually exclusive [
//		'Climb', 'Run', 'Jump', 'Prone', 'Flat-footed' 
//	]
//	these effects are mutually exclusive [
//		'Flying', 'Swimming', 'Burrowing'
//	]

debugger;
//	Check to see that we are in Combat as this is only useful there
	if (!actor.inCombat) {
		failure = true;
	}

// see if there is at least 1 [action point] available
	if (acts >= 1 && !failure) {

	// 	see how many [action points] the current <item> [ItemFeatPF::Move] 
	// 	action will use. actions are mutually exclusive requests [
	//		'walk', 'run', 'jump', 'crawl', 'stand', 'burrow', 'swim', 
	//		'fly', 'swim', 'long swim'
	//	]
	// 	-> direct drill down method.
		const cur = await item.actions.getName(action.name).activation.cost;
		const lftOvr = acts - cur;

	// see if we have enough [action points] left
		if (cur > acts) {
		// we don't have enough requested actions
			msg = `Not enough Actions left this round to ${action.name}`
			noteToOutside(msg, 'warn', true, head, true);

		} else {
		// now lets inspect the move situation selected from current <item>

		// see if the 'prone' status effect (condition) is on the <actor>
			const isProne = await actor.statuses.has('prone');

		// get what the 'elevation' (or declination) is on the <token>
			const howElevated = await foundry.utils.getProperty(token, tkelv);

			if ((thisAct == `mvStep`) || (thisAct == `mvWalk`) || (thisAct == `mvRun`) || (thisAct == `mvJump`) || (thisAct == `mvClimb`)) {
			// need to be at "ground level" and standing for these selected 'actions'
			// 'climb' can technically be at "ground level" when shimmying sidewise on a wall to cross 
			// a gap or crevasse on the ground 

			// if <actor> is 'prone', need to get up first.
				if (isProne) {
				// <actor> is 'prone'
					msg = `Currently 'Prone', need to 'Stand' first`;
					noteToOutside(msg, 'warn', true, head, true);

				// if <actor> is not at "ground level" need to get there first
				} else if (howElevated < 0) {
				// not 'prone' but the <token> is below "ground level"

				// should be 'swim', 'climb' or 'burrow' on <actor> and <token>
					if (tkCurMv == 'climb' || tkCurMv == 'burrow' || tkCurMv == 'swim') {
					// <token> is correct

						if (actor.statuses.has('climb') || actor.statuses.has('burrow') || actor.statuses.has('swim')) {
						// <actor> is also correct

						// we can't perform the selected action.
							msg = `Currently below "ground level", need come back up.`;
							noteToOutside(msg, 'warn', true, head, true);

						} else {
						// <token> and <actor> disagree, could be 'climb' as we don't have that condition currently
							msg = `Currently below "ground level", need come back up.`;
							noteToOutside(msg, 'warn', true, head, true);
						};
						
					} else {
						msg = `Currently below "ground level", 'token' is set to ${tkCurMv}.`;
						noteToOutside(msg, 'warn', true, head, true);
					};

				} else if (howElevated > 0) {
					
				// should be 'fly' or 'climb' on <actor> and <token>
					if (tkCurMv == 'climb' || tkCurMv == 'fly') {
					// <token> is correct
					
						if (actor.statuses.has('climb') || actor.statuses.has('fly')) {
						// <actor> is also correct
						
						// we can't perform the desired action.
							msg = `Currently above "ground level", need come back down.`;
							noteToOutside(msg, 'warn', true, head, true);

						} else {
						// <token> and <actor> disagree, could be 'climb' as we don't have that condition
							msg = `Currently above "ground level", need come back down.`;
							noteToOutside(msg, 'warn', true, head, true);
						};
				} else {
					msg = `Currently above "ground level", 'token' is set to ${tkCurMv}.`;
					noteToOutside(msg, 'warn', true, head, true);
				};

			} else {
			// must be at "ground level", but could have 'swim'
				if (tkCurMv == 'swim') {
				// must get back to shore

					await tokenMove(tkmv, 'walk');
				};
			};

		} else if (thisAct == `mvStand`) {
		// if we were already 'prone' great
			if (!isProne) {
				msg = `Not currently 'Prone', no need to 'Stand'`;
				noteToOutside(msg, 'warn', true, head, true);

			} else if (isElevated) {
				msg = `Currently 'Flying', need to land first`;
				noteToOutside(msg, 'warn', true, head, true);

			} else {
				await setMove('prone', false);
				await tokenMove(tkmv, 'walk');
			};

			} else if (thisAct == `mvCrawl`) {
				// go prone
				if (!isProne) {
					await setMove('prone', true);
					await tokenMove(tkmv, 'crawl');

				} else if (isElevated > 0) {
					msg = `Currently 'Flying', need to land first`;
					noteToOutside(msg, 'warn', true, head, true);
				};

			} else if (thisAct == `mvClimb`) {
				// assume you can start climbing from 'prone'
				// also assume that you can land from flying into climbing
				// [TO DO]: don't currently have a Condition for 'climb'
				await tokenMove(tkmv, 'climb');
				await setMove('prone', false);

			} else if (thisAct == `mvBurrow`) {
				// indicate burrowing, resets all but 'prone'
				if (isProne) {
					// swapping one for the other
					await setMove('prone', false);

				} else if (isElevated > 0) {
					msg = `Currently 'Flying', need to land first`;
					noteToOutside(msg, 'warn', true, head, true);

				} else if (isElevated < 0) {
					// perfect to continue burrowing
					msg = `Currently 'Burrowing', perfect.  Keep digging.`;
					noteToOutside(msg, 'info', false, '', false);

				};
				await setMove('burrow', true);
				await tokenMove(tkmv, 'burrow');

			} else if (thisAct == `mvFly`) {
				// indicate flying, resets all but 'prone'
				// Might be in the air, can't change until landing,
				// can only descend at twice speed.
				if (isProne) {
					msg = `Currently 'Prone', need to 'Stand' first`;
					noteToOutside(msg, 'warn', true, head, true);

				} else {
					await setMove('fly', true);
					await tokenMove(tkmv, 'fly');
				};

			} else if (thisAct == `mvSwim` || thisAct == `mvSwimL`) {
				// indicate swimming. for 'prone' assume
				// they crawled into the water and swapped
				await setMove('prone', false);
				await setMove('swim', true);
				await tokenMove(tkmv, 'swim');
			};
		};
	} else {
		// not enough actions, abort!
		msg = `No Actions left this round`;
		noteToOutside(msg, 'warn', true, head, true);
	};

	if (!failure) {
		// ok to check time stats
		const endTime = (game.time.components.minute * 60) + game.time.components.second;
		const diffTime = endTime - startTime;
		msg = `It took ${diffTime} seconds to update.`;
		noteToOutside(msg, 'info', false, '', false);
	}


	function setMove(cond, state) {
		if (!state) {
			// can only proceed to turn off if 'cond' is present
			if (actor.statuses.has(cond)) {
				setMove = actor.toggleCondition(cond, {
					active: state
				});
			} else {
				console.log(`Trying to disable ${cond} that is not active.`);
			}
		} else {
			// turn 'on' the condition
			setMove = actor.toggleCondition(cond, {
				active: state
			});
		};
		return setMove;
	}

	function tokenMove(attr, selected) {
		tokenMove = token.document.update({
			[attr]: selected
		});
		return tokenMove;
	}

	function noteToOutside(msg, kind, logIt, head, state) {
		// msg = string value
		// kind = string { 'info', 'warn', 'error' }
		// logIt = boolean; true:= output to console.log()
		// state = boolean; set the return value of 'failure'
		if (kind == 'info') {
			ui.notifications.info(msg);
			ui.chat.processMessage('<b>' + kind + ':</b> ' + msg);
		} else if (kind == 'warn') {
			ui.notifications.warn(msg);
			ui.chat.processMessage('<b>' + kind + ':</b> ' + msg);
		} else {
			ui.notifications.error(msg);
			ui.chat.processMessage('<b>' + kind + ':</b> ' + msg);
		};
		if (logIt) {
			console.log(head + msg)
		};
		failure = state;
	}

	function actionGround(prone, elevation, requested) {
	// 	prone: passed in result of 'isProne' variable
	//	elevation: passed in result of 'howElevated' variable
	//	requested: requested action passed into 'thisAct' variable
	
		return actionGround;
	}
	
	function actionUp(prone, elevation, requested) {
	// 	prone: passed in result of 'isProne' variable
	//	elevation: passed in result of 'howElevated' variable
	//	requested: requested action passed into 'thisAct' variable
	
		return actionUp;
	}
	
	function actionDown(prone, elevation, requested) {
	// 	prone: passed in result of 'isProne' variable
	//	elevation: passed in result of 'howElevated' variable
	//	requested: requested action passed into 'thisAct' variable
	
		return actionDown;
	}
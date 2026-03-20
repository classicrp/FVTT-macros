// Post-Use Condition

if (action.tag == `axe`) {
	// only care about attack events
	debugger;
	// shared.chatAttacks[0].attack.terms[0].results[0].result -> Attack d20 roll
	// shared.chatAttacks[0].critConfirm.options.critical -> Critical Hit number needed on d20
	// shared.chatAttacks[0].critConfirm.terms[0].results[0].result -> Confirmation d20 roll
	if (shared.chatData.system.rolls.attacks[0].attack.options.staticRoll == 20) {
	if (shared.chatData.system.rolls.attacks[0].attack.terms[0].results[0].result == 20) {
		// only care about a critcal hit, in case of Greataxe it is 'Nat 20' only.
		
		if (shared.chatData.system.rolls.attacks[0].critConfirm.options.staticRoll >= 19) {
			// critcal hit plus trigger [Critcal Focus] on 'Nat 19' or 'Nat 20'

			const m = game.macros.getName('useAction');
			const result = await m.execute({ My: 'Critical Focus' });
		}
	}
}

// shared.chatAttacks[0].attack.options.staticRoll == 20  // critcal
// shared.chatAttacks[0].critConfirm._evaluated = true // crit confirm

v1.03
if (action.tag == `attack`) {
	// only care about attack events
	debugger;
	// Critical Hit number needed on d20 by weapon used
	const crit = shared.chatAttacks[0].critConfirm.options.critical;
	// The Critical Focus feat requires a 19 or higher on the d20 to trigger its Stamina extra
	const critFocus = 19;  
	if (shared.chatAttacks[0].attack.terms[0].results[0].result >= crit) {
		// We have a critcal hit.  Now lookup the Confirmation roll data
		// only care about a critcal hit, look up the number.
		if (shared.chatAttacks[0].critConfirm.terms[0].results[0].result >= critFocus) {
			// Critical Focus stamina extra triggers, call the Action
			const m = game.macros.getName('useAction');
			const result = await m.execute({My: 'Critical Focus'});
		}
	}
}
```
script-call-bonus.mjs:62 Script call execution failed
 TypeError: Cannot read properties of null (reading 'options')
    at Macro.eval (eval at #executeScript (foundry.mjs:45499:16), <anonymous>:7:49)
    at #executeScript (foundry.mjs:45504:17)
    at Macro.execute (foundry.mjs:45446:35)
    at ItemScriptCall.execute (script-call.mjs:195:16)
    at async ItemWeaponPF.executeScriptCalls (script-call-bonus.mjs:59:21)
    at async ActionUse.executeScriptCalls (action-use.mjs:1462:11)
    at async ActionUse.process (action-use.mjs:1732:11)
    at async ActionUse.actionUseProcess (main.mjs:184:12)
 
ItemWeaponPF {links: {…}, actions: Collection(1), scriptCalls: Collection(1), name: '+3 Impact Wounding Cold-iron Greataxe', #validationFailures: {…}, …}

script-call-bonus.mjs:64 Uncaught (in promise) Error: Error occurred while executing a script call
[Detected 2 packages: ckl-roll-bonuses(2.22.4), system:pf1(11.8)]
    at ItemWeaponPF.executeScriptCalls (script-call-bonus.mjs:64:23)
    at async ActionUse.executeScriptCalls (action-use.mjs:1462:11)
    at async ActionUse.process (action-use.mjs:1732:11)
    at async ActionUse.actionUseProcess (main.mjs:184:12)
Caused by: TypeError: Cannot read properties of null (reading 'options')
    at Macro.eval (eval at #executeScript (foundry.mjs:45499:16), <anonymous>:7:49)
    at #executeScript (foundry.mjs:45504:17)
    at Macro.execute (foundry.mjs:45446:35)
    at ItemScriptCall.execute (script-call.mjs:195:16)
    at async ItemWeaponPF.executeScriptCalls (script-call-bonus.mjs:59:21)
    at async ActionUse.executeScriptCalls (action-use.mjs:1462:11)
    at async ActionUse.process (action-use.mjs:1732:11)
    at async ActionUse.actionUseProcess (main.mjs:184:12)
```

v1.04
// Check for values first, then do tests in case a null is returned
if (action.tag == `attack`) {
	// only care about attack events
	debugger;
	// Critical Hit number needed on d20 by weapon used
	const crit = shared.chatAttacks[0].critConfirm.options.critical;
	// The Critical Focus feat requires a 19 or higher on the d20 to trigger its Stamina extra
	const critFocus = 19;  
	const d20roll = shared.chatAttacks[0].attack.terms[0].results[0].result;
	// Check value
	if (!d20roll) {
		// d20 roll returned a NULL result, get out
	    ui.notifications.warn(`Your d20 roll had a problem and returned 'null'. Aborting.`);
		throw 'done';
	}
	const d20conf = shared.chatAttacks[0].critConfirm.terms[0].results[0].result;
	// Check value
	if (!d20conf) {
		// d20 confirmation returned a NULL result, get out.
	    ui.notifications.warn(`Your d20 critical confirmation roll had a problem and returned 'null'. Aborting.`);
		throw 'done';
	}
	if (shared.chatAttacks[0].attack.terms[0].results[0].result >= crit) {
		// We have a critcal hit.  Now lookup the Confirmation roll data
		// only care about a critcal hit, look up the number.
		if (shared.chatAttacks[0].critConfirm.terms[0].results[0].result >= critFocus) {
			// Critical Focus stamina extra triggers, call the Action
			const m = game.macros.getName('useAction');
			const result = await m.execute({ My: 'Critical Focus' });
		}
	}
}
// same errors as v1.03
// try using await to set values

v1.05
// Check for values first, then do tests in case a null is returned
if (action.tag == `attack`) {
	// only care about attack events
	debugger;
	// Critical Hit number needed on d20 by weapon used
	const crit = await shared.chatAttacks[0].critConfirm.options.critical;
	// The Critical Focus feat requires a 19 or higher on the d20 to trigger its Stamina extra
	const critFocus = 19;  
	const d20roll = await shared.chatAttacks[0].attack.terms[0].results[0].result;
	// Check value
	if (!d20roll) {
		// d20 roll returned a NULL result, get out
	    ui.notifications.warn(`Your d20 roll had a problem and returned 'null'. Aborting.`);
		throw 'done';
	}
	const d20conf = await shared.chatAttacks[0].critConfirm.terms[0].results[0].result;
	// Check value
	if (!d20conf) {
		// d20 confirmation returned a NULL result, get out.
	    ui.notifications.warn(`Your d20 critical confirmation roll had a problem and returned 'null'. Aborting.`);
		throw 'done';
	}
	if (d20roll >= crit) {
		// We have a critcal hit.  Now lookup the Confirmation roll data
		// only care about a critcal hit, look up the number.
		if (d20conf >= critFocus) {
			// Critical Focus stamina extra triggers, call the Action
			const m = game.macros.getName('useAction');
			const result = await m.execute({ My: 'Critical Focus' });
		}
	}
}
// ok so error is because 'crit' path only exists with a critical hit.
// use `item.system.actions[0].ability.critRange` instead.

v1.06
// Check for values first, then do tests in case a null is returned
if (action.tag == `attack`) {
	// only care about attack events
	debugger;
	// Critical Hit number needed on d20 by weapon used
	const crit = await item.system.actions[0].ability.critRange;
	// The Critical Focus feat requires a 19 or higher on the d20 to trigger its Stamina extra
	const critFocus = 19;  
	const d20roll = await shared.chatAttacks[0].attack.terms[0].results[0].result;
	// Check value
	if (!d20roll) {
		// d20 roll returned a NULL result, get out
	    ui.notifications.warn(`Your d20 roll had a problem and returned 'null'. Aborting.`);
		throw 'done';
	}
	const d20conf = await shared.chatAttacks[0].critConfirm.terms[0].results[0].result;
	// Check value
	if (!d20conf) {
		// d20 confirmation returned a NULL result, get out.
	    ui.notifications.warn(`Your d20 critical confirmation roll had a problem and returned 'null'. Aborting.`);
		throw 'done';
	}
	if (d20roll >= crit) {
		// We have a critcal hit.  Now lookup the Confirmation roll data
		// only care about a critcal hit, look up the number.
		if (d20conf >= critFocus) {
			// Critical Focus stamina extra triggers, call the Action
			const m = game.macros.getName('useAction');
			const result = await m.execute({ My: 'Critical Focus' });
		}
	}
}
// so it can't the 'null' when looking for d20conf
```
script-call-bonus.mjs:62 Script call execution failed
 TypeError: Cannot read properties of null (reading 'terms')
    at Macro.eval (eval at #executeScript (foundry.mjs:45499:16), <anonymous>:19:58)
    at async ItemWeaponPF.executeScriptCalls (script-call-bonus.mjs:59:21)
    at async ActionUse.executeScriptCalls (action-use.mjs:1462:11)
    at async ActionUse.process (action-use.mjs:1732:11)
    at async ActionUse.actionUseProcess (main.mjs:184:12)
 
ItemWeaponPF {links: {…}, actions: Collection(1), scriptCalls: Collection(1), name: '+3 Impact Wounding Cold-iron Greataxe', #validationFailures: {…}, …}
```
// is there an 'exists' option to prevent this?
// run again and check.  Maybe, but I can test `shared.chatAttacks[0].critConfirm` directly for 'null'

// v1.07
// Check for values first, then do tests in case a null is returned
if (action.tag == `attack`) {
	// only care about attack events
	debugger;
	// Critical Hit number needed on d20 by weapon used
	const crit = await item.system.actions[0].ability.critRange;
	// The Critical Focus feat requires a 19 or higher on the d20 to trigger its Stamina extra
	const critFocus = 19;  
	// check 'critConfirm' for 'null'
	// If 'null' then not a critical hit --- we are done
	// If not 'null' we need to know the value.
	// Kind of short circuits the test for critical.  More concise.
	if (!shared.chatAttacks[0].critConfirm) {
		// d20 confirmation returned a NULL result, not a critical hit. Get out.
		throw 'done';
	}
	const d20conf = await shared.chatAttacks[0].critConfirm.terms[0].results[0].result;
	// Check value
	if (d20conf >= critFocus) {
		// Critical Focus stamina extra triggers, call the Action
		const m = game.macros.getName('useAction');
		const result = await m.execute({ My: 'Critical Focus' });
	}
}
// Everything above the macro call itself worked fine.
// Check the args and pass in as string?
```
foundry.mjs:115049 Command failed. Something went wrong. 

VM65029:67 Whatever you did didn't work TypeError: Cannot read properties of undefined (reading 'split')
    at Macro.eval (eval at #executeScript (foundry.mjs:45499:16), <anonymous>:62:25)
    at #executeScript (foundry.mjs:45504:17)
    at Macro.execute (foundry.mjs:45446:35)
    at Macro.eval (eval at #executeScript (foundry.mjs:45499:16), <anonymous>:25:26)
    at async ItemWeaponPF.executeScriptCalls (script-call-bonus.mjs:59:21)
    at async ActionUse.executeScriptCalls (action-use.mjs:1462:11)
    at async ActionUse.process (action-use.mjs:1732:11)
    at async ActionUse.actionUseProcess (main.mjs:184:12)
 undefined
```

// v1.08
// Check for values first, then do tests in case a null is returned
if (action.tag == `attack`) {
	// only care about attack events
	debugger;
	// Critical Hit number needed on d20 by weapon used
	const crit = await item.system.actions[0].ability.critRange;
	// The Critical Focus feat requires a 19 or higher on the d20 to trigger its Stamina extra
	const critFocus = 19;  
	// check 'critConfirm' for 'null'
	// If 'null' then not a critical hit --- we are done
	// If not 'null' we need to know the value.
	// Kind of short circuits the test for critical.  More concise.
	if (!shared.chatAttacks[0].critConfirm) {
		// d20 confirmation returned a NULL result, not a critical hit. Get out.
		throw 'done';
	}
	const d20conf = await shared.chatAttacks[0].critConfirm.terms[0].results[0].result;
	// Check value
	if (d20conf >= critFocus) {
		// Critical Focus stamina extra triggers, call the Action
		const m = game.macros.getName('useAction');
		const result = await m.execute({my: "Critical Focus"});
	}
}
// still no mas.  backburner for now. able to use enrichers in footnotes for now.
// From Freeze #macro-polo:
```
const args_in = {test_data:"xyz"};
const macro = game.macros.get("1HMIrJlvVJVnzyOX");
macro.execute(args_in);
``` 

// v1.09
// Check for values first, then do tests in case a null is returned
if (action.tag == `attack`) {
	// only care about attack events
	debugger;
	// Critical Hit number needed on d20 by weapon used
	const crit = await item.system.actions[0].ability.critRange;
	// The Critical Focus feat requires a 19 or higher on the d20 to trigger its Stamina extra
	const critFocus = 19;  
	// check 'critConfirm' for 'null'
	// If 'null' then not a critical hit --- we are done
	// If not 'null' we need to know the value.
	// Kind of short circuits the test for critical.  More concise.
	if (!shared.chatAttacks[0].critConfirm) {
		// d20 confirmation returned a NULL result, not a critical hit. Get out.
		throw 'done';
	}
	const d20conf = await shared.chatAttacks[0].critConfirm.terms[0].results[0].result;
	// Check value
	if (d20conf >= critFocus) {
		// Critical Focus stamina extra triggers, call the Action
		const m = game.macros.getName('useAction');
		const args = {My:"Critical Focus"};
		const result = await m.execute(args);
	}
}
// not quite there.  seems to want actor first then item
```
foundry.mjs:115049 Actor "undefined" has no item "undefined" 

foundry.mjs:115049 Actor "undefined" has no item "undefined" 
```

// v1.10
// Check for values first, then do tests in case a null is returned
if (action.tag == `attack`) {
	// only care about attack events
	// Critical Hit number needed on d20 by weapon used
	const crit = await item.system.actions[0].ability.critRange;
	// The Critical Focus feat requires a 19 or higher on the d20 to trigger its Stamina extra
	const critFocus = 19;  
	// check 'critConfirm' for 'null'
	// If 'null' then not a critical hit --- we are done
	// If not 'null' we need to know the value.
	// Kind of short circuits the test for critical.  More concise.
	if (!shared.chatAttacks[0].critConfirm) {
		// d20 confirmation returned a NULL result, not a critical hit. Get out.
		throw 'done';
	}
	const d20conf = await shared.chatAttacks[0].critConfirm.terms[0].results[0].result;
	// Check value
	if (d20conf >= critFocus) {
		// Critical Focus stamina extra triggers, call the Action
		const m = game.macros.getName('useAction');
		const args = {actor, my:"critical focus"};
	debugger;
		const result = await m.execute(args);
	}
}

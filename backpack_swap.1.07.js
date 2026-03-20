// async function anonymous(speaker,actor,token,character,scope,item,shared,action,state,startTime

debugger; 
// This is the UUID to the world item `Item.1daHc4ys0Zqv3jne`
// not required -> const idSting = game.items.getName('Sting').id;			// actor.items.getName('Sting').id
// no point in pulling -> const itemSting = fromUuidSync(idSting);				// this pulled nothing as we are looking for world items, not actor ones - poop! ItemWeaponPF
// not needed const idBackpack = actor.items.getName('hidden').id;	// this is the local backpack id
const item = fromUuid(game.items.getName('Sting').id);
const backpack = actor.items.getName('hidden');			// fromUuidSync(idBackpack);  backpack is already local, don't pull from world
await backpack.createContainerContent(game.items.getName('Sting'));	//	this is deprecated as of V12 -> fromCompendium(itemSting));
// this would delete the world Item -> await itemSting.delete();


const item = fromUuid(game.items.getName('Sting').id);
const backpack = actor.items.getName('hidden');
await backpack.createContainerContent(item);
await item.delete();


// @UUID[Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf]
let backpack = fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf');
// @UUID[Item.1daHc4ys0Zqv3jne]  now @UUID[Item.V2l3z5Op2rucqxP3]
const item = game.items.getName("Sting")	// fromUuid('Item.V2l3z5Op2rucqxP3'); // still returns nothing
await backpack.createContainerContent(item);
// await item.delete();


// new 'Sting' in the backpack: `Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf.Item.cT9nD4kavwZnOs4i`
// @UUID[Item.1daHc4ys0Zqv3jne]  now @UUID[Item.V2l3z5Op2rucqxP3]

let backpack = fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf');

let backpack = await actor.items.getName("hidden");
let sting = ``;
let beak = ``;

// See if 'Sting' is on actor
if (actor.items.getName('Sting')) {
	// 'Sting' is on [actor], otherwise check [backpack]
	if (state) {
		// 'Raven' form, 'Sting' goes to [backpack]
		sting = await actor.items.getName('Sting');
	} else {
		// 'Imp' form, 'Sting' is already on [actor]
	};
	
} else if (backpack.items.getName('Sting')) {
	// 'Sting' is in backpack, otherwise use [world]
	if (state) {
		// 'Raven' form, 'Sting' is already in [backpack]
	} else {
		// 'Imp' form, 'Sting' goes to [actor]
		sting = await backpack.items.getName('Sting');
	};
	
} else {
	// get 'Sting' from `world`
	sting = await game.items.getName('Sting');
	if (state) {
		// 'Raven' form, 'Sting' goes to [backpack]
		await backpack.createContainerContent(sting);
	} else {
		// 'Imp' form, 'Sting' goes to [actor]
	};
}

// See if 'Beak' is on actor
if (actor.items.getName('Beak')) {
	// 'Beak' is on [actor], otherwise check [backpack]
	if (state) {
		// 'Raven' form, 'Beak' goes to [actor]
	} else {
		// 'Imp' form, 'Beak' is on [actor]
		beak = await actor.items.getName('Beak');
		await backpack.createContainerContent(beak);
	};
	
} else if (backpack.items.getName('Beak')) {
	// 'Beak' is in backpack, otherwise use [world]
	if (state) {
		// 'Raven' form, 'Beak' goes to [actor]
	} else {
		// 'Imp' form, 'Beak' goes to [backpack]
		beak = await backpack.items.getName('Beak');
	};
	
} else {
	// get 'Beak' from `world`
	beak = await game.items.getName('Beak');
	if (state) {
		// 'Raven' form, 'Beak' goes to [actor]
	} else {
		// 'Imp' form, 'Beak' goes to [backpack]
		await backpack.createContainerContent(beak);
	};
}

// take 'Sting' out of backpack
let sting = await backpack.items.getName("Sting");
await actor.items.createDocument(sting);
await sting.delete();
// put 'Beak' into backpack
const beak = await actor.items.getName("Beak");
await backpack.createContainerContent(beak);
await beak.delete();


v1.06

// debugger;

// 'Sting' in [world]
const backpack = await fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf');
// actor.items.getName('hidden');
const sting = await fromUuidSync('Item.V2l3z5Op2rucqxP3');
// game.items.getName('Sting');

debugger;
await backpack.createContainerContent(sting);
// await actor.update();

v1.07
const backpack = fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf');
const sting = fromUuidSync('Item.V2l3z5Op2rucqxP3');
await backpack.createContainerContent(game.items.fromCompendium(sting));
// this one works

v1.08
// new 'Sting' := Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf.Item.PjuFlkAxAlNWNCg6
const backpack = fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf');
const sting = fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf.Item.PjuFlkAxAlNWNCg6');
await actor.createContainerContent(game.items.fromCompendium(sting));
// this does not work

v1.09
// new 'Sting' := Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf.Item.PjuFlkAxAlNWNCg6
const backpack = fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf');
const sting = await backpack.items.get('PjuFlkAxAlNWNCg6');
await actor.createContainerContent(game.items.fromCompendium(sting));
// nope not this one

v1.10
const backpack = fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf');
const sting = await backpack.items.get('PjuFlkAxAlNWNCg6');
await actor.items.createDocument(game.items.fromCompendium(sting));
// nope

v1.11
const backpack = fromUuidSync('Actor.17YmYWkOEjemH0UL.Item.9NylBzdKAT212NUf');
const sting = await backpack.items.get('PjuFlkAxAlNWNCg6');
await actor.items.createDocument(sting);
// nope

v1.12
const sting = fromUuidSync('Item.V2l3z5Op2rucqxP3');
debugger;
await actor.items.createDocument(game.items.fromCompendium(sting));
// no error, no success

v1.13
const sting = fromUuidSync('Item.V2l3z5Op2rucqxP3');
await actor.items.createDocument(game.items.fromCompendium(sting));
await actor.update();
// throwing the other error again

v1.14 
// variant of 1.07
const backpack = await actor.items.getName('hidden');;
const sting = await game.items.getName('Sting');
await backpack.createContainerContent(game.items.fromCompendium(sting));
// this also works, without fromUuidSync()

v1.15
// try with Beak 
const backpack = await actor.items.getName('hidden');;
const beak = await game.items.getName('Beak');
await backpack.createContainerContent(game.items.fromCompendium(beak));
// yes, this also works

v1.16
// variant of v1.12
const sting = await game.items.getName('Sting');
await actor.collections.items.createDocument(sting);
// nope -> foundry.mjs:23819 Foundry VTT | Error thrown in hooked function '' for hook 'getHeaderControlsApplicationV2'

v1.17
const sting = await game.items.getName('Sting');
await item.parent.items.createDocument(sting);
debugger;
// no error, no effect?

v1.18
const sting = await game.items.getName('Sting');
await item.parent.items.createDocument(game.items.fromCompendium(sting));
// got v1.16 error again

v1.19
const backpack = await actor.items.getName('hidden');;
const beak = await backpack.items.getName('Beak');
const sting = await backpack.items.getName('Sting');
debugger;
// still crap

// foundry.utils.buildUuid(obj)
// .set method wants ( new id, value = obj, obj = Item? ) but _id in obj won't match new id!!!
// foundry.utils.randomID() 
// V2l3z5Op2rucqxP3
// SOOBJjaVsyHPDPPA
// lxPAHA5h6QXcaf9P
// ====================================================================
// .set method wants ( new id, value = obj, obj = Item? ) but _id 
// in obj won't match new id!!!  
// NOTE: This does create an entry in the proper collection (items) but
// so far I have pooched it by putting 'Sting' first which created an
// item with the object JSON as its [key] and nothing as its [value].
// Second attempt with a "made" [key] put the correct [key] but had a
// string ( "26" ) for [value] and 'Sting' as the final object.  Also a
// big oops.
// Both items crashed and locked 'Mandrau'.  Had to restore 'City Streets'
// from backup; restore 'Mandrau' from backup, then it was ok again.

v1.20
const backpack = await actor.items.getName('hidden');;
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
// so .createContainerContent creates a new instance of 'Sting'
// to put into the backpack. yes and no. 'newSting' <> 'sting'
await backpack.createContainerContent(newSting);
// Yes this works

v1.21
const backpack = await actor.items.getName('hidden');;
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
// so .createContainerContent creates a new instance of 'Sting'
// to put into the backpack. yes and no. 'newSting' <> 'sting'
// await backpack.createContainerContent(newSting);
await item.parent.items.set(newId, newSting, Item);
// The 'Item' was ItemBuffPF, wrong one. Also, maybe try direct "down" 
// access using [actor] and 'newSting'
// await actor.items.createDocument(newSting);
```
foundry.mjs:23839 Error: An error occurred while rendering ActorSheetPFNPC 173. e.getRollData is not a function
[Detected 1 package: system:pf1(11.8)]
    at Hooks.onError (foundry.mjs:23838:24)
    at 🎁Hooks.onError#0 (libWrapper-wrapper.js:188:54)
    at foundry.mjs:37303:15Caused by: TypeError: e.getRollData is not a function
[Detected 1 package: system:pf1(11.8)]
    at ActorSheetPFNPC._prepareItem (actor-sheet.mjs:473:59)
    at actor-sheet.mjs:237:57
    at EmbeddedCollection.map (foundry.mjs:5521:24)
    at ActorSheetPFNPC.getData (actor-sheet.mjs:237:38)
    at async ActorSheetPFNPC.getData (npc-sheet.mjs:40:11)
    at async ActorSheetPFNPC._render (foundry.mjs:37346:18)
    at async ActorSheetPFNPC._render (foundry.mjs:38113:5)
    at async ActorSheetPFNPC._render (foundry.mjs:38709:5)
onError @ foundry.mjs:23839
🎁Hooks.onError#0 @ libWrapper-wrapper.js:188
(anonymous) @ foundry.mjs:37303
Promise.catch
render @ foundry.mjs:37301
render @ foundry.mjs:32640
_onUpdateDescendantDocuments @ foundry.mjs:33009
_onUpdateDescendantDocuments @ foundry.mjs:41803
_dispatchDescendantDocumentEvents @ foundry.mjs:32943
#handleUpdateDocuments @ foundry.mjs:58796
await in #handleUpdateDocuments
_updateDocuments @ foundry.mjs:58665
await in _updateDocuments
update @ foundry.mjs:58219
await in update
updateDocuments @ foundry.mjs:12537
update @ foundry.mjs:12649
update @ item-pf.mjs:1145
_updateObject @ foundry.mjs:38896
_updateObject @ item-sheet.mjs:1283
_onSubmit @ foundry.mjs:38208
_onChangeInput @ foundry.mjs:38262
dispatch @ jquery.min.js:2
v.handle @ jquery.min.js:2

foundry.mjs:5728 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading '_id')
[Detected 1 package: system:pf1(11.8)]
    at EmbeddedCollection._initializeDocument (foundry.mjs:5728:29)
    at EmbeddedCollection.initialize (foundry.mjs:5702:24)
    at EmbeddedCollectionField.initialize (foundry.mjs:9874:16)
    at ActorNPCPF._initialize (foundry.mjs:11642:27)
    at ActorNPCPF._initialize (foundry.mjs:14274:11)
    at ActorNPCPF._initialize (foundry.mjs:32377:13)
    at ActorNPCPF._initialize (actor-base.mjs:43:11)
    at ActorNPCPF.reset (foundry.mjs:11671:10)
    at ActorNPCPF.reset (actor-base.mjs:38:11)
    at ActorNPCPF._onDeleteDescendantDocuments (foundry.mjs:41813:102)
    at ActorNPCPF._onDeleteDescendantDocuments (actor-pf.mjs:2501:11)
    at ActorNPCPF._dispatchDescendantDocumentEvents (foundry.mjs:32943:10)
    at ItemBuffPF._dispatchDescendantDocumentEvents (foundry.mjs:32949:14)
    at #handleDeleteDocuments (foundry.mjs:58909:13)
    at async ActiveEffectPF.deleteDocuments (foundry.mjs:12589:21)
    at async ActiveEffectPF.delete (foundry.mjs:12664:21)
```
v1.22
const backpack = await actor.items.getName('hidden');;
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
await actor.items.createDocument(newSting);
```
TypeError: Cannot read properties of undefined (reading '_id')
    at EmbeddedCollection._initializeDocument (foundry.mjs:5728:29)
    at EmbeddedCollection.initialize (foundry.mjs:5702:24)
    at EmbeddedCollectionField.initialize (foundry.mjs:9874:16)
    at ActorNPCPF._initialize (foundry.mjs:11642:27)
    at ActorNPCPF._initialize (foundry.mjs:14274:11)
    at ActorNPCPF._initialize (foundry.mjs:32377:13)
    at ActorNPCPF._initialize (actor-base.mjs:43:11)
    at ActorNPCPF.reset (foundry.mjs:11671:10)
    at ActorNPCPF.reset (actor-base.mjs:38:11)
    at #handleUpdateDocuments (foundry.mjs:58790:13)
    at async ItemBuffPF.updateDocuments (foundry.mjs:12537:21)
    at async ItemBuffPF.update (foundry.mjs:12649:21)
    at async ItemSheetPF._onSubmit (foundry.mjs:38208:7)
```
// lookup .createDocument in API
`createDocument(data: object, context?: object): documents.Item`
// does the contex relate to where we are putting the item?
// such as `actor.collections.items`?  Also it returns 
// `documents.Item` so lets catch that to see what it is
// ===============================
// looks like that locked actor again because I can't update macro
// dump and reload. Scene worked. Actor won't delete.
// Log out and return - yes that did it

// redo v1.23 and v1.24
v1.23
const backpack = await actor.items.getName('hidden') (;;) // typo retry before v1.24
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
let newObj = await actor.items.createDocument(newSting, actor.collections.items);
// caught the double ;; typo. fixed. try again.
// 
```
script-call-bonus.mjs:62 Script call execution failed
 DataModelValidationError: Macro Joint Validation Error:
SyntaxError: must be valid JavaScript for an asynchronous scope:
Unexpected token ';'
    at DataModelValidationFailure.asError (foundry.mjs:5138:12)
    at Macro.validate (foundry.mjs:11741:37)
    at new DataModel (foundry.mjs:11401:10)
    at new ClientDocumentMixin (foundry.mjs:32346:7)
    at new Macro (foundry.mjs:45373:15)
    at ItemScriptCall.getDelegate (script-call-bonus.mjs:80:25)
    at 🎁call_wrapper [as call_wrapper] (libWrapper-wrapper.js:614:14)
    at 🎁pf1.components.ItemScriptCall.prototype.getDelegate#0 (libWrapper-wrapper.js:193:20)
    at ItemScriptCall.execute (script-call.mjs:191:28)
    at ItemBuffPF.executeScriptCalls (script-call-bonus.mjs:59:29)
    at 🎁call_wrapper [as call_wrapper] (libWrapper-wrapper.js:614:14)
    at 🎁pf1.documents.item.ItemPF.prototype.executeScriptCalls#0 (libWrapper-wrapper.js:193:20)
    at ItemBuffPF._onUpdate (item-pf.mjs:1281:12)
    at ItemBuffPF._onUpdate (item-buff.mjs:41:11)
    at foundry.mjs:58784:13
    at foundry.mjs:58791:41
    at Array.map (<anonymous>)
    at #handleUpdateDocuments (foundry.mjs:58791:31)
    at async ItemBuffPF.updateDocuments (foundry.mjs:12537:21)
    at async ItemBuffPF.update (foundry.mjs:12649:21)
    at async ItemSheetPF._onSubmit (foundry.mjs:38208:7) 
ItemBuffPF
```
// looks like it thinks i'm `ItemBuffPF`
// first drop `await`

v1.24
const backpack = await actor.items.getName('hidden');
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
let newObj = actor.items.createDocument(newSting, actor.collections.items);
// warnings but no error. now check sheets.  nope nothing at all

// actor.collections.items.createDocument(newSting, pf1.documents.item.ItemWeaponPF)

v1.25
const backpack = await actor.items.getName('hidden');
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
let newObj = actor.collections.items.createDocument(newSting, pf1.documents.item.ItemWeaponPF);
// threw no errors or warnings. actor still responsive.

v1.26
const backpack = await actor.items.getName('hidden');
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
let newObj = actor.collections.items.createDocument(sting, pf1.documents.item.ItemWeaponPF);
// so this creates `newObj` which is now linked to [actor] in correct collection.
// see if we can change the [_id] to `newId` then save to [actor]

v1.27
const backpack = await actor.items.getName('hidden');
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
let newObj = actor.collections.items.createDocument(sting, pf1.documents.item.ItemWeaponPF);
newObj._id = newId;
await item.parent.items.set(newId, newObj, pf1.documents.item.ItemWeaponPF);
// no errors or warnings.
// so this created an item called 'Sting' in the [actor] inventory but had a problem with [.id]
// need to check collection raw.
// threw this when i checked the UUID
```
Item uuid "Actor.FjTqB6db6GZEljSI.Item.V2l3z5Op2rucqxP3" copied to clipboard. 
foundry.mjs:115049 Cannot read properties of undefined (reading 'id') 
#fetch @ foundry.mjs:115049
notify @ foundry.mjs:114908
error @ foundry.mjs:114948
#handleError @ foundry.mjs:58489
(anonymous) @ foundry.mjs:58472
o.onack @ socket.js:580
o.onpacket @ socket.js:499
I.emit @ index.js:136
(anonymous) @ manager.js:209
Promise.then
R @ globals.js:4
i.ondecoded @ manager.js:208
I.emit @ index.js:136
i.add @ index.js:142
i.ondata @ manager.js:195
I.emit @ index.js:136
i.H @ socket.js:259
I.emit @ index.js:136
i.onPacket @ transport.js:99
i.onData @ transport.js:91
ws.onmessage @ websocket.js:48
foundry.mjs:38211 Error: Cannot read properties of undefined (reading 'id')
    at /D:/Program%20Files/FoundryVTT/Foundry%20Virtual%20Tabletop/resources/app/dist/database/backend/server-backend.mjs:1:5431
    at Array.map (<anonymous>)
    at ServerDatabaseBackend._updateDocuments (/D:/Program%20Files/FoundryVTT/Foundry%20Virtual%20Tabletop/resources/app/dist/database/backend/server-backend.mjs:1:5404)
    at async #try (/D:/Program%20Files/FoundryVTT/Foundry%20Virtual%20Tabletop/resources/app/common/utils/semaphore.mjs:98:17)
_onSubmit @ foundry.mjs:38211
await in _onSubmit
submit @ foundry.mjs:38483
close @ foundry.mjs:38456
close @ foundry.mjs:38646
onclick @ foundry.mjs:37582
(anonymous) @ foundry.mjs:37491
dispatch @ jquery.min.js:2
v.handle @ jquery.min.js:2
```
// it created a full on clone of the world item and did not change the [_.id]
// nope, just created a 'ghost' that disappeared on reload
// try to adjust 'newSting' before .create() and see what happens?

v1.28
const backpack = await actor.items.getName('hidden');
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
newSting.id = newId;

debugger;

let newObj = actor.collections.items.createDocument(newSting, pf1.documents.item.ItemWeaponPF);
await item.parent.items.set(newId, newObj, pf1.documents.item.ItemWeaponPF);
// newObj was created with a null [._id] ???
// newSting took the [.id] no problem... shit not [._id]
// created another 'ghost', reloading.

v1.29
const backpack = await actor.items.getName('hidden');
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
newSting._id = newId;

debugger;

let newObj = actor.collections.items.createDocument(newSting, pf1.documents.item.ItemWeaponPF);
await item.parent.items.set(newId, newObj, pf1.documents.item.ItemWeaponPF);
// properly formed with correct id but still 'ghosting'.  Reload
// now try to update the actor last

v1.30
const backpack = await actor.items.getName('hidden');
const sting = await game.items.getName('Sting');
const newSting = await game.items.fromCompendium(sting);
const newId = foundry.utils.randomID();
newSting._id = newId;
let newObj = actor.collections.items.createDocument(newSting, pf1.documents.item.ItemWeaponPF);
await item.parent.items.set(newId, newObj, pf1.documents.item.ItemWeaponPF);
actor.update();
debugger;
// everything looks correct. reload to check permanence
// threw this as I closed [actor]
```
foundry.mjs:115049 Cannot read properties of undefined (reading 'id') 
foundry.mjs:38211 Error: Cannot read properties of undefined (reading 'id')
    at /D:/Program%20Files/…-backend.mjs:1:5431
    at Array.map (<anonymous>)
    at ServerDatabaseBackend._updateDocuments (/D:/Program%20Files/…-backend.mjs:1:5404)
    at async #try (/D:/Program%20Files/…semaphore.mjs:98:17)
﻿
```
// I was able to make a copy using the sheet so... Reload
// the copy was permanent, creation vanished like a 'ghost'
// mygiveup!



//	========================================================= //
//  author: classicrp, raydenx
//	date: 2025-11-01
const curVer = 'v1.01';
const head = `Macro.impPoisonSaveResult(${curVer}): `;
let msg = '';
let failure = Boolean(false);
//	========================================================= //

const lm = await game.macros.getName('impPoisonCheck');
await lm.execute({ actor: actor, token: token, item: item, state: item.system.active, args: item.flags.dictionary.saves });
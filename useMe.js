// v1.00
//```
//  fromUuid("Macro.Pqx9kFekNaT0Js2u")
//    .then(lm => lm.execute());
//```
// no args yet { token, range: 20 }));
// fromUuidSync does not work
// this works
//
// v1.01
//```
//  const lm = await game.macros.getName('TestMe');
//  const obj = fromUuid("Actor.fiCubZqu4iBxnbuI.Item.8vN7LNawbaFpCLQ5");
//  const args = "{Select Critical Focus from Actor}";
//  lm.execute({args});
//```
// args don't need curly braces in assign only at call
//
// v1.02
//```
//  const lm = await game.macros.getName('useAction');
//  const args = "Select Critical Focus";
//  lm.execute({args});
//```
// still has problems with actor, item not being found
//
// v1.03
//```
//  const lm = await game.macros.getName('useAction');
//  const args = "My: Critical Focus";
//  lm.execute({args});
//```
// still throwing same error;
// `foundry.mjs:115049 Actor "undefined" has no item "undefined"``
//
// v1.04
//```
//  const lm = await game.macros.getName('applyBuff');
//  const args = "Apply Slow to me at 10";
//  lm.execute({args});
//```
// trying the macro I know works as ``@Macro[applyBuff]{args}``
// VM54552:545 Buff Name: "undefined"
// VM54552:338 undefined "Whatever you did didn't work"
//
// v1.05
//```
//  const lm = await game.macros.getName('applyBuff');
//  const buff = "Actor.fiCubZqu4iBxnbuI.Item.rAtlOPS0JR7YiLzo";
//  const args = "Apply ${buff} to me at 10";
//  lm.execute({args});
//```
//
// v1.06
//```  
//  const lm = await game.macros.getName('applyBuff');
//  const buff = "Actor.fiCubZqu4iBxnbuI.Item.rAtlOPS0JR7YiLzo";
//  const args = "Apply " + buff + " to me at 10";
//  lm.execute({args});
//```
// FUCK! What am I doing wrong?
//
// v1.07
//```
//  const lm = await game.macros.getName('applyBuff');
//  const buff = fromUuid("Actor.fiCubZqu4iBxnbuI.Item.rAtlOPS0JR7YiLzo");
//  const args = "Apply " + buff + " to me at 10";
//  lm.execute({args});
//```
// same
// v1.08

  const lm = await game.macros.getName('applyBuff');
  const buff = fromUuid("Actor.fiCubZqu4iBxnbuI.Item.rAtlOPS0JR7YiLzo");
  const args = "Apply " + buff + " to me at 10";
  lm.execute({ args, buff });
  // same error
  
// v1.09

  const lm = await game.macros.getName('applyBuff');
  const buff = fromUuid("Actor.fiCubZqu4iBxnbuI.Item.rAtlOPS0JR7YiLzo");
  const args = "Apply " + buff + " to me at 10";
  lm.execute({ actor, buff, args });
  // same error
  
// v1.10

  const lm = await game.macros.getName('applyBuff');
  const buff = fromUuid("Actor.fiCubZqu4iBxnbuI.Item.rAtlOPS0JR7YiLzo");
  const args = "Apply Slow to me at 10";
  lm.execute({ actor, buff, args });
  // same error
  
// v1.11

  // example: @Macro[applyBuff]{Apply Slow to me at 10}
  // 	`Apply` = get from Compendium if not already on Actor
  // 	`Slow` = name of Spell Buff
  // 	`to me` = apply to Speaker
  // 	`at 10` = set @item.level to 10
  const lm = await game.macros.getName('applyBuff');
  // existing spell buff on character
  const buff = fromUuid("Actor.fiCubZqu4iBxnbuI.Item.rAtlOPS0JR7YiLzo");
  const args = "Apply Slow to me at 10";
  lm.execute({ args });
  // same error
  
const acts = await actor.items.getName('Actions');
const attr = `system.uses.value`;
const lftOvr = 3;
const getOut = false;
// debugger;
if (getOut) {
  throw error('resetActions not working as expected');
}
await acts.update({ [attr]: lftOvr });
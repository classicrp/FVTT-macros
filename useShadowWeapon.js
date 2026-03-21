//  get boolean flag 'shadow_weapon'
//  if not here, then weapon was not "created" yet
//  warn, exit and cancel attack 
const version = '0.0.5';
let rslt = item.getItemBooleanFlags().includes('shadow_weapon');
if (!rslt) {
//debugger
  const msg = `Your ${item.name} is not yet created. Cannot attack.`;
  await item.setItemBooleanFlag('abort');
  shared.reject = true;
  return ui.notifications.warn(msg);
} else {
  await item.removeItemBooleanFlag('abort');
}

return
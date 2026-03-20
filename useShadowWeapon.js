//  get boolean flag 'shadow_weapon'
//  if not here, then weapon was not "created" yet
//  warn, exit and cancel attack 
const rslt = item.getItemBooleanFlags().includes('shadow_weapon');
if (!rslt) {
//debugger
  const msg = `Your ${item.name} is not yet created. Cannot attack.`;
  shared.chatMessage = false;
  return ui.notifications.warn(msg);
}
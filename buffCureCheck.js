const version = '0.1.0';
const show = false;
const verbose = false;

	if (typeof action !== 'undefined') {
		if (action.tag === 'cure') {
			//  buff needs to be removed
			await item.addItemBooleanFlag('cured');
			await item.delete();
		}
	}
return
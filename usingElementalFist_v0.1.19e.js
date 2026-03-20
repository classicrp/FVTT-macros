// version: 0.1.19e
const msg = "@Use[Elemental Fist#Stop]";
const show = true;
let count = 0;
let purge = true;
let rslt = "";

if (show)
	debugger;

let src = Array.from(action.notes.effect);
if (show)
	console.log("src contents:", src);

const hasFlag = actor.itemFlags.boolean.hasOwnProperty('elemental_fist')
if (show)
	console.log("Has boolean flag 'elemental_fist:", hasFlag);

if (hasFlag) {
	if (src.length) {
		// see if our "msg" exists
		await context(src, msg);
		if (show)
			console.log("context:", purge, "count:", count);
		// now check returned values an do something
		rslt = await purgeMatching();
		if (show)
			console.log("result of 'pop':", rslt);
	}
	await src.push(msg);
	if (show)
		console.log("src contents:", src);
	rslt = await action.notes.effect.push(src);
	if (show)
		console.log("result of 'push':", rslt);
	
} else {
	// see if we have the 'effect note' and delete it
	if (src.length) {
		await context(src, msg);
		if (show)
			console.log("context:", purge, "count:", count);
		// now check returned values an do something
		if (count) {
			rslt = await purgeMatching();
			if (show)
				console.log("result of 'pop':", rslt);
			rslt = await action.update({ ['notes.effect']: src });
			if (show)
				console.log("updated item document:", rslt);
		}
	}
}

function context(s, t) {
	for (let i = 0; i < s.length; i++) {
		purge = (purge && (s[i].includes(t)));
		if (purge)
			count++;
	}
	return purge;
}

function purgeMatching() {
	let active = false;
	for (let i = 0; i < src.length; i++) {
		if (src[i].includes(msg) || src[i] === "" ) {
			rslt = delete src[i];
			if (show)
				console.log("result of 'delete':", rslt);
			count--;
			active = true;
		}
	}
	if (active) {
		src.reverse();
		src.pop();
		src.sort();
	}
	return count;
}
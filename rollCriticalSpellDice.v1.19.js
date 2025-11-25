// {actor, character, event, scope, speaker, token}

const curVer = 'v1.19';
const head = `Macro.rollCriticalSpellDice(${curVer}): `;
let msg = '';

const eTime = event.timeStamp;

 debugger;


//	create a pointer to the `ChatMessage` collection
const cmsgs = await game.collections.get("ChatMessage");
//	find the last index of the 0 based collection array
const lmsg = cmsgs.contents.length - 1
//	grab the last chat message
const cmsg = await cmsgs.contents[lmsg];
const cTitle = cmsg.title;
const cActor = cmsg.speaker.actor;
const cScene = cmsg.speaker.scene;
const cToken = cmsg.speaker.token;
const cItem = cmsg.system.item.id;
const cAction = cmsg.system.action.id;


// Build my own collection
let dmgcol = new Collection();		// empty Collection
//	electricity
let valcol = new Collection([['icon', 'ginf-power-lightning'], ['color', 'yellow'], ['shadow', 'blue'], ['alias', 'Electricity']]);
dmgcol.set('electric', valcol);
//	fire
valcol = new Collection([['icon', 'ginf-small-fire'], ['color', 'darkorange'], ['shadow', 'darkred'], ['alias', 'Fire']]);
dmgcol.set('fire', valcol);
//	cold
valcol = new Collection([['icon', 'fas fa-snowflake'], ['color', 'lightblue'], ['shadow', 'snow'], ['alias', 'Cold']]);
dmgcol.set('cold', valcol);
//	acid
valcol = new Collection([['icon', 'ginf-dripping-tube'], ['color', 'lightgreen'], ['shadow', 'darkgreen'], ['alias', 'Acid']]);
dmgcol.set('acid', valcol);
//	force
valcol = new Collection([['icon', 'ginf-comet-spark'], ['color', 'indigo'], ['shadow', 'plum'], ['alias', 'Force']]);
dmgcol.set('force', valcol);
//	air
valcol = new Collection([['icon', 'ginf-cloud-ring'], ['color', 'deepskyblue'], ['shadow', 'aliceblue'], ['alias', 'Air']]);
dmgcol.set('air', valcol);
//	earth
valcol = new Collection([['icon', 'ginf-ore'], ['color', '#506070'], ['shadow', 'sienna'], ['alias', 'Earth']]);
dmgcol.set('earth', valcol);
//	water
valcol = new Collection([['icon', 'ginf-big-wave'], ['color', 'deepseagreen'], ['shadow', 'paleturquoise'], ['alias', 'Water']]);
dmgcol.set('water', valcol);
//	sonic
valcol = new Collection([['icon', 'ginf-lightning-frequency'], ['color', 'deepslateblue'], ['shadow', 'tan'], ['alias', 'Sonic']]);
dmgcol.set('sonic', valcol);
//	good
valcol = new Collection([['icon', 'ginf-explosion-rays'], ['color', 'gold'], ['shadow', 'peru'], ['alias', 'Good']]);
dmgcol.set('good', valcol);
//	evil
valcol = new Collection([['icon', 'ginf-imp'], ['color', 'darkred'], ['shadow', 'plum'], ['alias', 'Evil']]);
dmgcol.set('evil', valcol);
//	death
valcol = new Collection([['icon', 'ginf-skull-bolt'], ['color', 'midnightblue'], ['shadow', 'lightgrey'], ['alias', 'Death']]);
dmgcol.set('death', valcol);
//	poison
valcol = new Collection([['icon', 'ginf-poison-bottle'], ['color', 'darkgreen'], ['shadow', 'greenyellow'], ['alias', 'Poison']]);
dmgcol.set('poison', valcol);
//	magic
valcol = new Collection([['icon', 'ginf-fairy-wand'], ['color', 'blue'], ['shadow', 'peru'], ['alias', 'Magic']]);
dmgcol.set('magic', valcol);

`
            "spellDescriptors": {
X                "acid": "acid",
X                "air": "air",
                "chaotic": "chaotic",
X                "cold": "cold",
                "curse": "curse",
                "darkness": "darkness",
X                "death": "death",
                "disease": "disease",
                "draconic": "draconic",
X                "earth": "earth",
X                "electricity": "electricity",
                "emotion": "emotion",
X                "evil": "evil",
                "fear": "fear",
X                "fire": "fire",
X                "force": "force",
X                "good": "good",
                "languageDependent": "language-dependent",
                "lawful": "lawful",
                "light": "light",
                "meditative": "meditative",
                "mindAffecting": "mind-affecting",
                "pain": "pain",
                "poison": "poison",
                "ruse": "ruse",
                "shadow": "shadow",
X                "sonic": "sonic",
X                "water": "water"

`
//
// access via: `dmgcol.get('electric').get('icon')`
//

const cTime = cmsg.timestamp;
let lastDmgType = cmsg.system.rolls.attacks[0].damage[0].options.damageType[0];
let cAlias = ``;
let cIcon = ``;
let cColor = `white`;
let cShadow = `black`;
//	see if we have a damage type match in our collection
if (dmgcol.has(lastDmgType)) {
	cIcon = dmgcol.get(lastDmgType).get('icon');
	cColor = dmgcol.get(lastDmgType).get('color');
	cShadow = dmgcol.get(lastDmgType).get('shadow');
	cAlias = dmgcol.get(lastDmgType).get('alias');
	lastDmgType = `<span class="${cIcon}" style="color: ${cColor}; text-shadow: 2px 2px 4px ${cShadow};"> </span> ${cAlias}`
}

const lastRolled = cmsg.systemRolls.attacks[0].damage[0]._formula;
let newRoll = await new Roll(lastRolled).evaluate({async: true});
const newDmg = newRoll._total;
const halfDmg = Math.floor(newDmg / 2);
const newResults = newRoll.terms[0].results;
const newSides = newRoll.terms[0]._faces;

const msgHeader = `<div class="pf1 chat-card item-card" data-actor-id="${cActor}" data-item-id="${cItem}" data-token-uuid="Scene.${cScene}.Token.${cToken}" data-action-id="${cAction}"><header class="card-header type-color type-spell flexrow"><h3 class="item-name" style="text-align: center; text-shadow: 2px 2px 4px black; font-weight: normal; font-size: 1.5em;">${cTitle}</h3></header></div>`;
const msgTop = `<div class="dice-roll"><div class="dice-result"><div class="dice-tooltip" style="display: block;"><section class="tooltip-part"><div class="dice">`;
const msgExtra = 	`<div class="chat-attack" data-index="0">
						<section class="attack-damage" >
							<p class="dice-total" style="font-size: 0.9em; text-align: center;"><span style="color:white; text-shadow:2px 2px 4px black;">Damage </span><a class="attack-damage total fake-inline-roll inline-result" data-tooltip="PF1.Total">${newDmg}</a> ${lastDmgType}  
								<a class="inline-action" data-action="applyDamage" data-type data-value="${newDmg}" data-ratio="1" data-tooltip="PF1.ApplyDamage" data-tags>
									<i class="fa-solid fa-hammer" style="color: ${cColor}" inert></i>
									<i class="absolute fa-solid fa-plus"  style="color: ${cColor}" inert></i>
								</a>  
								<a class="inline-action" data-action="applyDamage" data-type data-value="${halfDmg}" data-ratio="0.5" data-tooltip="PF1.ApplyHalf" data-tags>
									<i class="fa-solid fa-hammer" style="color: ${cColor}" inert></i>
									<i class="absolute" style="color: ${cColor}" inert>½</i>
								</a>
							</p>
						</section>
					</div>`;
					
const msgBot = `</ol></div></section></div></div></div>`;
let msgMid = `<ol class="dice-rolls">`;
// debugger;

//  build msgMid section of dice output
newResults.forEach(o => {
	msgMid +=  `<li class="roll die d${newSides}" style="transform: scale(1.1);margin-right: 4px">${o.result}</li>`;
});

let ChatData={
	// let the roll take part as a roll of the actor. If speaker ist deleted then the roll takes place as the player.
	speaker: cmsg.speaker.actor,
	// This was asked for by the Dice so Nice API. Currently not clear what it exactly does
	type: CONST.CHAT_MESSAGE_TYPES.ROLL,
	// Rolls a pool of dice/diceterms. If more than one diceterm/dices are rolled then an array of objects needs to be defined --> [r1,r2,r3]
	rolls: [newRoll],
	// This was asked for by the Dice so Nice API. Currently not clear what it exactly does
	rollMode: game.settings.get("core", "rollMode"),
	// Create HTML template for Chat message output. Each Dice in the dice term is an object in an array thus we need to address it with newRoll.dice[x]. Remember: arrays start with an index of 0 in java script
	content: msgHeader + msgTop + msgExtra + msgMid + msgBot
}
// Create the Chat message
ChatMessage.create(ChatData);
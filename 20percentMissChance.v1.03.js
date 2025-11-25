//Create a roll term with flavor text and execute the roll. Wait for the result and make the roll async.
// Note: Instead of "evaluate" --> "roll" can be used they seem identical 
let dies = await new Roll("1d100[black]").evaluate({async: true});
const missCh = 20;
const success = (dies.dice[0].results[0].result >= missCh)
let state = "";
let col = 'black';

if (success) {
	state = 'success';
	col = 'cornflowerblue';
} else {
	state = 'failure';
	col = 'darkred';
}

// Create a html based Chat message which will be outputed.
let ChatData = {
	// let the roll take part as a roll of the actor. If speaker ist deleted then the roll takes place as the player.
	speaker: ChatMessage.getSpeaker({token: actor}),
	// This was asked for by the Dice so Nice API. Currently not clear what it exactly does
	type: CONST.CHAT_MESSAGE_TYPES.ROLL,
	// Rolls a pool of dice/diceterms. If more than one diceterm/dices are rolled then an array of objects needs to be defined --> [r1,r2,r3]
	rolls: [dies],
	// This was asked for by the Dice so Nice API. Currently not clear what it exactly does
	rollMode: game.settings.get("core", "rollMode"),
	// Create HTML template for Chat message output. Each Dice in the dice term is an object in an array thus we need to adress it with dies.dice[x]. Remember: arrays start with an index of 0 in java script
	content:`
	<span class="flavor-text">${missCh}% Miss Chance</span>
	<div class="dice-roll" data-action="expandRoll">
		<div class="dice-result">
			<h4 class="roll-total dice-total has-details ${state} data-natural="${dies.dice[0].results[0].result}" data-dc="${missCh}" data-total="${dies.dice[0].results[0].result}"><i class="fa-solid fa-dice-d20" inert></i>${dies.dice[0].results[0].result} </h4>
			<div class="dice-tooltip" style="display: block">
				<div class="wrapper">
					<section class="tooltip-part">
						<div class="dice">								
							<header class="part-header flexrow">
								<span class="part-formula">1d100</span><span class="part-success" style="color: ${col}">&nbsp;&nbsp;&nbsp;&nbsp;<strong>${state}</strong></span><span class="part-flavor ">Check</span><span class="part-total">${dies.dice[0].results[0].result}</span>
							</header>
						</div>
					</section>
				</div>
			</div>
		</div>
	</div> `
}
// Create the Chat message
ChatMessage.create(ChatData);

/*  As a Chat Macro
<h4 style="font-family: Arial, sans-serif; font-size: 1.0em;"><b>20% Miss Chance</b></h4>
<p style="font-family: Arial, sans-serif; font-size: 1.3em"><b>[[/r 1d100]]{Roll 1d100}</b></p>
*/

/*
							<ol class="dice-rolls">
								<li class="roll die d100" style="transform: scale(1.1);margin-right: 4px">${dies.dice[0].results[0].result}</li>
							</ol>
*/
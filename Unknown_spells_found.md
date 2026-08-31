#	Unknowns Spells Found
```
Pack: "pf1.class-abilities"
Feature: "Aether Elemental School"
Level: 2
Spell: "spiritual weaponlife pact"

	INVESTIGATION
	SOURCE		CONTENT
	======		=======
	AoNPRD		"2nd - ablative barrier, blur, pilfering hand, spiritual weapon"
	
	PF1 		"2nd - ablative barrier, blur, pilfering hand, spiritual weaponlife pact, 
					protection from arrows, squeeze, web, whispering wind"
	
Issue: 			"life pact, protection from arrows, squeeze, web, whispering wind" is excess text.
Recommend:		List should terminate after "spiritual weapon".

Pack: "pf1.class-abilities"
Feature: "Fire Elemental School"
Level: 9
Spell: "firey body"

	INVESTIGATION:
	SOURCE		CONTENT
	======		=======
	AoNPRD	 	"9th - firey body, gate, meteor swarm"
	
	PF1 		"9th - firey body, gate, meteor swarm"`
	
Issue: 			Both match, so likely the spell itself is mis-named. Checking... Nope.
				Spell is "fiery body" so both AONPRD and PF1 are misspelled.	
Recommend:		Rename "firey body" as "fiery body" in lists.

Pack: "pf1.class-abilities"
Feature: "Void Elemental School"
Level: 2
Spell: "share memorypact"

	INVESTIGATION:
	SOURCE		CONTENT
	======		=======
	AoNPRD	 	"2nd - continual flame, haunting mists, invisibility, masterwork 
					transformation, see invisibility, share memory"
					
	PF1 		"2nd - continual flame, haunting mists, invisibility, masterwork 
					transformation, see invisibility, share memorypact, protection 
					from arrows, squeeze, web, whispering wind"
					
Issue:	 		"pact, protection from arrows, squeeze, web, whispering wind" is excess text.
Recommend:		List should terminate after "share memory".

Pack: "pf1.class-abilities"
Feature: "Void Elemental School"
Level: 3
Spell: "tapestry's embrace"

	INVESTIGATION:
	SOURCE		CONTENT
	======		=======
	AoNPRD	 	"3rd - arcane sight, clairaudience/clairvoyance, dispel magic, 
					nondetection, seek thoughts, tapestry's embrace, twilight knife"
					
	PF1			"3rd - arcane sight, clairaudience/clairvoyance, dispel magic, 
					nondetection, seek thoughts, tapestry's embrace, twilight knife"
					
Issue:			Both lists match, so let's look at the spell.  Hmm, no such spell exists in 
				pf1.spells nor on AoNPRD but shows in both lists.  It took some more digging 
				but I found a reference on d20PFSRD.
```
[*Editor’s Note](https://www.d20pfsrd.com/classes/core-classes/wizard/arcane-schools/paizo-arcane-schools/elemental-arcane-schools/void-elemental-school/)		
> "The spell listed as tapestry’s embrace doesn’t seem to exist, and it has been suggested that the spell call the void was originally called that name and was	changed in editing. GMs are encouraged to use call the void as a 3rd-level Void Elementalist wizard spell.
```
Recommend:		Change spell from "tapestry's embrace" to "call of the void".
```

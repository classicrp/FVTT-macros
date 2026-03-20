await resetMove();
if (action.tag == 'mvStep') {
    // nothing to activate
} else if (action.tag == `mvWalk`) {
    // nothing to activate
} else if (action.tag == `mvRun`) {
    // nothing to activate
} else if (action.tag == `mvCrawl`) {
    // go prone
    await actor.toggleCondition('prone', {active: true});
} else if (action.tag == `mvClimb`) {
    // nothing to activate
} else if (action.tag == `mvBurrow`) {
    // indicate burrowing
    await actor.toggleCondition('burrowing', {active: true});
} else if (action.tag == `mvFly`) {
    // indicate flying
    await actor.toggleCondition('flying', {active: true});
} else if (action.tag == `mvSwim`) {
    // indicate swimming
    await actor.toggleCondition('swimming', {active: true});
  // actor.toggleStatusEffect('bleeding', true);
};


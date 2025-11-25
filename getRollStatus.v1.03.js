// function getRollStatus(total, roll, target) {
	/*  <total> passed in. total roll of dice.
		<roll> passed in. the actual die roll.
		<target> passed in.  the target to compare the total roll against.
		<saved> passed in.  not sure if it will transfer data back via pass-thru
		returns: a string. { "CS, "S", "F", "CF" }
	*/
	var getRS = {
		success: true, 
		amount: ""
	}; 
	if (total >= target) {
	//	Success, now see how good it was
		if (roll == 20) {
		//	Critical Success
			getRS.amount = "CS";
		} else if (roll != 1) {
		//	Success
			getRS.amount = "S";
		} else {
		//  Critical Failure but Success = Failure
			getRS.amount = "F";
			getRS.success = false;
		};
	} else {
	//  Failure, now see how bad it was
		if (roll == 20) { 
		//  Failure but Critical Success = Success
			getRS.amount = "S";
		} else if (roll != 1) {
		//	Failure
			getRS.amount = "F";
			getRS.success = false;
		} else {
		//  Critical Failure
			getRS.amount = "CF"
			getRS.success = false;
		};			
	};
	return getRS;
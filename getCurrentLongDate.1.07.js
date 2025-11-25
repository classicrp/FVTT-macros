/*	==========================================================================
	author: classicrp, raydenx
	date: 2025-11-09
	==========================================================================
	<style> is a string arg passed in to determine the output format.
	returns: formatted string date

	result.formatter.calendar.dateFormats.absolom
	'{{ss-day format="ordinal"}} {{ss-month format="name"}}, {{year}} AR'
	Thanks: to @rayners, Discord::FVTT#modules who pointed out the im-
	plementing part `cdate.formatter.format(cdate, template);`
*/
const curVer = 'v1.06';
const head = `Macro.getCurrentLongDate(${curVer}): `;
let msg = '';
let failure = Boolean(false);


const cdate = await SeasonsStars.api.getCurrentDate();
const template = cdate.formatter.calendar.dateFormats.absalom;
const formattedDate = cdate.formatter.format(cdate, template);
console.log(formattedDate);

const sYear = cdate.getYearString();
const sMonth = cdate.getMonthName();
const sWeekday = cdate.getWeekdayName();
const sDay = cdate.getDayString();
let sNum = ''
if (sDay == 1 || sDay == 21 || sDay == 31) {
//	'st'
	sNum = 'st';
} else if (sDay == 2 || sDay == 22 || sDay == 32) {
//	'nd';
	sNum = 'nd';
} else if (sDay == 3 || sDay == 23 || sDay == 33) {
	sNum = 'rd';
} else {
//	the rest
	sNum = 'th';
};

const sTime = cdate.getTimeString();
const sHour = cdate.time.hour;
const sMin = cdate.time.minute;

let sQuarter = '';
if (sMin >= 46 && sMin <= 57) {
//	46-57, last quarter
	sQuarter = 'Last quarter of ';
} else if (sMin >= 33 && sMin <= 45) {
//	33-45, third quarter
	sQuarter = 'Third quarter of ';
} else if (sMin >= 28 && sMin <= 32) {
//	30, half past
	sQuarter = 'Half past ';
} else if (sMin >= 16 && sMin <= 27) {
//	16-27, second quarter
	sQuarter = 'Second quarter of ';
} else if (sMin >= 3 && sMin <= 15) {
//	03-15, first quarter
	sQuarter = 'First quarter of ';
} else {
//	00, Top of the hour
//	sQuarter = 'Top of ';
	sQuarter = '';
};

let mHr = '';
if (sHour > 12) {
// x bells after noon
	const sHr = sHour - 12;
    if (sHr == 1) {
		mHr = `${sHr} bell after noon`;  
    } else {
		mHr = `${sHr} bells after noon`;
    };
} else if (sHour == 12) {
//	noon
	mHr = `noon`;
} else if (sHr == 0) {
//	midnight
	mHr = `midnight`;
} else {
// x bells after midnight
    if (sHour == 1) {
		mHr = `${sHour} bell after midnight`;  
    } else {
		mHr = `${sHour} bells after midnight`;
    };
};

msg = `<p style="font-family: Amiri, sans-serif; font-size: 0.9em;"><em>${sQuarter}${mHr} on ${sWeekday} the ${sDay}<super>${sNum}</super> day of ${sMonth}, ${sYear}<em></p>`;
/* console.log(msg);
ui.chat.processMessage(msg); */


return msg;
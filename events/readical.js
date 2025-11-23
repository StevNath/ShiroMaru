const ICAL = require("ical.js");
const fetch = require("node-fetch");

async function readIcal(url) {
    const res = await fetch(url);
    const data = await res.text();

    const jcalData = ICAL.parse(data);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    return vevents.map(ev => {
        const event = new ICAL.Event(ev);
        return {
            summary: event.summary,
            start: event.startDate.toJSDate(),
            end: event.endDate.toJSDate()
        };
    });
}

module.exports = { readIcal };

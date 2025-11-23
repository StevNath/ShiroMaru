const ICAL = require("ical.js");

export async function readIcal(url) {
    const text = await (await fetch(url)).text();

    const jcal = ICAL.parse(text);
    const comp = new ICAL.Component(jcal);
    const vevents = comp.getAllSubcomponents("vevent");

    const merged = {};

    vevents.forEach(v => {
        const ev = new ICAL.Event(v);

        const baseName = ev.summary.replace(/\s+(opens|closes)$/i, "").trim();

        if (!merged[baseName]) {
            merged[baseName] = { summary: baseName };
        }

        if (/opens$/i.test(ev.summary)) {
            merged[baseName].start = ev.startDate.toJSDate();
        }

        if (/closes$/i.test(ev.summary)) {
            merged[baseName].end = ev.endDate.toJSDate();
        }
    });

    return Object.values(merged);
}

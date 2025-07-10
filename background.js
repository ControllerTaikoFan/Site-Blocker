let scheduleTimes = []; // scheduleTimes are stored in format: ["startHour:startMinute", "endHour:endMinute"]
let scheduleDays = []; // schedule days correspond to their index counterpart in schedules. days stored 0-6 with sunday being first and saturday being last.
// schedule days is the list of days which the schedule will be active.
let overridden = "";
let blockedLinks = Array();
let switchedOn = false;

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {

    chrome.storage.local.set({ links: [], on: true, scheduleTimes: [], scheduleDays: [], overridden: false, password: "" });

    chrome.tabs.create({
      url: "/mainpage/mainpage.html"
    });
  }
});

(async () => { // upon startup
  let result = await chrome.storage.local.get(["overridden", "scheduleTimes", "scheduleDays", "on", "links"]);
  overridden = result.overridden;
  scheduleTimes = result.scheduleTimes;
  scheduleDays = result.scheduleDays;
  switchedOn = result.on;
  blockedLinks = result.links;
})();



function inSchedule() {
  if (overridden) {
    return true;
  }

  if (scheduleTimes.length <= 0) {
    return true;
  }

  let date = new Date();
  let day = date.getDay();
  let hour = date.getHours();
  let minute = date.getMinutes();
  for (let i = 0; i < scheduleTimes.length; i++) {
    let currentSchedule = scheduleTimes[i];
    //console.log(scheduleDays[i].includes(day))
    
    if ((scheduleDays[i].includes(day))) {
      let startHour = Number(currentSchedule[0].split(":")[0]);
      let endHour = Number(currentSchedule[1].split(":")[0]);

      let startMinute = Number(currentSchedule[0].split(":")[1]);
      let endMinute = Number(currentSchedule[1].split(":")[1]);

      if (hour >= startHour && hour <= endHour) {
        if (hour == endHour) {
          if (minute < endMinute) {
            return true;
          }
        }
        else if (hour == startHour) {
          if (minute > startMinute) {
            return true;
          }
        }
        else { // hour is inbetween
          return true;
        }
      }
    }
  }

  return false;
}


chrome.runtime.onMessage.addListener(async function () { // message recieved from mainpage.js
  let result = await chrome.storage.local.get(["overridden", "scheduleTimes", "scheduleDays", "on", "links"]);
  overridden = result.overridden;
  scheduleTimes = result.scheduleTimes;
  scheduleDays = result.scheduleDays;
  switchedOn = result.on;
  blockedLinks = result.links;
});

chrome.tabs.onUpdated.addListener(function () { // when tab is opened/closed
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    if (switchedOn) {
        if (inSchedule()) {
          // blocking procedure begins
          if (blockedLinks.length !== 0) { // if there are links in blockedLinks
            for (let i = 0; i < blockedLinks.length; i++) {
              if (url.includes(blockedLinks[i])) { // if url in blocklist
                chrome.tabs.update({ url: "/blockscreen/blockscreen.html" });
              }
            }
          }
        }
      
    }
  });
});
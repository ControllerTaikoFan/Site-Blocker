chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    let linky = Array();
    chrome.storage.local.set({ links: linky }).then(() => {
      console.log("Value is set to " + linky);
      chrome.storage.local.set({ on: true }).then(() => {
        console.log("Value is set to " + true);

      });
      let schedule = Array();
      chrome.storage.local.set({ schedules: schedule }).then(() => {
        chrome.storage.local.set({ scheduleDays: [] }).then(() => {
          chrome.storage.local.set({ overridden: false });
        });
      });

      chrome.tabs.create({
        url: "/notpopup/notpopup.html"

      });
    });

  }
});



var schedules = []; // schedules are stored in format: ["startHour:startMinute", "endHour:endMinute"]
var scheduleDays = []; // schedule days correspond to their index counterpart in schedules. days stored 0-6 with sunday being first and saturday being last.
// schedule days is the list of days which the schedule will be active.
var overridden = "";
chrome.storage.local.get(["overridden"]).then((result) => {
  overridden = result.overridden;
});
chrome.storage.local.get(["schedules"]).then((result) => {
  schedules = result.schedules;
  chrome.storage.local.get(["scheduleDays"]).then((result) => {
    scheduleDays = result.scheduleDays;
  });
});


function inSchedule() {





  if (overridden) {
    console.log("schedule overridden. inschedule has returned true")
    return true;
  }
  else {
    console.log("schedule is not overridden. proceeding with schedule checking procedure")
    chrome.storage.local.get(["schedules"]).then((result) => {
      schedules = result.schedules;
      chrome.storage.local.get(["scheduleDays"]).then((result) => {
        scheduleDays = result.scheduleDays;
      });
    });
    if (schedules.length > 0) {
      let date = new Date();
      let day = date.getDay();
      let hour = date.getHours();
      let minute = date.getMinutes();
      for (let i = 0; i < schedules.length; i++) {
        let currentSchedule = schedules[i];
        console.log("starting schedule loop")
        console.log(scheduleDays[i])
        console.log(currentSchedule)
        if ((scheduleDays[i].includes(day))) {
          console.log("scheduledays confirmed to include current day")
          let startHour = Number(currentSchedule[0].split(":")[0]);
          let startMinute = Number(currentSchedule[0].split(":")[1]);
          let endHour = Number(currentSchedule[1].split(":")[0]);
          let endMinute = Number(currentSchedule[1].split(":")[1]);
          console.log(startHour + ":" + startMinute)
          console.log(endHour + ":" + endMinute)
          console.log(hour + ":" + minute)
          if (hour >= startHour && hour <= endHour) { // im having a fucking aneurysm right now god i hope this works
            console.log("current hour is greater than or equal to the start hour AND less than or equal to the end hour")
            if (hour == startHour && (startHour !== endHour)) {
              console.log("detected to be the start hour")
              if (minute > startMinute) {
                console.log("current minute is greater than the start minute; returns true, blocked")
                return true;
              }
            }
            else if (hour == endHour) {
              console.log("current hour is detected to be end hour")
              if (minute < endMinute) {
                console.log("current minute is less than the end minute; return true, blocked")
                return true;
              }
            }
            else {
              console.log("hour is neither the start hour nor the end hour, return true, blocked")
              return true;
            }
          }
        }
        console.log("schedule has not passed all tests. looping back.")
      }
      console.log("current time does not apply to any of the schedules; return false, not blocked")
      return false;

    }





    else {
      console.log("no schedules detected, checking again")
      chrome.storage.local.get(["schedules"]).then((result) => {
        schedules = result.schedules;
        chrome.storage.local.get(["scheduleDays"]).then((result) => {
          scheduleDays = result.scheduleDays;
        });
      });
      if (schedules.length > 0) {
        let date = new Date();
        let day = date.getDay();
        let hour = date.getHours();
        let minute = date.getMinutes();
        for (let i = 0; i < schedules.length; i++) {
          let currentSchedule = schedules[i];
          console.log("starting schedule loop")
          if ((scheduleDays[i].includes(day))) {
            console.log("scheduledays confirmed to include current day")
            let startHour = Number(currentSchedule[0].split(":")[0]);
            let startMinute = Number(currentSchedule[0].split(":")[1]);
            let endHour = Number(currentSchedule[1].split(":")[0]);
            let endMinute = Number(currentSchedule[1].split(":")[1]);
            if (hour >= startHour && hour <= endHour) { // im having a fucking aneurysm right now god i hope this works
              console.log("current hour is greater than or equal to the start hour AND less than or equal to the end hour")
              if (hour == startHour && (startHour !== endHour)) {
                console.log("detected to be the start hour")
                if (minute > startMinute) {
                  console.log("current minute is greater than the start minute; returns true, blocked")
                  return true;
                }
              }
              else if (hour == endHour) {
                console.log("current hour is detected to be end hour")
                if (minute < endMinute) {
                  console.log("current minute is less than the end minute; return true, blocked")
                  return true;
                }
              }
              else {
                console.log("hour is neither the start hour nor the end hour, return true, blocked")
                return true;
              }
            }
          }
          console.log("schedule has not passed all tests. looping back.")
        }
        console.log("current time does not apply to any of the schedules; return false, not blocked")
        return false;
      }
      console.log("confirmed no schedules. allowing block")
      return true;

    }
  }
}







var linky = Array();
var switchedon = false;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.statusChanged) {
    chrome.storage.local.get(["on"]).then((result) => {
      if (result.on) {
        switchedon = true;
      }
      else {
        switchedon = false;
      }
    }
    )
  };
  if (message.scheduleChanged) {
    chrome.storage.local.get(["schedules"]).then((result) => {
      schedules = result.schedules;
      chrome.storage.local.get(["scheduleDays"]).then((result) => {
        scheduleDays = result.scheduleDays;
      });
    });

  }
  if (message.overrideChanged) {
    chrome.storage.local.get(["overridden"]).then((result) => {
      overridden = result.overridden;
    });
  }
});



chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    chrome.storage.local.get(["on"]).then((result) => {
      if (result.on) {
        console.log("dowejn")
        console.log(inSchedule())
        if (inSchedule()) {
          console.log("inschedule has returned true. beginning blocking procedure")
          chrome.storage.local.get(["links"]).then((result) => {
            linky = result.links;
            if (url.includes("chrome-extension://")) {
              console.log("current url is a chrome extension url. ignoring.")
            }
            else {
              if (linky.length !== 0) {
                console.log("there are links currently being blocked. beginning loop.")
                for (i = 0; i <= linky.length; i++) {
                  console.log("starting link loop")
                  if (url.includes(linky[i])) {
                    console.log("current url is in blocklist, blocking")
                    chrome.tabs.update({
                      url: "/blockscreen/L.html"
                    });


                  }
                }
              }

            }
          });
        }

      }
    });
  });
});

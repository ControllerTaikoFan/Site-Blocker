body = document.getElementById("main");
let password = "";
let passwordScreen = document.getElementById("passwordscreen");
(async () => {
  let result = await chrome.storage.local.get(["password"]);
  password = result.password;
  if (password != "") {
    body.style.display = "none";
    passwordScreen.style.display = "block";
  }
})();



let blockedLinks = Array(); // make empty array
(async () => {
  let result = await chrome.storage.local.get(["links"])
  blockedLinks = result.links;
  if (blockedLinks.length == 0) {
    document.getElementById("linklist").innerHTML = "no links added yet :)";
  }
  else {
    displayLinks();
  }
})();
// these are 2d arrays, each item in the array representing one schedule. 
let scheduleTimes = Array(); // stored in format [[startTime, endTime], [startTime, endTime]]
let scheduleDays = Array(); // stores the days of the week (0-6 for sunday - saturday respectively) that each schedule contains. ex: [0, 1, 6] for sunday, monday, friday

let daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

(async () => {
  let result = await chrome.storage.local.get(["scheduleTimes", "scheduleDays"]);
  scheduleTimes = result.scheduleTimes;
  scheduleDays = result.scheduleDays;
  if (scheduleTimes.length == 0) {
    document.getElementById("schedules").innerHTML = "no schedules added yet :)";
  }
  else {
    displaySchedules();
  }
})();

let seton = false
async function checkForStatus() {
  let result = await chrome.storage.local.get(["on"]) // get on from storage
  document.getElementById("checkbox").checked = result.on; // change the switch to switched
  seton = result.on;

}

checkForStatus()

chrome.runtime.onMessage.addListener(function (message) { // when message recieved
  if (message.statusChanged) { // if the message is statusChanged, check the status
    checkForStatus();
  }
});

document.getElementById("checkbox").addEventListener("click", toggleOnOff);
document.getElementById("enter-button").addEventListener("click", addLink);

class Item {
  constructor(itemValue) {
    this.itemValue = itemValue;
  }
  addElements(elementID, itemText, days) {
    let self = this; // scope is lost if self is not declared
    let xButton = this.itemValue + "xButton"; // declare a variable different from the item but still easily callable
    let listSpace = document.getElementById(elementID);
    listSpace.appendChild(Object.assign(document.createElement("div"), { id: this.itemValue })); // make a div in linklistspace
    let itemDiv = document.getElementById(this.itemValue); // store the new div in a variable to put everything in a single div for easier removal
    itemDiv.appendChild(Object.assign(document.createElement("p"), { style: 'display:inline-block', innerHTML: itemText })); // make a p tag with the text being the link
    itemDiv.appendChild(Object.assign(document.createElement("pre"), { style: 'display:inline-block', innerHTML: " " })); // add space between p tag and button
    itemDiv.appendChild(Object.assign(document.createElement("button"),
      { innerHTML: "<img src =\"/images/x.png\" width = \"10px\" height = \"10px\" style = \"padding:0px\">", id: xButton }));  // add button
      console.log(xButton);
    document.getElementById(xButton).style = "background-color:transparent; border-style:none";
    itemDiv.appendChild(Object.assign(document.createElement("br")));

    document.getElementById(xButton).addEventListener("mouseover", function () {
      document.getElementById(xButton).firstChild.src = "/images/xhover.png";
    });
    document.getElementById(xButton).addEventListener("mouseout", function () {
      document.getElementById(xButton).firstChild.src = "/images/x.png";
    });
    if (elementID === "linklist") {
      document.getElementById(xButton).addEventListener("click", function () { // when the new button is clicked
        itemDiv.remove(); // hide the new div
        removeLink(String(self.itemValue)); // remove the link from blockedLinks 
      });

    } else if (elementID === "schedules") {
      document.getElementById(xButton).addEventListener("click", function () { // when the new button is clicked
        itemDiv.remove(); // hide the new div
        removeSchedule(self.itemValue, days);
      });
    }

  }
}

class ScheduleItem extends Item {
  constructor(times, days) {
    super([times, days].toString());
    this.times = times;
    this.days = days;
    console.log(this.itemValue);
  }
  addElements() {
    let addedDays = [];
    for (let i = 0; i < daysOfTheWeek.length; i++) {
      if (this.days.includes(i)) {
        addedDays.push(" " + daysOfTheWeek[i]);
      }
    }
    let elementID = "schedules";
    let itemText = "Block from&nbsp;" + this.times[0] + "&nbsp;to&nbsp;" + this.times[1] + "&nbsp;on" + addedDays;
    super.addElements(elementID, itemText, this.days);
  }
}





function displaySchedules() {
  let scheduleClasses = Array(); // make empty array
  for (i = 0; i < scheduleTimes.length; i++) {  // repeat the length of schedule
    scheduleClasses.push(new ScheduleItem(scheduleTimes[i], scheduleDays[i])); // put link classes into an array
    scheduleClasses[i].addElements();
  }
}


async function removeSchedule(itemValue, days) {
  itemValue = itemValue.split(",");
  let schedule = [itemValue[0], itemValue[1]];
  let index = -1
  for (let i = 0; i < scheduleTimes.length; i++) { // find index of the schedule
    if (scheduleTimes[i][0] == schedule[0] && scheduleTimes[i][1] == schedule[1]) {
      if (days.length !== scheduleDays[i].length) {
        continue;
      }
      let daysEquivalent = true;
      for (let j = 0; j < days.length; j++) {
        if (scheduleDays[i][j] !== days[j]) {
          daysEquivalent = false;
        }
      }
      if (daysEquivalent) {
        index = i;
        break;
      }
      
    }
  }
  // get index of the input link

  if (index > -1) { // index of the link will be -1 if it does not exist in the array; added as a failsafe
    scheduleTimes.splice(index, 1); // remove index 1
    scheduleDays.splice(index, 1);
    await chrome.storage.local.set({ scheduleTimes: scheduleTimes });
    await chrome.storage.local.set({ scheduleDays: scheduleDays });
    await chrome.runtime.sendMessage({ scheduleChanged: true });
    if (schedule.length == 0) {
      document.getElementById("schedules").innerHTML = "no schedules added yet :)";
    }
  }

}





class ListItem extends Item {
  addElements() {
    let elementID = "linklist"
    let itemText = this.itemValue;
    super.addElements(elementID, itemText, 0);
  }
}



function displayLinks() {
  let linkClasses = Array(); // make empty array
  for (i = 0; i < blockedLinks.length; i++) {  // repeat the length of blockedLinks
    linkClasses.push(new ListItem(blockedLinks[i])); // put link classes into an array
    linkClasses[i].addElements();

  }
}

async function removeLink(link) {
  console.log(link);
  let index = blockedLinks.indexOf(link); // get index of the input link
  if (index > -1) { // index of the link will be -1 if it does not exist in the array; added as a failsafe
    blockedLinks.splice(index, 1); // remove index 1
    chrome.storage.local.set({ links: blockedLinks }); // update links in chrome storage
    chrome.runtime.sendMessage({ scheduleChanged: true });
    if (blockedLinks.length == 0) {
      document.getElementById("linklist").innerHTML = "no links added yet :)";
    }
  }

}

async function addLink() {
  let new_link = document.getElementById("link");
  new_link = new_link.value.trim();
  if (new_link == "") {
    document.getElementById("message").innerHTML = "Please enter a link.";
    return;
  }
  if (!new_link.includes(".")) {
    document.getElementById("message").innerHTML = "Please enter a valid website or URL.";
    return;
  }
  if (blockedLinks.includes(new_link)) {
    document.getElementById("message").innerHTML = "This link is already on the block list!";
    return;
  }

  blockedLinks.push(new_link); // add new link to blockedLinks
  document.getElementById("message").innerHTML = new_link + "&nbsp;has been added to blocked sites.";
  await chrome.storage.local.set({ links: blockedLinks });
  await chrome.runtime.sendMessage({ statusChanged: true });
  if (blockedLinks.length == 1) {
    document.getElementById("linklist").innerHTML = "";
  }
  let newItem = new ListItem(new_link);
  newItem.addElements();

  document.getElementById("link").value = "";
}


async function toggleOnOff() {
  seton = !seton;
  await chrome.storage.local.set({ on: seton });
  chrome.runtime.sendMessage({ statusChanged: true });
}

// deal with schedule inputs

class DayButton {
  constructor(element, day) {
    this.element = element;
    this.day = day;

    this.element.day = this.day;

    this.element.addEventListener("click", clickDays);
    this.element.addEventListener("mouseover", hoveringDays);
    this.element.addEventListener("mouseout", notHoveringDays);
  }
}



let dayElements = new Array();
for (let i = 0; i < daysOfTheWeek.length; i++) {
  dayElements.push(new DayButton(document.getElementById(daysOfTheWeek[i]), i));
}

let daysOn = [false, false, false, false, false, false, false]; // corresponds to sun - sat

document.getElementById("enterschedule").addEventListener("click", inputSchedule);

function extractHour(time) { // check if start and end times are valid (i.e formatted correctly)
  let scheduleMessage = document.getElementById("schedulemessage");
  if (!time.includes(":")) {
    scheduleMessage.innerHTML = "Please put your times in the format hour:minute, assuming a 24 hour clock.";
    return -1; // return -1 for error
  }

  time = time.split(":");
  if (time.length !== 2) {
    scheduleMessage.innerHTML = "Please put your times in the format hour:minute, assuming a 24 hour clock.";
    return -1;
  }

  let hour = Number(time[0]);
  let minute = Number(time[1]);

  if (isNaN(hour) || isNaN(minute)) { // if hour or minute are not numbers
    scheduleMessage.innerHTML = "Please put your times in the format hour:minute, assuming a 24 hour clock.";
    return -1;
  }

  if (hour < 0 || hour >= 24) { // if hours are out of range
    scheduleMessage.innerHTML = "Your hours need to be between 0 and 23.";
    return -1;
  }


  if (minute < 0 || minute >= 60) { // minutes hour of range
    scheduleMessage.innerHTML = "Your minutes need to be between 0 and 59.";
    return -1;
  }

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    scheduleMessage.innerHTML = "Please enter integers for your times!";
    return -1;
  }
  return Number(time[0]);
}

function extractMinute(time) {
  time = time.split(":");
  return time[1];
}


async function inputSchedule() {
  let scheduleMessage = document.getElementById("schedulemessage");
  let startTime = document.getElementById("start-time").value;
  let endTime = document.getElementById("end-time").value;
  let startTimeHour = extractHour(startTime);
  let endTimeHour = extractHour(endTime);


  if (startTimeHour === -1 || endTimeHour === -1) {
    return;
  }
  let startTimeMinute = extractMinute(startTime);
  let endTimeMinute = extractMinute(endTime);

  if (startTimeHour > endTimeHour) {
    scheduleMessage.innerHTML = "Your start time cannot be later than your end time.";
    return;
  } 
  else if (startTimeHour === endTimeHour && startTimeMinute === endTimeMinute) {
    scheduleMessage.innerHTML = "Start and end times cannot be the same!";
    return;
  }

  if (startTimeHour === endTimeHour && startTimeMinute > endTimeMinute) {
    scheduleMessage.innerHTML = "Your start time cannot be later than your end time.";
    return;
  }
  // get which days are switched on
  let switchedOnDays = [];
  for (let i = 0; i < 7; i++) { // for each day of the week, this results in a sorted list
    if (daysOn[i]) {
      switchedOnDays.push(i);
    }
  }

  if (switchedOnDays.length == 0) {
    scheduleMessage.innerHTML = "Please input which days you want the schedule to be active.";
    return;
  }

  for (let i = 0; i < scheduleTimes.length; i++) { // check if schedule is a duplicate
    if (scheduleTimes[i][0] === startTime && scheduleTimes[i][1] === endTime) {
      let schedulesEquivalent = true;
      if (scheduleDays[i].length != switchedOnDays.length) {
        continue;
      }
      for (let j = 0; j < scheduleDays[i].length; j++) { // for each day of the week
        if (scheduleDays[i][j] !== switchedOnDays[j]) {
          schedulesEquivalent = false;
          break;
        }
      }
      if (schedulesEquivalent) {
        scheduleMessage.innerHTML = "You've already inputted this schedule!";
        return;
      }
    }
  }

  // everything has passed all tests, input the schedule in
  scheduleTimes.push([startTime, endTime])
  scheduleDays.push(switchedOnDays)
  if (scheduleTimes.length == 1) {
    document.getElementById("schedules").innerHTML = "";
  }
  let newItem = new ScheduleItem([startTime, endTime], switchedOnDays); // put link classes into an array
  newItem.addElements();
  scheduleMessage.innerHTML = "Schedule inputted!";


  await chrome.storage.local.set({ scheduleTimes: scheduleTimes });
  await chrome.storage.local.set({ scheduleDays: scheduleDays })
  chrome.runtime.sendMessage({ scheduleChanged: true });



}



function hoveringDays(e) {
  let day = e.currentTarget.day;
  let element = e.currentTarget;
  if (!daysOn[day]) {
    element.style.backgroundColor = "#e7e6e6 ";
  }
}

function notHoveringDays(e) {
  let day = e.currentTarget.day;
  let element = e.currentTarget;
  if (!daysOn[day]) {
    element.style.backgroundColor = "#FFFFFF";
  }
}

function clickDays(e) {
  let day = e.currentTarget.day;
  let element = e.currentTarget;
  if (daysOn[day]) {
    element.style.backgroundColor = "#FFFFFF";
  }
  else {
    element.style.backgroundColor = "#b0b0b0";
  }
  daysOn[day] = !daysOn[day];
}

document.getElementById("pass-enter").addEventListener("click", checkPassword);
document.getElementById("pass-show").addEventListener("click", showPassword);

let passwordInput = document.getElementById("passwordinput");
function checkPassword() {
  let inputted = passwordInput.value;
  if (inputted == password) {
    body.style.display = "block";
    passwordScreen.style.display = "none";
  }
  else {
    document.getElementById("passinputmessage").innerHTML = "Incorrect password given!";
  }
}

function showPassword() {
  if (passwordInput.type == "password") {
    passwordInput.type = "text";
  }
  else {
    passwordInput.type = "password";
  }
}

let passMessage = document.getElementById("passmessage");
async function inputPassword() {
  let inputted = document.getElementById("password").value;

  if (inputted == "") {
    passMessage.innerHTML = "Please enter a password!";
    return;
  }
  if (password != "") {
    passMessage.innerHTML = "Please remove your current password before entering a new one!";
  }
  else {
    await chrome.storage.local.set({ password: inputted });
    passMessage.innerHTML = "Password inputted! Please note down your password somewhere, as it's not possible to change your password without entering it first.";
    password = inputted;

  }
}


document.getElementById("passbutton").addEventListener("click", inputPassword);
document.getElementById("passremove").addEventListener("click", removePass);

function removePass() {
  if (password == "") {
    passMessage.innerHTML = "You must have a password before removing it!";
  }
  else {
    document.getElementById("passremoveconfirm").style.display = "block";
    document.getElementById("passconfirm").addEventListener("click", confirmPass);
  }
}

async function confirmPass() {
  let passentered = document.getElementById("passwordcheck").value;
  if (passentered == password) {
    await chrome.storage.local.set({ password: "" });
    passMessage.innerHTML = "Password removed.";
    document.getElementById("passremoveconfirm").style.display = "none";
    password = "";
  }
  else {
    passMessage.innerHTML = "Incorrect password.";
  }
}

(async () => {
  let result = await chrome.storage.local.get(["overridden"]);
  if (result.overridden) { // if on
    document.getElementById("override").checked = true; // change the switch to switched
  }
  else {
    document.getElementById("override").checked = false; // change the switch to unswitched
  }
  document.getElementById("override").addEventListener("click", scheduleOverride);
})();


async function scheduleOverride() {
  if (document.getElementById("override").checked) {
    await chrome.storage.local.set({ overridden: true });
  }
  else {
    await chrome.storage.local.set({ overridden: false });
  }
  chrome.runtime.sendMessage({ overrideChanged: true });
}

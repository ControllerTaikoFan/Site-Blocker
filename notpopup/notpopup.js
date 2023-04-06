var linky = Array(); // make empty array
chrome.storage.local.get(["links"]).then((result) => { // get links from storage
  linky = result.links;
  if (linky.length == 0) {
    document.getElementById("linklist").innerHTML = "no links added yet :)";
  }
  else {
    displayLinks();
  }

});

var schedule = Array();
var scheduleDays = Array();

chrome.storage.local.get(["schedules"]).then((result) => {
  schedule = result.schedules;
  chrome.storage.local.get(["scheduleDays"]).then((result => {
    scheduleDays = result.scheduleDays;
    if (schedule.length == 0){
      document.getElementById("schedules").innerHTML = "no schedules added yet :)";
    }
    else{
      displaySchedules();
    }
  }))
  
});

console.log("linky")

var seton = false
function checkForStatus() {
  chrome.storage.local.get(["on"]).then((result) => { // get on from storage
    if (result.on) { // if on
      document.getElementById("checkbox").checked = true; // change the switch to switched
      seton = true;
    }
    else {
      document.getElementById("checkbox").checked = false; // change the switch to unswitched
    }

  });

}
checkForStatus()

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) { // when message recieved
  if (message.statusChanged) { // if the message is statusChanged, check the status
    checkForStatus();

  }
});

document.getElementById("checkbox").addEventListener("click", onners);
document.getElementById("button").addEventListener("click", addLink);



class scheduleItem {
  constructor(item, days) {
    var self = this; // variable self is assigned to this because self's scope is lost for some reason idk why but it works
    this.item = item; // item variable
    this.days = days;
    let listedDays = this.days;
    console.log(listedDays)
    this.addElements = function () {
      console.log("addschedule is called")
      let anotherItem = this.item + 1; // declare a variable different from the item but still easily callable
      let addedDays = [];
      if (this.days.includes(0)){
        addedDays.push(" Sundays");
      }
      if (this.days.includes(1)){
        addedDays.push(" Mondays");
      }
      if (this.days.includes(2)){
        addedDays.push(" Tuesdays");
      }
      if (this.days.includes(3)){
        addedDays.push(" Wednesdays");
      }
      if (this.days.includes(4)){
        addedDays.push(" Thursdays");
      }
      if (this.days.includes(5)){
        addedDays.push(" Fridays");
      }
      if (this.days.includes(6)){
        addedDays.push(" Saturdays");
      }
      
      let scheduleListSpace = document.getElementById("schedules");
      scheduleListSpace.appendChild(Object.assign(document.createElement("div"), { id: this.item })); // make a div in linklistspace
      let itemDiv = document.getElementById(this.item); // store the new div in a variable to put everything in a single div for easier removal
      itemDiv.appendChild(Object.assign(document.createElement("p"), { style: 'display:inline-block', innerHTML: "Block from&nbsp;" + this.item[0] + "&nbsp;to&nbsp;" + this.item[1] + "&nbsp;on" + addedDays})); // make a p tag with the text being the link
      itemDiv.appendChild(Object.assign(document.createElement("pre"), { style: 'display:inline-block', innerHTML: " " })); // add space between p tag and button
      itemDiv.appendChild(Object.assign(document.createElement("button"), { innerHTML: "<img src =\"x.png\" width = \"20px\" height = \"25px\" style = \"padding:1px\">", id: anotherItem }));  // add button
      itemDiv.appendChild(Object.assign(document.createElement("br")));
      document.getElementById(anotherItem).addEventListener("click", function () { // when the new button is clicked
        itemDiv.style.display = "none"; // hide the new div
        console.log(String(self.item))
        removeSchedule(self.item); // remove the link from linky
      })
    }
  }

}



function displaySchedules() {
  var scheduleClasses = Array(); // make empty array
  for (i = 0; i < schedule.length; i++) {  // repeat the length of schedule
    scheduleClasses.push(new scheduleItem(schedule[i], scheduleDays[i])); // put link classes into an array
    console.log(scheduleClasses);
    scheduleClasses[i].addElements();

  }
}


function removeSchedule(schedulee) {
  console.log(schedulee)
  console.log(schedule)
  var index = schedule.indexOf(schedulee)
  console.log(index)
  for (let i = 0; i < schedulee; i++){ // schedule.indexOf(schedulee) did not work
    if (schedule[i] == schedulee){
      console.log("slayed!")
      index = i;
      break;
    }
  }
   // get index of the input link
  console.log(index)
  if (index > -1) { // index of the link will be -1 if it does not exist in the array; added as a failsafe
    schedule.splice(index, 1); // remove index 1
    scheduleDays.splice(index, 1);
    chrome.storage.local.set({ schedules: schedule }).then(() => { // add this but for scheduledays pl0x
      console.log("Value is set to " + schedule);
      chrome.storage.local.set({scheduleDays: scheduleDays}).then(() => {
        chrome.runtime.sendMessage({scheduleChanged: true});
        if (schedule.length == 0){
          document.getElementById("schedules").innerHTML = "no schedules added yet :)";
        }
      });
      
    });
  }

}




linkListSpace = document.getElementById("linklist");
class listItem {
  constructor(item) {
    var self = this; // variable self is assigned to this because self's scope is lost for some reason idk why but it works
    this.item = item; // item variable
    this.addElements = function () {
      console.log("addelements is called")
      let anotherItem = this.item + 1; // declare a variable different from the item but still easily callable
      linkListSpace.appendChild(Object.assign(document.createElement("div"), { id: this.item })); // make a div in linklistspace
      let itemDiv = document.getElementById(this.item); // store the new div in a variable to put everything in a single div for easier removal
      itemDiv.appendChild(Object.assign(document.createElement("p"), { style: 'display:inline-block', innerHTML: this.item })); // make a p tag with the text being the link
      itemDiv.appendChild(Object.assign(document.createElement("pre"), { style: 'display:inline-block', innerHTML: " " })); // add space between p tag and button
      itemDiv.appendChild(Object.assign(document.createElement("button"), { innerHTML: "remove", id: anotherItem }));  // add button
      itemDiv.appendChild(Object.assign(document.createElement("br")));
      document.getElementById(anotherItem).addEventListener("click", function () { // when the new button is clicked
        itemDiv.style.display = "none"; // hide the new div
        console.log(String(self.item))
        removeLink(String(self.item)); // remove the link from linky
      })
    }
  }

}



function displayLinks() {
  var linkClasses = Array(); // make empty array
  for (i = 0; i < linky.length; i++) {  // repeat the length of linky
    linkClasses.push(new listItem(linky[i])); // put link classes into an array
    console.log(linkClasses);
    linkClasses[i].addElements();

  }
}

function removeLink(link) {
  console.log(link)
  var index = linky.indexOf(link); // get index of the input link
  console.log(index)
  if (index > -1) { // index of the link will be -1 if it does not exist in the array; added as a failsafe
    linky.splice(index, 1); // remove index 1
    chrome.storage.local.set({ links: linky }).then(() => { // update links in chrome storage
      console.log("Value is set to " + linky);
      if (linky.length == 0){
        document.getElementById("linklist").innerHTML = "no links added yet :)";
      }
    });
  }

}

function addLink() {
  let new_link = document.getElementById("link");
  new_link = new_link.value;
  if (new_link == ""){
    document.getElementById("message").innerHTML = "Please enter a link.";
    return;
  }
  else{
    new_link = new_link.trim();
  }
  if (new_link == ""){
    document.getElementById("message").innerHTML = "Please enter a link.";
    return;
  }
  linky.push(new_link); // add new link to linky
  document.getElementById("message").innerHTML = new_link + "&nbsp;has been added to blocked sites.";
  chrome.storage.local.set({ links: linky }).then(() => {
    console.log("Value is set to " + linky);
    if (linky.length == 1){
      document.getElementById("linklist").innerHTML = "";
    }
    let newItem = new listItem(new_link);
    newItem.addElements()
  });
  document.getElementById("link").value = "";

}


function onners() {
  if (seton) {
    seton = false;
  }
  else {
    seton = true;
  }
  chrome.storage.local.set({ on: seton }).then(() => {
    console.log("Value is set to " + seton);
    chrome.runtime.sendMessage({ statusChanged: true });
  });

}

// deal with schedule inputs

class dayButton {
  constructor(element, day) {
    this.element = element;
    this.day = day;

    this.element.day = this.day;

    this.element.addEventListener("click", clickDays);
    this.element.addEventListener("mouseover", hoveringDays);
    this.element.addEventListener("mouseout", notHoveringDays);
  }
}



var sunday = new dayButton(document.getElementById("0"), 0);
var monday = new dayButton(document.getElementById("1"), 1);
var tuesday = new dayButton(document.getElementById("2"), 2);
var wednesday = new dayButton(document.getElementById("3"), 3);
var thursday = new dayButton(document.getElementById("4"), 4);
var friday = new dayButton(document.getElementById("5"), 5);
var saturday = new dayButton(document.getElementById("6"), 6);

var sundayOn = false;
var mondayOn = false;
var tuesdayOn = false;
var wednesdayOn = false;
var thursdayOn = false;
var fridayOn = false;
var saturdayOn = false;

document.getElementById("enterSchedule").addEventListener("click", inputSchedule)

function inputSchedule() {
  let scheduleMessage = document.getElementById("scheduleMessage");
  let startTime = document.getElementById("startTime");
  startTime = startTime.value;
  let endTime = document.getElementById("endTime");
  endTime = endTime.value;
  let endTimeHour = ""
  let startTimeHour = ""
  // check if start and end times are valid
  for (i = 0; i <= 1; i++) {
    let time = "";
    if (i == 0) {
      time = startTime;
    }
    else{
      time = endTime;
    }
    if (time.includes(":")) {
      time = time.split(":");
      console.log(time);
      if (time.length == 2) {
        time[0] = Number(time[0]);
        time[1] = Number(time[1]);
        if (time[0] >= 0 && time[0] < 24) {
          if (time[1] >= 0 && time[1] < 60){
            if (i==0){
              startTimeHour = Number(time[0]);
            }
            else{
              endTimeHour = Number(time[0]);
            }
            // do nothing if everything is all good
          }
          else{
            scheduleMessage.innerHTML = "Your minutes need to be between 0 and 59.";
            return;
          }
    
        }
        else{
          scheduleMessage.innerHTML = "Your hours need to be between 0 and 23.";
          return;
        }

      }
      else{
        scheduleMessage.innerHTML = "Please put your times in the format hour:minute, assuming a 24 hour clock.";
        return;
      }

    }
    else{
      scheduleMessage.innerHTML = "Please put your times in the format hour:minute, assuming a 24 hour clock.";
      return;
    }

  }
  if (startTimeHour > endTimeHour){
    scheduleMessage.innerHTML = "Your start time cannot be later than your end time.";
    return;
  }
  // get which days are switched on
  let switchedOnDays = [];
  if (sundayOn){
    switchedOnDays.push(0)
    console.log("ayo")
    console.log(switchedOnDays)
  }
  if (mondayOn){
    switchedOnDays.push(1)
  }
  if (tuesdayOn){
    switchedOnDays.push(2)
  }
  if (wednesdayOn){
    switchedOnDays.push(3)
  }
  if (thursdayOn){
    switchedOnDays.push(4)
  }
  if (fridayOn){
    switchedOnDays.push(5)
  }
  if (saturdayOn){
    switchedOnDays.push(6)
  }

  if (switchedOnDays.length == 0){
    scheduleMessage.innerHTML = "Please input which days you want the schedule to be active.";
    return;

  }

  if (schedule.includes([startTime, endTime]) && scheduleDays.includes(switchedOnDays)){
    scheduleMessage.innerHTML = "You've already inputted this schedule!";
    return;
  }

  // everything has passed all tests, input the schedule in
  console.log(switchedOnDays)
  schedule.push([startTime, endTime])
  scheduleDays.push(switchedOnDays)
  if (schedule.length == 1){
    document.getElementById("schedules").innerHTML = "";
  }
  let newItem = new scheduleItem([startTime, endTime], switchedOnDays); // put link classes into an array
  newItem.addElements();
  scheduleMessage.innerHTML = "Schedule inputted!";
  
  
  chrome.storage.local.set({schedules: schedule}).then(() => {
    chrome.storage.local.set({scheduleDays: scheduleDays}).then(() => {
      chrome.runtime.sendMessage({scheduleChanged: true});
      console.log("weoiki0ef")
      
    });
  });


}

// you are now entering: HELL


function hoveringDays(e) {
  let day = e.currentTarget.day;
  let element = e.currentTarget;
  switch (day) { // im practically asking to get featured on one of those cursed programming vids
    case 0:
      if (sundayOn) {
      }
      else {
        element.style.backgroundColor = "#C94444";
      }

      break;

    case 1:
      if (mondayOn) {

      }
      else {
        element.style.backgroundColor = "#C94444";
      }

      break;

    case 2:
      if (tuesdayOn) {

      }
      else {
        element.style.backgroundColor = "#C94444";
      }

      break;

    case 3:
      if (wednesdayOn) {

      }
      else {
        element.style.backgroundColor = "#C94444";
      }

      break;
    case 4:
      if (thursdayOn) {

      }
      else {
        element.style.backgroundColor = "#C94444";
      }

      break;
    case 5:
      if (fridayOn) {

      }
      else {
        element.style.backgroundColor = "#C94444";
      }

      break;


    case 6:
      if (saturdayOn) {

      }
      else {
        element.style.backgroundColor = "#C94444";
      }

      break;
  }



}

function notHoveringDays(e) {
  let day = e.currentTarget.day;
  let element = e.currentTarget;
  switch (day) {
    case 0:
      if (sundayOn) {


      }
      else {
        element.style.backgroundColor = "#FF5555";
      }

      break;

    case 1:
      if (mondayOn) {

      }
      else {
        element.style.backgroundColor = "#FF5555";
      }

      break;

    case 2:
      if (tuesdayOn) {

      }
      else {
        element.style.backgroundColor = "#FF5555";
      }

      break;

    case 3:
      if (wednesdayOn) {

      }
      else {
        element.style.backgroundColor = "#FF5555";
      }

      break;
    case 4:
      if (thursdayOn) {

      }
      else {
        element.style.backgroundColor = "#FF5555";
      }

      break;
    case 5:
      if (fridayOn) {

      }
      else {
        element.style.backgroundColor = "#FF5555";
      }

      break;


    case 6:
      if (saturdayOn) {

      }
      else {
        element.style.backgroundColor = "#FF5555";
      }

      break;
  }
}

function clickDays(e) {
  let day = e.currentTarget.day;
  let element = e.currentTarget;
  switch (day) {
    case 0:
      if (sundayOn) {
        element.style.backgroundColor = "#FF5555";

      }
      else {
        element.style.backgroundColor = "#55FF55";
      }
      sundayOn = !(sundayOn)
      break;

    case 1:
      if (mondayOn) {
        element.style.backgroundColor = "#FF5555";
      }
      else {
        element.style.backgroundColor = "#55FF55";
      }
      mondayOn = !(mondayOn)
      break;

    case 2:
      if (tuesdayOn) {
        element.style.backgroundColor = "#FF5555";
      }
      else {
        element.style.backgroundColor = "#55FF55";
      }
      tuesdayOn = !(tuesdayOn)
      break;

    case 3:
      if (wednesdayOn) {
        element.style.backgroundColor = "#FF5555";
      }
      else {
        element.style.backgroundColor = "#55FF55";
      }
      wednesdayOn = !(wednesdayOn)
      break;
    case 4:
      if (thursdayOn) {
        element.style.backgroundColor = "#FF5555";
      }
      else {
        element.style.backgroundColor = "#55FF55";
      }
      thursdayOn = !(thursdayOn)
      break;
    case 5:
      if (fridayOn) {
        element.style.backgroundColor = "#FF5555";
      }
      else {
        element.style.backgroundColor = "#55FF55";
      }
      fridayOn = !(fridayOn)
      break;


    case 6:
      if (saturdayOn) {
        element.style.backgroundColor = "#FF5555";
      }
      else {
        element.style.backgroundColor = "#55FF55";
      }
      saturdayOn = !(saturdayOn)
      break;
  }


}
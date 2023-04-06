var seton = false;

function checkForStatus() {
  chrome.storage.local.get(["on"]).then((result) => {
    if (result.on) {
      seton = true;
    }
    else {

    }

  });
}

checkForStatus();




chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.statusChanged) {
    checkForStatus();

  }
  if (message.urlChanged) {
    displayUrl();
  }
});


setTimeout(displayUrl)

function displayUrl() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    url = url.toString();
    chrome.storage.local.get(["links"]).then((result) => {
      let linky = result.links;
      if (linky.includes(url)) { // this is bugged, fix later
        document.getElementById("linkStatus").innerHTML = "This website is blocked.";
      }
      else {
        document.getElementById("linkStatus").innerHTML = "Would you like to add this site to your block list?";
      }
    })

    url = url.replace("https://", "");
    url = url.replace("www.", "")
    url = url.split("/")[0];
    document.getElementById("link").innerHTML = url;

  });

}

var seton = false;

async function checkForStatus() {
  let result = await chrome.storage.local.get(["on"]);
  seton = result.on;
}

checkForStatus();
displayUrl();



chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.statusChanged) {
    checkForStatus();

  }
  if (message.urlChanged) {
    displayUrl();
  }
});

//setTimeout(displayUrl);
document.getElementById("addLink").addEventListener("click", function (){
  console.log("IM GONNA KILL MYSELF");
})

function displayUrl() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    url = url.toString();
    console.log(url);

    (async () => {
      let result = await chrome.storage.local.get(["links"]);
      blockedLinks = result.links;
      console.log(blockedLinks);
      if (blockedLinks.includes(url)) {
        document.getElementById("linkStatus").innerHTML = "This website is on your blocked links list.";
      }
      else {
        document.getElementById("linkStatus").innerHTML = "This website is not on your blocked links list.";
      }
    })();

    url = url.replace("https://", "");
    url = url.replace("www.", "");
    url = url.split("/")[0];
    document.getElementById("link").innerHTML = url;
  });


}


document.getElementById("button").addEventListener("mouseover", hovering);
document.getElementById("button").addEventListener("mouseout", nothovering);

function hovering() {
  document.getElementById("settings").src = "/images/settingshover.png";
}

function nothovering() {
  document.getElementById("settings").src = "/images/settings.png";
}
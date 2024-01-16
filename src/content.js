function getPageContent() {
    console.log("getPageContent() called");
    return document.body.innerText;
}

console.log("content.js loaded");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received in content.js!");
    console.log(request);
    if (request.action === "getPageContent") {
        sendResponse({content: document.body.innerText || "No content found"});
    }
    return true;
});
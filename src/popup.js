const button = document.getElementById('summarize');
const outputElement = document.getElementById('output');


button.addEventListener('click', (event) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let tab = tabs[0];
        console.log("Sending message to content script...");

        if (tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
            console.log("Sending message to content script...");
            chrome.tabs.sendMessage(tab.id, {action: "getPageContent"}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                } else {
                    handleResponse(response, tab.id);
                }
            });
        } else {
            console.error("Extension cannot be used on this page.");
        }
    });
});

function handleResponse(response, tabId) {
    console.log("Message received from the content script!");
    if (!response) {
        console.error("No response found.");
        return;
    }
    const message = {
        action: 'classify',
        text: response.content,
        tabId: tabId,
    }
    
    chrome.runtime.sendMessage(message, (response) => {
        outputElement.innerText = JSON.stringify(response, null, 2);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.audio && message.samplingRate) {
        const audioArrayBuffer = convertToAudioBuffer(new Float32Array(message.audio));
        playAudio(audioArrayBuffer, message.samplingRate);
    }
});

function convertToAudioBuffer(float32Array) {
    var buffer = new ArrayBuffer(float32Array.byteLength);
    var view = new Float32Array(buffer);
    for (var i = 0; i < float32Array.length; i++) {
        view[i] = float32Array[i];
    }
    return buffer;
}

const audioContext = new AudioContext();

const audioPlayer = document.getElementById('audioPlayer');

function playAudio(audioArray, samplingRate) {
    const audioData = new Float32Array(audioArray);
    const audioBuffer = audioContext.createBuffer(1, audioData.length, samplingRate);
    audioBuffer.copyToChannel(audioData, 0);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
}
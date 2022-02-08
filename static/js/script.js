let cachedText;
let cachedTimePoints;

function uploadFile(transcript, blob) {
    const formData = new FormData();
    formData.append("blob", blob);
    formData.append("lang", chosenLanguage);
    formData.append("transcript", transcript);
    formData.append("behavior", document.getElementById("behavior-select").value);
    formData.append("conversation", getDialogueJSON());

    fetch("/upload", {
        method: "post",
        body: formData
    }).then(function (response) {
        return response.text();
    }).then(function (text) {
        const fileNames = text.split("\n");
        downloadMachineText(fileNames[0], fileNames[1]);
    });
}

function downloadMachineText(textFileName, audioFileName) {
    fetch(`/download/text/${textFileName}`).then(function (response) {
        return response.text();
    }).then(function (text) {
        if (!aborted) {
            const splitText = text.split("\n");
            cachedText = splitText[0];
            cachedTimePoints = splitText[1];
            downloadMachineAudio(audioFileName);
        }
    });
}

function downloadMachineAudio(audioFileName) {
    fetch(`/download/audio/${audioFileName}`).then(function (response) {
        return response.blob();
    }).then(function (blob) {
        if (!aborted) {
            appendTextGradually(cachedText, cachedTimePoints);
            speakSentence(cachedText + "###" + cachedTimePoints);
            let objectURL = URL.createObjectURL(blob);
            playAudio(objectURL);
        }
    });
}

function speakSentence(sentence) {
    if (chosenLanguage === "en-US") {
        unityInstance.SendMessage('Head', 'speak', sentence);
    }
}

let unityInstance;
createUnityInstance(document.querySelector("#unity-canvas"), {
    dataUrl: "Build/Builds.data",
    frameworkUrl: "Build/Builds.framework.js",
    codeUrl: "Build/Builds.wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "DefaultCompany",
    productName: "AgentHead",
    productVersion: "0.1",
}).then((instance) => unityInstance = instance);

function changeBehavior() {
    sessionStorage.setItem("behavior", document.getElementById("behavior-select").value);
    clearDialogBox();
}

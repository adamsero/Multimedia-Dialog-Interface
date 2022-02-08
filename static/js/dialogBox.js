let dialogue = [];

function appendText(text, isFinal) {
    const lastSentence = dialogue[dialogue.length - 1];
    const element = {
        line: text,
        isFinal: isFinal
    };

    if (!lastSentence || lastSentence.isFinal) {
        dialogue.push(element);
    } else {
        dialogue[dialogue.length - 1] = element;
    }

    applyChangesToDialogBox();
}

function applyChangesToDialogBox() {
    const dialogBox = document.getElementById('dialogBox');
    dialogBox.value = convertDialogueToText(dialogue)
    dialogBox.scrollTop = dialogBox.scrollHeight
    sessionStorage.setItem("dialog_box", dialogBox.value);
}

function clearNonFinalLine() {
    dialogue = dialogue.filter(e => e.isFinal);
    applyChangesToDialogBox();
}

function clearDialogBox() {
    document.getElementById('dialogBox').value = "";
    sessionStorage.setItem("dialog_box", "");
    dialogue = [];
}

function formatText(text, source) {
    return '[' + translations[source][chosenLanguage] + ']: ' + text;
}

function convertDialogueToText(arr) {
    const lines = arr.map(obj => obj.line);
    return lines.join("\n");
}

function convertTextToDialogue(text) {
    return text.split("\n").map(sentence => {
        return {
            line: sentence,
            isFinal: true
        }
    })
}

function appendTextGradually(text, timePointsString) {
    const prefix = formatText("", "machine-name");
    const timePoints = timePointsString.split(",");
    const lastTimePointMS = parseFloat(timePoints[timePoints.length - 1]) * 1000;
    const msPerCharacter = lastTimePointMS / text.length;

    let textToAppend = "";
    let index = 0;
    const timerId = setInterval(() => {
        textToAppend += text[index++];
        appendText(prefix + textToAppend, false);
        if (index >= text.length - 1) {
            appendText(prefix + text, true);
            clearInterval(timerId);
        }
    }, msPerCharacter);
}

function getDialogueJSON() {
    const lines = dialogue.map(obj => {
        const fullLine = obj.line;
        const splitLine = fullLine.split("]: ");
        return splitLine[1];
    });
    return JSON.stringify(lines);
}

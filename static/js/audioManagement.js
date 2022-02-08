let recognition;
let lastTranscript;
let recognized = false;
let aborted = false;

function recognize() {
    aborted = false;
    document.getElementById("animation").style.visibility = "visible";
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    startRecognition();

    recognition.addEventListener("result", (event) => {
        lastTranscript = event.results[0][0].transcript;
        recognized = true;
        appendText(formatText(lastTranscript, "user-name"), false);
    });

    recognition.addEventListener("end", () => {
        if (!aborted) {
            stopRecognition();
        }
    });
}

function startRecognition() {
    document.getElementById("animation").className = "lds-ripple"
    document.getElementById("start-stop").disabled = false;
    recognition.lang = chosenLanguage;
    recognition.start();
    startRecording();
}

function stopRecognition() {
    recognition.stop();
    if (recognized) {
        document.getElementById("animation").className = "loader";
        document.getElementById("start-stop").disabled = true;
    }
    stopRecording();
}

function abortRecognition() {
    document.getElementById("animation").style.visibility = "hidden";
    aborted = true;
    recognition.abort();
    stopRecording();
}

let audioPlayerSource = document.getElementById("audioPlayer");

function playAudio(url) {
    audioPlayerSource.setAttribute("src", url);
    audioPlayerSource.play();
    document.getElementById("animation").style.visibility = "hidden";
}

audioPlayerSource.addEventListener("ended", () => {
    if (!aborted) {
        document.getElementById("animation").style.visibility = "visible";
        startRecognition();
    }
});

function toggleRecognition() {
    let button = document.getElementById("start-stop");
    if (button.getAttribute("name") === "start") {
        recognize();
        button.setAttribute("name", "stop");
        button.setAttribute("src", "/get_icon/pause.png");
    } else if (button.getAttribute("name") === "stop") {
        abortRecognition();
        button.setAttribute("name", "start");
        button.setAttribute("src", "/get_icon/play.png");
        clearNonFinalLine();
    }
}

let gumStream;
let recorder;

function startRecording() {
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    let constraints = {audio: true, video: false};

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            let audioContext = new AudioContext();
            gumStream = stream;
            let input = audioContext.createMediaStreamSource(stream);

            recorder = new WebAudioRecorder(input, {
                workerDir: "static/js/",
                encoding: "wav",
                numChannels: 1,
            });

            recorder.onComplete = function (recorder, blob) {
                if (aborted) {
                    return;
                }
                if (recognized) {
                    appendText(formatText(lastTranscript, "user-name"), true);
                    recognized = false;
                    uploadFile(lastTranscript, blob);
                } else {
                    startRecognition();
                }
            };

            recorder.ondataavailable = function (e) {
            };

            recorder.setOptions({
                timeLimit: 300,
                encodeAfterRecord: true,
                mp3: {bitRate: 160},
            });

            recorder.startRecording(500);
        });
}

function stopRecording() {
    gumStream.getAudioTracks()[0].stop();
    recorder.finishRecording();
}

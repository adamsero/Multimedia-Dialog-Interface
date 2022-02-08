let chosenLanguage;

function changeLanguage(languageCountryCode, languageFull, clearDialog) {
    if (document.getElementById("dialogBox") != null && clearDialog) {
        clearDialogBox();
        sessionStorage.removeItem("last_audio");
    }

    if (languageCountryCode == null) {
        languageCountryCode = "en-US";
        languageFull = "English";
    }
    chosenLanguage = languageCountryCode;
    let icon = document.getElementById(languageCountryCode);
    let dropButtonIcon = document.getElementById("dropButtonIcon");
    dropButtonIcon.setAttribute("src", icon.getAttribute("src"));
    document.getElementById("dropdownButtonLabel").textContent = ' ' + languageFull;

    let translatableElements = document.getElementsByClassName("translatable");
    for (let element of translatableElements) {
        let elementID = element.getAttribute("id");
        element.textContent = translations[elementID][languageCountryCode];
        element.style.visibility = "visible";
    }

    const headDisplay = languageCountryCode === "en-US" ? "inline" : "none";
    document.getElementById("unity-canvas").style.display = headDisplay;
    document.getElementById("select-container").style.display = headDisplay;

    localStorage.setItem("langCode", languageCountryCode);
    localStorage.setItem("langFull", languageFull);
}

let translations
window.onload = function () {
    getTranslations();
    getDialogBox();
    getCachedBehavior();
}

function getTranslations() {
    let translationsString = localStorage.getItem("translations");
    if (translationsString == null) {
        fetch("/get_translations").then(function (response) {
            return response.json();
        }).then(function (json) {
            translations = json;
            localStorage.setItem("translations", JSON.stringify(json));
            fetchCachedLanguage();
        });
    } else {
        translations = JSON.parse(translationsString);
        fetchCachedLanguage()
    }
}

function getDialogBox() {
    if (document.getElementById("dialogBox") != null) {
        let cachedDialog = sessionStorage.getItem("dialog_box");
        if (cachedDialog != null) {
            document.getElementById('dialogBox').value = cachedDialog;
            if (cachedDialog.length > 0) {
                dialogue = convertTextToDialogue(cachedDialog);
            } else {
                dialogue = [];
            }
        }
    }
}

function getCachedBehavior() {
    const cachedBehavior = sessionStorage.getItem("behavior");
    if (cachedBehavior == null) {
        return;
    }

    const dialogueCopy = [...dialogue];
    document.querySelector(".fstdropdown-select").fstdropdown.setValue(cachedBehavior);

    dialogue = [...dialogueCopy];
    const conversationText = convertDialogueToText(dialogue);
    document.getElementById('dialogBox').value = conversationText;
    sessionStorage.setItem("dialog_box", conversationText);
}

function fetchCachedLanguage() {
    let prevLanguageCode = localStorage.getItem("langCode");
    let prevLanguageFull = localStorage.getItem("langFull");
    if (prevLanguageCode != null) {
        chosenLanguage = prevLanguageCode;
    } else {
        chosenLanguage = "pl-PL";
        prevLanguageFull = "Polski"
    }

    changeLanguage(prevLanguageCode, prevLanguageFull, false);
    document.body.setAttribute("style", "");
}

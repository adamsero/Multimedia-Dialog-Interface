import json

json_prompt_data = {}
select_data = []
available_languages = []


def load_ai_prompts():
    with open("./res/json/ai_prompts.json", 'r', encoding="utf-8") as file:
        global json_prompt_data
        json_prompt_data = json.loads(file.read())

    global select_data
    for behavior in json_prompt_data["behaviors"]:
        select_data.append((behavior, json_prompt_data["behaviors"][behavior]["behaviorName"]))


def load_available_languages():
    with open("./res/json/available_languages.json", 'r', encoding="utf-8") as file:
        global available_languages
        available_languages = json.loads(file.read())

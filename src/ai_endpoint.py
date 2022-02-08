import json

import openai as ai

from src import load_files

MAX_CONVERSATION_LENGTH = 3


def get_ai_response(human_message, behavior, conversation_json):
    with open("res/key/openai_key.txt", 'r') as file:
        ai.api_key = file.read()

    starter = load_files.json_prompt_data["behaviors"][behavior]["starter"]
    conversation = [starter]
    conversation_list = json.loads(conversation_json)
    for i in range(0, len(conversation_list) - 1, 2):
        conversation.append({
            "human": conversation_list[i],
            "ai": conversation_list[i + 1]
        })
    conversation_trimmed = conversation[max(0, len(conversation) - MAX_CONVERSATION_LENGTH):]

    prompt = load_files.json_prompt_data["behaviors"][behavior]["prompt"]
    for message in conversation_trimmed:
        prompt += f"Human: {message['human']}\n"
        prompt += f"AI:{message['ai']}\n"

    prompt += f"Human: {human_message}\nAI:"

    response = ai.Completion.create(
        engine="davinci",
        prompt=prompt,
        temperature=0.9,
        max_tokens=50,
        top_p=1,
        frequency_penalty=0.0,
        presence_penalty=0.6,
        stop=["\n", " Human:", " AI:"]
    )
    response_text = response.choices[0].text

    return response_text

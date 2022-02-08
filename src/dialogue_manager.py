import io
import uuid
from datetime import datetime

import app as main
from src import text_to_speech, ai_endpoint as ai


def save_data(transcript, blob, lang, behavior, conversation):
    uuid_8 = str(uuid.uuid4())[:8]
    date_time_str = datetime.now().strftime(f'%Y-%m-%d_%H-%M-%S_{uuid_8}')

    user_audio_file_name = 'user_audio_' + date_time_str + '.wav'
    machine_audio_file_name = 'machine_audio_' + date_time_str + '.wav'
    user_text_file_name = 'user_text_' + date_time_str + '.txt'
    machine_text_file_name = 'machine_text_' + date_time_str + '.txt'

    user_audio_path = f"{main.app.config['USER_AUDIO_FOLDER']}/{user_audio_file_name}"
    machine_audio_path = f"{main.app.config['MACHINE_AUDIO_FOLDER']}/{machine_audio_file_name}"
    user_text_path = f"{main.app.config['USER_TEXT_FOLDER']}/{user_text_file_name}"
    machine_text_path = f"{main.app.config['MACHINE_TEXT_FOLDER']}/{machine_text_file_name}"

    with io.open(user_text_path, 'x', encoding="utf-8") as file:
        file.write(transcript)
    blob.save(user_audio_path)

    ai_response = ai.get_ai_response(transcript, behavior, conversation) if lang == "en-US" else transcript
    text_to_speech.synthesize_speech(ai_response, machine_audio_path, machine_text_path, lang)

    return f"{machine_text_file_name}\n{machine_audio_file_name}"

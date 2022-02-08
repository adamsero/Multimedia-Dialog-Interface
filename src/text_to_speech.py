import os

from google.cloud import texttospeech_v1beta1 as tts
from pydub import AudioSegment


def synthesize_speech(text, audio_path, text_path, lang):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./res/key/key.json"
    client = tts.TextToSpeechClient()

    voices_for_languages = {
        "pl-PL": "Wavenet-B",
        "en-US": "Wavenet-D",
        "de-DE": "Wavenet-B",
        "fr-FR": "Wavenet-B",
        "es-ES": "Wavenet-B",
        "it-IT": "Wavenet-D",
    }

    voice = tts.VoiceSelectionParams(dict(
        language_code=lang,
        name=lang + '-' + voices_for_languages[lang],
        ssml_gender=tts.SsmlVoiceGender.MALE,
    ))

    audio_config = tts.AudioConfig(dict(
        audio_encoding=tts.AudioEncoding.LINEAR16,
    ))

    synthesis_input = tts.SynthesisInput(dict(ssml=text_to_ssml(text)))

    response = client.synthesize_speech(
        request=tts.SynthesizeSpeechRequest(
            dict(input=synthesis_input,
                 voice=voice,
                 audio_config=audio_config,
                 enable_time_pointing=[tts.SynthesizeSpeechRequest.TimepointType.SSML_MARK]
                 )
        )
    )

    trimmed_duration = trim_and_save_audio(audio_path, response.audio_content)
    marks = list([round(time_point.time_seconds, 4) for time_point in response.timepoints])
    marks[len(marks) - 1] = trimmed_duration / 1000
    marks_str = ",".join(map(str, marks))

    with open(text_path, 'x', encoding="utf-8") as file:
        file.write(f"{text}\n{marks_str}")


def detect_silence(my_sound):
    threshold_dB = -50
    chunk_size_ms = 10
    trim_ms = 0
    while my_sound[trim_ms: trim_ms + chunk_size_ms].dBFS < threshold_dB:
        trim_ms += chunk_size_ms
    return trim_ms


def trim_and_save_audio(path, audio_content):
    with open(path, 'wb') as out:
        out.write(audio_content)

    speech = AudioSegment.from_file(path, format="wav")
    trim_ts = detect_silence(speech.reverse())
    speech_no_silence = speech[0: len(speech) - trim_ts]

    os.remove(path)
    speech_no_silence.export(path, format="wav")
    return len(speech_no_silence)


def text_to_ssml(text):
    words = text.split(" ")
    ssml = "<speak>\n"
    ssml += "<prosody rate=\"80%\">"
    for word in enumerate(words):
        ssml += word[1]
        ssml += f" <mark name=\"{word[0] + 1}\"/> "
    ssml += "</prosody>"
    ssml += "\n</speak>"
    return ssml

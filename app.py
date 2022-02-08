from flask import Flask, render_template, request, send_from_directory

from src import load_files, dialogue_manager as dm

app = Flask(__name__)
app.secret_key = 'F045XAKJWRL8E62G'
app.config['USER_AUDIO_FOLDER'] = './saved_data/user_audio'
app.config['MACHINE_AUDIO_FOLDER'] = './saved_data/machine_audio'
app.config['USER_TEXT_FOLDER'] = './saved_data/user_text'
app.config['MACHINE_TEXT_FOLDER'] = './saved_data/machine_text'


@app.route('/', methods=['GET'])
def index():
    return render_template("index.html", available_languages=load_files.available_languages)


@app.route('/Build/<filename>', methods=['GET'])
def get_build(filename):
    return send_from_directory('components/AgentHead/Build', filename)


@app.route('/agent', methods=['GET'])
def agent():
    return render_template('agent.html', select_data=load_files.select_data,
                           available_languages=load_files.available_languages)


@app.route('/favicon.ico', methods=['GET'])
def get_favicon():
    return send_from_directory('./res/icons', 'favicon.ico', as_attachment=True)


@app.route('/upload', methods=['POST'])
def upload_file():
    blob = request.files['blob']
    transcript = request.form['transcript']
    lang = request.form['lang']
    behavior = request.form['behavior']
    conversation = request.form['conversation']

    return dm.save_data(transcript, blob, lang, behavior, conversation)


@app.route('/download/<file_type>/<file_name>', methods=['GET'])
def download_file(file_type, file_name):
    if file_type == 'text':
        with open(f'./saved_data/machine_text/{file_name}', 'r', encoding="utf-8") as file:
            content = file.read()
        return content
    else:
        return send_from_directory('./saved_data/machine_audio', file_name, as_attachment=True)


@app.route('/get_translations', methods=['GET'])
def get_translations():
    return send_from_directory('./res/json', 'translations_client.json', as_attachment=True)


@app.route('/get_icon/<name>')
def get_icon(name):
    return send_from_directory('./res/icons', name, as_attachment=True)


@app.before_first_request
def config():
    load_files.load_ai_prompts()
    load_files.load_available_languages()


if __name__ == '__main__':
    app.run()

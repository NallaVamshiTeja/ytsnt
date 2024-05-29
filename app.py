from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from gensim.summarization import summarize
from googletrans import Translator

app = Flask(__name__)

@app.route('/summary', methods=['GET'])
def summary_api():
    try:
        url = request.args.get('url', '')
        lang = request.args.get('lang', '')
        length = request.args.get('length', 'medium')
        
        if not url:
            return jsonify({'error': 'Please provide a YouTube video URL'}), 400

        video_id = url.split('=')[1]
        autoGenerated=False
        
        try:
            transcript,autoGenerated = get_transcript(video_id)
            # print(transcript,autoGenerated)
        except Exception as e:
            return jsonify({'error': f'Error getting transcript: {str(e)}'}), 500

        translator = Translator()

        try:
            if(not autoGenerated):
                summary=summarize(transcript)
                words = summary.split()

                if length == "small":
                    percentage = 0.5
                elif length == "medium":
                    percentage = 0.7
                elif length == "large":
                    percentage = 1.0
                else:
                    raise ValueError("Invalid length category")

                num_words_to_take = int(len(words) * percentage)

                selected_words = words[:num_words_to_take]

                summary = ' '.join(selected_words)
            else:
                summary=transcript[:5000]
                words = summary.split()
                if(length=='small'):
                    percentage=0.5
                elif(length=='medium'):
                    percentage=0.7
                else:
                    percentage=1.0
                num_words_to_take = int(len(words) * percentage)
                selected_words = words[:num_words_to_take]
                summary = ' '.join(selected_words)
                # return jsonify({'error': "Transcript not available, please select different video"}), 500
            translated_summary = translator.translate(summary, dest=lang).text
        except Exception as e:
            return jsonify({'error': f'Error translating summary: {str(e)}'}), 500

        return translated_summary,200

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

def get_transcript(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = transcript_list.find_transcript(['en'])
        # if(autoGenerated):
        #     transcript = ' '.join([d['text'] + '.' for d in transcript_list])
        # else:
        #     transcript = ' '.join([d['text'] for d in transcript_list])
        transcript1 = ' '.join([d['text'] for d in transcript.fetch()])
        return transcript1,transcript.is_generated
    except Exception as e:
        raise Exception(f'Error getting transcript: {str(e)}')

if __name__ == '__main__':
    app.run(debug=True)
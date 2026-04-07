from flask import Flask, request, jsonify
from podcast_agent import PodcastAgent

app = Flask(__name__)

# Global cache for the agent to avoid reloading the large LLM on every request
_agent_instance = None

@app.route('/funfacts', methods=['GET', 'POST'])
def funfacts():
    global _agent_instance
    
    # Extract parameters
    if request.method == 'POST':
        data = request.json or {}
        song = data.get('song')
        artist = data.get('artist')
    else:
        song = request.args.get('song')
        artist = request.args.get('artist')
        
    if not song or not artist:
        return jsonify({"error": "Please provide both 'song' and 'artist' parameters."}), 400
        
    try:
        # Creates a PodcastAgent (as defined in podcast_agent.py)
        if _agent_instance is None:
            _agent_instance = PodcastAgent()
            
        # Uses the funfact_comment_pipeline to return the path of the generated file
        audio_path = _agent_instance.funfact_comment_pipeline(song=song, artist=artist)
        
        return jsonify({"audio_path": audio_path}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

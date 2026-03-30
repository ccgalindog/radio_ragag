import torch
import soundfile as sf
from kokoro import KPipeline


def create_steered_voice(base_name,
                         trait_name,
                         neutral_ref_name='af_sarah',
                         strength=0.3):
    """
    base_name: The voice you want to use (e.g., 'am_michael').
    trait_name: The voice that has the emotion you want
                (e.g., 'af_bella' for excitement).
    neutral_ref_name: A 'flat' voice used to isolate the trait.
    strength: How much of the emotion to add (0.1 to 0.5 is usually best).
    """
    base_voice = pipeline.load_voice(base_name)
    trait_voice = pipeline.load_voice(trait_name)
    neutral_voice = pipeline.load_voice(neutral_ref_name)
    emotion_delta = trait_voice - neutral_voice
    steered_voice = base_voice + (emotion_delta * strength)
    return steered_voice


def init_kokoro_voice(base_name='am_michael',
                      trait_name='af_bella',
                      strength=0.4):
    """
    Initializes the Kokoro voice model.
    Args:
        base_name (str): The base voice to use.
        trait_name (str): The voice that has the emotion you want.
        strength (float): How much of the emotion to add.
    Returns:
        KokoroVoice: The initialized Kokoro voice model.
    """
    radio_host_voice = create_steered_voice(
        base_name=base_name, 
        trait_name=trait_name, 
        strength=strength
    )
    return radio_host_voice


def generate_voice_comment(text,
                           radio_voice,
                           output_path,
                           lang_code='a',
                           speed=1.05):
    """
    Generates a voice comment for a given text.
    Args:
        text (str): The text to generate a voice comment for.
        radio_voice (KokoroVoice): The initialized Kokoro voice model.
        output_path (str): The path to save the generated wav file.
        lang_code (str): The language code for the voice comment.
        speed (float): The speed of the voice comment.
    Returns:
        str: The path to the generated wav file.
    """
    pipeline = KPipeline(lang_code=lang_code) 
    generator = pipeline(text, voice=radio_voice, speed=speed)
    complete_audio = []
    for j, (gs, ps, audio) in enumerate(generator):
        complete_audio.append(audio)
    sf.write(output_path, complete_audio, 24000)
    return output_path

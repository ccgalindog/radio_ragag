import os
import soundfile as sf
from kokoro import KPipeline
from datetime import datetime


def create_steered_voice(pipeline,
                         base_name,
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


def init_kokoro_voice(lang_code='a',
                      base_name='am_michael',
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
    pipeline = KPipeline(lang_code=lang_code) 
    radio_host_voice = create_steered_voice(
        pipeline=pipeline,
        base_name=base_name, 
        trait_name=trait_name, 
        strength=strength
    )
    return pipeline, radio_host_voice


def generate_voice_comment(text,
                           pipeline,
                           radio_voice,
                           output_path,
                           speed=1.05):
    """
    Generates a voice comment for a given text.
    Args:
        text (str): The text to generate a voice comment for.
        pipeline (KPipeline): The initialized Kokoro pipeline.
        radio_voice (KokoroVoice): The initialized Kokoro voice model.
        output_path (str): The path to save the generated wav file.
        speed (float): The speed of the voice comment.
    Returns:
        str: The path to the generated wav file.
    """
    generator = pipeline(text, voice=radio_voice, speed=speed)
    complete_audio = []
    for j, (gs, ps, audio) in enumerate(generator):
        complete_audio.extend(audio)
    sf.write(output_path, complete_audio, 24000)
    return output_path


def text_to_speech(text: str) -> str:
    """
    This function generates a voice comment for a given text.
    It uses the Kokoro model to generate the voice comment.
    It saves the voice comment as a wav file, the output of this function is
    the path to such file.
    Args:
        text (str): The text to generate a voice comment for.
    Returns:
        str: The path to the generated wav file.
    """
    execution_time = str(datetime.today()).replace(" ", "_")\
                                          .replace(":", "_").split('.')[0]
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, '..', 'data', 'voice_comments')
    os.makedirs(output_dir, exist_ok=True)
    output_filename = os.path.join(output_dir, f"{execution_time}.wav")
    kokoro_pipeline, announcer_voice = init_kokoro_voice()
    output_filename = generate_voice_comment(text,
                                             kokoro_pipeline,
                                             announcer_voice,
                                             output_filename,
                                             speed=1.05)
    return output_filename

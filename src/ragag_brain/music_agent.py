from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import OpenAI, ChatOpenAI
from langchain_community.tools import DuckDuckGoSearchRun
from langgraph.prebuilt import create_react_agent
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
from time import time
import torch
import torchaudio as ta
from chatterbox.tts import ChatterboxTTS
from fastapi import FastAPI
from datetime import datetime
import json


EXAGGERATION = 0.8
TEMPERATURE = 0.3
CFG_WEIGHT = 0.3
SYSTEM_PROMPT_PATH = "./prompts/system_prompt.txt"
FUNFACTS_PROMPT_PATH = "./prompts/funfacts_prompt.txt"
LLM_NAME = "gpt-4o-mini"



@tool
def text_to_speech(text: str) -> str:
    """
    This function generates a voice comment for a given text.
    It uses the ChatterboxTTS model to generate the voice comment.
    It saves the voice comment as a wav file, the output of this function is the path to the wav file.
    Args:
        text (str): The text to generate a voice comment for.
    Returns:
        str: The path to the generated wav file.
    """
    execution_time = str(datetime.today()).replace(" ", "_").replace(":", "_").split('.')[0]
    output_filename = f"../data/voice_comments/{execution_time}.wav"
    wav = voice_model.generate(text,
                                exaggeration=EXAGGERATION,
                                temperature=TEMPERATURE,
                                cfg_weight=CFG_WEIGHT
                            )
    ta.save(output_filename, wav, model.sr)

    return output_filename


def init_voice_model():
    if torch.backends.mps.is_available():
        device = "mps"
    elif torch.cuda.is_available():
        device = "cuda" 
    else:
        device = "cpu"
    map_location = torch.device(device)
    torch_load_original = torch.load

    def patched_torch_load(*args, **kwargs):
        if 'map_location' not in kwargs:
            kwargs['map_location'] = map_location
        return torch_load_original(*args, **kwargs)

    torch.load = patched_torch_load
    voice_model = ChatterboxTTS.from_pretrained(device=device)
    return voice_model


def init_agent():
    system_prompt = open(SYSTEM_PROMPT_PATH, "r").read()
    voice_model = init_voice_model()
    llm = ChatOpenAI(model=LLM_NAME)
    search_tool = DuckDuckGoSearchRun()
    music_agent = create_react_agent(llm, [search_tool, text_to_speech])
    return music_agent, system_prompt, voice_model



app = FastAPI()
music_agent, system_prompt, voice_model = init_agent()


@app.get("/generate_funfacts")
def generate_funfacts(song, artist):
    funfacts_prompt = open(FUNFACTS_PROMPT_PATH, "r").read()
    funfacts_prompt_template = funfacts_prompt.format(song=song, artist=artist)
    agent_response = music_agent.invoke({"messages":
                                            [SystemMessage(content=system_prompt),
                                             HumanMessage(content=funfacts_prompt_template)
                                            ]
                                        }
                                        )
    print(agent_response)
    final_response = json.loads(agent_response['messages'][-1].content\
                                    .replace("```json", "").replace("```", "")
                                )
    return final_response


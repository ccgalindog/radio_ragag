import re
import os
from transformers import AutoProcessor, AutoModelForMultimodalLM
from agent_tools import search_tool
from kokoro_voice import text_to_speech


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SYSTEM_PROMPT_PATH = os.path.join(BASE_DIR, "prompts", "system_prompt.txt")
FUNFACTS_PROMPT_PATH = os.path.join(BASE_DIR, "prompts", "funfacts_prompt.txt")
MODEL_ID = "google/gemma-4-E2B-it"



class PodcastAgent:
    """
    Class that represents the podcast agent.
    """
    def __init__(self):
        self.model_id = MODEL_ID
        self.system_prompt = open(SYSTEM_PROMPT_PATH, "r").read()
        self.funfacts_prompt_template = open(FUNFACTS_PROMPT_PATH, "r").read()
        self.model = AutoModelForMultimodalLM.from_pretrained(self.model_id,
                                                              dtype="auto",
                                                              device_map="auto")
        self.processor = AutoProcessor.from_pretrained(self.model_id)
        self.tools = [search_tool]


    def create_podcast_agent_plan(self, message: list) -> str:
        """
        Function that uses an agent to plan how to use tools to solve
        users requests.
        Args:
            message (list): The message to create a podcast dialog for.
        Returns:
            str: The plan for the podcast dialog.
        """
        text = self.processor.apply_chat_template(message,
                                                  tools=self.tools,
                                                  tokenize=False,
                                                  add_generation_prompt=True,
                                                  enable_thinking=True)
        inputs = self.processor(text=text, return_tensors="pt")\
                     .to(self.model.device)
        model_output = self.model.generate(**inputs, max_new_tokens=1280)
        generated_tokens = model_output[0][len(inputs["input_ids"][0]):]
        llm_plan = self.processor.decode(generated_tokens,
                                         skip_special_tokens=False)
        return llm_plan


    def extract_tool_calls(self, text: str) -> list:
        """
        Extracts tool calls from the text.
        Args:
            text (str): The text to extract tool calls from.
        Returns:
            list: A list of tool calls.
        """
        def cast(v):
            try:
                return int(v)
            except:
                try:
                    return float(v)
                except:
                    return {'true': True, 'false': False}.get(v.lower(),
                                                            v.strip("'\""))
        return [{
            "name": name,
            "arguments": {
                k: cast((v1 or v2).strip())
                for k, v1, v2\
                  in re.findall(r'(\w+):(?:<\|"\|>(.*?)<\|"\|>|([^,}]*))', args)
            }
        } for name, args\
            in re.findall(r"<\|tool_call>call:(\w+)\{(.*?)\}<tool_call\|>",
                            text, re.DOTALL)]


    def get_tools_responses(self, calls: list, message: list) -> list:
        """
        Gets the responses from the tool calls.
        Args:
            calls (list): The list of tool calls.
            message (list): The message to append the tool responses to.
        Returns:
            list: The message with the tool responses appended.
        """
        if calls:
            results = [
                {"name": c['name'],
                "response": globals()[c['name']](**c['arguments'])}
                for c in calls
            ]
            message.append({
                "role": "assistant",
                "tool_calls": [
                    {"function": call} for call in calls
                ],
                "tool_responses": results
            })
        return message


    def create_podcast_dialog(self, message: list) -> tuple:
        """
        Creates a podcast dialog.
        Args:
            message (list): The message to create a podcast dialog for.
        Returns:
            tuple: A tuple containing the output and the message.
        """
        text = self.processor.apply_chat_template(message,
                                                  tools=self.tools,
                                                  tokenize=False,
                                                  add_generation_prompt=True)
        inputs = self.processor(text=text, return_tensors="pt")\
                     .to(self.model.device)
        out = self.model.generate(**inputs,
                                  max_new_tokens=1280,
                                  temperature=0.8)
        generated_tokens = out[0][len(inputs["input_ids"][0]):]
        output = self.processor.decode(generated_tokens,
                                       skip_special_tokens=True)\
                                .replace("*", "")
        message[-1]["content"] = output
        return output, message


    def get_funfacts_request(self, song: str, artist: str) -> list:
        """
        Gets the funfacts request for a given song and artist.
        Args:
            song (str): The song to get funfacts for.
            artist (str): The artist to get funfacts for.
        Returns:
            list: A list containing the system prompt and the funfacts prompt.
        """
        funfacts_prompt = self.funfacts_prompt_template.format(song=song,
                                                               artist=artist)
        message = [{"role": "system", "content": self.system_prompt},
                   {"role": "user", "content": funfacts_prompt}]
        return message


    def funfact_comment_pipeline(self, song: str, artist: str) -> str:
        """
        Creates a funfact comment for a given song and artist.
        Args:
            song (str): The song to create a funfact comment for.
            artist (str): The artist to create a funfact comment for.
        Returns:
            str: The path to the generated wav file.
        """
        print("Creating funfact comment for song: ", song, " by artist: ", artist)
        message = self.get_funfacts_request(song, artist)
        print("Message: ", message)
        final_output = self.create_podcast_agent_plan(message)
        print("Final output: ", final_output)
        calls = self.extract_tool_calls(final_output)
        print("Calls: ", calls)
        message = self.get_tools_responses(calls, message)
        print("Message: ", message)
        podcast_script, message = self.create_podcast_dialog(message)
        print("Podcast script: ", podcast_script)
        audio_path = text_to_speech(podcast_script)
        print("Audio path: ", audio_path)
        return audio_path

from langchain_core.messages import HumanMessage, SystemMessage, BaseMessage,\
                                    AIMessage
from langchain_openai import OpenAI, ChatOpenAI
from langchain_community.tools import DuckDuckGoSearchRun
from langgraph.prebuilt import create_react_agent
from langchain_core.prompts import PromptTemplate
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.outputs import ChatResult, ChatGeneration
from transformers import pipeline
import torch
from typing import List, Optional, Any

SYSTEM_PROMPT_PATH = "./prompts/system_prompt.txt"
FUNFACTS_PROMPT_PATH = "./prompts/funfacts_prompt.txt"
LLM_NAME = "gpt-4o-mini"


class GemmaChatModel(BaseChatModel):
    pipeline: Any = None

    def __init__(self, model_id: str = "google/gemma-3-1b-it", **kwargs):
        super().__init__(**kwargs)
        self.pipeline = pipeline(
            "text-generation",
            model=model_id,
            device="mps",
            torch_dtype=torch.bfloat16
        )

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> ChatResult:
        # Convert LangChain messages to Hugging Face format
        hf_messages = []
        for m in messages:
            if isinstance(m, SystemMessage):
                hf_messages.append({"role": "system", "content": m.content})
            elif isinstance(m, HumanMessage):
                hf_messages.append({"role": "user", "content": m.content})
            elif isinstance(m, AIMessage):
                hf_messages.append({"role": "assistant", "content": m.content})

        # Run the pipeline
        output = self.pipeline(hf_messages,
                               max_new_tokens=kwargs.get("max_new_tokens", 512))
        
        # Extract the assistant's response
        if isinstance(output, list) and len(output) > 0:
            generated_text = output[0]["generated_text"]
            if isinstance(generated_text, list):
                response_text = generated_text[-1]["content"]
            else:
                response_text = generated_text
        else:
            response_text = "Error: No output from model"

        message = AIMessage(content=response_text)
        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    def bind_tools(self, tools: List[Any], **kwargs: Any) -> Any:
        # For create_react_agent to work, we need to implement bind_tools
        # For now, we just bind them so they're available in self.kwargs
        return self.bind(tools=tools, **kwargs)

    @property
    def _llm_type(self) -> str:
        return "gemma-3-hf"


def init_agent(use_local=True):
    system_prompt = open(SYSTEM_PROMPT_PATH, "r").read()
    # voice_model = init_voice_model() # Assuming it's defined elsewhere or handled
    
    if use_local:
        llm = GemmaChatModel()
    else:
        llm = ChatOpenAI(model=LLM_NAME)
        
    search_tool = DuckDuckGoSearchRun()
    music_agent = create_react_agent(llm, [search_tool]) # Simplified for now
    return music_agent, system_prompt


def text_generator(song="Bohemian Rhapsody", artist="Queen"):
    system_prompt = open(SYSTEM_PROMPT_PATH, "r").read()
    funfacts_prompt_template = open(FUNFACTS_PROMPT_PATH, "r").read()
    funfacts_prompt = funfacts_prompt_template.format(song=song, artist=artist)

    model = GemmaChatModel()
    messages = [SystemMessage(content=system_prompt),
                HumanMessage(content=funfacts_prompt)
               ]
    output = model.invoke(messages)
    return output.content


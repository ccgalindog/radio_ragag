from langchain_community.tools import DuckDuckGoSearchRun


def search_tool(search_query: str) -> str:
    """
    Search the web for information on a given topic

    Args:
        search_query: Query to look for in the internet

    Returns:
        results: Results from the internet after performing the query
    """
    return DuckDuckGoSearchRun().run(search_query)

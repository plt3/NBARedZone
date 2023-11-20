import json
import subprocess
from urllib.parse import urlencode

import nba_api
import requests
from nba_api.live.nba.endpoints import scoreboard
from requests.exceptions import HTTPError


class Scraper:
    def __init__(
        self,
        bsApiUrl: str = "https://bestsolaris.com/wp-json/wp/v2/posts",
        embeddingUrlBase: str = "https://bestsolaris.com/solaris.php?postid=",
        useCurl: bool = True,
    ):
        self.bsApiUrl = bsApiUrl
        self.embeddingUrlBase = embeddingUrlBase
        self.gamesPerPage = 100

        # mock requests.get with custom request method which uses cURL instead
        if useCurl:
            print("Using cURL instead of requests library")
            nba_api.library.http.requests.get = Scraper.mockedGet
            requests.get = Scraper.mockedGet

    class MockedResponse:
        """Class meant to mock requests.Response class"""

        def __init__(self, url, statusCode, text):
            self.url = url
            self.status_code = statusCode
            self.text = text

        def raise_for_status(self):
            if self.status_code >= 400:
                raise HTTPError(f"Status code {self.status_code} for url: {self.url}")

        def json(self):
            try:
                return json.loads(self.text)
            except json.decoder.JSONDecodeError:
                raise requests.exceptions.JSONDecodeError

    @staticmethod
    def mockedGet(*args, **kwargs):
        """For whatever reason requests takes multiple minutes on some requests
        when on my home network. Mock requests.get with this method which uses
        cURL from the command line
        """
        url = kwargs.get("url") or args[0]
        params = kwargs.get("params")
        if params:
            url += "?" + urlencode(params)

        command = ["curl", url]
        process = subprocess.run(command, capture_output=True, text=True)
        text = process.stdout
        statusCode = 200

        try:
            json.loads(text)
        except json.decoder.JSONDecodeError:
            statusCode = 400

        return Scraper.MockedResponse(url, statusCode, text)

    def getLiveGames(self) -> list[tuple[str, str]]:
        board = scoreboard.ScoreBoard()
        games = []

        if board.games is not None:
            for game in board.games.get_dict():
                if game["gameClock"] != "":
                    games.append(
                        (game["homeTeam"]["teamName"], game["awayTeam"]["teamName"])
                    )

        return games

    def getStreamIDs(self, liveGames: list[tuple[str, str]]) -> list[dict[str, str]]:
        if len(liveGames) == 0:
            return []
        params = {"page": 1, "per_page": self.gamesPerPage}
        streams = []
        done = False

        while not done:
            print("getting", params["page"])
            response = requests.get(self.bsApiUrl, params=params)
            try:
                response.raise_for_status()
                respJson = response.json()

                for stream in respJson:
                    title = stream["title"]["rendered"]
                    for index, (team1, team2) in enumerate(liveGames):
                        if team1 in title and team2 in title:
                            streamUrl = stream["link"]
                            embeddingUrl = self.embeddingUrlBase + str(stream["id"])
                            streams.append(
                                {
                                    "title": title,
                                    "stream_url": streamUrl,
                                    "embedding_url": embeddingUrl,
                                }
                            )
                            del liveGames[index]
                            break

                if len(liveGames) == 0 or len(respJson) < self.gamesPerPage:
                    done = True

                params["page"] += 1
            except HTTPError:
                # API returns 400 status code if trying to get to a page with no
                # results, so stop if that happens
                done = True

        return streams

    def getAllStreams(self) -> list[dict[str, str]]:
        games = self.getLiveGames()
        return self.getStreamIDs(games)


if __name__ == "__main__":
    scr = Scraper()
    streams = scr.getAllStreams()
    __import__("pprint").pprint(streams)

from typing import Union

import nba_api
import requests
from nba_api.live.nba.endpoints import scoreboard
from requests.exceptions import HTTPError

from utils import mockedGet


class Scraper:
    def __init__(
        self,
        bsApiUrl: str = "https://bestsolaris.com/wp-json/wp/v2/posts",
        embeddingUrlBase: str = "https://bestsolaris.com/solaris.php?postid=",
        useCurl: bool = False,
    ):
        self.bsApiUrl = bsApiUrl
        self.embeddingUrlBase = embeddingUrlBase
        self.gamesPerPage = 100

        # mock requests.get with custom request method which uses cURL instead
        if useCurl:
            print("Using cURL instead of requests library")
            nba_api.library.http.requests.get = mockedGet
            requests.get = mockedGet

    def getLiveGames(self, sort: bool = False) -> list[dict[str, Union[str, int]]]:
        board = scoreboard.ScoreBoard()
        games = []

        if board.games is not None:
            for game in board.games.get_dict():
                if game["gameClock"] != "":
                    gameDict = {
                        "home": game["homeTeam"]["teamName"],
                        "away": game["awayTeam"]["teamName"],
                        "home_score": game["homeTeam"]["score"],
                        "away_score": game["awayTeam"]["score"],
                        "time": game["gameStatusText"],
                    }
                    games.append(gameDict)

        # sort by point differential to get closest games first
        if sort:
            games.sort(key=lambda d: abs(d["home_score"] - d["away_score"]))

        return games

    def getStreamIDs(
        self, liveGames: list[dict[str, Union[str, int]]], sort: bool = False
    ) -> list[dict[str, str]]:
        if len(liveGames) == 0:
            return []
        params = {"page": 1, "per_page": self.gamesPerPage}
        streams = []
        gameIndices = {}
        done = False

        while not done:
            print("getting", params["page"])
            response = requests.get(self.bsApiUrl, params=params)
            try:
                response.raise_for_status()
                respJson = response.json()

                for stream in respJson:
                    title = stream["title"]["rendered"]
                    lowerTitle = title.lower()
                    for game in liveGames:
                        if (
                            game["home"].lower() in lowerTitle
                            and game["away"].lower() in lowerTitle
                        ):
                            teamTup = (game["home"], game["away"])
                            streamUrl = stream["link"]
                            embeddingUrl = self.embeddingUrlBase + str(stream["id"])
                            gameDict = {
                                "title": title,
                                "stream_url": streamUrl,
                                "embedding_url": embeddingUrl,
                                "point_diff": abs(
                                    game["home_score"] - game["away_score"]
                                ),
                            }
                            # add to correct index if another mirror has already been
                            # found, otherwise create a new index
                            if teamTup not in gameIndices:
                                gameIndices[teamTup] = len(streams)
                                streams.append([gameDict])
                            else:
                                streams[gameIndices[teamTup]].append(gameDict)

                            break

                if len(respJson) < self.gamesPerPage:
                    done = True

                params["page"] += 1
            except HTTPError:
                # API returns 400 status code if trying to get to a page with no
                # results, so stop if that happens
                done = True

        if sort:
            streams.sort(key=lambda s: s[0]["point_diff"])

        for mirrorList in streams:
            for stream in mirrorList:
                del stream["point_diff"]

        return streams

    def getAllStreams(self, sort: bool = True) -> list[dict[str, str]]:
        games = self.getLiveGames()
        return self.getStreamIDs(games, sort=sort)


if __name__ == "__main__":
    scr = Scraper(useCurl=True)
    streams = scr.getAllStreams()
    __import__("pprint").pprint(streams)

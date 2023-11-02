from datetime import timezone

import requests
from dateutil import parser
from nba_api.live.nba.endpoints import scoreboard
from requests.exceptions import HTTPError


class Scraper:
    def __init__(
        self,
        bsApiUrl: str = "https://bestsolaris.com/wp-json/wp/v2/posts",
        embeddingUrlBase: str = "https://bestsolaris.com/solaris.php?postid=",
    ):
        self.bsApiUrl = bsApiUrl
        self.embeddingUrlBase = embeddingUrlBase
        self.gamesPerPage = 100

    def getLiveGames(self) -> list[tuple[str, str]]:
        # TODO: check game clock field to actually get live games
        # fields to check: gameClock, gameStatus, gameStatusText
        board = scoreboard.ScoreBoard()
        games = []

        for game in board.games.get_dict():
            # gameTimeLTZ = (
            #     parser.parse(game["gameTimeUTC"])
            #     .replace(tzinfo=timezone.utc)
            #     .astimezone(tz=None)
            # )
            games.append((game["homeTeam"]["teamName"], game["awayTeam"]["teamName"]))

        return games

    def getStreamIDs(self, liveGames: list[tuple[str, str]]) -> list[tuple[str, str]]:
        params = {"page": 1, "per_page": self.gamesPerPage}
        streams = []
        done = False

        while not done:
            print("getting", params["page"])
            r = requests.get(self.bsApiUrl, params=params)
            try:
                r.raise_for_status()
                respJson = r.json()

                for stream in respJson:
                    title = stream["title"]["rendered"]
                    for team1, team2 in liveGames:
                        if team1 in title and team2 in title:
                            url = self.embeddingUrlBase + str(stream["id"])
                            streams.append((title, url))

                if len(streams) == len(liveGames) or len(respJson) < self.gamesPerPage:
                    done = True

                params["page"] += 1
            except HTTPError:
                # API returns 400 status code if trying to get to a page with no
                # results, so stop if that happens
                done = True

        return streams

    def getAllStreams(self) -> list[tuple[str, str]]:
        games = self.getLiveGames()
        return self.getStreamIDs(games)


if __name__ == "__main__":
    scr = Scraper()
    __import__("pprint").pprint(scr.getAllStreams())

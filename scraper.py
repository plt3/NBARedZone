import requests
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
        board = scoreboard.ScoreBoard()
        games = []

        if board.games is not None:
            for game in board.games.get_dict():
                if game["gameClock"] != "":
                    games.append(
                        (game["homeTeam"]["teamName"], game["awayTeam"]["teamName"])
                    )

        return games

    def getStreamIDs(self, liveGames: list[tuple[str, str]]) -> list[tuple[str, str]]:
        if len(liveGames) == 0:
            return []
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
                            streamUrl = stream["link"]
                            embeddingUrl = self.embeddingUrlBase + str(stream["id"])
                            streams.append(
                                {
                                    "title": title,
                                    "stream_url": streamUrl,
                                    "embedding_url": embeddingUrl,
                                }
                            )

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

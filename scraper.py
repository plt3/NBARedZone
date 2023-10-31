import requests
from bs4 import BeautifulSoup


class Scraper:
    def __init__(
        self,
        url: str = "https://sportsurge.io/nba/schedule1/0",
        htmlParser: str = "html.parser",
    ):
        self.url = url
        self.htmlParser = htmlParser

    def get(self, url: str) -> BeautifulSoup:
        page = requests.get(url)
        # check that server returns < 400 response code
        page.raise_for_status()

        soupObject = BeautifulSoup(page.text, self.htmlParser)

        return soupObject

    def getFromFile(self, fileName: str) -> BeautifulSoup:
        with open(fileName) as f:
            return BeautifulSoup(f.read(), self.htmlParser)

    def getGamePages(self):
        # soup = self.get(self.url)
        soup = self.getFromFile("ugh.html")
        gameDivs = soup.select("main.pushContain div.row div.col-md-4")
        gamePageLinks = {}

        for gameDiv in gameDivs:
            gameNameA = gameDiv.select_one("a.card-title.event-title")
            gamePageA = gameDiv.select_one("a.card-action-text")

            if gameNameA is not None and gamePageA is not None:
                gamePageLinks[gameNameA.text.strip()] = gamePageA.get("href")

        return gamePageLinks


if __name__ == "__main__":
    scr = Scraper()
    scr.getGamePages()

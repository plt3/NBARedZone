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
        page.raise_for_status()

        soupObject = BeautifulSoup(page.text, self.htmlParser)

        return soupObject

    def getFromFile(self, fileName: str) -> BeautifulSoup:
        with open(fileName) as f:
            return BeautifulSoup(f.read(), self.htmlParser)

    def getGamePages(self) -> dict[str, str]:
        """Return list of all links of game pages for all games listed on self.url"""

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

    def getGameLink(self, url: str) -> str:
        """Given url to a SportSurge game page, return link to BestSolaris stream
        if present, or first link listed if not. Return empty string if game is not live
        """

        # soup = self.get(url)
        soup = self.getFromFile("soccer.html")
        eventStatus = soup.select_one("div.event-status")
        bestLinkIfNoBS = ""

        if eventStatus is not None and eventStatus.text.strip() == "LIVE":
            linksTableBody = soup.select_one("tbody")
            if linksTableBody is not None:
                firstIteration = True
                for tableRow in linksTableBody.select("tr"):
                    rowHeader = tableRow.select_one("th")
                    link = tableRow.select_one("a")
                    if link is not None:
                        linkHref = str(link.get("href"))
                        if linkHref is not None:
                            if (
                                rowHeader is not None
                                and rowHeader.text.strip().lower() == "bestsolaris"
                            ):
                                return linkHref
                            if firstIteration:
                                bestLinkIfNoBS = linkHref
                                firstIteration = False

        return bestLinkIfNoBS

    def getStreamLinkFromBSPage(self, url: str) -> str:
        """Given BestSolaris stream page, return link to steam link for embedding"""

        # soup = self.getFromFile("torino.html")
        soup = self.get(url)
        shortlink = soup.select_one("link[rel='shortlink']")

        if shortlink is not None:
            linkHref = shortlink.get("href")
            if linkHref is not None:
                return str(linkHref)

        raise Exception("BestSolaris streaming link not found")


if __name__ == "__main__":
    scr = Scraper()
    scr.getGamePages()
    a = scr.getGameLink("a")
    print(a)

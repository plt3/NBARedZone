import subprocess

from bs4 import BeautifulSoup


class Scraper:
    def __init__(
        self,
        url: str = "https://sportsurge.io/nba/schedule1/0",
        htmlParser: str = "html.parser",
    ):
        self.url = url
        self.htmlParser = htmlParser
        self.requestHeaders = {
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
        }

    def get(self, url: str) -> BeautifulSoup:
        print("Getting " + url)
        command = ["curl", url]
        # weirdly requests.get is very unreliable but curl works great.
        # No idea why, tried to change user agent and that didn't do anything
        process = subprocess.run(command, capture_output=True, text=True)

        soupObject = BeautifulSoup(process.stdout, self.htmlParser)

        return soupObject

    def getFromFile(self, fileName: str) -> BeautifulSoup:
        with open(fileName) as f:
            return BeautifulSoup(f.read(), self.htmlParser)

    def getGamePages(self) -> dict[str, str]:
        """Return list of all links of game pages for all games listed at self.url"""

        soup = self.get(self.url)
        # soup = self.getFromFile("ugh.html")
        gameDivs = soup.select("main.pushContain div.row div.col-md-4")
        gamePageLinks = {}

        for gameDiv in gameDivs:
            gameNameA = gameDiv.select_one("a.card-title.event-title")
            gamePageA = gameDiv.select_one("a.card-action-text")

            if gameNameA is not None and gamePageA is not None:
                gamePageLinks[gameNameA.text.strip()] = gamePageA.get("href")

        return gamePageLinks

    def getGameLink(self, url: str) -> tuple[str, bool]:
        """Given url to a SportSurge game page, return link to BestSolaris stream
        if present, or first link listed if not. Return empty string if game is not live
        """

        soup = self.get(url)
        # soup = self.getFromFile("soccer.html")
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
                                return (linkHref, True)
                            if firstIteration:
                                bestLinkIfNoBS = linkHref
                                firstIteration = False

        return (bestLinkIfNoBS, False)

    def getStreamLinkFromBSPage(self, url: str) -> str:
        """Given BestSolaris stream page, return link to steam link for embedding"""

        # soup = self.getFromFile("torino.html")
        soup = self.get(url)
        textarea = soup.select_one("textarea")

        if textarea is not None:
            text = textarea.text
            if text is not None:
                text = text[text.index("https") :]
                return text[: text.index('"')]

        raise Exception("BestSolaris streaming link not found")

    def getAllLiveStreams(self) -> dict[str, str]:
        """Main function to return all embedding links for all live games.
        Currently takes ~30 seconds to run all requests sequentially"""
        pages = self.getGamePages()
        returnDict = {}

        for game, page in pages.items():
            streamLink, isBestSolaris = self.getGameLink(page)
            if streamLink != "":
                if isBestSolaris:
                    streamLink = self.getStreamLinkFromBSPage(streamLink)
                returnDict[game] = streamLink

        return returnDict


if __name__ == "__main__":
    scr = Scraper()
    __import__("pprint").pprint(scr.getAllLiveStreams())

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from scraper import Scraper

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/games")
def getStreams():
    # scraper = Scraper()
    # return scraper.getAllStreams()
    # dummyData = [
    #     (
    #         "New Orleans Pelicans vs Detroit Pistons",
    #         "https://bestsolaris.com/nbastreams/new-orleans-pelicans-vs-detroit-pistons/",
    #     ),
    #     (
    #         "Philadelphia 76ers vs Toronto Raptors",
    #         "https://bestsolaris.com/nbastreams/philadelphia-76ers-vs-toronto-raptors/",
    #     ),
    #     (
    #         "Utah Jazz vs Orlando Magic",
    #         "https://bestsolaris.com/nbastreams/utah-jazz-vs-orlando-magic/",
    #     ),
    #     (
    #         "Phoenix Suns vs San Antonio Spurs",
    #         "https://bestsolaris.com/nbastreams/phoenix-suns-vs-san-antonio-spurs-2/",
    #     ),
    #     (
    #         "New York Rangers vs Carolina Hurricanes",
    #         "https://bestsolaris.com/nhlstreams/new-york-rangers-vs-carolina-hurricanes/",
    #     ),
    # ]
    dummyData = [
        (
            "Philadelphia 76ers vs Toronto Raptors",
            "https://bestsolaris.com/solaris.php?postid=44987",
        )
    ]

    return dummyData


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

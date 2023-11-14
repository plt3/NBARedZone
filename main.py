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
    dummyData = [
        {
            "title": "Toronto Raptors vs Washington Wizards",
            "stream_url": "https://bestsolaris.com/nbastreams/toronto-raptors-vs-washington-wizards/",
            "embedding_url": "https://bestsolaris.com/solaris.php?postid=45958",
        },
        {
            "title": "Sacramento Kings vs Cleveland Cavaliers",
            "stream_url": "https://bestsolaris.com/nbastreams/sacramento-kings-vs-cleveland-cavaliers/",
            "embedding_url": "https://bestsolaris.com/solaris.php?postid=45960",
        },
    ]
    return dummyData


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

import os
import sys

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from scraper import Scraper
from utils import getWifiName

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

useCurl = False
if sys.platform == "darwin":
    useCurl = getWifiName() == os.environ.get("REDZONE_BAD_WIFI_NETWORK")

scraper = Scraper(useCurl=useCurl)


@app.get("/streams")
def getStreams():
    return scraper.getAllStreams()


@app.get("/scores")
def getScores():
    return scraper.getLiveGames(sort=True)


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    try:
        port = os.environ.get("PORT", "5000")
        port = int(port)
    except ValueError:
        port = 5000
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")

import os
import subprocess

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from scraper import Scraper

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


def getWifiName():
    """Get current network SSID in an aggresively macOS-specific manner.
    Helps choose whether to use cURL or requests library to make HTTP requests in scraper.
    """
    command = "/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I".split()
    process = subprocess.run(command, capture_output=True, text=True)
    words = process.stdout.split()

    return words[words.index("SSID:") + 1]


@app.get("/games")
def getStreams():
    useCurl = getWifiName() == os.environ.get("REDZONE_BAD_WIFI_NETWORK")
    scraper = Scraper(useCurl=useCurl)

    return scraper.getAllStreams()


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

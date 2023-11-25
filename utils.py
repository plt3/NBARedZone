import json
import subprocess
from urllib.parse import urlencode

import requests
from requests.exceptions import HTTPError


def getWifiName():
    """Get current network SSID in an aggresively macOS-specific manner.
    Helps choose whether to use cURL or requests library to make HTTP requests in scraper.
    """
    command = "/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I".split()
    process = subprocess.run(command, capture_output=True, text=True)
    words = process.stdout.split()

    return words[words.index("SSID:") + 1]


class MockedResponse:
    """Class meant to mock requests.Response class"""

    def __init__(self, url, statusCode, text):
        self.url = url
        self.status_code = statusCode
        self.text = text

    def raise_for_status(self):
        if self.status_code >= 400:
            raise HTTPError(f"Status code {self.status_code} for url: {self.url}")

    def json(self):
        try:
            return json.loads(self.text)
        except json.decoder.JSONDecodeError:
            raise requests.exceptions.JSONDecodeError


def mockedGet(*args, **kwargs):
    """For whatever reason requests takes multiple minutes on some requests
    when on my home network. Mock requests.get with this method which uses
    cURL from the command line
    """
    url = kwargs.get("url") or args[0]
    params = kwargs.get("params")
    if params:
        url += "?" + urlencode(params)

    command = ["curl", url]
    process = subprocess.run(command, capture_output=True, text=True)
    text = process.stdout
    statusCode = 200

    try:
        json.loads(text)
    except json.decoder.JSONDecodeError:
        statusCode = 400

    return MockedResponse(url, statusCode, text)

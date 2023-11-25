import subprocess


def getWifiName():
    """Get current network SSID in an aggresively macOS-specific manner.
    Helps choose whether to use cURL or requests library to make HTTP requests in scraper.
    """
    command = "/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I".split()
    process = subprocess.run(command, capture_output=True, text=True)
    words = process.stdout.split()

    return words[words.index("SSID:") + 1]

from datetime import datetime
from urllib.parse import urlencode
def generate_url(name: str, description: str, d: datetime):
    d = d.strftime("%Y%m%d/%Y%m%d")
    m = urlencode({"action": "TEMPLATE", "text": name, "details": description, "dates": d, "ctz": "Europe/Zagreb"})
    return f"https://calendar.google.com/calendar/render?{m}"

if __name__ == "__main__":
    print(generate_url("ZG stipendija", "stipendija grada Zagreba", datetime.now()))

import sys
import requests
from bs4 import BeautifulSoup
import re
if __name__ == "__main__":
    import ZagrebUrlGetter as Zg
else:
    import scraping.ZagrebUrlGetter as Zg


class ZagrebScraper:
    def __init__(self, url):
        self.url = url
        self.soup = self.get_soup()

    def get_soup(self):
        response = requests.get(self.url)
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, 'html.parser')

    def get_title(self):
        return self.soup.find('h1').get_text(strip=True)

    def get_date(self):
        date_div = self.soup.find('div', class_='datum')
        return date_div.get_text(strip=True) if date_div else None

    def get_details(self):
        details_div = self.soup.find('div', class_='opis')
        return details_div.get_text(separator=" ", strip=True) if details_div else ""

    def get_details_div(self):
        return self.soup.find('div', class_='opis')

    def get_amount(self):
        details = self.get_details()
        amount_pattern = r"(\d{2,3}(?:[.,]\d{2})?)\s*eura"
        return max([int(float(x.replace(",", "."))) for x in re.findall(amount_pattern, details, flags=re.IGNORECASE)] + [0])

    def get_durations(self):
        details = self.get_details()
        duration_pattern = r"(?:na|traje)\s+(\d+)\s+mjesec"
        match = re.search(duration_pattern, details, flags=re.IGNORECASE)
        return match.group(1) if match else None

    def get_all(self):
        title = self.get_title()
        date = self.get_date()
        details = self.get_details()
        iznos = self.get_amount()
        trajanje = self.get_durations()
        return {
            "title": title,
            "url": self.url,
            "date": date,
            "details": details,
            "iznos": iznos,
            "trajanje": trajanje,
            "org": "Grad Zagreb"
        }

    def __str__(self):
        data = self.get_all()
        return f"Title: {data['title']}\n Last updated: {data['date']}\nDetails: {data['details']}\nAmounts: {data['iznosi']}\nDuration: {data['trajanje']} months"


def scrape():
    url = "https://zagreb.hr/stipendije-grada-zagreba/175198"
    out = []
    for l in Zg.ZagrebUrlGetter(url).get_links():
        try:
            out.append(ZagrebScraper(l).get_all())
        except Exception as e:
            print(f"Loading {l} failed, skipping\n{e}", file=sys.stderr)
    return out


if __name__ == "__main__":
    url = "https://zagreb.hr/stipendije-grada-zagreba/175198"
    url_getter = Zg.ZagrebUrlGetter(url)
    print(url_getter)
    scraper = ZagrebScraper(url_getter.get_links()[0])
    print(scraper)

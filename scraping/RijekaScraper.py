import sys
import requests
from bs4 import BeautifulSoup
import re

if __name__ == "__main__":
    from RijekaUrlGetter import RijekaUrlGetter
    from RijekaAmountGetter import RijekaIznosiScraper
else:
    from scraping.RijekaUrlGetter import RijekaUrlGetter
    from scraping.RijekaAmountGetter import RijekaIznosiScraper


class RijekaScraper:
    def __init__(self, url):
        self.url = url
        self.soup = self.get_soup()

    def get_soup(self):
        response = requests.get(self.url)
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, 'html.parser')

    def get_title(self):
        h1 = self.soup.find('h1')
        return h1.get_text(strip=True) if h1 else None

    def get_details(self):
        div = self.soup.find('div', class_='user-content')
        return div.get_text(separator=" ", strip=True) if div else ""

    def get_lists(self):
        div = self.soup.find('div', class_='user-content')
        if not div:
            return []

        html_str = str(div)
        cutoff_match = re.search(
            r'boduj[eu]\s+se\s+prema', html_str, re.IGNORECASE)
        if cutoff_match:
            html_str = html_str[:cutoff_match.start()]

        partial_soup = BeautifulSoup(html_str, 'html.parser')
        all_conditions = []

        for element in partial_soup.find_all(['ul']):
            for li in element.find_all('li'):
                item = li.get_text(strip=True)
                if not item or re.search(r'kriterij', item, re.IGNORECASE):
                    continue
                item = re.sub(r'\s+', ' ', item).strip().rstrip('.')
                if item not in all_conditions:
                    all_conditions.append(item)
        for p in partial_soup.find_all('p'):
            text = p.get_text(strip=True)
            if re.search(r'uvjet', text, re.IGNORECASE) and len(text.split()) > 4:
                all_conditions.append(text)

        return all_conditions

    def get_page_title(self):
        title_div = self.soup.find('div', class_='page-title')
        if title_div:
            h1 = title_div.find('h1')
            if h1:
                return h1.get_text(strip=True)
        return None

    def get_categories(self):
        text = self.get_details().lower()
        categories = []
        if "učenik" in text or "učenici" in text:
            categories.append("učenici")
        if "student" in text or "studenti" in text:
            categories.append("studenti")
        return categories

    def get_durations(self):
        text = self.get_details()
        pattern = r"razdoblje od\s+(\d+)\s+mjesec"
        match = re.search(pattern, text, flags=re.IGNORECASE)
        return match.group(1) if match else None

    def get_all(self):
        return {
            "title": self.get_title(),
            "url": self.url,
            "details": self.get_details(),
            "categories": self.get_categories(),
            "uvjeti": self.get_lists(),
            "trajanje": self.get_durations(),
            "iznos": 0,
            "org": "Grad Rijeka"
        }

    def get_matching_iznos_text(self):
        page_title = self.get_page_title()
        if not page_title:
            return None

        match_page = re.search(r"prema kategoriji\s*(.+)",
                               page_title, re.IGNORECASE)
        if not match_page:
            return None
        page_category = match_page.group(1).strip().lower()
        iznos_scraper = RijekaIznosiScraper(
            "https://www.rijeka.hr/natjecaji-za-stipendije-grada-rijeke/")
        iznosi = iznos_scraper.get_stipendije()

        for entry in iznosi:
            match_iznos = re.search(
                r"prema kategoriji\s*(.+)", entry["naslov"], re.IGNORECASE)
            if match_iznos:
                iznos_category = match_iznos.group(1).strip().lower()
                if iznos_category == page_category:
                    return entry["tekst"]

        return None

    def __str__(self):
        data = self.get_all()
        text = f"\nNaslov: {data['title']}\n"
        page_title = self.get_page_title()

        if page_title:
            text += f"Naslov stranice: {page_title}\n"
        if data['categories']:
            text += f"Kategorije: {', '.join(data['categories'])}\n"
        if data['trajanje']:
            text += f"Trajanje: {data['trajanje']} mjeseci\n"

        iznos_text = self.get_matching_iznos_text()
        if iznos_text:
            text += f"\nOpis iznosne kategorije:\n{iznos_text}\n"

        uvjeti = data['uvjeti']
        if uvjeti:
            text += "\nUvjeti:\n"
            for item in uvjeti:
                text += f"  - {item}\n"
        return text


def scrape():
    url = "https://www.rijeka.hr/teme-za-gradane/odgoj-i-obrazovanje/stipendije/"
    out = []
    for l in RijekaUrlGetter(url).get_links():
        try:
            out.append(RijekaScraper(l).get_all())
        except Exception as e:
            print(f"Loading {l} failed, skipping\n{e}", file=sys.stderr)
    return out


if __name__ == "__main__":
    print(scrape())

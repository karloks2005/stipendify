
import requests
from bs4 import BeautifulSoup
import re
from RijekaUrlGetter import RijekaUrlGetter

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

    def get_date(self):
        date_tag = self.soup.find('time')
        return date_tag.get_text(strip=True) if date_tag else None

    def get_details(self):
        div = self.soup.find('div', class_='user-content')
        return div.get_text(separator=" ", strip=True) if div else ""

    def get_lists(self):
        div = self.soup.find('div', class_='user-content')
        if not div:
            return []
        lists = []
        for ul in div.find_all('ul'):
            items = [li.get_text(strip=True) for li in ul.find_all('li')]
            if items:
                lists.append(items)
        return lists

    def get_amounts(self):
        text = self.get_details()
        pattern = r"(\d{2,4}(?:[.,]\d{1,2})?)\s*eura"
        return re.findall(pattern, text, flags=re.IGNORECASE)

    def get_durations(self):
        text = self.get_details()
        pattern = r"razdoblje od\s+(\d+)\s+mjesec"
        match = re.search(pattern, text, flags=re.IGNORECASE)
        return match.group(1) if match else None

    def get_categories(self):
        text = self.get_details().lower()
        categories = []
        if "učenic" in text:
            categories.append("učenici")
        if "student" in text:
            categories.append("studenti")
        if "izvrsn" in text:
            categories.append("izvrsni")
        return categories

    def get_all(self):
        return {
            "title": self.get_title(),
            "date": self.get_date(),
            "categories": self.get_categories(),
            "details": self.get_details(),
            "lists": self.get_lists(),
            "iznosi": self.get_amounts(),
            "trajanje": self.get_durations()
        }

    def __str__(self):
        data = self.get_all()
        text = (
            f"\nNaslov: {data['title']}\n"
            f"Datum: {data['date']}\n"
            f"Kategorije: {', '.join(data['categories'])}\n"
            f"Iznosi: {data['iznosi']}\n"
            f"Trajanje: {data['trajanje']} mjeseci\n"
            f"Detalji:\n{data['details'][:500]}...\n"
        )

        if data['lists']:
            text += "\nPopisi uvjeta:\n"
            for i, ul in enumerate(data['lists'], 1):
                text += f"  - Lista {i}: {ul}\n"
        return text


if __name__ == "__main__":
    url = "https://www.rijeka.hr/teme-za-gradane/odgoj-i-obrazovanje/stipendije/"
    getter = RijekaUrlGetter(url)
    links = getter.get_links()
    print(getter)
    
    if links:
        for i, link in enumerate(links, start=1):
            print(f"\n=== Stipendija {i} ===")
            scraper = RijekaScraper(link)
            print(scraper)

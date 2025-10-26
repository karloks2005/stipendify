import requests
from bs4 import BeautifulSoup
import re
from SplitUrlGetter import SplitUrlGetter


class SplitScraper:
    def __init__(self, url):
        self.url = url
        self.soup = self.get_soup()
        
    def get_soup(self):
        response = requests.get(self.url)
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, 'html.parser')
    
    def get_title(self):
        # Traži h1 naslov
        h1 = self.soup.find('h1')
        if h1:
            return h1.get_text(strip=True)
        
        # Alternativa: traži u meta tagovima
        meta_title = self.soup.find('meta', property='og:title')
        if meta_title:
            return meta_title.get('content', '').strip()
        
        return None

    def get_date(self):
        # Traži div sa klasom 'prijave' koji sadrži datum
        prijave_div = self.soup.find('div', class_='prijave')
        if prijave_div:
            # Traži <b> tag koji sadrži datum
            date_tag = prijave_div.find('b')
            if date_tag:
                return date_tag.get_text(strip=True)
        
        # Alternativni pattern - traži u cijelom tekstu
        text = self.soup.get_text()
        date_pattern = r"Prijave na natječaj traju od\s+(\d{1,2}\.\d{1,2}\.\d{4})"
        match = re.search(date_pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
        
        return None

    def get_details(self):
        # Traži glavni sadržaj natječaja
        # Obično je u div sa klasom koja sadrži 'content' ili 'body'
        details_div = self.soup.find('div', class_='user-content')
        if not details_div:
            details_div = self.soup.find('div', class_='edn_articleContent')
        if not details_div:
            details_div = self.soup.find('div', class_='article-content')
        if not details_div:
            details_div = self.soup.find('article')
        if not details_div:
            details_div = self.soup.find('main')
        
        if details_div:
            return details_div.get_text(separator=" ", strip=True)
        
        return ""

    def get_categories(self):
        text = self.get_details().lower()
        categories = []
        if "učenik" in text or "učenici" in text:
            categories.append("učenici")
        if "student" in text or "studenti" in text:
            categories.append("studenti")
        if "sportaš" in text or "sportaša" in text:
            categories.append("sportaši")
        return categories

    def get_amounts(self):
        details = self.get_details()
        # Pattern za iznose u eurima
        amount_pattern = r"(\d{2,3}(?:[.,]\d{2})?)\s*(?:eura|€|EUR)"
        return re.findall(amount_pattern, details, flags=re.IGNORECASE)

    def get_durations(self):
        details = self.get_details()
        # Pattern za trajanje
        duration_pattern = r"(?:na|traje|razdoblje od)\s+(\d+)\s+mjesec"
        match = re.search(duration_pattern, details, flags=re.IGNORECASE)
        return match.group(1) if match else None

    def get_all(self):
        return {
            "title": self.get_title(),
            "date": self.get_date(),
            "details": self.get_details(),
            "categories": self.get_categories(),
            "iznosi": self.get_amounts(),
            "trajanje": self.get_durations()
        }

    def __str__(self):
        data = self.get_all()
        text = f"\nNaslov: {data['title']}\n"
        
        if data['date']:
            text += f"Datum otvaranja prijave: {data['date']}\n"
        
        if data['categories']:
            text += f"Kategorije: {', '.join(data['categories'])}\n"
        
        if data['iznosi']:
            text += f"Iznosi: {', '.join(data['iznosi'])} EUR\n"
        
        if data['trajanje']:
            text += f"Trajanje: {data['trajanje']} mjeseci\n"
        
        text += f"\nDetalji:\n{data['details']}\n"
        
        return text


if __name__ == "__main__":
    # URL sa listom natječaja za stipendiranje
    url = "https://split.hr/natjecaji-i-oglasi/pid/5936/searchid/5937/cfs/true/edncfddlnc_55/1222"
    getter = SplitUrlGetter(url)
    print(getter)
    
    links = getter.get_links()
    if links:
        for i, link in enumerate(links, start=1):
            print(f"\n=== Stipendija {i} ===")
            scraper = SplitScraper(link)
            print(scraper)
    else:
        print("\nNisu pronađeni linkovi za stipendije.")
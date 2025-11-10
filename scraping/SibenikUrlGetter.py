import requests
from bs4 import BeautifulSoup

class SibenikUrlGetter:
    def __init__(self, url):
        self.url = url
        self.soup = self.get_soup()
        
    def get_soup(self):
        response = requests.get(self.url)
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, 'html.parser')
    
    def get_links(self):
        links = []
        # Traži sve div elemente sa klasom 'card-body border-bottom'
        cards = self.soup.find_all('div', class_='card-body border-bottom')
        
        for card in cards:
            # Unutar svakog card-a traži link (a tag)
            link = card.find('a', href=True)
            if link:
                href = link['href']
                title = link.get_text(strip=True).lower()
                
                # Preskoči rang liste i privremene liste
                skip_keywords = ['lista kandidata', 'rang lista', 'privremena lista', 'konačna lista']
                if any(keyword in title for keyword in skip_keywords):
                    continue
                
                # Traži samo natječaje
                if 'natječaj' not in title:
                    continue
                
                # Ako link nije potpun URL, dodaj domenu
                if href.startswith('/'):
                    href = "https://gov.sibenik.hr" + href
                elif not href.startswith('http'):
                    href = "https://gov.sibenik.hr/" + href
                
                if href not in links:
                    links.append(href)
        
        return links
    
    def __str__(self):
        links = self.get_links()
        return "Šibenik stipendije:\n" + "\n".join(links)


if __name__ == "__main__":
    url = "https://gov.sibenik.hr/stranice/stipendije/135.html"
    getter = SibenikUrlGetter(url)
    print(getter)
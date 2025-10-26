import requests
from bs4 import BeautifulSoup

class SplitUrlGetter:
    def __init__(self, url):
        self.url = url
        self.soup = self.get_soup()
        
    def get_soup(self):
        response = requests.get(self.url)
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, 'html.parser')
    
    def get_links(self):
        links = []
        # Traži sve article elemente koji sadrže natječaje
        articles = self.soup.find_all('article', class_='l-item')
        
        for article in articles:
            # Unutar svakog article-a traži link sa klasom 'o-link--overlay'
            link = article.find('a', class_='o-link--overlay')
            if link and link.get('href'):
                href = link['href']
                # Ako link nije potpun URL, dodaj domenu
                if href.startswith('/'):
                    href = "https://split.hr" + href
                elif not href.startswith('http'):
                    href = "https://split.hr/" + href
                    
                # Dodaj samo ako sadrži "stipendij" u linku
                if "stipendij" in href.lower() or "natjecaj" in href.lower():
                    if href not in links:
                        links.append(href)
        
        return links
    
    def __str__(self):
        links = self.get_links()
        return "Split stipendije:\n" + "\n".join(links)
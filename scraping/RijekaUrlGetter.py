
import requests
from bs4 import BeautifulSoup

class RijekaUrlGetter:
    def __init__(self, url):
        self.url = url
        self.soup = self.get_soup()
        
    def get_soup(self):
        response = requests.get(self.url)
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, 'html.parser')
    
    def get_links(self):
        links = []
        for a in self.soup.find_all("a", href=True):
            href = a["href"]
            if "stipendiranje" in href:
                if href.startswith("/"):
                    href = "https://www.rijeka.hr" + href
                links.append(href)
        return list(set(links)) 
    def __str__(self):
        links = self.get_links()
        return "Rijeka stipendije:\n" + "\n".join(links)

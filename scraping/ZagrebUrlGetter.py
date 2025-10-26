import requests
from bs4 import BeautifulSoup
import re

class ZagrebUrlGetter:
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
            if "stipendija-grada-zagreba" in href:
                links.append("https://zagreb.hr/" + href)
        return links
    
    def __str__(self):
        links = self.get_links()
        return "Urls:\n" + "\n".join(links)
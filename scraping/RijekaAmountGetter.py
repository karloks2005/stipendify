import requests
from bs4 import BeautifulSoup

class RijekaIznosiScraper:
    def __init__(self, url):
        self.url = url
        self.soup = self.get_soup()

    def get_soup(self):
        response = requests.get(self.url)
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, "html.parser")

    def get_stipendije(self):
        div = self.soup.find("div", class_="user-content")
        if not div:
            return []

        stipendije = []
        h3_tags = div.find_all("h3")
        for h3 in h3_tags:
            naslov = h3.get_text(strip=True)
            if "stipendij" not in naslov.lower() or "uvjet" in naslov.lower():
                continue

            tekst = []
            sibling = h3.find_next_sibling()
            while sibling and sibling.name != "h3":
                if sibling.name == "p":
                    tekst.append(sibling.get_text(" ", strip=True))
                sibling = sibling.find_next_sibling()

            stipendije.append({
                "naslov": naslov,
                "tekst": " ".join(tekst)
            })

        return stipendije


    def __str__(self):
        data = self.get_stipendije()
        output = ""
        for i, s in enumerate(data, start=1):
            output += f"\n=== {s['naslov']} ===\n{s['tekst']}\n"
        return output


if __name__ == "__main__":
    url = "https://www.rijeka.hr/natjecaji-za-stipendije-grada-rijeke/"
    scraper = RijekaIznosiScraper(url)
    print(scraper)

import sys
import requests
from bs4 import BeautifulSoup
import re

if __name__ == "__main__":
    from SplitUrlGetter import SplitUrlGetter
else:
    from scraping.SplitUrlGetter import SplitUrlGetter
from pypdf import PdfReader
import io


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

    def get_pdf_links(self):
        """Dohvaća sve PDF linkove sa stranice"""
        pdf_links = []

        # Traži sve linkove prema PDF dokumentima
        for link in self.soup.find_all('a', href=True):
            href = link['href']
            # Provjeri je li to PDF link
            if 'DocumentDownload.ashx' in href or href.lower().endswith('.pdf'):
                # Provjerava sadržava li "tekst poziva" ili slične izraze
                link_text = link.get_text(strip=True).lower()
                if 'tekst' in link_text:
                    if not href.startswith('http'):
                        href = 'https://split.hr' + href
                    pdf_links.append(href)

        return pdf_links

    def extract_text_from_pdf(self, pdf_url):
        """Preuzima PDF i izvlači tekst"""
        try:
            response = requests.get(pdf_url, timeout=30)
            response.raise_for_status()

            pdf_file = io.BytesIO(response.content)
            pdf_reader = PdfReader(pdf_file)

            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()

            return text
        except Exception as e:
            print(f"Greška pri čitanju PDF-a {pdf_url}: {e}")
            return ""

    def get_amounts_from_pdf(self):
        """Dohvaća iznose stipendija iz PDF dokumenata"""
        pdf_links = self.get_pdf_links()
        all_amounts = []

        for pdf_link in pdf_links:
            pdf_text = self.extract_text_from_pdf(pdf_link)
            if pdf_text:
                # Pattern za iznose: traži EUR ili eura sa brojevima
                # Primjer: "150,00 EUR", "200 EUR", "150.00 eura"
                amount_patterns = [
                    r"(\d{1,4}[.,]\d{2})\s*(?:EUR|eura)",  # 150,00 EUR
                    r"(\d{1,4})\s*(?:EUR|eura)",            # 150 EUR
                    r"(\d{1,4}[.,]\d{2})\s*€",              # 150,00 €
                ]

                for pattern in amount_patterns:
                    matches = re.findall(pattern, pdf_text, re.IGNORECASE)
                    for match in matches:
                        # Normaliziraj broj (zamijeni zarez sa točkom)
                        normalized = match.replace(',', '.')
                        try:
                            amount = float(normalized)
                            if amount not in all_amounts and 50 <= amount <= 1000:  # Filtriraj realne iznose
                                all_amounts.append(amount)
                        except ValueError:
                            continue

        # Vrati sortirane jedinstvene iznose
        return sorted(list(set(all_amounts)))

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
        # Prvo pokušaj iz PDF-a
        pdf_amounts = self.get_amounts_from_pdf()
        if pdf_amounts:
            return [str(int(amt)) if amt == int(amt) else str(amt) for amt in pdf_amounts]

        # Ako nema PDF-a, traži na stranici
        details = self.get_details()
        amount_pattern = r"(\d{2,3}(?:[.,]\d{2})?)\s*(?:eura|€|EUR)"
        amounts = re.findall(amount_pattern, details, flags=re.IGNORECASE)
        return [int(a) for a in amounts]

    def get_durations(self):
        details = self.get_details()
        duration_pattern = r"(?:na|traje|razdoblje od)\s+(\d+)\s+mjesec"
        match = re.search(duration_pattern, details, flags=re.IGNORECASE)
        return match.group(1) if match else None

    def get_all(self):
        return {
            "title": self.get_title(),
            "url": self.url,
            "date": self.get_date(),
            "details": self.get_details(),
            "categories": self.get_categories(),
            "iznosi": max(self.get_amounts() + [0]),
            "trajanje": self.get_durations(),
            "org": "Grad Split",
            "location": "Split"
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
        else:
            text += f"Iznosi: Null\n"

        if data['trajanje']:
            text += f"Trajanje: {data['trajanje']} mjeseci\n"

        text += f"\nDetalji:\n{data['details']}\n"

        return text


def scrape():
    return []
    url = "https://split.hr/natjecaji-i-oglasi/pid/5936/searchid/5937/cfs/true/edncfddlnc_55/1222"
    out = []
    for l in SplitUrlGetter(url).get_links():
        try:
            out.append(SplitScraper(l).get_all())
        except Exception as e:
            print(f"Loading {l} failed, skipping\n{e}", file=sys.stderr)
    return out


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

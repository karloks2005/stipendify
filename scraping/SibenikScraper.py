import requests
from bs4 import BeautifulSoup
import re
from SibenikUrlGetter import SibenikUrlGetter
import PyPDF2
import io
import time
from concurrent.futures import ThreadPoolExecutor, as_completed


class SibenikScraper:
    session = requests.Session()  # koristi zajedničku sesiju za brže HTTP pozive

    def __init__(self, url):
        self.url = url
        self.soup = self.get_soup()
        
    def get_soup(self):
        try:
            response = self.session.get(self.url, timeout=10)
            response.encoding = "utf-8"
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            print(f"[Greška] Ne mogu dohvatiti {self.url}: {e}")
            return BeautifulSoup("", "html.parser")

    def clean_text(self, text):
        """Uklanja višestruke razmake i slovo 'h' nakon vremena"""
        text = re.sub(r"\s+", " ", text.strip())
        text = re.sub(r"\s*h$", "", text)
        text = re.sub(r",\s*(\d{1,2}:\d{2})\s*h", r", \1", text)
        return text.strip()
    
    def get_title(self):
        title = self.soup.find('h3', class_='font-weight-bold text-uppercase')
        if title:
            return self.clean_text(title.get_text())
        
        title = self.soup.find('h5', class_='font-weight-bold')
        if title:
            return self.clean_text(title.get_text())
        
        meta_title = self.soup.find('meta', property='og:title')
        if meta_title:
            return self.clean_text(meta_title.get('content', ''))
        
        return None

    def get_status(self):
        status_div = self.soup.find('div', class_='card-body')
        if status_div:
            status_text = status_div.find('span', class_='red-text')
            if status_text:
                return self.clean_text(status_text.get_text())
            status_text = status_div.find('span', class_='green-text')
            if status_text:
                return self.clean_text(status_text.get_text())
        return None

    def get_date_range(self):
        dates = {}
        
        date_objave = self.soup.find('div', class_='card-body border-bottom')
        if date_objave and 'Datum objave' in date_objave.get_text():
            date_text = date_objave.find('b')
            if date_text:
                dates['datum_objave'] = self.clean_text(date_text.get_text())
        
        date_isteka = self.soup.find_all('div', class_='card-body border-bottom')
        for div in date_isteka:
            if 'Datum isteka' in div.get_text():
                date_text = div.find('b')
                if date_text:
                    dates['datum_isteka'] = self.clean_text(date_text.get_text())
        
        text = self.soup.get_text()
        date_pattern = r"od\s+(\d{1,2}\.\d{1,2}\.\d{4}).*?do\s+(\d{1,2}\.\d{1,2}\.\d{4})"
        match = re.search(date_pattern, text, re.IGNORECASE)
        if match:
            dates['od'] = match.group(1)
            dates['do'] = match.group(2)
        
        return dates if dates else None

    def get_details(self):
        details_divs = self.soup.find_all('div', class_='card-body')
        all_text = []
        
        for div in details_divs:
            paragraphs = div.find_all('p')
            for p in paragraphs:
                text = self.clean_text(p.get_text())
                if text and len(text) > 20:
                    all_text.append(text)
        
        return "\n\n".join(all_text) if all_text else ""

    def get_pdf_links(self):
        pdf_links = []
        for link in self.soup.find_all('a', href=True):
            href = link['href']
            link_text = link.get_text(strip=True).lower()
            
            if href.lower().endswith('.pdf'):
                skip_keywords = ['lista', 'popis', 'rezultat']
                if any(keyword in link_text for keyword in skip_keywords):
                    continue
                    
                if not href.startswith('http'):
                    if href.startswith('../'):
                        href = 'https://gov.sibenik.hr/' + href.replace('../', '')
                    elif href.startswith('/'):
                        href = 'https://gov.sibenik.hr' + href
                    else:
                        href = 'https://gov.sibenik.hr/' + href
                        
                pdf_links.append(href)
        
        return pdf_links

    def extract_text_from_pdf(self, pdf_url):
        """Brzo dohvaćanje PDF-a (max 2 stranice, timeout 10s)"""
        try:
            response = self.session.get(pdf_url, timeout=10)
            response.raise_for_status()
            pdf_file = io.BytesIO(response.content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for i, page in enumerate(pdf_reader.pages[:2]):  # čitaj max 2 stranice
                page_text = page.extract_text()
                if page_text:
                    text += page_text
            return text
        except Exception as e:
            print(f"[Upozorenje] PDF preskočen {pdf_url}: {e}")
            return ""

    def get_amounts_from_pdf(self):
        pdf_links = self.get_pdf_links()
        all_amounts = []
        
        for pdf_link in pdf_links:
            pdf_text = self.extract_text_from_pdf(pdf_link)
            if pdf_text:
                amount_patterns = [
                    r"(?:stipendij[ae]|iznos).*?(\d{1,4}[.,]\d{2})\s*(?:EUR|eura|€)",
                    r"(?:stipendij[ae]|iznos).*?(\d{1,4})\s*(?:EUR|eura|€)",
                    r"(\d{1,4}[.,]\d{2})\s*(?:EUR|eura|€)\s*(?:mjesečno|godišnje)",
                    r"(\d{1,4})\s*(?:EUR|eura|€)\s*(?:mjesečno|godišnje)",
                ]
                
                for pattern in amount_patterns:
                    matches = re.findall(pattern, pdf_text, re.IGNORECASE)
                    for match in matches:
                        normalized = match.replace(',', '.')
                        try:
                            amount = float(normalized)
                            if 80 <= amount <= 600:
                                all_amounts.append(amount)
                        except ValueError:
                            continue
        
        return sorted(list(set(all_amounts)))

    def get_amounts(self):
        pdf_amounts = self.get_amounts_from_pdf()
        if pdf_amounts:
            return [f"{int(amt)}" if amt == int(amt) else f"{amt:.2f}" for amt in pdf_amounts]
        
        details = self.get_details()
        amount_patterns = [
            r"(?:stipendij[ae]|iznos).*?(\d{2,3}[.,]\d{2})\s*(?:EUR|eura|€)",
            r"(?:stipendij[ae]|iznos).*?(\d{2,3})\s*(?:EUR|eura|€)",
            r"(\d{2,3}[.,]\d{2})\s*(?:EUR|eura|€)\s*(?:mjesečno|godišnje)",
            r"(\d{2,3})\s*(?:EUR|eura|€)\s*(?:mjesečno|godišnje)",
        ]
        
        all_amounts = []
        for pattern in amount_patterns:
            matches = re.findall(pattern, details, flags=re.IGNORECASE)
            for match in matches:
                normalized = match.replace(',', '.')
                try:
                    amount = float(normalized)
                    if 80 <= amount <= 600 and amount not in all_amounts:
                        all_amounts.append(amount)
                except ValueError:
                    continue
        
        if all_amounts:
            return [f"{int(amt)}" if amt == int(amt) else f"{amt:.2f}" for amt in sorted(all_amounts)]
        
        return None

    def get_categories(self):
        text = (self.get_title() + " " + self.get_details()).lower()
        categories = []
        if "učenik" in text or "učenici" in text:
            categories.append("učenici")
        if "student" in text or "studenti" in text:
            categories.append("studenti")
        if "sportaš" in text or "sportaša" in text:
            categories.append("sportaši")
        return categories if categories else ["studenti"]

    def get_all(self):
        return {
            "title": self.get_title(),
            "status": self.get_status(),
            "date_range": self.get_date_range(),
            "details": self.get_details(),
            "categories": self.get_categories(),
            "iznosi": self.get_amounts()
        }

    def __str__(self):
        data = self.get_all()
        text = f"\nNaslov: {data['title']}\n"
        
        if data['status']:
            text += f"Status: {data['status']}\n"
        
        if data['date_range']:
            dates = data['date_range']
            if 'datum_objave' in dates:
                text += f"Datum objave: {dates['datum_objave']}\n"
            if 'datum_isteka' in dates:
                text += f"Datum isteka: {dates['datum_isteka']}\n"
            if 'od' in dates and 'do' in dates:
                text += f"Interval prijava: od {dates['od']} do {dates['do']}\n"
        
        if data['categories']:
            text += f"Kategorije: {', '.join(data['categories'])}\n"
        
        if data['iznosi']:
            text += f"Iznosi: {', '.join(data['iznosi'])} EUR\n"
        else:
            text += f"Iznosi: Nedostupno\n"
        
        return text

if __name__ == "__main__":
    url = "https://gov.sibenik.hr/stranice/stipendije/135.html"
    getter = SibenikUrlGetter(url)
    print(getter)
    
    links = getter.get_links()
    if links:
        print(f"\nPronađeno {len(links)} stipendija, krećem s obradom...\n")

        # paralelno dohvaćanje više stranica (do 5 istovremeno)
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(SibenikScraper, link): link for link in links}
            for i, future in enumerate(as_completed(futures), start=1):
                link = futures[future]
                try:
                    scraper = future.result()
                    print(f"\n=== Stipendija {i} ===")
                    print(scraper)
                except Exception as e:
                    print(f"[Greška] Ne mogu obraditi {link}: {e}")
                time.sleep(0.3)  # mala pauza da ne zatrpaš server
    else:
        print("\nNisu pronađeni linkovi za stipendije.")

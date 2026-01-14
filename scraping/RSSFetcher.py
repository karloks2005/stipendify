import feedparser as fp

class RSSFeedEntry:
    def __init__(self, title, link, guid, description, pubDate):
        self.title = title
        self.link = link
        self.guid = guid
        self.description = description
        self.pubDate = pubDate

    def __repr__(self):
        return f"<RSSFeedEntry>\n title={self.title},\n link={self.link},\n guid={self.guid},\n description={self.description},\n pubDate={self.pubDate})>"

class RSSFetcher:
    def __init__(self, url):
        self.feed_url = url
    
    def fetch(self):
        if not self.feed_url:
            raise ValueError("Feed URL is not set.")
        
        feed = fp.parse(self.feed_url)
        entries = []
        for entry in feed.entries:
            entries.append({
                "title": entry.title,
                "link": entry.link,
                "guid": entry.guid,
                "description": entry.description,
                "pubDate": entry.published
            })
        return [RSSFeedEntry(**entry) for entry in entries]
    
    def get_scholarships_only(self):
        all_entries = self.fetch()
        scholarship_entries = [entry for entry in all_entries if "stipend" in entry.title.lower() or "scholarship" in entry.title.lower()]
        return scholarship_entries
    
    def is_minority_scholarship(self, entry):
        keywords = ["manjine"]
        return any(keyword in entry.title.lower() for keyword in keywords)
    
    def get_amount_from_link(self, entry):
        # access the link and parse the amount if possible
        # Returns a dict with keys: amount (float if parseable else raw string), currency (if detected), raw (matched string)
        try:
            import requests
            from bs4 import BeautifulSoup
            import re
        except Exception:
            # missing dependencies
            return None

        if not entry or not getattr(entry, 'link', None):
            return None

        url = entry.link
        headers = { 'User-Agent': 'stipendify-rss-fetcher/1.0 (+https://example.com)' }
        try:
            resp = requests.get(url, headers=headers, timeout=8)
            resp.raise_for_status()
            html = resp.text
        except Exception:
            return None

        # Try to extract JSON-LD price information first
        try:
            soup = BeautifulSoup(html, 'html.parser')
            for script in soup.find_all('script', type='application/ld+json'):
                try:
                    import json
                    data = json.loads(script.string or '')
                except Exception:
                    continue
                # Look for price / offers
                if isinstance(data, dict):
                    offers = data.get('offers')
                    if offers:
                        price = None
                        currency = None
                        if isinstance(offers, dict):
                            price = offers.get('price')
                            currency = offers.get('priceCurrency')
                        elif isinstance(offers, list) and len(offers) > 0:
                            price = offers[0].get('price')
                            currency = offers[0].get('priceCurrency')
                        if price:
                            try:
                                return {'amount': float(price), 'currency': currency, 'raw': str(price)}
                            except Exception:
                                return {'amount': str(price), 'currency': currency, 'raw': str(price)}

        except Exception:
            pass

        # Fallback: search page text for currency patterns
        text = BeautifulSoup(html, 'html.parser').get_text(separator=' ', strip=True)

        # Common currency symbols and Croatian/English word forms
        currency_words = r'(?:€|EUR|euro|eura|kn|kuna|kune|kuni|kunu|HRK|USD|\$|GBP|£)'
        # number with optional thousands separators and decimals
        number = r'(?:\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?)'

        # 1) Range pattern often seen: "od 500 do 1.500 kn" -> take the upper bound (group2)
        range_pattern = re.compile(rf'od\s*({number})\s*(?:do|-)\s*({number})\s*(?:{currency_words})', re.IGNORECASE)
        m = range_pattern.search(text)
        if m:
            amt_raw = m.group(2) or m.group(1)
            raw = m.group(0)
            currency = None
            post = text[m.end():m.end()+12]
            cur_m = re.search(currency_words, post, re.IGNORECASE)
            if cur_m:
                currency = cur_m.group(0)
            try:
                cleaned = re.sub(r'[\s\u00A0]', '', amt_raw)
                if cleaned.count(',') and cleaned.count('.'):
                    cleaned = cleaned.replace('.', '').replace(',', '.')
                else:
                    cleaned = cleaned.replace(',', '.')
                value = float(re.sub(r'[^0-9\.]', '', cleaned))
                return {'amount': value, 'currency': currency, 'raw': raw}
            except Exception:
                return {'amount': amt_raw, 'currency': currency, 'raw': raw}

        # 2) Croatian phrasing patterns: "iznosi 1.500 kn", "u iznosu od 1500 kuna" - allow more gap
        phrase_pattern = re.compile(rf'(?:u iznosu od|u iznosu|iznosi|iznos|dodijeljen[ao]?|dodijeljeno|najv[iš]e|najviše|do iznosa|do)\s*:?.{{0,80}}?({number})\s*(?:{currency_words})', re.IGNORECASE | re.DOTALL)
        m = phrase_pattern.search(text)
        if m:
            amt_raw = m.group(1)
            raw = m.group(0)
            post = text[m.end():m.end()+12]
            cur_m = re.search(currency_words, post, re.IGNORECASE)
            currency = cur_m.group(0) if cur_m else None
            try:
                cleaned = re.sub(r'[\s\u00A0]', '', amt_raw)
                if cleaned.count(',') and cleaned.count('.'):
                    cleaned = cleaned.replace('.', '').replace(',', '.')
                else:
                    cleaned = cleaned.replace(',', '.')
                value = float(re.sub(r'[^0-9\.]', '', cleaned))
                return {'amount': value, 'currency': currency, 'raw': raw}
            except Exception:
                return {'amount': amt_raw, 'currency': currency, 'raw': raw}

        # 3) Generic patterns (amount followed/preceded by currency)
        pattern = re.compile(rf'({number})\s*(?:{currency_words})|(?:{currency_words})\s*({number})', re.IGNORECASE)
        m = pattern.search(text)
        if m:
            # determine which group matched
            g1 = m.group(1)
            g2 = m.group(2) if m.lastindex and m.lastindex >= 2 else None
            raw = m.group(0)
            currency = None
            amt = None
            if g1:
                amt = g1
                post = text[m.end():m.end()+10]
                cur_m = re.search(currency_words, post, re.IGNORECASE)
                currency = cur_m.group(0) if cur_m else None
            elif g2:
                amt = g2
                pre = text[max(0, m.start()-10):m.start()]
                cur_m = re.search(currency_words, pre, re.IGNORECASE)
                currency = cur_m.group(0) if cur_m else None

            try:
                cleaned = re.sub(r'[\s\u00A0]', '', amt)
                if cleaned.count(',') and cleaned.count('.'):
                    cleaned = cleaned.replace('.', '').replace(',', '.')
                else:
                    cleaned = cleaned.replace(',', '.')
                value = float(re.sub(r'[^0-9\.]', '', cleaned))
                return {'amount': value, 'currency': currency, 'raw': raw}
            except Exception:
                return {'amount': amt, 'currency': currency, 'raw': raw}

        return None
    
if __name__ == "__main__":
    fetcher = RSSFetcher("https://mzom.gov.hr/rss.aspx?ID=196")

    for entry in fetcher.get_scholarships_only():
        print(entry)
        print(fetcher.is_minority_scholarship(entry))
        amount_info = fetcher.get_amount_from_link(entry)
        print("Amount info:", amount_info)
    


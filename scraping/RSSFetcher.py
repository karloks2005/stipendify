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
    
if __name__ == "__main__":
    fetcher = RSSFetcher("https://mzom.gov.hr/rss.aspx?ID=196")
    
    print("\n\n\n".join(str(entry) for entry in fetcher.get_scholarships_only()))


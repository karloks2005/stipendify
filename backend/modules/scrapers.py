import glob
import sys
import importlib
from modules.models import Scholarship


def scrape_scholarships():
    data = []
    for f in glob.glob("scraping/*Scraper.py"):
        f = f.replace("scraping/", "scraping.").removesuffix(".py")
        print(f, file=sys.stderr)
        try:
            new = importlib.import_module(f).scrape()
            print(f"Loaded {len(new)} scholarships from {f}", file=sys.stderr)
            for n in new:
                sc = Scholarship(
                    name=n["title"],
                    url=n["url"],
                    value=int(n["iznosi"][0]))
                data.append(sc)
        except Exception as e:
            print(f"Loading data from {
                  f} failed, skipping:\n{e}", file=sys.stderr)
    return data

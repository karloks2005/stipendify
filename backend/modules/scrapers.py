import glob
import sys
import importlib
from modules.models import Scholarship, Organisation


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
                    is_allowed=True,
                    url=n["url"],
                    description=n["details"],
                    value=n["iznos"] or None)
                org = Organisation(
                    name=n["org"],
                    oib=n["org"].zfill(11)[-11:],
                    address=n["org"]
                )
                data.append((sc, org))
        except Exception as e:
            print(f"Loading data from {
                  f} failed, skipping:\n{e}", file=sys.stderr)
    return data

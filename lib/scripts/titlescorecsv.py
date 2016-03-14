from collections import defaultdict
import os, sys, csv, shutil, json

dirs = os.listdir( "C:/Users/James/Desktop/Reddit_Vis/lib/data" )
top101 = "C:/Users/James/Desktop/Reddit_Vis/lib/scripts/top101subs.txt"

with open(top101) as f:
    content = [line.rstrip('\n') for line in f]

titlescore = defaultdict(int)
fieldname = ['created_utc','score','title']
# for file in dirs:
for file in content:
    print(file)
    titles = []

    try:
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/data/"+file+".csv", 'r', encoding="utf-8") as inf:
            rd = csv.DictReader(inf)
            rows = [row for row in rd]
            with open("C:/Users/James/Desktop/Reddit_Vis/lib/titlescoredate_csv/"+file+".csv", 'w', encoding="utf-8", newline='') as outf:
                wr = csv.DictWriter(outf,fieldnames=fieldname)
                wr.writeheader()
                for row in rows:
                    wr.writerow({'created_utc': row['created_utc'],'score': row['score'],'title': row['title']})
    except:
        print(file+".csv does not exist. skipping.")
        continue;
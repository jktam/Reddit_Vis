from collections import defaultdict
import os, sys, csv, shutil, json

dirs = os.listdir( "C:/Users/James/Desktop/Reddit_Vis/lib/data" )
top101 = "C:/Users/James/Desktop/Reddit_Vis/lib/scripts/top101subs.txt"

with open(top101) as f:
    content = [line.rstrip('\n') for line in f]

wordscore = defaultdict(int)
fieldname = ['word','score']
# for file in dirs:
for file in content:
    print(file)
    words = []

    try:
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/data/"+file+".csv", 'r', encoding="utf-8") as inf:
            rd = csv.DictReader(inf)
            rows = [row for row in rd]
        for row in rows:
            split_list = row['title'].split()
            for s in split_list:
                words.append(s)
            for score in words:
                wordscore[score] += int(row['score'])
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/topwords_csv/"+file+".csv", 'w', encoding="utf-8", newline='') as outf:
            wr = csv.DictWriter(outf,fieldnames=fieldname)
            wr.writeheader()
            for w in wordscore:
                wr.writerow({'word': w,'score': str(wordscore[w]).split("'",1)[0]})
    except:
        print(file+".csv does not exist. skipping.")
        continue;
from collections import defaultdict
import os, sys, csv, shutil, json

dirs = os.listdir( "C:/Users/James/Desktop/Reddit_Vis/lib/data" )
top101 = "C:/Users/James/Desktop/Reddit_Vis/lib/scripts/top101subs.txt"

with open(top101) as f:
    content = [line.rstrip('\n') for line in f]

wordscore = defaultdict(int)
wordmentions = defaultdict(int)
fieldname = ['word','score','mentions']
# for file in dirs:
for file in content:
    print(file)
    words = []
    count = 0
    try:
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/data/"+file+".csv", 'r', encoding="utf-8") as inf:
            rd = csv.DictReader(inf)
            rows = [row for row in rd]
        for row in rows:
            split_list = row['title'].split()
            for s in split_list:
                words.append(s.lower())
                wordscore[s.lower()] += (int(row['score'])/len(split_list))
                wordmentions[s.lower()] += 1
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/topwords2_csv/"+file+".csv", 'w', encoding="utf-8", newline='') as outf:
            wr = csv.DictWriter(outf,fieldnames=fieldname)
            wr.writeheader()
            for w in wordscore:
                wr.writerow({'word': w,'score': float(str(wordscore[w]).split("'",1)[0])/float(str(wordmentions[w]).split("'",1)[0]),'mentions': str(wordmentions[w]).split("'",1)[0]})
    except:
        print(file+".csv does not exist. skipping.")
        continue;
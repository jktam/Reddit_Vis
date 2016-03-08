from collections import defaultdict
import os, sys, csv, shutil, json

# Open a file


path = "C:/Users/James/Desktop/Reddit_Vis/lib/data"
dirs = os.listdir( path )
dicts = []
blob = ""
top100subs = []

top100path = "C:/Users/James/Desktop/Reddit_Vis/lib/top100subs.txt"
with open(top100path, encoding="iso-8859-1") as f:
    for line in f:
        top100subs.append(line.rstrip())



for file in dirs:
    subredditName = file.split('.',1)[0]
    if subredditName in top100subs:
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/data/"+file, 'r', encoding="iso-8859-1") as f:
            # print("C:/Users/James/Desktop/Reddit_Vis/lib/data/"+file)
            reader = csv.DictReader(f)
            rows = [row for row in reader]
        # words = defaultdict(String)
        for row in rows:
            # print(row['title'])
            blob += row['title']+" "
        dicts.append({subredditName: blob})

for subs in dicts:
    print (subs)


# print("Just took a dump.")
# with open("C:/Users/James/Desktop/blobdump.json", 'w') as f:
#     json.dump(dicts,f,indent=4)
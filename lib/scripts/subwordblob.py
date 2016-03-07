from collections import defaultdict
import os, sys, csv, shutil, json

# Open a file
path = "C:/Users/James/Desktop/Reddit_Vis/lib/data2"
dirs = os.listdir( path )
dicts = []
blob = ""
for file in dirs:
    subredditName = file.split('.',1)[0]
    with open("C:/Users/James/Desktop/Reddit_Vis/lib/data2/"+file, 'r', encoding="iso-8859-1") as f:
        # print("C:/Users/James/Desktop/Reddit_Vis/lib/data/"+file)
        reader = csv.DictReader(f)
        rows = [row for row in reader]
    # words = defaultdict(String)
    for row in rows:
        # print(row['title'])
        blob += row['title']+" "+row['selftext']
    dicts.append({subredditName: blob})
# print(dicts)
with open("C:/Users/James/Desktop/asdf.txt", 'w') as f:
	json.dump(dicts,f)
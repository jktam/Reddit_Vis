import math
from textblob import TextBlob as tb


from collections import defaultdict
import os, sys, csv, shutil, json

def tf(word, blob):
    return blob.words.count(word) / len(blob.words)

def n_containing(word, bloblist):
    return sum(1 for blob in bloblist if word in blob)

def idf(word, bloblist):
    return math.log(len(bloblist) / (1 + n_containing(word, bloblist)))

def tfidf(word, blob, bloblist):
    return tf(word, blob) * idf(word, bloblist)

# Open a file
path = "C:/Users/Chris/Documents/GitHub/Reddit_Vis/lib/data"
dirs = os.listdir( path )
dicts = []
blob = ""

for file in dirs:
    blob = ""
    subredditName = file.split('.',1)[0]
    with open("C:/Users/Chris/Documents/GitHub/Reddit_Vis/lib/data/"+file, 'r', encoding="iso-8859-1") as f:
        reader = csv.DictReader(f)
        rows = [row for row in reader]
    for row in rows:
        blob += row['title'].lower()+" "
    dicts.append({'subname': subredditName, 'subBlob': tb(blob)})


bloblist = []

for subreddit in dicts:
    bloblist.append(subreddit['subBlob'])


for subreddit in dicts:
    print("Top words in " + subreddit['subname'])
    scores = {word: tfidf(word, subreddit['subBlob'], bloblist) for word in subreddit['subBlob'].words}
    sorted_words = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    for word, score in sorted_words[:25]:
        print("\tWord: {}, TF-IDF: {}".format(word, round(score, 5)))

print("done")

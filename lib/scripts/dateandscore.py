from collections import defaultdict
import os, sys, csv, shutil, json

dirs = os.listdir( "C:/Users/James/Desktop/Reddit_Vis/lib/data" )
top101 = "C:/Users/James/Desktop/Reddit_Vis/lib/scripts/top101subs.txt"

with open(top101) as f:
    content = [line.rstrip('\n') for line in f]

timescore = defaultdict(int)
fieldname = ['timestamp','value']
valuefield = ['count']

for file in content:
    dumptext = "{\n  \"data\":[\n    "
    try:
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/data/"+file+".csv", 'r', encoding="utf-8") as inf:
            rd = csv.DictReader(inf)
            rows = [row for row in rd]
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/timescore_json/" + file + ".json", 'a') as outf:
            outf.write("{")
            outf.write('\n')
            outf.write("\"data\":[")
            outf.write('\n')
            for row in rows[0:len(rows)-1]:
                outf.write("{\"timestamp\": \"" + row['created_utc'].split('.',1)[0] + "\", \"value\":")
                outf.write('\n')
                outf.write("{\"count\": " + row['score'] + "}},")
                outf.write('\n')
                # dumptext += "{\"timestamp\": \"" + row['created_utc'].split('.',1)[0] + "\", \"value\":\n{\"count\": " + row['score'] + "}},\n"
            outf.write("{\"timestamp\": \"" + rows[len(rows)-1]['created_utc'].split('.',1)[0] + "\", \"value\":")
            outf.write('\n')
            outf.write("{\"count\": " + rows[len(rows)-1]['score'] + "}}]")
            outf.write('\n')
            outf.write("}")
        # dumptext += "{\"timestamp\": \"" + rows[len(rows)-1]['created_utc'].split('.',1)[0] + "\", \"value\":\n{\"count\": " + rows[len(rows)-1]['score'] + "}}]\n}"
            # json.dump(dumptext, sort_keys=True, indent=4, separators=(',', ': '), outf)
            # output = json.dumps(dumptext, outf, indent=2)
        # json.dump(dumptext,outf)
        # outf.write('\n')
    # print(dumptext)
    #     print("{\"timestamp\": \"" + row['created_utc'].split('.',1)[0] + "\", \"value\":\n{\"count\": " + row['score'] + "}},")
    # print("{\"timestamp\": \"" + rows[len(rows)-1]['created_utc'].split('.',1)[0] + "\", \"value\":\n{\"count\": " + rows[len(rows)-1]['score'] + "}}")
    except:
        print(file+".csv does not exist. skipping.")
        continue;
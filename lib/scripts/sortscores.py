from collections import defaultdict
import os, sys, csv, shutil, json, operator

dirs = os.listdir( "C:/Users/James/Desktop/Reddit_Vis/lib/data" )
top101 = "C:/Users/James/Desktop/Reddit_Vis/lib/scripts/top101subs.txt"

with open(top101) as f:
    content = [line.rstrip('\n') for line in f]

fieldname = ['word','score','mentions']
result = []
sortedlist = []
for file in content:
    print(file)
    try:
        with open("C:/Users/James/Desktop/Reddit_Vis/lib/topwords2_csv/"+file+".csv", 'r', encoding="utf-8") as inf:
            rd = csv.reader(inf,delimiter=',')
            next(rd,None)
            sortedlist.clear()
            sortedlist = sorted(rd, key=lambda x: float(x[1]), reverse=True)
            result.clear()
            for i in range(len(sortedlist)):
                if sortedlist[i][2] is not '1':
                    result.append(sortedlist[i])
            with open("C:/Users/James/Desktop/Reddit_Vis/lib/topwords4_csv/"+file+".csv", 'w', encoding="utf-8", newline='') as outf:
                wr = csv.DictWriter(outf,fieldnames=fieldname)
                wr.writeheader()
                for i in range(1,26):
                    wr.writerow({'word': result[i][0],'score': result[i][1],'mentions': result[i][2]})
    # for i in range(1,26):
    #     print(result[i][0],result[i][1],result[i][2])
    except:
        print("what")
        continue;
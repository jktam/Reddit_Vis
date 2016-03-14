import json, os, datetime, csv
from collections import defaultdict

path = "C:/Users/ccch/Documents/GitHub/Reddit_Vis/lib/timescore_json"
dirs = os.listdir( path )
result = defaultdict(int)

for file in dirs:
    filename = file.split('.',1)[0]
    with open(path + "/" + file) as data_file:
        result.clear()

        data = json.load(data_file)
        for dic in data['data']:
            tempstring = str(int(datetime.datetime.fromtimestamp(int(dic['timestamp'])).strftime('%w'))+ 1) + "," + str(int(datetime.datetime.fromtimestamp(int(dic['timestamp'])).strftime('%H')) + 1)


            result[tempstring] += int(dic['value']['count'])

        with open("C:/Users/ccch/Documents/GitHub/Reddit_Vis/lib/timescore_csv"+ "/" + filename + ".csv", 'w', newline = '') as csvfile:
            cwriter = csv.writer(csvfile, delimiter = ",")
            cwriter.writerow(["day","hour","value"])
            for key,value in result.items():
                temp = str(key) + ',' + str(value)
                tempsplit = temp.split(",", 2)
                cwriter.writerow([tempsplit[0], tempsplit[1], tempsplit[2]])





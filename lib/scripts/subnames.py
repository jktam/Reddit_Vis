# import csv

# with open("names.csv", 'r') as f:


#!/usr/bin/python

import os, sys, csv

# Open a file
path = "C:/Users/James/Desktop/Reddit_Vis/lib/data"
dirs = os.listdir( path )


# This would print all the files and directories
fieldname = ["subreddit_name"]
with open("subnames.csv", 'w') as f:
	writer = csv.DictWriter(f, fieldnames=fieldname)
	writer.writeheader()
	for file in dirs:
		subredditName = file.split('.',1)[0]
		writer.writerow({'subreddit_name':subredditName})
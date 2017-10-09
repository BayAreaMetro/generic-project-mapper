#this presumes a windows 10 environment at MTC 
#set up the environment: conda create -n pyodbc python=3.5 pyodbc sqlalchemy pandas 
import pandas as pd
from sqlalchemy import create_engine
from webgis_credentials import username,password,fms_url
import numpy as np

def main():
	df = pd.read_json(fms_url)
	fields = ["sequence","name","system","county","location","tipId","rtpId","status","id","mapInfo"]

	df = df[fields]

	#rename seuence since its a duplicate with a nested value in mapInfo column
	df.columns.values[0] = 'sequence1' 

	#pull nested values out to columns and drop the column
	df = df.join(pd.DataFrame(df["mapInfo"].to_dict()).T)
	df = df.drop("mapInfo", axis=1)

	idx = np.where(df.columns.values=="sequence")[0]

	df.columns.values[idx] = 'sequence_mapinfo' 

	#drop it since its all NaN
	df = df.drop("sequence_mapinfo", axis=1)

	#rename the main sequence back to sequence
	idx = np.where(df.columns.values=="sequence1")[0]
	df.columns.values[idx] = 'sequence' 

	#on windows 10, create a 64 bit ODBC connection (here named WebGIS)
	engine = create_engine("mssql+pyodbc://{}:{}@WebGIS".format(username, password))
	engine.execute("USE WebGIS")

	#all object fields except shapeString should be varchar(256)
	df.to_sql(name='FMS_API_Projects', schema="rpd", con=engine, if_exists = 'replace', index=False)

if __name__ == "__main__":
	main()
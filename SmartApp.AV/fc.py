from time import sleep
import time


while True:
	sleep(1)
	#print("hello")
	timestr = time.strftime("%Y%m%d-%H%M%S")
	with open("Output.txt", "a") as text_file:
	    text_file.write("time: %s" % timestr)
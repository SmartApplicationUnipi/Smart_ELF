#!/usr/bin/env python
import sys

import os


#	1 kb
#	2 kinect
#	3 AV
#	4 CV
#	5 ENLP
# 	6 GNLP

# con troller.py
#enlp_app.py
#gnlp_service.py
# qa_app.py



print("Start running elf...\n")

os.chdir("../SmartApp.KB")
#os.system("./ startkb_onWIndows.sh")

os.chdir("../SmartApp.HAL")
#os.system("")

os.chdir("../SmartApp.AV")
os.system("START /B python asyncSTT")
os.system("START /B python asyncTTS")

os.chdir("../SmartApp.CV")

os.chdir("../SmartApp.ENLP")

os.chdir("../SmartApp.GNLP")

os.chdir("../SmartApp.QA")

os.chdir("../SmartApp.CRW")


#os.chdir("../SmartApp.")
#print(" ")

#"cmd MyApp.exe"
exit()

os.chdir("../SmartApp.")
#print("python asyncSTT.py ")

os.chdir("../SmartApp.")
#print("python asyncTTS.py ")

os.chdir("../SmartApp.")
#print("python enlp_app.py ")

os.chdir("../SmartApp.")
#print("python gnlp_service.py ")

#os.chdir("../SmartApp.")
print("python qa_app.py ")

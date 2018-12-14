#!/usr/bin/env python
import sys
import time
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

os.chdir("../SmartApp.AV/marytts-5.2/bin")
os.system("START marytts-server")
print("marytts is running")

os.chdir("../../../SmartApp.KB")
os.system("START  sh startkb_onWIndows.sh")

time.sleep(13)
print("KB is running")


os.chdir("../SmartApp.HAL/SmartApp.HAL/bin/Release")
os.system("START  SmartApp.HAL.exe")

print("HAL is running")
time.sleep(5)

os.chdir("../../../../SmartApp.AV")
os.system("START /B python asyncSTT.py")
time.sleep(1)
os.system("START /B python asyncTTS.py")
time.sleep(1)
os.chdir("../SmartApp.AV/UI")
os.system("START /B  npm run start:dev ")
print("AV is running")


os.chdir("../../SmartApp.ENLP")
os.system("START /B python enlp_app.py")
print("ENLP is running")
os.chdir("../SmartApp.GNLP")
os.system("START /B python gnlp_service.py")
print("GNLP is running")

time.sleep(5)
os.system("""START chrome "http://localhost:8080/" """)

os.chdir("../SmartApp.CV")
os.chdir("../SmartApp.QA")
os.chdir("../SmartApp.CRW")




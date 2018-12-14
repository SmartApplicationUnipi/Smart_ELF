#!/usr/bin/env python
import sys

import os


print("AV starting...\n")
os.system("ls")


os.system(". bin/activate")
os.system("cd Smart_ELF")
os.system("cd SmartApp.AV")
os.system("python3 asyncSTT.py")

#os.system("git pull")


#!/usr/bin/env python
import sys

import os


print("AV starting...\n")
os.system(". bin/activate")
os.system("cd SmartApp.AV")
os.system("python3 asyncSTT.py")

#os.system("git pull")

os.system("ls")

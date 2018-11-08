#!/bin/bash
source ../venv/bin/activate

if [[ $# -ne 1 ]];
then echo "Wrong usage"
     exit 1
fi
python ../bindings/python/query.py "$1"
deactivate

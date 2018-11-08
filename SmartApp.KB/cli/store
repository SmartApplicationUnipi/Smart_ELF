#!/bin/bash
source ../venv/bin/activate

if [[ $# -ne 3 ]];
then echo "Wrong usage"
     exit 1
fi
python ../bindings/python/store.py "$1" "$2" "$3"
deactivate

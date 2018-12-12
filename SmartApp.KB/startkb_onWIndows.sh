#!/bin/bash

dt=$(date '+%Y-%m-%d_%H-%M-%S');
logpath="./log/log_$dt"
npm start > $logpath

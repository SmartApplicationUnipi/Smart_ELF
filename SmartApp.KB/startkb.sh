#!/bin/bash

dt=$(date '+%Y-%m-%d_%H-%M-%S');
logpath="./log/log_$dt"

if pgrep -f "node dist/src/server.js" > /dev/null
then
	echo "still running"
else
	npm start > $logpath &
fi

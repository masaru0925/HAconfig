#!/bin/bash

node setting.js

for js in `*.js`; do
	node $js
done

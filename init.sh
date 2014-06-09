#!/bin/bash

LIB=/var/local/lib/redis
LOG=/var/local/log/redis
RUN=/var/local/run/redis
ETC=/etc/redis

for TARGET in $LIB $LOG $RUN $ETC; do
	mkdir -p $TARGET
	chown -R redis.redis $TARGET
done
ETC=/etc/haproxy
mkdir -p $ETC
chown -R haproxy.haproxy $ETC

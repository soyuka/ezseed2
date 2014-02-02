#!/bin/bash
###################################################
#   ___  ___  ___  ___  ___  ___     _  _  ___    #
#  (  _)(_  )/ __)(  _)(  _)(   \   ( )( )(__ \   #
#   ) _) / / \__ \ ) _) ) _) ) ) )   \\// / __/   #
#  (___)(___)(___/(___)(___)(___/    (__) \___)   #
#  									   © soyuka   #
###################################################

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Adding mongodb source
apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | tee /etc/apt/sources.list.d/10gen.list

apt-get update
apt-get upgrade -y

#mongodb
mkdir -p /data/db

# Dependecies
# whois = mkpasswd
apt-get install mongodb-10gen git-core curl build-essential openssl libssl-dev whois python inotify-tools nginx php5-fpm -y

#Install node js
wget http://nodejs.org/dist/node-latest.tar.gz | tar xzvf
cd node-latest
 
# Configure seems not to find libssl by default so we give it an explicit pointer.
# Optionally: you can isolate node by adding --prefix=/opt/node
./configure --openssl-libpath=/usr/lib/ssl
make
make install

cd $DIR

rm -r node

# it's alive ?
if [ -z $(node -v) && -z $(npm -v) ]
then
	exit 0
else
	npm install pm2@latest -g #to be changed
	mkdir -p /var/log/ezseed
	mkdir -p /var/www
	cp -R $DIR /var/www/ezseed2

	cd /var/www/ezseed2/ &&	npm install --save
	npm link

	echo "Please start 'ezseed install -h'"
fi



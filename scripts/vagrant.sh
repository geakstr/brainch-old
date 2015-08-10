#!/usr/bin/env bash

sudo su - vagrant -c "sudo apt-get update
sudo apt-get install -y git

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo \"deb http://repo.mongodb.org/apt/ubuntu \"$(lsb_release -sc)\"/mongodb-org/3.0 multiverse\" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org=3.0.5 mongodb-org-server=3.0.5 mongodb-org-shell=3.0.5 mongodb-org-mongos=3.0.5 mongodb-org-tools=3.0.5

sudo apt-get install -y build-essential libssl-dev
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 0.12.7
nvm use 0.12.7
nvm alias default stable

cd /home/vagrant/brainch/
npm install gulp -g
npm install"

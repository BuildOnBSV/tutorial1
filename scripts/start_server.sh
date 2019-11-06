#!/bin/bash -x
curl -sL https://rpm.nodesource.com/setup_10.x | sudo -E bash -
sudo yum install -y gcc-c++ make git docker nodejs
sudo npm install
sudo npm install -g pm2
sudo service docker start
cd /home/ec2-user
sudo docker stop mongo
sudo docker rm -f mongo
sudo docker stop app
sudo docker rm -f app
sudo rm tape.txt
sudo pm2 delete all
sudo pm2 start index.js 
sudo pm2 start server.js

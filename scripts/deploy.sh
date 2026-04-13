#!/bin/bash
cd /home/ubuntu/FanPulse-App

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 137568342949.dkr.ecr.us-east-1.amazonaws.com

docker-compose pull
docker-compose down
docker-compose up -d --remove-orphans

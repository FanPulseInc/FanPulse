#!/bin/bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 137568342949.dkr.ecr.us-east-1.amazonaws.com

cd /home/ubuntu/FanPulse-App

sudo docker-compose pull

sudo docker-compose up -d

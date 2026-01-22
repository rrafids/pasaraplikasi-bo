#!/usr/bin/env bash

docker stop tukuaplikasi-bo
docker rm tukuaplikasi-bo
docker image rm tukuaplikasi-bo
docker build -t tukuaplikasi-bo .
docker run --name tukuaplikasi-bo --env-file .env -d -p 3002:3002 tukuaplikasi-bo


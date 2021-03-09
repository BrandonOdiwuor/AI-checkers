#!/usr/bin/env bash
set -e
docker-compose -f docker/docker-compose.yml config > docker-local-stack.yml
docker-compose -f docker-local-stack.yml build
docker-compose -f docker-local-stack.yml down
docker-compose -f docker-local-stack.yml up
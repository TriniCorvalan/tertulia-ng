#!/usr/bin/env bash
# Deploy tertulia-ng frontend on the EC2 host (run via SSM or SSH).
# Usage: deploy-frontend.sh <image> <region>
set -Eeuo pipefail

image="${1:?image is required}"
region="${2:?AWS region is required}"

if [[ ! "$region" =~ ^[a-z0-9-]+$ ]]; then
  echo "Invalid AWS region." >&2
  exit 2
fi

docker_config="$(mktemp -d /tmp/tertulia-ng-ecr-docker.XXXXXX)"
export DOCKER_CONFIG="$docker_config"
cleanup_auth() {
  if [[ -n "${docker_config:-}" ]]; then
    rm -rf -- "$docker_config"
    docker_config=""
  fi
}
trap cleanup_auth EXIT

if [[ "$image" == *".dkr.ecr."* ]]; then
  registry="${image%%/*}"
  aws ecr get-login-password --region "$region" \
    | docker login --username AWS --password-stdin "$registry" >/dev/null
  docker pull "$image"
  docker logout "$registry" >/dev/null 2>&1 || true
  rm -f -- "$docker_config/config.json"
elif ! docker image inspect "$image" >/dev/null 2>&1; then
  echo "Image not found locally and is not an ECR URI: $image" >&2
  exit 1
fi

backup=""
new_container_attempted=false
rollback() {
  status=$?
  trap - EXIT
  if (( status != 0 )); then
    if [[ "$new_container_attempted" == true ]] && docker inspect tertulia-frontend >/dev/null 2>&1; then
      docker rm -f tertulia-frontend >/dev/null
    fi
    if [[ -n "$backup" ]] && docker inspect "$backup" >/dev/null 2>&1; then
      docker rename "$backup" tertulia-frontend
      docker start tertulia-frontend
      echo "Frontend deployment failed; previous container restored." >&2
    fi
  fi
  cleanup_auth
  exit "$status"
}
trap rollback EXIT

if docker inspect tertulia-frontend >/dev/null 2>&1; then
  backup="tertulia-frontend-rollback-$(date +%s%N)"
  docker rename tertulia-frontend "$backup"
  docker stop "$backup" >/dev/null || true
fi

new_container_attempted=true
docker run -d \
  --name tertulia-frontend \
  --restart unless-stopped \
  --publish 127.0.0.1:4000:80 \
  "$image" >/dev/null

healthy=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:4000/ >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  echo "Frontend health check failed on port 4000." >&2
  docker logs tertulia-frontend >&2 || true
  exit 1
fi

if [[ -n "$backup" ]]; then
  docker rm "$backup" >/dev/null
fi
backup=""
cleanup_auth
trap - EXIT
echo "Frontend deployed successfully: $image"

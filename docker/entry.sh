#!/bin/sh

chown pokybuild:nogroup /sharedrepo
chown pokybuild:nogroup /publish
chown pokybuild:nogroup /home/pokybuild/git/mirror
chown pokybuild:nogroup /srv/autobuilder
cd /home/pokybuild/ || exit 1

docker_name=$(host "$(host "$(hostname)" | awk '{print $NF}')" | awk '{print $NF}' | awk -F . '{print $1}')
role=$(echo "${docker_name}" | cut -d_ -f 2)
instance=$(echo "${docker_name}" | cut -d_ -f 3)

if [ "${role}" = "controller" ]; then
  su pokybuild -c "yocto-autobuilder-helper/janitor/ab-janitor" &
  su pokybuild -c "buildbot start yocto-controller"
  #tail -F yocto-controller/twistd.log &
elif [ "${role}" = "worker" ] || [ "${role}" = "extraworker" ]; then
  if [ "${role}" = "extraworker" ]; then
      worker_name="local-worker-extra-${instance}"
  else
      worker_name=local-worker-debian
  fi
  buildbot-worker create-worker -r --umask=0o22 yocto-worker controller "${worker_name}" pass
  chown -R pokybuild:nogroup yocto-worker
  su pokybuild -c "buildbot-worker start yocto-worker"
else
  echo "Unexpected role: ${role}"
  exit 2
fi

/bin/bash

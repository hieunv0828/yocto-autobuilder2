#!/bin/sh

chown pokybuild:nogroup /sharedrepo
chown pokybuild:nogroup /publish
chown pokybuild:nogroup /home/pokybuild/git/mirror
chown pokybuild:nogroup /srv/autobuilder
cd /home/pokybuild/ || exit 1

role="$1"

if [ "${role}" = "controller" ]; then
  su pokybuild -c "yocto-autobuilder-helper/janitor/ab-janitor" &
  su pokybuild -c "buildbot start yocto-controller"
  #tail -F yocto-controller/twistd.log &
elif [ "${role}" = "worker" ]; then
  workername="$2"
  su pokybuild -c "buildbot-worker start ${workername}"
else
  echo "Unexpected role: ${role}"
  exit 2
fi

/bin/bash

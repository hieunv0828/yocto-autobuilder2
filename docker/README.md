# Local autobuilder setup docker

This docker compose configuration aims to provide a working minimal setup,
allowing to test and debug the buildbot configuration.

It create two docker containers based on the same image, one acting as a
buildbot controller, one acting as buildbot worker.

The buildbot configuration will be modified in several ways from the
configuration used in the public autobuilders. Main changes include:
 - Only a few workers will be used.
 - Git urls will be modified to use git protocol instead of ssh, removing needs
   for authentication.
 - All nightly schedulers will be disabled.

## Usage

The local autobuilder can be started by running `docker-compose up` in this
folder. Once the dockers are started, buildbot web interface will be exposed on
http://localhost:8010/. Note that with the default profile, only one worker will
be started. You can start extra workers with `docker-compose --profile
manyworkers`.

You might want to modify the `compose.yaml` file first to suit your needs, such
as the cpu count, memory limits and number of extra workers.

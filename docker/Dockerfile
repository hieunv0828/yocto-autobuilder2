FROM ubuntu:24.04

ARG AUTOBUILDER2_BRANCH=master

USER root

# Install needed packages
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
    apt full-upgrade -y && \
    apt -y install \
        build-essential \
        chrpath \
        cpio \
        debianutils \
        diffstat \
        file \
        gawk \
        gcc \
        git \
        iproute2 \
        iputils-ping \
        libacl1 \
        liblz4-tool \
        locales \
        npm \
        python3 \
        python3-git \
        python3-jinja2 \
        python3-pexpect \
        python3-pip \
        python3-subunit \
        socat \
        texinfo \
        unzip \
        virtualenv \
        wget \
        xz-utils \
        zstd

RUN pip3 install --break-system-packages \
        buildbot==4.2.1 \
        buildbot-www==4.2.1 \
        buildbot-waterfall-view==4.2.1 \
        buildbot-console-view==4.2.1 \
        buildbot-grid-view==4.2.1 \
        buildbot-worker==4.2.1 \
        buildbot_pkg==4.2.1 \
        websockets

RUN npm install -g yarn

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN ssh-keyscan push.yoctoproject.org push.openembedded.org >> /etc/ssh/ssh_known_hosts

# Setup buildbot
COPY yocto-autobuilder2_patches /yocto-autobuilder2_patches
RUN useradd -m --system pokybuild && \
    cd /home/pokybuild && \
    buildbot create-master -r yocto-controller && \
    buildbot-worker create-worker -r --umask=0o22 yocto-worker controller example-worker pass && \
    \
    cd yocto-controller && \
    git clone https://git.yoctoproject.org/git/yocto-autobuilder2 yoctoabb && \
    git -C yoctoabb apply /yocto-autobuilder2_patches/*.patch && \
    ln -rs yoctoabb/master.cfg master.cfg && \
    \
    cd /home/pokybuild && \
    git clone https://git.yoctoproject.org/git/yocto-autobuilder-helper && \
    pip install --break-system-packages \
        yocto-controller/yoctoabb/yocto_console_view/ && \
    mkdir -p /home/pokybuild/git/ && \
    mkdir -p /home/pokybuild/tmp/ && \
    echo "[user]\nname=pokybuild\nemail=pokybuild@none\n" > \
        /home/pokybuild/.gitconfig && \
    chown -R pokybuild:nogroup /home/pokybuild && \
    mkdir -p /srv/autobuilder/ && \
    chown -R pokybuild:nogroup /srv/autobuilder/

# Fix config files for local runner
RUN sed -i \
        # Add example-worker \
        -e "s/^\(workers_debian *=.*\).*/\1 + [\"example-worker\"]/" \
        # Remove workers_bringup from all_workers \
        -e "/^all_workers *=/s/workers_bringup + //" \
        # Switch from ssh:// URLS to git:// so we do not need any auth \
        -e "s#ssh://git@push\.\(yoctoproject.org\|openembedded.org\)/#git://git.\1/#" \
        # Change location of sharedrepodir and publish_dest directories \
        -e "s@^\(sharedrepodir *= *\).*@\1\"/sharedrepo\"@" \
        -e "s@^\(publish_dest *= *\).*@\1\"/publish\"@" \
        /home/pokybuild/yocto-controller/yoctoabb/config.py && \
    sed -i \
        # Change location of sharedrepodir and publish_dest directories \
        -e "s#ssh://git@push\.\(yoctoproject.org\|openembedded.org\)/#git://git.\1/#" \
        /home/pokybuild/yocto-autobuilder-helper/config.json && \
    sed -i \
        # imp was removed in python 3.12, switch to importlib \
        -e "s/^import imp$/import importlib as imp/" \
        # Fix own URL \
        -e "s@^\(c\['buildbotURL'\] *= *\).*@\1\"http://localhost:8010/\"@" \
        /home/pokybuild/yocto-controller/master.cfg && \
    # Comment any sched.Nightly schedulers \
    # We try to support multilines code blocks by counting parenthesis \
    awk '/^schedulers.append\(sched.Nightly\(/{comment=1} /\(/{count+=gsub("\\(", "(")} /\)/{count-=gsub("\\)", ")")} {if (comment) {print "#" $0} else {print} if (count==0) comment=0}' \
        /home/pokybuild/yocto-controller/yoctoabb/schedulers.py

COPY entry.sh /
RUN chmod a+x /entry.sh

ENTRYPOINT ["/entry.sh"]

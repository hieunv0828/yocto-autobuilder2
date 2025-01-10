#
# SPDX-License-Identifier: GPL-2.0-only
#

# ## Build configuration, tied to config.json in yocto-autobuilder-helpers
# Repositories used by each builder
buildertorepos = {
    "eclipse-plugin-neon": ["eclipse-poky-neon"],
    "eclipse-plugin-oxygen": ["eclipse-poky-oxygen"],
    "a-quick": ["poky", "meta-intel", "oecore", "bitbake",
                "meta-mingw", "meta-gplv2"],
    "a-full": ["poky", "meta-intel", "oecore", "bitbake",
                "meta-mingw", "meta-gplv2", "meta-arm", "meta-aws", "meta-agl", "meta-openembedded", "meta-virtualization", "meta-clang"],
    "non-gpl3": ["poky", "meta-gplv2"],
    "meta-mingw": ["poky", "meta-mingw"],
    "qa-extras": ["poky", "meta-mingw"],
    "meta-oe": ["poky", "meta-openembedded"],
    "meta-virt": ["poky", "meta-openembedded", "meta-virtualization"],
    "meta-intel": ["poky", "meta-intel"],
    "meta-exein": ["poky", "meta-exein", "meta-openembedded"],
    "meta-arm": ["poky", "meta-arm"],
    "meta-agl-core": ["poky", "meta-agl"],
    "meta-aws": ["poky", "meta-aws", "meta-openembedded"],
    "meta-clang": ["poky", "meta-clang"],
    "buildtools-docs": ["poky", "meta-openembedded"],
    "qemuarm-oecore": ["oecore", "bitbake"],
    "checkuri": ["poky"],
    "check-layer": ["poky", "meta-mingw", "meta-gplv2"],
    "check-layer-nightly": ["poky", "meta-agl", "meta-arm", "meta-aws", "meta-intel", "meta-openembedded", "meta-virtualization", "meta-ti", "meta-security", "meta-clang", "meta-exein"],
    "docs": ["yocto-autobuilder-helper", "yocto-docs", "bitbake"],
    "reproducible-meta-oe": ["poky", "meta-openembedded"],
    "patchtest": ["poky", "meta-patchtest", "meta-openembedded"],
    "meta-oe-mirror":  ["poky", "meta-openembedded"],
    "auh":  ["poky", "auto-upgrade-helper"],
    "auh-meta-oe":  ["poky", "meta-openembedded", "auto-upgrade-helper"],
    "metrics":  ["poky", "meta-openembedded"],
    "meta-webosose":  ["poky", "meta-clang", "meta-openembedded", "meta-qt6", "meta-webosose", "meta-security"],
    "default": ["poky"]
}

# Repositories used that the scripts need to know about and should be buildbot
# user customisable
repos = {
    "yocto-autobuilder-helper":
        ["ssh://git@push.yoctoproject.org/yocto-autobuilder-helper",
         "master"],
    "eclipse-poky-neon": ["ssh://git@push.yoctoproject.org/eclipse-yocto",
                          "neon-master"],
    "eclipse-poky-oxygen": ["ssh://git@push.yoctoproject.org/eclipse-yocto",
                            "oxygen-master"],
    "poky": ["ssh://git@push.yoctoproject.org/poky", "master"],
    "meta-intel": ["ssh://git@push.yoctoproject.org/meta-intel", "master"],
    "meta-arm": ["ssh://git@push.yoctoproject.org/meta-arm", "master"],
    "meta-agl": ["https://git.automotivelinux.org/AGL/meta-agl", "next"],
    "meta-aws": ["https://github.com/aws/meta-aws.git", "master"],
    "meta-ti": ["ssh://git@push.yoctoproject.org/meta-ti", "master"],
    "meta-exein": ["https://github.com/exein-io/meta-exein", "main"],
    "meta-security": ["ssh://git@push.yoctoproject.org/meta-security", "master"],
    "oecore": ["ssh://git@push.openembedded.org/openembedded-core",
                          "master"],
    "bitbake": ["ssh://git@push.openembedded.org/bitbake", "master"],
    "auto-upgrade-helper": ["ssh://git@push.yoctoproject.org/auto-upgrade-helper", "master"],
    "meta-qt6": ["http://code.qt.io/yocto/meta-qt6.git", "6.7.2"],
    "meta-qt4": ["ssh://git@push.yoctoproject.org/meta-qt4", "master"],
    "meta-qt3": ["ssh://git@push.yoctoproject.org/meta-qt3", "master"],
    "meta-mingw": ["ssh://git@push.yoctoproject.org/meta-mingw", "master"],
    "meta-gplv2": ["ssh://git@push.yoctoproject.org/meta-gplv2", "master"],
    "meta-patchtest": ["ssh://git@push.yoctoproject.org/meta-patchtest", "master"],
    "meta-openembedded": ["ssh://git@push.openembedded.org/meta-openembedded", "master"],
    "meta-virtualization": ["ssh://git@push.yoctoproject.org/meta-virtualization", "master"],
    "yocto-docs": ["ssh://git@push.yoctoproject.org/yocto-docs", "master"],
    "meta-clang": ["https://github.com/kraj/meta-clang.git", "master"],
    "meta-webosose": ["https://github.com/webosose/meta-webosose.git", "master"],
}

trigger_builders_wait_shared = [
    "qemuarm", "qemuarm-alt", "qemuarm-tc",
    "qemuarm64", "qemuarm64-alt", "qemuarm64-tc",
    "qemumips", "qemumips-tc",
    "qemumips64", "qemumips64-tc",
    "qemuppc", "qemuppc-tc",
    "qemux86", "qemux86-alt", "qemux86-tc",
    "qemux86-64", "qemux86-64-alt", "qemux86-64-tc",
    "qemuarm-oecore",
    "qemux86-64-x32", "qemux86-world",
    "multilib",
    "edgerouter",
    "genericarm64", "genericarm64-alt",
    "genericx86", "genericx86-alt",
    "genericx86-64", "genericx86-64-alt",
    "beaglebone", "beaglebone-alt",
    "pkgman-non-rpm",
    "build-appliance", "buildtools",
    "non-gpl3", "wic",
    "poky-tiny", "musl-qemux86", "musl-qemux86-64", "no-x11",
    "qa-extras", "qa-extras2",
    "check-layer", "meta-mingw",
    "reproducible",
    "patchtest-selftest",
    "oe-selftest-armhost",
    "qemuarm64-armhost"
]

trigger_builders_wait_quick = trigger_builders_wait_shared + [
    "oe-selftest", "qemux86-64-ptest-fast", "qemuarm64-ptest-fast"
]

trigger_builders_wait_full = trigger_builders_wait_shared + [
    "qemumips-alt", "edgerouter-alt", "qemuppc-alt", "qemux86-world-alt",
    "oe-selftest-ubuntu", "oe-selftest-debian", "oe-selftest-fedora", "oe-selftest-centos",
    "qemux86-64-ptest", "qemux86-64-ltp", "qemuarm64-ptest", "qemuarm64-ltp",
    "meta-intel", "meta-arm", "meta-aws", "meta-agl-core", "meta-virt", "qemuarmv5"
]

trigger_builders_wait_quick_releases = {
    "master" : trigger_builders_wait_quick,
    "scarthgap" : trigger_builders_wait_quick,
    "zeus" : trigger_builders_wait_quick + ["mpc8315e-rdb"],
    "thud" : trigger_builders_wait_quick + ["mpc8315e-rdb"],
    "sumo" : trigger_builders_wait_quick + ["mpc8315e-rdb"]
}

trigger_builders_wait_full_releases = {
    "master" : trigger_builders_wait_full + ["meta-clang"],
    "scarthgap" : trigger_builders_wait_full,
    "zeus" : trigger_builders_wait_full + ["mpc8315e-rdb-alt"],
    "thud" : trigger_builders_wait_full + ["mpc8315e-rdb-alt"],
    "sumo" : trigger_builders_wait_shared + ["qemumips-alt", "edgerouter-alt", "mpc8315e-rdb-alt", "qemuppc-alt", "qemux86-world-alt",
                                             "oe-selftest-ubuntu", "oe-selftest-debian", "oe-selftest-centos"]
}

trigger_builders_wait_perf = ["buildperf-debian11", "buildperf-alma8"]

# Builders which are individually triggered
builders_others = [
    "reproducible-ubuntu", "reproducible-debian", "reproducible-fedora", "reproducible-centos",
    "meta-oe", "meta-virt", "meta-clang", "meta-exein",
    "bringup", "bringup-fast", "buildtools-docs",
    "qemuarm-armhost",
    "check-layer-nightly",
    "metrics", "indexing",
    "qemuriscv32", "qemuriscv32-tc",
    "qemuriscv64", "qemuriscv64-ptest", "qemuriscv64-tc",
    "qemuppc64", "qemuppc64-tc",
    "qemux86-ptest", "qemux86-ptest-fast",
    "buildperf-debian11",
    "buildperf-alma8",
    "reproducible-meta-oe",
    "patchtest-selftest",
    "toaster",
    "patchtest",
    "yocto-mirror",
    "meta-oe-mirror",
    "auh", "auh-meta-oe",
    "meta-webosose"
]

subbuilders = list(set(trigger_builders_wait_quick + trigger_builders_wait_full + trigger_builders_wait_perf + builders_others))
builders = ["a-quick", "a-full", "docs"] + subbuilders

# ## Cluster configuration
# Publishing settings
sharedrepodir = "/srv/autobuilder/repos"
publish_dest = "/srv/autobuilder/autobuilder.yocto.io/pub"

# Web UI settings
web_port = 8010

# List of workers in the cluster
workers_ubuntu = ["ubuntu2004-vk-1", "ubuntu2004-vk-2", "ubuntu2004-vk-3", "ubuntu2204-vk-1", "ubuntu2204-vk-2", "ubuntu2204-vk-3", "ubuntu2204-vk-4", "ubuntu2404-vk-1", "ubuntu2404-vk-2", "ubuntu2404-vk-3", "ubuntu2410-vk-1"]
workers_centos = ["alma8-vk-1", "alma8-vk-2", "rocky8-vk-1", "alma9-vk-1", "alma9-vk-2", "stream9-vk-1", "rocky9-vk-1", "rocky9-vk-2", "rocky9-vk-3"]
workers_fedora = ["fedora38-vk-2", "fedora38-vk-3", "fedora39-vk-1", "fedora39-vk-2", "fedora40-vk-1", "fedora40-vk-2", "fedora40-vk-3", "fedora40-vk-4", "fedora41-vk-1"]
workers_debian = ["debian11-vk-1", "debian11-vk-2", "debian11-vk-3", "debian12-vk-1", "debian12-vk-2", "debian12-vk-3", "debian12-vk-4", "debian12-vk-5", "debian12-vk-6", "debian12-vk-7", "debian12-vk-8", "debian12-vk-9"]
workers_opensuse = ["opensuse155-vk-1", "opensuse155-vk-2", "opensuse156-vk-1"]

workers = workers_ubuntu + workers_centos + workers_fedora + workers_debian + workers_opensuse

workers_bringup = ["opensuse156-vk-1", "ubuntu2410-vk-1"]
# workers with wine on them for meta-mingw
workers_wine = ["ubuntu2004-vk-1", "ubuntu2004-vk-2", "ubuntu2004-vk-3", "ubuntu2204-vk-1", "ubuntu2204-vk-2", "ubuntu2204-vk-3", "ubuntu2204-vk-4", "ubuntu2404-vk-1", "ubuntu2404-vk-2", "ubuntu2404-vk-3", "ubuntu2410-vk-1"]
workers_arm = ["ubuntu2004-vk-arm1", "ubuntu2004-vk-arm2", "ubuntu2204-vk-arm1", "ubuntu2204-vk-arm2", "ubuntu2404-vk-arm1", "ubuntu2404-vk-arm2", "ubuntu2410-vk-arm1"]
workers_buildperf = ["perf-debian12-vk", "perf-alma8-vk"]
# workers which don't need buildtools for AUH and are able to send email to mailing lists
workers_auh = ["alma8-vk-2"]
#workers_toaster = ["ubuntu2204-vk-1", "ubuntu2204-vk-2"]
workers_toaster = ["ubuntu2204-vk-1", "ubuntu2204-vk-2", "ubuntu2204-vk-3", "ubuntu2204-vk-4", "ubuntu2404-vk-1", "ubuntu2404-vk-2", "ubuntu2404-vk-3", "ubuntu2410-vk-1"]

all_workers = workers + workers_bringup + workers_buildperf + workers_arm

# Worker filtering for older releases
workers_prev_releases = {
    "styhead" : ("alma8", "alma9", "debian11", "debian12", "fedora38", "fedora39", "fedora40", "opensuse154", "opensuse155", "opensuse156", "rocky9", "stream8", "ubuntu1804", "ubuntu2004","ubuntu2204", "ubuntu2304", "ubuntu2404", "perf-"),
    "scarthgap" : ("alma8", "alma9", "debian11", "debian12", "fedora38", "fedora39", "fedora40", "opensuse154", "rocky9", "stream8", "ubuntu1804", "ubuntu2004","ubuntu2204", "ubuntu2304", "perf-"),
    "nanbield" : ("alma8", "alma9", "debian11", "debian12", "fedora37", "fedora38", "opensuse153", "opensuse154", "rocky9", "stream8", "ubuntu1804", "ubuntu2004","ubuntu2204", "ubuntu2304", "perf-"),
    "mickledore" : ("alma8", "alma9", "debian10", "debian11", "fedora35", "fedora36", "fedora37", "fedora38", "opensuse153", "opensuse154", "ubuntu1804", "ubuntu2004","ubuntu2204", "perf-"),
    "langdale" : ("alma8", "alma9", "debian10", "debian11", "fedora35", "fedora36", "opensuse153", "opensuse154", "ubuntu1804", "ubuntu2004","ubuntu2204", "perf-"),
    "kirkstone" : ("alma8", "alma9", "centos7", "centos8", "debian8", "debian9", "debian10", "debian11", "fedora29", "fedora30", "fedora31", "fedora32", "fedora33", "fedora34", "fedora35", "fedora36", "fedora37", "fedora38", "fedora39", "fedora40", "opensuse150", "opensuse151", "opensuse152", "opensuse153", "ubuntu1604", "ubuntu1804", "ubuntu1904", "ubuntu2004", "ubuntu2110", "ubuntu2204", "perf-"),
    "honister" : ("alma8", "centos7", "centos8", "debian8", "debian9", "debian10", "debian11", "fedora29", "fedora30", "fedora31", "fedora32", "fedora33", "fedora34", "fedora35", "opensuse150", "opensuse151", "opensuse152", "opensuse153", "ubuntu1604", "ubuntu1804", "ubuntu1904", "ubuntu2004", "ubuntu2110", "ubuntu2204", "perf-"),
    "hardknott" : ("centos7", "centos8", "debian8", "debian9", "debian10", "debian11", "fedora31", "fedora32", "fedora33", "fedora34", "opensuse152", "ubuntu1604", "ubuntu1804", "ubuntu2004", "perf-"),
    "gatesgarth" : ("centos7", "centos8", "debian8", "debian9", "debian10", "fedora30", "fedora31", "fedora32", "opensuse150", "opensuse151", "opensuse152", "ubuntu1604", "ubuntu1804", "ubuntu1904", "ubuntu2004", "perf-"),
    "dunfell" : ("alma8", "centos7", "centos8", "debian8", "debian9", "debian10", "debian11", "fedora29", "fedora30", "fedora31", "fedora32", "fedora33", "fedora34", "fedora35", "fedora36", "fedora37", "fedora38", "opensuse150", "opensuse151", "opensuse152", "opensuse153", "ubuntu1604", "ubuntu1804", "ubuntu1904", "ubuntu2004", "ubuntu2204", "perf-"),
    "zeus" : ("centos7", "debian8", "debian9", "debian10", "fedora28", "fedora29", "fedora30", "opensuse150", "opensuse151", "ubuntu1604", "ubuntu1804", "ubuntu1904", "perf-"),
    "warrior" : ("centos7", "debian8", "debian9", "debian10", "fedora28", "fedora29", "fedora30", "opensuse150", "opensuse151", "ubuntu1604", "ubuntu1804", "ubuntu1904", "perf-"),
    "thud" : ("centos7", "debian8", "debian9", "debian10", "fedora28", "fedora29", "fedora30", "opensuse150", "opensuse151", "ubuntu1604", "ubuntu1804", "ubuntu1904", "perf-"),
    "sumo" : ("centos7", "debian8", "debian9", "fedora28", "ubuntu1604", "ubuntu1804", "perf-")
}

# Worker configuration, all workers configured the same...
# TODO: support per-worker config
worker_password = "pass"
worker_max_builds = None
notify_on_missing = None

# Some builders should only run on specific workers (host OS dependent)
builder_to_workers = {
    "bringup": workers_bringup + workers,
    "bringup-fast": workers_bringup + workers,
    "oe-selftest-ubuntu": workers_ubuntu,
    "oe-selftest-debian": workers_debian,
    "oe-selftest-fedora": workers_fedora,
    "oe-selftest-opensuse": workers_opensuse,
    "oe-selftest-centos": workers_centos,
    "oe-selftest-armhost": workers_arm,
    "reproducible-ubuntu": workers_ubuntu,
    "reproducible-debian": workers_debian,
    "reproducible-fedora": workers_fedora,
    "reproducible-opensuse": workers_opensuse,
    "reproducible-centos": workers_centos,
    "meta-mingw": workers_wine,
    "buildperf-debian11": ["perf-debian12-vk"],
    "buildperf-alma8": ["perf-alma8-vk"],
    "qemuarm-armhost": workers_arm,
    "qemuarm64-ptest": workers_arm,
    "qemuarm64-ptest-fast": workers_arm,
    "qemuarm64-ltp": workers_arm,
    "qemuarm64-armhost": workers_arm,
    "auh" : workers_auh,
    "auh-meta-oe" : workers_auh,
    "metrics": workers_centos + workers_debian + workers_opensuse,
    "toaster": workers_toaster,
    "default": workers
}

builder_tags = {
    "qemuarm":  ["qemu"],
    "qemuarm64":  ["qemu"],
    "qemuarmv5":  ["qemu"],
    "qemumips": ["qemu"],
    "qemumips64": ["qemu"],
    "qemuppc": ["qemu"],
    "qemuppc64": ["qemu"],
    "qemux86": ["qemu"],
    "qemux86-64": ["qemu"],
    "qemux86-64-x32": ["qemu"],
    "qemuriscv32": ["qemu"],
    "qemuriscv64": ["qemu"],
    "qemuppc64": ["qemu"],

    "qemuarm-alt": ["qemu-alt"],
    "qemuarm64-alt": ["qemu-alt"],
    "qemumips-alt": ["qemu-alt"],
    "qemuppc-alt": ["qemu-alt"],
    "qemux86-alt": ["qemu-alt"],
    "qemux86-64-alt": ["qemu-alt"],

    "qemuarm-tc":  ["toolchain"],
    "qemuarm64-tc":  ["toolchain"],
    "qemumips-tc": ["toolchain"],
    "qemumips64-tc": ["toolchain"],
    "qemuppc-tc": ["toolchain"],
    "qemuppc64-tc": ["toolchain"],
    "qemux86-tc": ["toolchain"],
    "qemux86-64-tc": ["toolchain"],
    "qemuriscv32-tc": ["toolchain"],
    "qemuriscv64-tc": ["toolchain"],
    "qemuppc64-tc": ["toolchain"],

    "beaglebone": ["hw-ref"],
    "edgerouter": ["hw-ref"],
    "genericarm64": ["hw-ref"],
    "genericx86": ["hw-ref"],
    "genericx86-64": ["hw-ref"],

    "beaglebone-alt": ["hw-ref-alt"],
    "edgerouter-alt": ["hw-ref-alt"],
    "genericarm64-alt": ["hw-ref-alt"],
    "genericx86-alt": ["hw-ref-alt"],
    "genericx86-64-alt": ["hw-ref-alt"],

    "meta-intel": ["layers"],
    "meta-arm": ["layers"],
    "meta-aws": ["layers"],
    "meta-agl-core": ["layers"],
    "meta-virt": ["layers"],

    "musl-qemux86": ["musl"],
    "musl-qemux86-64": ["musl"],

    "qemuarm64-ptest": ["ptest"],
    "qemuarm64-ptest-fast": ["ptest"],
    "qemux86-64-ptest": ["ptest"],
    "qemux86-64-ptest-fast": ["ptest"],
    "qemux86-ptest": ["ptest"],
    "qemux86-ptest-fast": ["ptest"],
    "qemuriscv64-ptest": ["ptest"],

    "qemuarm64-ltp": ["ltp"],
    "qemux86-64-ltp": ["ltp"],

    "oe-selftest-armhost": ["selftest"],
    "oe-selftest-ubuntu": ["selftest"],
    "oe-selftest-debian": ["selftest"],
    "oe-selftest-fedora": ["selftest"],
    "oe-selftest-centos": ["selftest"],
    "oe-selftest": ["selftest"],
}

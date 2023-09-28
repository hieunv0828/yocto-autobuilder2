#
# SPDX-License-Identifier: GPL-2.0-only
#

from buildbot.plugins import reporters
from yoctoabb import config
import os

services = []

with open(os.path.join(os.path.dirname(__file__), "default_mail.txt"), "r") as f:
    emailtext = "\n".join(f.readlines())

formatter = reporters.MessageFormatter(template=emailtext)

generator = reporters.BuildStatusGenerator(
    mode=('failing', 'warnings', 'exception', 'cancelled'),
    message_formatter=formatter,
    builders=['a-full', 'a-quick', 'buildperf-alma8', 'buildperf-debian11', 'docs'])

#services.append(
#     reporters.MailNotifier(fromaddr="controller@yoctoproject.org",
#                            extraRecipients=["yocto-builds@lists.yoctoproject.org"],
#                            generators=[generator])
#)


# services.append(
#     reporters.IRC(host="irc.freenode.net",
#                   nick="YoctoAutobuilderBot",
#                   password=""
#                   notify_events={
#                     'successToFailure': 1,
#                     'failureToSuccess': 0
#                   },
#                   channels=["yocto"],
#                   noticeOnChannel=True))

# from yoctoabb.reporters import wikilog
# services.append(
#     wikilog.WikiLog("https://wiki.yoctoproject.org/wiki/api.php",
#                     "User", "password", "LogPage",
#                     "Production Cluster")
# )

# from yoctoabb.reporters import swatbot
# services.append(
#     swatbot.SwatBot("http://localhost:8000/", "buildbot-notifier", "password")
# )

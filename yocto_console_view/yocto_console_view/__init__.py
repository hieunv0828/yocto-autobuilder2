# This file is part of Buildbot.  Buildbot is free software: you can
# redistribute it and/or modify it under the terms of the GNU General Public
# License as published by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright Buildbot Team Members

from buildbot.www.plugin import Application
from buildbot.schedulers.forcesched import ChoiceStringParameter

import json

# create the interface for the setuptools entry point
ep = Application(__package__, "Yocto Buildbot Console View plugin")

class ReleaseSelector(ChoiceStringParameter):

    spec_attributes = ["selectors"]
    selectors = None

    def __init__(self, name, selectors, **kw):
        def format_choice(choice):
            return choice + ': ' + json.dumps(selectors.get(choice, {}))

        super().__init__(name, **kw)
        self.choices = [format_choice(choice)
                        for choice in kw.get('choices', {})]
        self.__dict__['default'] = format_choice(self.__dict__['default'])

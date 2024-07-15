/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import 'angular-animate';
import '@uirouter/angularjs';
import 'guanlecoja-ui';
import 'buildbot-data-js';

class ConsoleState {
    constructor($stateProvider, glMenuServiceProvider, bbSettingsServiceProvider) {

        // Name of the state
        const name = 'console';

        // Menu configuration
        glMenuServiceProvider.addGroup({
            name,
            caption: 'Yocto Console View',
            icon: 'exclamation-circle',
            order: 5
        });

        // Configuration
        const cfg = {
            group: name,
            caption: 'Yocto Console View'
        };

        // Register new state
        const state = {
            controller: `${name}Controller`,
            controllerAs: "c",
            template: require('./console.tpl.jade'),
            name,
            url: `/${name}`,
            data: cfg
        };

        $stateProvider.state(state);

        bbSettingsServiceProvider.addSettingsGroup({
            name: 'Console',
            caption: 'Console related settings',
            items: [{
                type: 'integer',
                name: 'buildLimit',
                caption: 'Number of builds to fetch',
                default_value: 200
            }
            , {
                type: 'integer',
                name: 'changeLimit',
                caption: 'Number of changes to fetch',
                default_value: 30
            }
            ]});
    }
}

class Console {
    constructor($scope, $q, $window, dataService, bbSettingsService, resultsService,
        $uibModal, $timeout) {
        this.onChange = this.onChange.bind(this);
        this._onChange = this._onChange.bind(this);
        this.matchBuildWithChange = this.matchBuildWithChange.bind(this);
        this.makeFakeChange = this.makeFakeChange.bind(this);
        this.$scope = $scope;
        this.$window = $window;
        this.$uibModal = $uibModal;
        this.$timeout = $timeout;
        angular.extend(this, resultsService);
        const settings = bbSettingsService.getSettingsGroup('Console');
        this.buildLimit = settings.buildLimit.value;
        this.changeLimit = settings.changeLimit.value;
        this.dataAccessor = dataService.open().closeOnDestroy(this.$scope);
        this._infoIsExpanded = {};
        this.$scope.all_builders = (this.all_builders = this.dataAccessor.getBuilders());
        this.$scope.builders = (this.builders = []);
        this.$scope.buildergroups = (this.buildergroups = []);
        if (typeof Intl !== 'undefined' && Intl !== null) {
            const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
            this.strcompare = collator.compare;
        } else {
            this.strcompare = function(a, b) {
                if (a < b) {
                    return -1;
                }
                if (a === b) {
                    return 0;
                }
                return 1;
            };
        }

        this.$scope.revmapping = (this.revmapping = {});
        this.$scope.branchmapping = (this.branchmapping = {});

        this.$scope.builds = (this.builds = this.dataAccessor.getBuilds({
            property: ["yp_build_revision", "yp_build_branch", "reason", "publish_destination"],
            limit: this.buildLimit,
            order: '-started_at'
        }));
        this.changes = this.dataAccessor.getChanges({limit: this.changeLimit, order: '-changeid'});
        this.$scope.fakechanges = (this.fakechanges = []);
        this.buildrequests = this.dataAccessor.getBuildrequests({limit: this.buildLimit, order: '-submitted_at'});
        this.buildsets = this.dataAccessor.getBuildsets({limit: this.buildLimit, order: '-submitted_at'});

        this.builds.onChange = this.onChange;
        this.changes.onChange = this.onChange;
        this.buildrequests.onChange = this.onChange;
        this.buildsets.onChange = this.onChange;

        this.builds.onNew = build => {
            let change = false;
            let {
                buildid
            } = build;
            if ((build.properties != null ? build.properties.yp_build_revision : undefined) != null) {
                this.revmapping[build.buildid] = build.properties.yp_build_revision[0];
                change = true;
            }
            if ((build.properties != null ? build.properties.yp_build_branch : undefined) != null) {
                this.branchmapping[build.buildid] = build.properties.yp_build_branch[0];
                change = true;
            }
            if ((!this.revmapping[buildid] || !this.branchmapping[buildid]) && !build.complete_at) {
                build.getProperties().onChange = properties => {
                    change = false;
                    buildid = properties.endpoint.split('/')[1];
                    if (!this.revmapping[buildid]) {
                        const rev = this.getBuildProperty(properties[0], 'yp_build_revision');
                        if (rev != null) {
                            this.revmapping[buildid] = rev;
                            change = true;
                        }
                    }
                    if (!this.branchmapping[buildid]) {
                        const branch = this.getBuildProperty(properties[0], 'yp_build_branch');
                        if (branch != null) {
                            this.branchmapping[buildid] = branch;
                            change = true;
                        }
                    }
                    if (change && (this.onchange_debounce == null)) {
                        this.onchange_debounce = this.$timeout(this._onChange, 100);
                    }
                };
            }
            if (change && (this.onchange_debounce == null)) {
                this.onchange_debounce = this.$timeout(this._onChange, 100);
            }
        };
    }

    getBuildProperty(properties, property) {
        const hasProperty = properties && properties.hasOwnProperty(property);
        if (hasProperty) { return properties[property][0]; } else { return null; }
    }

    onChange(s) {
        // if there is no data, no need to try and build something.
        if ((this.builds.length === 0) || (this.all_builders.length === 0) || !this.changes.$resolved ||
                (this.buildsets.length === 0) || (this.buildrequests === 0)) {
            return;
        }
        if ((this.onchange_debounce == null)) {
            this.onchange_debounce = this.$timeout(this._onChange, 100);
        }
    }

    _onChange() {
        let build, change;
        this.onchange_debounce = undefined;
        // we only display builders who actually have builds
        for (build of Array.from(this.builds)) {
            this.all_builders.get(build.builderid).hasBuild = true;
        }

        this.sortBuildersByTags(this.all_builders);

        if (this.changesBySSID == null) { this.changesBySSID = {}; }
        if (this.changesByRevision == null) { this.changesByRevision = {}; }
        for (change of Array.from(this.changes)) {
            this.changesBySSID[change.sourcestamp.ssid] = change;
            this.changesByRevision[change.revision] = change;
            this.populateChange(change);
        }
        for (change of Array.from(this.fakechanges)) {
            this.populateChange(change);
        }

        for (build of Array.from(this.builds)) {
            this.matchBuildWithChange(build);
        }

        this.filtered_changes = [];

        for (let ssid in this.changesBySSID) {
            change = this.changesBySSID[ssid];
            if (change.comments) {
                change.subject = change.comments.split("\n")[0];
            }
            for (let builder of Array.from(change.builders)) {
                if (builder.builds.length > 0) {
                    this.filtered_changes.push(change);
                    break;
                }
            }
        }
    }
    /*
     * Sort builders by tags
     * Buildbot eight has the category option, but it was only limited to one category per builder,
     * which make it easy to sort by category
     * Here, we have multiple tags per builder, we need to try to group builders with same tags together
     * The algorithm is rather twisted. It is a first try at the concept of grouping builders by tags..
     */

    sortBuildersByTags(all_builders) {
        // first we only want builders with builds
        let builder, builders, tag;
        const builders_with_builds = [];
        let builderids_with_builds = "";
        for (let builder of Array.from(all_builders)) {
            if (builder.hasBuild && builder.name != 'indexing') {
                builders_with_builds.push(builder);
                builderids_with_builds += `.${builder.builderid}`;
            }
        }

        if (builderids_with_builds === this.last_builderids_with_builds) {
            // don't recalculate if it hasn't changed!
            return;
        }

        const builders_by_tags = {};
        for (builder of Array.from(builders_with_builds)) {
            if (builder.tags != null && builder.tags.length) {
                for (tag of Array.from(builder.tags)) {
                    if ((builders_by_tags[tag] == null)) {
                        builders_by_tags[tag] = [];
                    }
                    builders_by_tags[tag].push(builder);
                }
            } else {
                if ((builders_by_tags[''] == null)) {
                    builders_by_tags[''] = [];
                }
                builders_by_tags[''].push(builder);
            }
        }

        const self = this;
        for (tag in builders_by_tags) {
            builders_by_tags[tag].sort((a, b) => self.strcompare(a.name, b.name));
        }
        let buildergroups = [];
        for (tag in builders_by_tags) {
            if (tag != '') {
                buildergroups.push({
                    name: builders_by_tags[tag][0].name,
                    tag: tag,
                    builders: builders_by_tags[tag],
                    colspan: builders_by_tags[tag].length
                });
            }
        }
        for (builder in builders_by_tags['']) {
            buildergroups.push({
                name: builders_by_tags[''][builder].name,
                tag: '',
                builders: [builders_by_tags[''][builder]],
                colspan: 1
            });
        }

        buildergroups.sort((a, b) => self.strcompare(a.name, b.name));

        let sorted_builders = [];
        for (let group in buildergroups) {
            for (builder in buildergroups[group].builders) {
                sorted_builders.push(buildergroups[group].builders[builder])
            }
        }

        this.builders = sorted_builders;
        this.buildergroups = buildergroups;
        this.tag_lines = [];
        return this.last_builderids_with_builds = builderids_with_builds;
    }

    /*
     * fill a change with a list of builders
     */
    populateChange(change) {
        change.builders = [];
        change.buildersById = {};
        for (let buildergroup of Array.from(this.buildergroups)) {
            let builderg = {name: buildergroup.name, builds: [], builders: [], colspan: buildergroup.builders.length};
            for (let builder of Array.from(buildergroup.builders)) {
                builderg.builders.push(builder);
                change.buildersById[builder.builderid] = builderg;
            }
            change.builders.push(builderg);
        }
    }
    /*
     * Match builds with a change
     */
    matchBuildWithChange(build) {
        let change, oldrev, rev;
        const buildrequest = this.buildrequests.get(build.buildrequestid);
        if ((buildrequest == null)) {
            return;
        }
        const buildset = this.buildsets.get(buildrequest.buildsetid);
        if ((buildset == null)) {
            return;
        }

        if (((build.properties != null ? build.properties.yp_build_revision : undefined) != null) || this.revmapping[build.buildid]) {
            if ((build.properties != null ? build.properties.yp_build_revision : undefined) != null) {
                rev = build.properties.yp_build_revision[0];
            } else {
                rev = this.revmapping[build.buildid];
            }
            change = this.changesByRevision[rev];
            if ((change == null)) {
                change = this.changesBySSID[rev];
            }
            if ((change == null)) {
                change = this.makeFakeChange(rev, build.started_at, rev);
                this.fakechanges.push(change)
            }

            change.caption = "Commit";
            if ((build.properties != null ? build.properties.yp_build_branch : undefined) != null) {
                change.caption = build.properties.yp_build_branch[0];
            }
            if (this.branchmapping[build.buildid]) {
                change.caption = this.branchmapping[build.buildid];
            }
            change.revlink = "http://git.yoctoproject.org/cgit.cgi/poky/commit/?id=" + rev;
            change.errorlink = "http://errors.yoctoproject.org/Errors/Latest/?filter=" + rev + "&type=commit&limit=150";
            let bid = build.buildid;
            if ((buildset != null) && (buildset.parent_buildid != null)) {
                bid = buildset.parent_buildid;
            }
            if ((build.properties != null ? build.properties.reason : undefined) != null) {
                change.reason = build.properties.reason[0];
            }
            if ((build.properties != null ? build.properties.publish_destination : undefined) != null) {
                change.publishurl = build.properties.publish_destination[0].replace("/srv/autobuilder/autobuilder.yoctoproject.org/", "https://autobuilder.yocto.io/");
                change.publishurl = change.publishurl.replace("/srv/autobuilder/autobuilder.yocto.io/", "https://autobuilder.yocto.io/");
            }

        } else {
            rev = `Unresolved Revision`;
            if ((change == null)) {
                change = this.changesBySSID[rev];
            }
            if ((change == null)) {
                change = this.makeFakeChange(rev, build.started_at, rev);
                change.caption = rev;
               this.fakechanges.push(change)
            }

        }

        if (build.builderid in change.buildersById) {
            change.buildersById[build.builderid].builds.push(build);
        }
    }

    makeFakeChange(revision, when_timestamp, comments) {
        const change = {
            revision,
            changeid: revision,
            when_timestamp,
            comments
        };
        this.changesBySSID[revision] = change;
        this.populateChange(change);
        return change;
    }
    /*
     * Open all change row information
     */
    openAll() {
        return Array.from(this.filtered_changes).map((change) =>
            (change.show_details = true));
    }

    /*
     * Close all change row information
     */
    closeAll() {
        return Array.from(this.filtered_changes).map((change) =>
            (change.show_details = false));
    }

    /*
     * Calculate row header (aka first column) width
     * depending if we display commit comment, we reserve more space
     */
    getRowHeaderWidth() {
        if (this.hasExpanded()) {
            return 400;  // magic value enough to hold 78 characters lines
        } else {
            return 200;
        }
    }
    /*
     * Calculate col header (aka first row) height
     * It depends on the length of the longest builder
     */
    getColHeaderHeight() {
        let max_buildername = 0;
        for (let builder of Array.from(this.builders)) {
            max_buildername = Math.max(builder.name.length, max_buildername);
        }
        return Math.max(100, max_buildername * 3);
    }

    /*
     *
     * Determine if we use a 100% width table or if we allow horizontal scrollbar
     * depending on number of builders, and size of window, we need a fixed column size or a 100% width table
     *
     */
    isBigTable() {
        const padding = this.getRowHeaderWidth();
        if (((this.$window.innerWidth - padding) / this.builders.length) < 40) {
            return true;
        }
        return false;
    }
    /*
     *
     * do we have at least one change expanded?
     *
     */
    hasExpanded() {
        for (let change of Array.from(this.changes)) {
            if (this.infoIsExpanded(change)) {
                return true;
            }
        }
        return false;
    }

    /*
     *
     * display build details
     *
     */
    selectBuild(build) {
        let modal;
        return modal = this.$uibModal.open({
            template: require('./view/modal/modal.tpl.jade'),
            controller: 'consoleModalController as modal',
            windowClass: 'modal-big',
            resolve: {
                selectedBuild() { return build; }
            }
        });
    }

    /*
     *
     * toggle display of additional info for that change
     *
     */
    toggleInfo(change) {
        return change.show_details = !change.show_details;
    }
    infoIsExpanded(change) {
        return change.show_details;
    }
}


angular.module('yocto_console_view', [
    'ui.router', 'ui.bootstrap', 'ngAnimate', 'guanlecoja.ui', 'bbData'])
.config(['$stateProvider', 'glMenuServiceProvider', 'bbSettingsServiceProvider', ConsoleState])
.controller('consoleController', ['$scope', '$q', '$window', 'dataService', 'bbSettingsService', 'resultsService', '$uibModal', '$timeout', Console]);

require('./view/modal/modal.controller.js');
require('./releaseselectorfield.directive.js');
require('./yoctochangedetails.directive.js');

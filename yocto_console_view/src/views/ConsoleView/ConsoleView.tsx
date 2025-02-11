/*
  This file is part of Buildbot.  Buildbot is free software: you can
  redistribute it and/or modify it under the terms of the GNU General Public
  License as published by the Free Software Foundation, version 2.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
  details.

  You should have received a copy of the GNU General Public License along with
  this program; if not, write to the Free Software Foundation, Inc., 51
  Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

  Copyright Buildbot Team Members
*/

import './ConsoleView.scss'
import {ObservableMap} from "mobx";
import {observer, useLocalObservable} from "mobx-react";
import {Link} from "react-router-dom";
import {
  FaExclamationCircle,
  FaMinusCircle,
  FaPlusCircle
} from "react-icons/fa";
import {OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import {buildbotGetSettings, buildbotSetupPlugin} from "buildbot-plugin-support";
import {
  Build,
  Buildset,
  Builder,
  Buildrequest,
  Change,
  useDataAccessor, useDataApiQuery, IDataAccessor
} from "buildbot-data-js";
import {
  BuildLinkWithSummaryTooltip,
  ChangeDetails,
  LoadingIndicator,
  pushIntoMapOfArrays,
  useWindowSize
} from "buildbot-ui";
import {YoctoChangeDetails} from './YoctoChangeDetails.tsx';

type ChangeInfo = {
  change: Change;
  buildsByBuilderId: Map<number, Build[]>;
}

export type TagTreeItem = {
  builders: Builder[];
  tag: string;
  childItems: TagTreeItem[];
}

export type BuilderGroup = {
  name: string;
  tag: string;
  builders: Builder[];
  colspan: int;
};

// Sorts and groups builders together by their tags.
export function getBuildersGroups(builders: Builder[]) : [Builder[], BuilderGroup[]]
{
  const buildersByTags = new Map<string, Builder[]>();
  for (const builder of builders) {
    if (builder.name === "indexing") {
      continue;
    }
    if ((builder.tags !== null) && (builder.tags.length != 0)) {
      for (const tag of builder.tags) {
        pushIntoMapOfArrays(buildersByTags, tag, builder);
      }
    } else {
      pushIntoMapOfArrays(buildersByTags, '', builder);
    }
  }

  const buildersGroups: BuilderGroup[] = [];
  for (const [tag, builders] of buildersByTags) {
    builders.sort((a, b) => a.name.localeCompare(b.name));
    if (tag !== '') {
      buildersGroups.push({
        name: builders[0].name,
        tag: tag,
        builders: builders,
        colspan: builders.length
      });
    }
  }
  if (buildersByTags.has('')) {
    const builders = buildersByTags.get('');
    builders.sort((a, b) => a.name.localeCompare(b.name));
    for (const builder of builders) {
      buildersGroups.push({
        name: builder.name,
        tag: '',
        builders: [builder],
        colspan: 1
      });
    }
  }

  buildersGroups.sort((a, b) => a.name.localeCompare(b.name));

  const sortedBuilders: Builder[] = [];
  for (const buildersGroup of buildersGroups) {
    for (const builder of buildersGroup.builders) {
      sortedBuilders.push(builder);
    }
  }

  return [sortedBuilders, buildersGroups];
}

function resolveFakeChange(revision: string, whenTimestamp: number, comment: string,
                           changesByFakeId: Map<string, ChangeInfo>): ChangeInfo
{
  const fakeId = `${revision}-${comment}`;
  const existingChange = changesByFakeId.get(fakeId);
  if (existingChange !== undefined) {
    return existingChange;
  }

  const newChange = {
    change: new Change(undefined as unknown as IDataAccessor, "a/1", {
      changeid: revision,
      author: "",
      branch: "",
      comments: comment,
      files: [],
      parent_changeids: [],
      project: "",
      properties: {},
      repository: "",
      revision: revision,
      revlink: null,
      when_timestamp: whenTimestamp,
    }),
    buildsByBuilderId: new Map<number, Build[]>
  };
  changesByFakeId.set(fakeId, newChange);
  return newChange;
}

// Adjusts changesByFakeId for any new fake changes that are created
function selectChangeForBuild(build: Build, buildset: Buildset,
                              changesBySsid: Map<number, ChangeInfo>,
                              changesByRevision: Map<string, ChangeInfo>,
                              changesByFakeId: Map<string, ChangeInfo>,
                              revMapping: Map<int, string>,
                              branchMapping: Map<int, string>)
                              {
  if ((build.properties !== null && ('yp_build_revision' in build.properties))  || (build.buildid in revMapping)) {
    let revision;
    let change = undefined;
    if (build.properties !== null && ('yp_build_revision' in build.properties)) {
      revision = build.properties['yp_build_revision'][0];
    } else {
      revision = revMapping[build.buildid];
    }
    // got_revision can be per codebase or just the revision string
    if (typeof(revision) === "string") {
      change = changesByRevision.get(revision);
      if (change === undefined) {
        change = changesBySsid.get(revision);
      }
      if (change === undefined) {
        change = resolveFakeChange(revision, build.started_at, revision, changesByFakeId);
      }

      change.change.caption = "Commit";
      if (build.properties !== null && ('yp_build_revision' in build.properties)) {
        change.change.caption = build.properties['yp_build_branch'][0];
      }
      if (build.buildid in branchMapping) {
        change.change.caption = branchMapping[build.buildid];
      }
      change.change.revlink = "http://git.yoctoproject.org/cgit.cgi/poky/commit/?id=" + revision;
      change.change.errorlink = "http://errors.yoctoproject.org/Errors/Latest/?filter=" + revision + "&type=commit&limit=150";

      let bid = build.buildid;
      if ((buildset !== null) && (buildset.parent_buildid != null)) {
        bid = buildset.parent_buildid;
      }
      if (build.properties !== null && ('reason' in build.properties)) {
        change.change.reason = build.properties['reason'][0];
      }
      if (build.properties !== null && ('publish_destination' in build.properties)) {
        change.change.publishurl = build.properties['publish_destination'][0].replace("/srv/autobuilder/autobuilder.yoctoproject.org/", "https://autobuilder.yocto.io/");
        change.change.publishurl = change.change.publishurl.replace("/srv/autobuilder/autobuilder.yocto.io/", "https://autobuilder.yocto.io/");
      }
    }

    return change;
  }

  const revision = `Unresolved Revision`
  const change = changesBySsid.get(revision);
  if (change !== undefined) {
    return change
  }

  const fakeChange = resolveFakeChange(revision, build.started_at, revision, changesByFakeId);
  fakeChange.change.caption = revision;
  return fakeChange
}

export const ConsoleView = observer(() => {
  const accessor = useDataAccessor([]);

  const settings = buildbotGetSettings();
  const changeFetchLimit = settings.getIntegerSetting("Console.changeLimit");
  const buildFetchLimit = settings.getIntegerSetting("Console.buildLimit");

  const buildsetsQuery = useDataApiQuery(() => Buildset.getAll(accessor, {query: {
      limit: buildFetchLimit,
      order: '-submitted_at',
    }}));

  const changesQuery = useDataApiQuery(() => Change.getAll(accessor, {query: {
      limit: changeFetchLimit,
      order: '-changeid',
    }}));

  const buildersQuery = useDataApiQuery(() => Builder.getAll(accessor));

  const buildrequestsQuery = useDataApiQuery(() => Buildrequest.getAll(accessor, {query: {
      limit: buildFetchLimit,
      order: '-submitted_at',
    }}));

  const buildsQuery = useDataApiQuery(() => Build.getAll(accessor, {query: {
      limit: buildFetchLimit,
      order: '-started_at',
      property: ["yp_build_revision", "yp_build_branch", "reason", "publish_destination"],
    }}));

  const windowSize = useWindowSize()
  const changeIsExpandedByChangeId = useLocalObservable(() => new ObservableMap<number, boolean>());

  const queriesResolved =
    buildsetsQuery.resolved &&
    changesQuery.resolved &&
    buildersQuery.resolved &&
    buildrequestsQuery.resolved &&
    buildsQuery.resolved;

  // FIXME: fa-spin
  if (!queriesResolved) {
    return (
      <div className="bb-console-container">
        <LoadingIndicator/>
      </div>
    );
  }


  const builderIdsWithBuilds = new Set<number>();
  for (const build of buildsQuery.array) {
    builderIdsWithBuilds.add(build.builderid);
  }

  const revMapping = new Map<int, string>();
  const branchMapping = new Map<int, string>();
  for (const build of buildsQuery.array) {
    let change = false;
    let {
      buildid
    } = build;
    if (build.properties !== null && ('yp_build_revision' in build.properties)) {
      revMapping[build.buildid] = build.properties['yp_build_revision'][0];
      change = true;
    }
    if (build.properties !== null && ('yp_build_branch' in build.properties)) {
      branchMapping[build.buildid] = build.properties.yp_build_branch[0];
      change = true;
    }
    if ((!revMapping[buildid] || !branchMapping[buildid]) && !build.complete_at) {
      build.getProperties().onChange = properties => {
        change = false;
        buildid = properties.endpoint.split('/')[1];
        if (!revMapping[buildid]) {
          const rev = getBuildProperty(properties[0], 'yp_build_revision');
          if (rev != null) {
            revMapping[buildid] = rev;
            change = true;
          }
        }
        if (!branchMapping[buildid]) {
          const branch = getBuildProperty(properties[0], 'yp_build_branch');
          if (branch != null) {
            branchMapping[buildid] = branch;
            change = true;
          }
        }
      };
    }
  }

  function getBuildProperty(properties, property) {
    const hasProperty = properties && properties.hasOwnProperty(property);
    if (hasProperty) { return properties[property][0]; } else { return null; }
  }

  const buildersWithBuilds = buildersQuery.array.filter(b => builderIdsWithBuilds.has(b.builderid));
  const [buildersToShow, builderGroups] = getBuildersGroups(buildersWithBuilds);

  const changesByRevision = new Map<string, ChangeInfo>();
  const changesBySsid = new Map<number, ChangeInfo>();
  const changesByFakeId = new Map<string, ChangeInfo>();

  for (const change of changesQuery.array) {
    const changeInfo: ChangeInfo = {change: change, buildsByBuilderId: new Map<number, Build[]>()};
    if (change.revision !== null) {
      changesByRevision.set(change.revision, changeInfo);
    }
    changesBySsid.set(change.sourcestamp.ssid, changeInfo);
  }

  for (const build of buildsQuery.array) {
    if (build.buildrequestid === null) {
      continue;
    }
    const buildrequest = buildrequestsQuery.getByIdOrNull(build.buildrequestid.toString());
    if (buildrequest === null) {
      continue;
    }
    const buildset = buildsetsQuery.getByIdOrNull(buildrequest.buildsetid.toString());
    if (buildset === null) {
      continue;
    }

    const change = selectChangeForBuild(build, buildset, changesBySsid, changesByRevision,
      changesByFakeId, revMapping, branchMapping);

    pushIntoMapOfArrays(change.buildsByBuilderId, build.builderid, build);
  }

  const changesToShow = [...changesBySsid.values(), ...changesByFakeId.values()]
    .filter(ch => ch.buildsByBuilderId.size > 0)
    .sort((a, b) => b.change.when_timestamp - a.change.when_timestamp);


  const hasExpandedChanges = [...changeIsExpandedByChangeId.values()].includes(true);

  // The magic value is selected so that the column holds 78 character lines without wrapping
  const rowHeaderWidth = hasExpandedChanges ? 400 : 200;

  // Determine if we use a 100% width table or if we allow horizontal scrollbar
  // Depending on number of builders, and size of window, we need a fixed column size or a
  // 100% width table
  const isBigTable = () => {
    const padding = rowHeaderWidth;
    if (((windowSize.width - padding) / buildersToShow.length) < 40) {
      return true;
    }
    return false;
  }

  const getColHeaderHeight = () => {
    let maxBuilderName = 0;
    for (const builder of buildersToShow) {
      maxBuilderName = Math.max(builder.name.length, maxBuilderName);
    }
    return Math.max(100, maxBuilderName * 3);
  }

  const openAllChanges = () => {
    for (const change of changesToShow) {
      changeIsExpandedByChangeId.set(change.change.changeid, true);
    }
  };

  const closeAllChanges = () => {
    for (const changeid of changeIsExpandedByChangeId.keys()) {
      changeIsExpandedByChangeId.set(changeid, false);
    }
  };

  if (buildsQuery.array.length === 0) {
    return (
      <div className="bb-console-container">
        <p>
          No builds. Console View needs run builds to be setup.
        </p>
      </div>
    );
  }

  const builderColumns = buildersToShow.map(builder => {
    return (
      <th key={builder.name} className="column">
        <span style={{marginTop: getColHeaderHeight()}} className="bb-console-table-builder">
          <Link to={`/builders/${builder.builderid}`}>{builder.name}</Link>
        </span>
      </th>
    )
  });

  const tagLineColumns = builderGroups.map((builderGroup, i) => {
    return (
      <td key={i} colSpan={builderGroup.colspan} style={{textAlign: 'center'}}>
      {builderGroup.tag}
      </td>
    );
  });


  const changeRows = changesToShow.map(changeInfo => {
    const change = changeInfo.change;

    const builderColumns = builderGroups.map((builderGroup, i) => {
      const builds: Build[] = [];
      for (const builder of builderGroup.builders) {
        const builderBuilds = changeInfo.buildsByBuilderId.get(builder.builderid) ?? []
        builds.push(...builderBuilds);
      }
      const buildLinks = builds.map(build => (
        <BuildLinkWithSummaryTooltip key={build.buildid} build={build}/>
      ));
      return (
        <td key={i} title={builderGroup.name} colSpan={builderGroup.colspan} className="column">
          {buildLinks}
        </td>
      );
    });

    // Note that changeid may not be unique because fake changes always have changeid of 0
    return (
      <tr key={`change-${change.changeid}-${change.codebase}-${change.revision ?? ''}`}>
        <td>
          <YoctoChangeDetails change={change} compact={true}
                         showDetails={changeIsExpandedByChangeId.get(change.changeid) ?? false}
                         setShowDetails={(show: boolean) => changeIsExpandedByChangeId.set(change.changeid, show)}/>
        </td>
        {builderColumns}
      </tr>
    );
  });

  return (
    <div className="container bb-console">
      <Table striped bordered className={(isBigTable() ? 'table-fixedwidth' : '')}>
        <thead>
          <tr className="bb-console-table-first-row first-row">
            <th className="row-header">
            </th>
            {builderColumns}
          </tr>
        </thead>
        <tbody>
          <tr className="bb-console-tag-row" key="tag">
            <td className="row-header"></td>
            {tagLineColumns}
          </tr>
          {changeRows}
        </tbody>
      </Table>
    </div>
  );
});

buildbotSetupPlugin(reg => {
  reg.registerMenuGroup({
    name: 'console',
    caption: 'Yocto Console View',
    icon: <FaExclamationCircle/>,
    order: 5,
    route: '/console',
    parentName: null,
  });

  reg.registerRoute({
    route: "/console",
    group: "console",
    element: () => <ConsoleView/>,
  });

  reg.registerSettingGroup({
    name: "Console",
    caption: "Console related settings",
    items: [
      {
        type: 'integer',
        name: 'changeLimit',
        caption: 'Maximum number of changes to fetch',
        defaultValue: 30
      }, {
        type: 'integer',
        name: 'buildLimit',
        caption: 'Maximum number of builds to fetch',
        defaultValue: 200
      }
    ]
  });
});

export default ConsoleView;

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

import './YoctoChangeDetails.scss';
import {useState} from "react";
import {observer} from "mobx-react";
import {OverlayTrigger, Popover, Table} from "react-bootstrap";
import {Change, parseChangeAuthorNameAndEmail} from "buildbot-data-js";
import {dateFormat, durationFromNowFormat, useCurrentTime} from "buildbot-ui";
import {ArrowExpander} from "buildbot-ui";

type ChangeDetailsProps = {
  change: Change;
  compact: boolean;
  showDetails: boolean;
  setShowDetails: ((show: boolean) => void) | null;
}

export const YoctoChangeDetails = observer(({change, compact, showDetails, setShowDetails}: ChangeDetailsProps) => {
  const now = useCurrentTime();
  const [showProps, setShowProps] = useState(false);

  const renderChangeDetails = () => (
    <div className="anim-yoctochangedetails">
      <Table striped size="sm">
        <tbody>
          { change.reason !== null
            ? <tr>
              <td>Reason</td>
              <td>{change.reason}</td>
            </tr>
            : <></>
          }
          { change.author != null
            ? <tr>
              <td>Author</td>
              <td>{change.author}</td>
            </tr>
            : <></>
          }
          <tr>
            <td>Date</td>
            <td>{dateFormat(change.when_timestamp)} ({durationFromNowFormat(change.when_timestamp, now)})</td>
          </tr>
          { change.repository !== null
            ? <tr>
              <td>Repository</td>
              <td>{change.repository}</td>
            </tr>
            : <></>
          }
          { change.branch !== null
            ? <tr>
              <td>Branch</td>
              <td>{change.branch}</td>
            </tr>
            : <></>
          }
          <tr>
            <td>Revision</td>
            <td>
            {
              change.revlink
              ? <a href={change.revlink}>{change.revision}</a>
              : <></>
            }
            </td>
          </tr>
        </tbody>
      </Table>
      <h5>Comment</h5>
      <pre>{change.comments}</pre>
      <h5>Changed files</h5>
      {change.files.length === 0
        ? <p>No files</p>
        : <ul>{change.files.map(file => (<li key={file}>{file}</li>))}</ul>
      }
    </div>
  );

  const [changeAuthorName, changeEmail] = parseChangeAuthorNameAndEmail(change.author);

  const popoverWithText = (id: string, text: string) => {
    return (
      <Popover id={"bb-popover-change-details-" + id}>
        <Popover.Content>
          {text}
        </Popover.Content>
      </Popover>
    );
  }

  const onHeadingClicked = () => {
    if (setShowDetails === null)
      return;
    setShowDetails(!showDetails);
  }

  return (
    <div className="yoctochangedetails">
      <div className="yoctochangedetails-heading" onClick={onHeadingClicked}>
        <OverlayTrigger placement="top"
                        overlay={popoverWithText("comments-" + change.id, change.caption)}>
          <React.Fragment>
            {
              change.revlink
              ? <a href={change.revlink}>{change.caption}</a>
              : <span>{change.caption}</span>
            }
            {
              change.errorlink
              ? <a href={change.errorlink}>Error</a>
              : <></>
            }
            {
              change.publishurl
              ? <a href={change.publishurl}>Output</a>
              : <></>
            }
          </React.Fragment>
        </OverlayTrigger>
        { !compact
          ? <OverlayTrigger placement="top"
                            overlay={popoverWithText("date-" + change.id,
                              dateFormat(change.when_timestamp))}>
              <span>({durationFromNowFormat(change.when_timestamp, now)})</span>
            </OverlayTrigger>
          : <></>
        }
        {setShowDetails !== null ? <ArrowExpander isExpanded={showDetails}/> : <></>}
      </div>
      {showDetails ? renderChangeDetails() : <></>}
    </div>
  );
});

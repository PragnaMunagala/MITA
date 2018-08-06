/**
 * Created by sergeyyudintsev on 26/03/2018.
 */

import {writeFileSync} from "fs";
import {join} from "path";
import {Observable} from "rxjs";
import * as _ from "lodash";
const versionParts: any = {major: 0, minor: 1, patch: 2};

const indexBasePath = join(__dirname, "..", "src");
const exec = require("child_process").exec;

export function getMergeRequestCommitHash() {
  return new Observable<string>(o => {
    exec(`git log --pretty=%P -n 1 $CI_COMMIT_SHA | awk "/ /"'{print $2}'`,
      function (error: Error, stdout: Buffer, stderr: Buffer) {
        if (error !== null) {
          console.log("git error: " + error + stderr);
        }
        const res = stdout.toString().trim();
        if (res) {
          console.log("hash found:", res);
          o.next(res);
        } else {
          console.log("hash not found");
          o.error("NOT_FOUND");
        }
        o.complete();
      })
  })
}

export function getMergeRequestId(hash: string): Observable<string> {
  return new Observable<string>(o => {
    exec(`git ls-remote $CI_REPOSITORY_URL refs/merge-requests/[0-9]*/head | awk \"/${hash}/\"'{print $2}' | cut -d '/' -f3`,
      function (error: Error, stdout: Buffer, stderr: Buffer) {
        if (error !== null) {
          console.log("git error: " + error + stderr);
        }
        const res = stdout.toString().trim();
        if (res) {
          console.log("MR found:", res);
          o.next(res);
        } else {
          console.log("MR not found");
          o.error("NOT_FOUND");
        }
        o.complete();
      })
  })
}

export function getMergeRequestInfo(id: string): Observable<any> {
  return new Observable<any>(o => {
    exec(`curl --header "PRIVATE-TOKEN: $GIT_PRIVATE_TOKEN" https://gitlab.com/api/v4/projects/$CI_PROJECT_ID/merge_requests/${id}`,
      function (error: Error, stdout: Buffer, stderr: Buffer) {
        let res;

        if (error !== null) {
          console.log("git error: " + error + stderr);
        }

        try {
          res = JSON.parse(stdout.toString());
        } catch (err) {
          console.log("can't get MR info");
        }

        if (!res) {
          o.error("NOT_FOUND");
        } else if (!res.iid) {
          o.error(new Error(res.error || res.message));
        } else {
          console.log("got MR info", res);
          o.next(res);
        }
        o.complete();
      });
  })
}

export function parseLabels(labels: string[]): Observable<string> {
  let res = "";

  if (!labels) return fail();

  for (let i = 0; i < labels.length; i++) {
    const part = labels[i];
    const partKey = versionParts[part];
    if ((!res && partKey !== undefined) || (res && partKey < versionParts[res])) res = part
  }

  if (res) {
    console.log("label found:", res);
    return Observable.of(res);
  } else {
    return fail();
  }

  function fail() {
    console.log("labels not found");
    return Observable.throw("NOT_FOUND")
  }
}

export function updateVersion(partKey?: string): Observable<string> {
  return getRevision()
    .map(parseVersion)
    .map(version => {
      const options = {encoding: "utf8"};
      const presc = `/*\n* This file is automatically created by git.versions.ts\n* Do not edit it manually!\n*/\n`;
      let newVersion = version;
      if (partKey) {
        console.log("updating version...");
        newVersion = upgradeVersion(version, partKey);
      } else {
        console.log("using current version");
      }
      const content = `${presc}\nexport const versions = ${JSON.stringify({app: newVersion})};\n`;
      writeFileSync(`${indexBasePath}/environments/versions.ts`, content, options);
      return newVersion;
    });
}

export function setGitTag(version: string): Observable<void> {
  return getRevision()
    .map(parseVersion)
    .filter(currentVersion => {
      const [majorC, minorC, patchC] = _.split(currentVersion, ".");
      const [major, minor, patch] = _.split(version, ".");
      return (major > majorC) || (minor > minorC) || (patch > patchC)
    })
    .switchMap(() => new Observable<any>(o => {
      const repoAddressWithAccess = _.replace(
        process.env.CI_REPOSITORY_URL as string,
        /gitlab-ci-token.*@/,
        `private-token:${process.env.GIT_PRIVATE_TOKEN}@`
      );
      const tagName = `v${version}`;

      exec(`git stash
        git checkout $CI_COMMIT_REF_NAME
        git pull "${repoAddressWithAccess}" $CI_COMMIT_REF_NAME
        git stash apply
        git stash clear
        git add "${indexBasePath}/environments/versions.ts"
        git commit -m "[ci skip] ${tagName}"
        git tag "${tagName}"
        git push "${repoAddressWithAccess}" $CI_COMMIT_REF_NAME
        git push "${repoAddressWithAccess}" --tags`,
        function (error: Error, stdout: Buffer, stderr: Buffer) {
          if (error !== null) {
            console.log("error: " + error + stderr);
            o.error(error + stderr.toString());
          }
          o.complete();
        });
    }))
}

function getRevision(): Observable<string> {
  return new Observable<string>(o => {
    exec("git describe --tag",
      function (error: Error, stdout: Buffer, stderr: Buffer) {
        if (error !== null) {
          console.log("git error: " + error + stderr);
          o.error(error + stderr.toString());
        }
        o.next(stdout.toString().trim());
        o.complete();
      });
  })
}

function parseVersion(revision: string) {
  const [version, , hash] = _.split(revision, "-", 3);
  return _.replace(version, /[a-zA-Z]/, "");
}

function upgradeVersion(version: string, partKey: string) {
  const parts: any[] = _.split(version, ".");
  const idx = versionParts[partKey];

  _.mapValues(versionParts, v => {
    if (v === idx) ++parts[v];
    else if (v > idx) parts[v] = 0;
  });

  return _.join(parts, ".");
}

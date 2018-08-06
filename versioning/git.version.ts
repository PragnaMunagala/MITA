/**
 * Created by sergeyyudintsev on 15/03/2018.
 */
import {
  getMergeRequestCommitHash,
  getMergeRequestId,
  getMergeRequestInfo,
  parseLabels,
  updateVersion
} from "./service";

getMergeRequestCommitHash()
  .switchMap(getMergeRequestId)
  .switchMap(getMergeRequestInfo)
  .map(mr => mr.labels)
  .switchMap(parseLabels)
  .switchMap(updateVersion)
  .catch((err: any) => {
    if (err === "NOT_FOUND") return updateVersion();
    else throw err;
  })
  .subscribe(res => {
    console.log("done\nversion to build:", res);
  });





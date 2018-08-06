/**
 * Created by sergeyyudintsev on 23/03/2018.
 */
import {setGitTag} from "./service";
import {versions} from "../src/environments/versions";

setGitTag(versions.app).subscribe(() => console.log("git successfully set:", versions.app));

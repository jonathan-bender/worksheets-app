# Classroom mode rollback

The exact live Hosting release before this work is version **41d8329b4ecb0bfe** of site **worksheets-c5d83** (released 2026-11-08 19:28:43 UTC). It is also preserved in preview channel `before-classroom-20261108`.

To restore that live release, including its Hosting rewrites:

```sh
firebase hosting:clone worksheets-c5d83@41d8329b4ecb0bfe worksheets-c5d83:live --project worksheets-c5d83
```

The version identifier works independently of the preview channel's expiration. Verify the solo angle game and landing page afterward. This rollback does not change the local working tree.

The classroom release was browser-tested on preview version `62a4e1ea8bbd238a` before that exact version was promoted to live. The first classroom release is therefore also recoverable with the same clone command, substituting that version identifier.

The local files as they stood before classroom work, **including uncommitted changes**, are saved in `.rollback/2026-11-08-before-classroom/site.tar.gz`. That ignored directory also contains SHA-256 checksums, the original working-tree patch, and the Git HEAD identifier. It is local to this workspace, so retain a copy if moving machines.

If the requested rollback means the initial local files instead of the previous live release, extract the archive to a fresh temporary directory, verify it against the manifest, and deploy Hosting from that directory with its original `firebase.json` and `.firebaserc`. Do not reset this working tree or overwrite subsequent edits. The archived Hosting config has no classroom API rewrite.

Restoring Hosting removes access to classroom mode through the site, but leaves the new backend resources deployed. If classroom mode is being abandoned entirely, also remove `classroomApi` and `cleanupClassrooms` after confirming no room is in use, and remove only the classroom `rooms` data. The Firebase billing plan remains Blaze until changed separately in the console. Never delete unrelated project data or disable billing implicitly.

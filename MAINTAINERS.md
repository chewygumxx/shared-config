---
spdx: GPL-3.0-only
title: Shared Config Maintainer Runbook
---

<!--
   -
   - ~chewygumxx/shared-config.git
   - ::: :/MAINTAINERS.md
   -
   -->

# Shared Config Maintainer Runbook

## Work on a change

On a fresh checkout, run `mise trust` and `mise install`. Outside CI, the
postinstall hook runs `bun ci` and installs the hk Git hooks. In an
environment with `CI` set, run `mise exec -- bun ci` after installing the
tools. Run `mise run install` when the vendored sources are needed as well.

| Command | When to use it |
| --- | --- |
| `mise run lint` | Check changed files while editing. |
| `mise run format` | Fix changed files and leave the fixes unstaged. |
| `mise run test` | Run the repository's tests locally. |
| `mise run check --all` | Run the full CI check locally when diagnosing a failure. |

For lint and format, add `--staged` to select the index or `--step <name>`
to run one hk step. Changes to shared configuration and the `packages/`
tree can widen file selection. hk prints warnings and failures by default.
Add `--verbose` to lint or format for hk debug output.

The pre-commit hook runs staged lint and the workspace lockfile and peer
checks. CI runs the tests, package checks and checks of materialised
templates. The commit-msg hook validates the Conventional Commit message.

For a change to one scaffold, run
`mise run templates:verify --template typescript`, substituting the
template name. This generates and checks a fresh clone of each feature
combination for that template. Omit `--template` for the full matrix.
By default, the verifier uses packed configs from this checkout. Add
`--registry` to install the versions pinned in the bundled manifests and
lockfiles. Use `mise run templates:materialize` to inspect the composed
templates in `.templates/`. If scratch storage is tight, point `TMPDIR` at
a writable location with room for the packed dependencies and a generated
repository with its installed dependencies.

When upgrading a linter, check the optional peers in
`packages/hk-config/package.json` against the CLI resolved in `bun.lock`.
Update the shared config or peer range where the new CLI requires it.
`mise run lint --all --step lockfile` checks those ranges and the workspace
versions. After changing a workspace manifest, refresh the root lockfile
with `bun install --lockfile-only --ignore-scripts`.

## Release shared packages

Release Please prepares the package manifests, release manifest and root
Bun lockfile together and proposes them in one commit. It refreshes the
proposal when main advances.

With `gh` authenticated, run `mise run release:status` to inspect the open
release PR or the current versions on remote main. Add `--main` to inspect
main while a release PR is open, `--json` for machine-readable output, or
`--check` to fail on an invalid proposal. On main, the report shows whether
npm accepted a publish and whether its tarball is downloadable.

Merge the release PR once it is current with main and the `check / check`
and `release-preflight` jobs pass on its latest commit. The preflight
checks the workspace versions, lockfile, remote Git tags and npm. If a tag
or npm version already exists, use a fresh version. A Conventional Commit
touching the affected package can set the proposed version with a
`Release-As: <version>` footer. Check the resulting proposal before merging.

On the merge commit, CI runs the repository checks. Its `release-artifacts`
job packs each updated workspace once and checks its tarball with publint
and, for packages with `index.d.ts`, attw. If the release includes the
scaffolder, CI runs the registry template matrix against that tarball.
CI retains the verified bundle for 30 days. Release Please checks that CI
approved the exact PR head and merge commit and that the release files
match the approved proposal before creating the tags and GitHub releases.

Each release starts Publish, which retrieves its tarball from the
successful CI run for the tagged commit and verifies its SHA-512 digest
before npm Trusted Publishing. The publish job records npm acceptance.
The registry job waits for the tarball and checks both the registry
integrity value and the downloaded bytes against the digest from CI.

### Recover a release

- If release approval is waiting on CI, check the CI run for the commit
  SHA reported by Release Please. Rerun any failed jobs. Once CI passes,
  run `gh workflow run release-please.yaml --ref main`.
- If npm accepted the publish but the tarball is pending, check
  `mise run release:status --main` and the Publish run. The registry job
  retries for up to 15 minutes. If it times out, run
  `gh run rerun <run-id> --failed` on the original Publish run to retry
  verification with the digest from the successful publish job.
- If the publish job failed, check its logs, the tag and npm before
  retrying the original run. If the verified bundle is missing, rerun
  the `release-artifacts` job via CI for that commit while GitHub still
  allows reruns, then retry Publish.

## Rehearse a release

Run `gh workflow run release-rehearsal.yaml --ref main` to rehearse a
release on GitHub Actions. The rehearsal also runs when release tooling
changes. It prepares fixture versions and their lockfile and runs the
release packing and validation code. A second runner checks the proposal,
downloads the same tarballs, dry-runs npm publishing, and verifies
registry retries and integrity.
The workflow uses read-only permissions and saves its outputs as an artifact.

## Release refreshed templates

After Publish verifies a shared config on npm, Refresh Template Pins reads
the release manifest from main and waits for the affected versions to be
downloadable. It updates the affected template manifests and lockfiles,
verifies the resolutions and tests the packed scaffolder against npm. If
there are changes, it opens or updates one PR from
`automation/template-pins`. Merging that PR starts a separate `create-repo`
release. Existing versions keep the pins they shipped with.

To preview the changes locally, run
`mise run templates:update-pins --dry-run`. To prepare them locally, fetch
the release tags with `git fetch --tags origin`, run
`mise run templates:update-pins`, and verify with
`mise run templates:verify --registry`. To resume the automated refresh
after a failure, use
`gh workflow run template-pins.yaml --ref main`.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->

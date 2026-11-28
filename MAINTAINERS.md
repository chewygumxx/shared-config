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

Use `mise run lint` and `mise run format` while editing. They select changed
files by default. Add `--staged` for the index or `--step <name>` for a
specific hk step. Pre-commit checks staged files and runs the fast workspace
checks. Run `mise run check --all` before handing off a cross-package change.
It also runs the tests, package checks, and checks of materialised templates.

For a change to one scaffold, run
`mise run templates:verify --template typescript`, substituting the
template name. This checks every feature combination for that template. Omit
`--template` for the full matrix. By default, the verifier packs configs
from this checkout. Add `--registry` to install the versions pinned in
the bundled manifests and lockfiles. If scratch storage is tight, set
`TMPDIR` to a writable location outside the home directory with room for
one generated repository and its installed dependencies.

When upgrading a linter, check the optional peers in
`packages/hk-config/package.json` against the CLI resolved in `bun.lock`.
Update the shared config or peer range where the new CLI requires it.
`mise run lint --all --step lockfile` checks those ranges and the workspace
versions. After changing a workspace manifest, refresh the root lockfile
with `bun install --lockfile-only --ignore-scripts`.

## Release shared packages

Release Please prepares the package manifests, release manifest, and root
Bun lockfile together in CI and proposes them in one commit. With `gh`
authenticated, run `mise run release:status` to see the proposed versions
and any conflicts.
Use `--json` for automation or `--main` to inspect released versions
when another release PR is open.

Merge the release PR after CI and the release preflight pass on its latest
commit. The preflight checks the proposed workspace names and versions,
the lockfile, the remote Git tags, and the npm registry. If a tag already
exists, use a fresh version. A conventional commit touching the affected
package can set the proposed version with a `Release-As: <version>`
footer. Check the resulting proposal before merging.

After merge, Release Please checks that CI passed on the exact PR head and
merge commit and that the release files still match the approved proposal.
It then creates the GitHub releases. Each release starts the corresponding
Publish workflow, which publishes to npm with Trusted Publishing. The job
summary records npm acceptance. The registry job waits for the exact tarball
and checks its integrity.

If npm accepted a publish but still returns 404, check
`mise run release:status --main` and the Publish run. The registry job
retries for up to 15 minutes. If it times out, use
`gh run rerun <run-id> --failed` on that Publish run to retry the registry
job using the successful publish's outputs. If publish itself failed, read
its logs and check the tag and registry before retrying.

If release approval is waiting on CI, rerun the failed CI jobs for the SHA
reported by Release Please. When they pass, rerun Release Please with
`gh workflow run release-please.yaml --ref main`.

## Rehearse a release

Run `gh workflow run release-rehearsal.yaml --ref main` to rehearse a
release on GitHub Actions. The rehearsal also runs when release tooling
changes. It prepares fixture versions and their lockfile, packs the two
packages, and checks the proposal and registry retries on a second runner.
The workflow uses read-only permissions and saves its outputs as an artifact.

## Release refreshed templates

After a shared config is downloadable, Refresh Template Pins reads the
released versions from main. It updates the affected template manifests and
lockfiles, verifies the packed scaffolder against npm, and opens or updates
one PR from `automation/template-pins`. Merging that PR starts a separate
`create-repo` release. Existing versions keep the pins they shipped with.

To preview the changes locally, run
`mise run templates:update-pins --dry-run`. To prepare them locally, fetch
the release tags with `git fetch --tags origin`, run
`mise run templates:update-pins`, and verify with
`mise run templates:verify --registry`. To resume the automated refresh
after a failure, use
`gh workflow run template-pins.yaml --ref main`.

<!-- vim:set expandtab shiftwidth=2 filetype=markdown foldlevel=3: -->

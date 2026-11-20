#!/usr/bin/env sh
# vim:set expandtab shiftwidth=4 filetype=sh:
# SPDX-License-Identifier: GPL-3.0-only

#
#
# ~chewygumxx/shared-config.git
# ::: :/scripts/lint-packages.sh
#
#

# Usage: lint-packages.sh
#
# Checks every workspace package with publint, and each typed package's
# types with attw, reporting every failure before failing. attw prints
# its table only for a package that fails.

set -eu

status=0
for dir in packages/*/; do
    dir=${dir%/}
    if ! bun run publint --level warning "$dir"; then
        status=1
    fi
    [ -f "$dir/index.d.ts" ] || continue
    if ! bun run attw --pack "$dir" --profile esm-only --quiet; then
        bun run attw --pack "$dir" --profile esm-only || true
        status=1
    fi
done
exit "$status"

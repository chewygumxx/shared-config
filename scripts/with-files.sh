#!/usr/bin/env sh
# vim:set expandtab shiftwidth=4 filetype=sh:
# SPDX-License-Identifier: GPL-3.0-only

#
#
# ~chewygumxx/shared-config.git
# ::: :/scripts/with-files.sh
#
#

# Usage: with-files.sh [--all] [<pathspec>...] -- <command> [<arg>...]
#
# Runs the command with the staged files added, copied, modified or renamed,
# or with --all, all tracked files matching the pathspecs. Mise exports the
# same choice through $usage_staged.
# No pathspec means every file. Runs nothing when no file matches. Each
# path starts ./, so no tool reads a file named -x as an option.

set -eu

usage() {
    echo 'usage: with-files.sh [--all] [<pathspec>...] -- <command> [<arg>...]' >&2
    exit 2
}

staged=${usage_staged-true}
if [ "${1-}" = --all ]; then
    staged=false
    shift
fi

# Lists the files matching the arguments before --, NUL-separated.
list() {
    count=$#
    keep=1
    while [ "$count" -gt 0 ]; do
        arg=$1
        shift
        count=$((count - 1))
        [ "$arg" = -- ] && keep=
        [ -n "$keep" ] && set -- "$@" "$arg"
    done
    if [ "$staged" = true ]; then
        git diff -z --cached --name-only --diff-filter=ACMR \
            --line-prefix=./ -- "$@"
    else
        git ls-files -z --format='./%(path)' -- "$@"
    fi
}

for arg; do
    [ "$arg" = -- ] && break
done
[ "${arg-}" = -- ] || usage

files=$(mktemp)
trap 'rm -f "$files"' EXIT
list "$@" >"$files"

while [ "$1" != -- ]; do
    shift
done
shift
[ $# -gt 0 ] || usage

[ -s "$files" ] || exit 0
xargs -0 "$@" <"$files"

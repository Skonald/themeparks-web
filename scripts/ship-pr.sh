#!/usr/bin/env bash
# One-command: test (optional) → commit → push → draft PR → optional merge.
# Usage (recommended — ship to main):
#   ./scripts/ship-pr.sh -m "feat: my change" -a --merge
# Other:
#   ./scripts/ship-pr.sh -m "feat: my change" -a        # draft PR only (no merge)
#   ./scripts/ship-pr.sh --no-commit --merge            # merge only (already pushed)
#   ./scripts/ship-pr.sh --no-commit --merge-now        # merge without CI wait (use sparingly)
#   ./scripts/ship-pr.sh --no-commit                    # push + PR only (no new commit)
#
# Requires: git, python3 (backend tests) or flutter (UI tests), curl, jq optional but recommended.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMMIT_MSG=""
STAGE_ALL=0
NO_TEST=0
NO_COMMIT=0
DRAFT=1
READY=0
DO_MERGE=0
MERGE_NOW=0
BASE_BRANCH="main"
PR_TITLE=""

usage() {
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
  echo ""
  echo "Recommended (ship to main):"
  echo "  ./scripts/ship-pr.sh -m \"feat: my change\" -a --merge"
  echo ""
  echo "Options:"
  echo "  -m, --message MSG   Commit message (required if committing)"
  echo "  -a, --all           Stage all tracked/untracked (respects .gitignore)"
  echo "  -t, --title TITLE   PR title (default: derived from branch or message)"
  echo "  --base BRANCH       PR base branch (default: main)"
  echo "  --ready             Open PR ready for review (not draft)"
  echo "  --no-test           Skip tests"
  echo "  --no-commit         Push + PR only; do not create a commit"
  echo "  --merge             Squash-merge after CI checks pass"
  echo "  --merge-now         Squash-merge immediately (skips CI wait)"
  echo "  -h, --help          Show help"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message) COMMIT_MSG="${2:-}"; shift 2 ;;
    -a|--all) STAGE_ALL=1; shift ;;
    -t|--title) PR_TITLE="${2:-}"; shift 2 ;;
    --base) BASE_BRANCH="${2:-}"; shift 2 ;;
    --ready) DRAFT=0; READY=1; shift ;;
    --no-test) NO_TEST=1; shift ;;
    --no-commit) NO_COMMIT=1; shift ;;
    --merge) DO_MERGE=1; shift ;;
    --merge-now) DO_MERGE=1; MERGE_NOW=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ "$READY" -eq 1 ]]; then
  DRAFT=0
fi

github_token() {
  if [[ -n "${GH_TOKEN:-}" ]]; then
    echo "$GH_TOKEN"
    return
  fi
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    echo "$GITHUB_TOKEN"
    return
  fi
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    gh auth token 2>/dev/null
    return
  fi
  printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null \
    | awk -F= '/^password=/{print $2; exit}'
}

github_remote_parts() {
  local url
  url="$(git remote get-url origin 2>/dev/null || true)"
  if [[ -z "$url" ]]; then
    echo "FAIL: no origin remote" >&2
    exit 1
  fi
  if [[ "$url" =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
    echo "${BASH_REMATCH[1]} ${BASH_REMATCH[2]}"
  else
    echo "FAIL: origin is not a github.com URL: $url" >&2
    exit 1
  fi
}

run_tests() {
  if [[ "$NO_TEST" -eq 1 ]]; then
    echo "==> tests skipped (--no-test)"
    return
  fi
  echo "==> tests"
  if [[ -f "$ROOT_DIR/pubspec.yaml" ]]; then
    if ! command -v flutter >/dev/null 2>&1; then
      echo "WARN: flutter not found; skipping tests" >&2
      return
    fi
    flutter test
  elif [[ -f "$ROOT_DIR/run.py" ]] || [[ -d "$ROOT_DIR/tests" ]]; then
    python3 -m pytest -q --ignore=tests/test_scoring_and_planner.py
  else
    echo "WARN: unknown repo type; skipping tests" >&2
  fi
}

ensure_feature_branch() {
  local branch
  branch="$(git branch --show-current)"
  if [[ "$branch" == "$BASE_BRANCH" || "$branch" == "staging" ]]; then
    echo "FAIL: on protected branch '$branch'." >&2
    echo "Create a feature branch first, e.g.:" >&2
    echo "  git checkout -b feat/my-change" >&2
    exit 1
  fi
}

commit_if_needed() {
  if [[ "$NO_COMMIT" -eq 1 ]]; then
    echo "==> commit skipped (--no-commit)"
    return
  fi
  if [[ -z "$(git status --porcelain)" ]]; then
    echo "==> nothing to commit"
    return
  fi
  if [[ -z "$COMMIT_MSG" ]]; then
    echo "FAIL: uncommitted changes but no -m/--message" >&2
    exit 1
  fi
  echo "==> commit"
  if [[ "$STAGE_ALL" -eq 1 ]]; then
    git add -A
  else
    git add -u
    if [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
      echo "WARN: untracked files present; use --all to include them" >&2
    fi
  fi
  git commit -m "$COMMIT_MSG"
}

push_branch() {
  local branch
  branch="$(git branch --show-current)"
  echo "==> push origin $branch"
  git push -u origin "HEAD:refs/heads/$branch"
}

api_json() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local token owner repo
  token="$(github_token)"
  if [[ -z "$token" ]]; then
    echo "FAIL: no GitHub token (install gh auth login, or set GH_TOKEN)" >&2
    exit 1
  fi
  read -r owner repo <<<"$(github_remote_parts)"
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" \
      -H "Authorization: Bearer ${token}" \
      -H "Accept: application/vnd.github+json" \
      -H "Content-Type: application/json" \
      "https://api.github.com/repos/${owner}/${repo}${path}" \
      -d "$data"
  else
    curl -sS -X "$method" \
      -H "Authorization: Bearer ${token}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${owner}/${repo}${path}"
  fi
}

find_open_pr_number() {
  local branch head_filter
  branch="$(git branch --show-current)"
  read -r owner _ <<<"$(github_remote_parts)"
  head_filter="${owner}:${branch}"
  api_json GET "/pulls?state=open&head=${head_filter}&base=${BASE_BRANCH}" \
    | python3 -c "import sys,json; ps=json.load(sys.stdin); print(ps[0]['number'] if ps else '')" 2>/dev/null || true
}

pr_payload_update() {
  python3 - "$PR_TITLE" "$body" "$DRAFT" <<'PY'
import json, sys
title, body, draft = sys.argv[1], sys.argv[2], sys.argv[3] == "1"
print(json.dumps({"title": title, "body": body, "draft": draft}))
PY
}

pr_payload_create() {
  python3 - "$PR_TITLE" "$branch" "$BASE_BRANCH" "$body" "$DRAFT" <<'PY'
import json, sys
title, head, base, body, draft = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5] == "1"
print(json.dumps({"title": title, "head": head, "base": base, "body": body, "draft": draft}))
PY
}

create_or_update_pr() {
  local branch body title existing
  branch="$(git branch --show-current)"
  if [[ -z "$PR_TITLE" ]]; then
    if [[ -n "$COMMIT_MSG" ]]; then
      PR_TITLE="${COMMIT_MSG%%$'\n'*}"
    else
      PR_TITLE="${branch//-/ }"
      PR_TITLE="$(echo "$PR_TITLE" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')"
    fi
  fi
  body="$(cat <<EOF
## Summary
Automated PR from \`./scripts/ship-pr.sh\` on branch \`${branch}\`.

## Test plan
- [ ] CI green
- [ ] Manual smoke if needed
EOF
)"
  existing="$(find_open_pr_number)"
  if [[ -n "$existing" ]]; then
    echo "==> updating PR #${existing}" >&2
    api_json PATCH "/pulls/${existing}" "$(pr_payload_update)" >/dev/null
    echo "$existing"
    return
  fi

  echo "==> creating draft PR" >&2
  api_json POST "/pulls" "$(pr_payload_create)" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'number' not in d:
  raise SystemExit('PR create failed: ' + str(d.get('message', d)))
print(d['number'])
"
}

pr_head_sha() {
  local pr_number="$1"
  api_json GET "/pulls/${pr_number}/commits" | python3 -c "
import sys, json
commits = json.load(sys.stdin)
if not commits:
    sys.exit(1)
print(commits[-1]['sha'])
" 2>/dev/null
}

ci_state_for_sha() {
  local sha="$1"
  api_json GET "/commits/${sha}/check-runs?per_page=100" | python3 -c "
import sys, json
d = json.load(sys.stdin)
runs = d.get('check_runs') or []
if not runs:
    print('empty')
    sys.exit(0)
incomplete = [r for r in runs if r.get('status') != 'completed']
if incomplete:
    print('pending')
    sys.exit(0)
bad = {'failure', 'cancelled', 'timed_out', 'action_required'}
for r in runs:
    c = r.get('conclusion')
    if c in bad:
        print('failure')
        sys.exit(0)
print('success')
" 2>/dev/null
}

legacy_ci_state_for_sha() {
  local sha="$1"
  api_json GET "/commits/${sha}/status" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('state', 'pending'))
" 2>/dev/null || echo "pending"
}

wait_for_ci() {
  local pr_number="$1"
  local attempts=60
  local i=0 sha status
  echo "==> waiting for CI on PR #${pr_number} (up to ~10 min)"
  while [[ "$i" -lt "$attempts" ]]; do
    sha="$(pr_head_sha "$pr_number" || true)"
    if [[ -z "$sha" ]]; then
      sleep 10
      i=$((i + 1))
      continue
    fi
    status="$(ci_state_for_sha "$sha" || echo "pending")"
    if [[ "$status" == "empty" ]]; then
      status="$(legacy_ci_state_for_sha "$sha")"
    fi
    case "$status" in
      success) echo "CI: success"; return 0 ;;
      failure|error)
        echo "FAIL: CI failed (check-runs or commit status)" >&2
        exit 1
        ;;
      *) sleep 10 ;;
    esac
    i=$((i + 1))
  done
  echo "FAIL: CI did not complete in time" >&2
  exit 1
}

pr_is_draft() {
  local pr_number="$1"
  api_json GET "/pulls/${pr_number}" \
    | python3 -c "import sys,json; print('1' if json.load(sys.stdin).get('draft') else '0')" \
    2>/dev/null || echo "0"
}

mark_pr_ready_graphql() {
  local pr_number="$1"
  local node_id token payload
  node_id="$(api_json GET "/pulls/${pr_number}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('node_id',''))" 2>/dev/null || true)"
  if [[ -z "$node_id" ]]; then
    echo "FAIL: could not read PR node_id for GraphQL" >&2
    return 1
  fi
  token="$(github_token)"
  payload="$(python3 - "$node_id" <<'PY'
import json, sys
node_id = sys.argv[1]
print(json.dumps({
    "query": "mutation($id: ID!) { markPullRequestReadyForReview(input: {pullRequestId: $id}) { pullRequest { isDraft } } }",
    "variables": {"id": node_id},
}))
PY
)"
  curl -sS -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    "https://api.github.com/graphql" \
    -d "$payload" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
if d.get('errors'):
    raise SystemExit('GraphQL markPullRequestReadyForReview failed: ' + str(d['errors']))
pr = (d.get('data') or {}).get('markPullRequestReadyForReview', {}).get('pullRequest', {})
if pr.get('isDraft'):
    raise SystemExit('PR still draft after markPullRequestReadyForReview')
"
}

mark_pr_ready() {
  local pr_number="$1"
  echo "==> marking PR #${pr_number} ready for review"
  if [[ "$(pr_is_draft "$pr_number")" != "1" ]]; then
    echo "PR #${pr_number} already ready for review"
    return 0
  fi
  api_json PATCH "/pulls/${pr_number}" '{"draft":false}' >/dev/null 2>&1 || true
  if [[ "$(pr_is_draft "$pr_number")" != "1" ]]; then
    return 0
  fi
  echo "==> REST undraft did not apply; trying GraphQL markPullRequestReadyForReview" >&2
  mark_pr_ready_graphql "$pr_number"
  if [[ "$(pr_is_draft "$pr_number")" == "1" ]]; then
    echo "FAIL: PR #${pr_number} is still a draft; cannot merge" >&2
    return 1
  fi
}

merge_pr() {
  local pr_number="$1"
  mark_pr_ready "$pr_number"
  echo "==> merging PR #${pr_number} (squash)"
  api_json PUT "/pulls/${pr_number}/merge" '{"merge_method":"squash"}' \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
if not d.get('merged'):
    raise SystemExit('Merge failed: ' + str(d.get('message', d)))
print('Merged:', d.get('sha',''))
"
}

main() {
  ensure_feature_branch
  run_tests
  commit_if_needed
  push_branch
  local pr_number owner repo
  pr_number="$(create_or_update_pr)"
  read -r owner repo <<<"$(github_remote_parts)"
  echo ""
  echo "PR: https://github.com/${owner}/${repo}/pull/${pr_number}"

  if [[ "$DO_MERGE" -eq 1 ]]; then
    if [[ "$MERGE_NOW" -eq 0 ]]; then
      wait_for_ci "$pr_number"
    fi
    merge_pr "$pr_number"
    echo "==> sync local ${BASE_BRANCH}"
    git checkout "$BASE_BRANCH"
    git pull origin "$BASE_BRANCH"
  fi

  echo ""
  echo "Done. Working tree tip:"
  git status -sb
  git log -1 --oneline
}

main

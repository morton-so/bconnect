#!/usr/bin/env sh
# .envrc.example 의 비밀값 변수가 .envrc.local 에 모두 작성되었는지 검증합니다.

set -u

missing_files=0
missing_keys=0

# 동일한 변수명에 대해 서로 다른 값을 허용하는 키값. 콤마로 구분
allowed_lists="NEXT_PUBLIC_FIREBASE_APP_ID"

# export 변수
keys() {
  grep '^export ' "$1" | cut -d= -f1 | cut -d' ' -f2
}

# 단일 디렉터리
check() {
  dir=$1
  example="$dir/.envrc.example"
  local_file="$dir/.envrc.local"
  name=$dir
  [ "$dir" = "." ] && name=root

  if [ ! -f "$local_file" ]; then
    echo "$name : local 파일 누락"
    missing_files=$((missing_files + 1))
    return
  fi
  echo "$name"

  for key in $(keys "$example"); do
    if ! grep -q "^export $key=" "$local_file"; then
      echo "- $key 누락됨"
      missing_keys=$((missing_keys + 1))
    fi
  done
}

for example in $(git ls-files '.envrc.example' '*/.envrc.example'); do
  check "$(dirname "$example")"
done

# 같은 변수명이 파일마다 다른 값이면 경고
awk -v allowed="$allowed_lists" '
BEGIN { gsub(/ +/, "", allowed); split(allowed, list, ","); for (i in list) skip[list[i]] = 1 }
/^export +[A-Z][A-Z0-9_]*=/ {
  eq = index($0, "=")
  key = substr($0, 8, eq - 8)
  value = substr($0, eq + 1)
  gsub(/["\047 \t]/, "", key)
  gsub(/["\047 \t]/, "", value)
  if (key in seen && seen[key] != value && !(key in skip)) print key " 값 충돌 : " file[key] ", " FILENAME
  seen[key] = value
  file[key] = FILENAME
}' $(git ls-files '.envrc' '*/.envrc')

echo
echo "파일 누락 ${missing_files}개, 키 누락 ${missing_keys}개"
[ $((missing_files + missing_keys)) -eq 0 ]

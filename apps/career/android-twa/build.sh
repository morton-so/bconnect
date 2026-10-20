#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

ENV="${1:-prod}"
case "$ENV" in
  dev) HOST="career.dev.bconnect.to" ;;
  prod) HOST="career.bconnect.to" ;;
  *) echo "ERROR: 인자는 dev|prod (기본 prod). 받은 값: '$ENV'" >&2; exit 1 ;;
esac

: "${TWA_KEYSTORE_PASSWORD:?export TWA_KEYSTORE_PASSWORD 필요}"
: "${TWA_KEY_PASSWORD:?export TWA_KEY_PASSWORD 필요}"

echo "=== twa-manifest.json 생성 (env=$ENV, host=$HOST) ==="
sed "s/__HOST__/${HOST}/g" twa-manifest.template.json > twa-manifest.json

if [[ ! -f android.keystore ]]; then
  echo "ERROR: android.keystore 없음 — 레포 밖 보관본을 이 디렉토리에 복사하세요 (README 참조)" >&2
  exit 1
fi

export JAVA_HOME="$HOME/jdk17"
export PATH="$JAVA_HOME/bin:$PATH"
export BUBBLEWRAP_KEYSTORE_PASSWORD="$TWA_KEYSTORE_PASSWORD"
export BUBBLEWRAP_KEY_PASSWORD="$TWA_KEY_PASSWORD"

echo "=== update (twa-manifest.json → android project 재생성) ==="
bubblewrap update --skipVersionUpgrade < /dev/null

echo "=== build ==="
bubblewrap build --skipPwaValidation < /dev/null

echo
echo "산출물:"
ls -la app-release-signed.apk app-release-bundle.aab
echo "사이드로드: app-release-signed.apk 를 폰에 복사 후 설치 (같은 키라 기존 앱 위 업데이트)"

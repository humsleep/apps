# apps — boheme 앱 공용 안내 사이트

boheme(GitHub `humsleep`)가 만든 앱들의 **공용** 안내 사이트. GitHub Pages 로 `https://humsleep.github.io/apps/` 에 게시된다.

**링크는 전부 상대 경로로 쓴다**(`/assets/...` 처럼 `/`로 시작하면 `humsleep.github.io/assets/`를 가리켜 깨진다).

| 경로 | 용도 | 스토어 어디에 넣나 |
|---|---|---|
| `/apps/` | 앱 목록 + 개발자 문의 | App Store 마케팅 URL · Google Play 웹사이트 (선택) |
| `/apps/<app-id>/` | 앱 안내·FAQ·문의 | App Store **지원 URL** |
| `/apps/<app-id>/privacy/` | 앱별 개인정보처리방침 | App Store·Google Play **개인정보처리방침 URL**, 앱 설정 화면 링크 |
| `app-ads.txt` | 광고 판매자 인증 원본(모든 앱 공용 1개) | ⚠️ 아래 "app-ads.txt" 참고 |
| `/apps/assets/style.css` | 공용 스타일 | — |
| `_template/` | 새 앱용 틀 (밑줄로 시작해 **게시되지 않음**) | — |

## 앱 목록

| app-id | 앱 | 광고 | 분석 |
|---|---|---|---|
| `mossol` | 모쏠 키우기 : 연애 시뮬레이션 게임 (iOS, com.hyukahn.mossol) | AdMob | Firebase Analytics |
| `fcscope` | FC Scope (iOS + 웹, xyz.fcscope.app) — **외부 링크**: 방침·안내는 `www.fcscope.xyz` 에 있음, 이 저장소엔 아이콘(`assets/icons/fcscope.png`)만 | AdMob | 자체 익명 통계(Supabase `app_events`) |
| `ribatto` | Ribatto: Rally Clips (iOS, com.ribatto.app) — 옛 주소 `humsleep.github.io/Ribatto/privacy.html` 은 여기로 리디렉트 | AdMob + UMP | 없음 |

## 새 앱 추가

절차는 **`ADD_APP.md`** 에 있다. 앱 프로젝트의 Claude 세션에 이렇게 입력하면 된다:

> `~/workspace/apps/ADD_APP.md` 절차대로 이 앱을 공용 안내 사이트에 추가해줘. app-id는 `<app-id>`.

## 처음 한 번만: GitHub Pages 켜기

저장소 Settings → Pages → Source **Deploy from a branch** → Branch **main** / **(root)** → Save.

## app-ads.txt

AdMob 은 **도메인 맨 위**(`https://humsleep.github.io/app-ads.txt`)만 읽는다. 이 저장소는 `/apps/` 아래에 게시되므로
여기 있는 파일은 원본 보관용이고, 실제로는 출시 후 아래 둘 중 하나가 필요하다.

1. `humsleep.github.io` 라는 이름의 공개 저장소를 하나 더 만들고 `app-ads.txt` 한 파일만 넣는다(가장 간단).
2. 나중에 도메인(예: boheme.dev)을 사서 이 저장소에 연결하면 이 파일이 그대로 맨 위에 서므로 1번이 필요 없다.

## 공통 연락처

모든 앱의 보호책임자·문의 연락처는 하나로 통일한다: **안혁 / humsleep@naver.com** (템플릿에 미리 들어 있다).

## 주의

- 공개 저장소다. 게임 코드·API 키는 넣지 않는다. 연락처는 위 공통 연락처만 쓴다.
- 개인정보처리방침을 고치면 시행일을 바꾸고, 중요한 변경이면 앱 업데이트 노트에도 알린다.

# 새 앱을 이 사이트에 추가하는 절차 (Claude 세션용)

> 다른 프로젝트의 Claude 세션이 이 파일을 읽고 그대로 따른다. 사람이 읽어도 된다.
> 저장소: github.com/humsleep/apps · 로컬: `~/workspace/apps` · 게시 주소: `https://humsleep.github.io/apps/`

## 입력으로 받는 것
- 앱 프로젝트 폴더 (예: `~/workspace/fcscope`)
- app-id: 영문 소문자·하이픈 (예: `fcscope`, `ribatto`). 주소가 `https://humsleep.github.io/apps/<app-id>/` 가 되므로 **출시 후 바꾸지 않는다.**

## 0. 먼저 확인
1. `~/workspace/apps` 에서 `git pull` 로 최신화.
2. `apps/<app-id>/` 가 이미 있으면 새로 만들지 말고 **갱신**만 한다.
3. **앱에 이미 방침 주소가 있는지** 찾는다(앱 코드·스토어 문서에서 `privacy` 가 들어간 URL). 있으면 아래 중 하나로 처리한다.
   - **(가) 옛 주소가 GitHub Pages(`humsleep.github.io/<다른 저장소>/...`)**: 새 주소로 옮기고, 옛 저장소의 그 파일을
     새 주소로 보내는 리디렉트 페이지로 바꾼다(`<meta http-equiv="refresh" content="0; url=새 주소">` + 링크 한 줄).
     이미 출시돼 스토어·앱에 옛 주소가 들어가 있어도 끊기지 않게 하기 위해서다. 옛 방침 내용은 새 방침의 근거 자료로 쓴다.
   - **(나) 앱이 자기 도메인을 가진 웹 서비스**(예: `https://www.fcscope.xyz/privacy`): 방침은 **서비스 도메인에 그대로 둔다**
     (웹 서비스는 자기 사이트에 방침이 있어야 하고, 그 도메인 맨 위에 `app-ads.txt`도 직접 둘 수 있다).
     이 사이트에는 `<app-id>/` 폴더를 만들지 않고, 루트 `index.html` 목록과 README 표에 **외부 링크로만** 추가한다.
     단, 연락처가 다르면 서비스 쪽 방침의 보호책임자·연락처를 **안혁 / humsleep@naver.com** 으로 맞출지 사용자에게 묻는다.

## 1. 앱 조사 (방침의 사실 근거 — 추측으로 쓰지 않는다)
앱 프로젝트에서 아래를 **코드와 설정 파일로 확인**하고 표로 정리한다.

| 확인할 것 | 어디서 |
|---|---|
| 정식 앱 이름, 번들 ID/패키지명, 한 줄 소개, 강조색, 플랫폼(iOS/Android/Web) | Info.plist, AndroidManifest, pubspec/package.json, 스토어 문서 |
| 광고 SDK (AdMob, UMP, 기타) | 의존성 목록, 초기화 코드 |
| 분석·크래시 (Firebase Analytics/Crashlytics, Sentry 등) | 의존성, `GoogleService-Info.plist` |
| 로그인·계정 (Apple/Google/카카오 로그인, 자체 계정) | 의존성, 인증 코드 |
| 서버 전송 (자체 API, Firestore, Supabase, 외부 API) — **무엇을** 보내는가 | 네트워크 호출 코드 |
| 권한 (카메라, 사진, 마이크, 위치, 알림, ATT, 연락처) | Info.plist `NS...UsageDescription`, Manifest permissions |
| 기기 안에만 저장하는 데이터 | shared_preferences, SQLite, 파일 저장 코드 |
| 결제 (인앱 결제·구독) | 의존성 |
| 대상 연령 (아동 대상 아님이 기본) | 스토어 문서 |

## 2. 파일 만들기
1. `_template/` 를 `<app-id>/` 로 복사한다 (`_template` 자체는 게시되지 않는다).
2. `<app-id>/privacy/index.html`
   - `[대괄호]` 전부 채운다. 남은 대괄호가 0개인지 `grep -n '\[' ` 로 확인.
   - **1단계 조사 결과에 있는 것만** 쓴다. 쓰지 않는 서비스의 표 행·항목은 지운다
     (광고·분석이 전혀 없으면 2항 표와 3항을 통째로 지우고 "제3자에게 제공하지 않습니다"로 바꾼다).
   - 권한을 쓰면 "접근 권한" 항을 추가해 권한별 목적과 거부 시 영향을 적는다.
   - 서버로 보내는 데이터가 있으면 1항에 수집 항목·목적·보유 기간·파기 방법을 적는다.
   - 로그인이 있으면 **회원 탈퇴·데이터 삭제 방법**을 적는다 (App Store 필수).
   - 보호책임자·연락처는 **안혁 / humsleep@naver.com** 고정. 시행일은 오늘 이후 날짜.
3. `<app-id>/index.html` (안내·문의 = 스토어 지원 URL): FAQ 2~4개는 앱의 실제 기능에서 나온 질문으로.
4. `<app-id>/icon.png`: 앱 아이콘 원본을 256×256 으로 (`sips -z 256 256`).
5. 링크는 **전부 상대 경로** (`../assets/style.css`, `privacy/`). `/` 로 시작하는 경로 금지.

## 3. 목록 갱신
1. 루트 `index.html` 의 `<ul class="apps">` 에 앱 한 줄 (아이콘, 이름, 안내·문의, 개인정보처리방침 링크).
2. `README.md` 의 "앱 목록" 표에 한 줄 (app-id, 이름·번들 ID, 광고, 분석).
3. 광고 SDK 가 AdMob 이면 `app-ads.txt` 는 **건드리지 않는다**(같은 게시자 ID 한 줄이 모든 앱을 덮는다).
   다른 광고 네트워크를 쓰면 그 네트워크가 주는 줄을 추가한다.

## 4. 확인 → 게시
1. 로컬 확인: `python3 -m http.server 8765 --directory ~/workspace` 후 `http://localhost:8765/apps/<app-id>/` 와
   `/privacy/` 를 모바일 폭에서 열어 링크·아이콘·표가 깨지지 않는지 본다.
2. `git add -A && git commit -m "<app-id> 추가: 안내·개인정보처리방침" && git push`.
3. 1~2분 뒤 실제 주소가 200 인지 `curl -I` 로 확인.

## 5. 앱 프로젝트 쪽 반영
1. 앱 설정/정보 화면의 개인정보처리방침 링크를 `https://humsleep.github.io/apps/<app-id>/privacy/` 로 바꾼다
   (없으면 추가를 제안만 하고 사용자에게 묻는다).
2. 앱 프로젝트의 출시 문서에 세 주소를 적는다:
   - 개인정보처리방침 URL: `https://humsleep.github.io/apps/<app-id>/privacy/`
   - 지원 URL: `https://humsleep.github.io/apps/<app-id>/`
   - 마케팅 URL: `https://humsleep.github.io/apps/`
3. 1단계 조사표를 App Store "앱 개인정보 보호"(데이터 수집 설문)·Google Play "데이터 보안" 답변 초안으로 함께 남긴다.

## 6. 보고
만든/바꾼 파일, 세 주소, 1단계 조사표, 확신이 없어 사용자 확인이 필요한 항목(예: 서버가 무엇을 저장하는지)을 짧게 보고한다.

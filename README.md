# humsleep.github.io

humsleep이 만든 앱들의 **공용** 안내 사이트. GitHub Pages 로 `https://humsleep.github.io/` 에 게시된다.

| 경로 | 용도 | 스토어 어디에 넣나 |
|---|---|---|
| `/` | 앱 목록 + 개발자 문의 | App Store 마케팅 URL · Google Play 웹사이트 (선택) |
| `/<app-id>/` | 앱 안내·FAQ·문의 | App Store **지원 URL** |
| `/<app-id>/privacy/` | 앱별 개인정보처리방침 | App Store·Google Play **개인정보처리방침 URL**, 앱 설정 화면 링크 |
| `/app-ads.txt` | 광고 판매자 인증 (**모든 앱 공용 1개**) | AdMob 이 자동으로 읽음 (스토어의 개발자 웹사이트 도메인 = 이 사이트) |
| `/assets/style.css` | 공용 스타일 | — |
| `/_template/` | 새 앱용 틀 (밑줄로 시작해 **게시되지 않음**) | — |

## 앱 목록

| app-id | 앱 | 광고 | 분석 |
|---|---|---|---|
| `mossol` | 모쏠 키우기 : 연애 시뮬레이션 게임 (iOS, com.hyukahn.mossol) | AdMob | Firebase Analytics |

## 새 앱 추가 (10분)

1. `_template/` 를 `<app-id>/` 로 복사한다 (영문 소문자, 예: `rallycut`).
2. `<app-id>/privacy/index.html` 의 `[대괄호]` 를 채우고, 쓰지 않는 서비스 행을 지운다.
   광고·분석을 전혀 안 쓰는 앱이면 2항 표와 3항을 통째로 지운다.
3. `<app-id>/index.html` 안내 페이지를 `mossol/index.html` 을 참고해 만든다. 아이콘은 `<app-id>/icon.png` (256px).
4. 루트 `index.html` 의 `<ul class="apps">` 에 한 줄 추가, 이 README 의 앱 목록 표에도 추가.
5. 같은 AdMob 계정이면 `app-ads.txt` 는 **그대로 둔다**(게시자 ID 가 같으므로 한 줄로 모든 앱을 덮는다).
   다른 광고 네트워크를 새로 쓰면 그 네트워크가 주는 줄만 추가한다.
6. 커밋·푸시하면 1~2분 뒤 반영된다.

## 처음 한 번만: GitHub Pages 켜기

저장소 Settings → Pages → Source **Deploy from a branch** → Branch **main** / **(root)** → Save.

## 주의

- 공개 저장소다. 게임 코드·키·개인 연락처(개인 메일)는 넣지 않는다. 연락처는 앱 문의 전용 메일을 쓴다.
- 개인정보처리방침을 고치면 시행일을 바꾸고, 중요한 변경이면 앱 업데이트 노트에도 알린다.

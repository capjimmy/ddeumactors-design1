# 뜸 연기학원 웹사이트

## 폴더 구조

```
website/
├── index.html          # 메인 페이지
├── css/
│   ├── style.css       # 공통 스타일
│   ├── home.css        # 홈페이지 전용 스타일
│   ├── pages.css       # 서브페이지 공통 스타일
│   ├── teachers.css    # 강사소개 스타일
│   └── curriculum.css  # 커리큘럼 스타일
├── js/
│   ├── main.js         # 공통 JavaScript
│   └── home.js         # 홈페이지 전용 JavaScript
├── pages/
│   ├── about.html      # 학원소개
│   ├── teachers.html   # 강사 소개
│   ├── facility.html   # 시설 안내
│   ├── location.html   # 오시는 길
│   ├── curriculum.html # 커리큘럼
│   ├── success.html    # 합격자 소개
│   └── contact.html    # 상담 신청
└── images/             # 이미지 폴더 (필요시 추가)
```

## Google Sheets 연동

### 현재 연동된 시트들

| 시트 (gid) | 용도 | 컬럼 구조 |
|------------|------|----------|
| 0 | 합격자 명단 (롤링) | A열: 이름 |
| 2046441648 | 메트릭스 카드 | A열: 라벨, B열: 값 |
| 1842660855 | 합격 대학 목록 | A열: 대학명 |
| 571115650 | 합격자 소개 게시판 | A: 이름, B: 대학, C: 전공, D: 년도, E: 이미지URL, F: 한마디 |

### 합격자 소개 게시판 (gid=571115650) 데이터 형식

Google Sheets에 다음과 같은 형식으로 데이터를 입력하세요:

| 이름 | 합격대학 | 전공 | 년도 | 이미지URL | 한마디 |
|------|----------|------|------|-----------|--------|
| 김예진 | 중앙대학교 | 연극학과 | 2025 | (이미지 URL) | 뜸에서 배운 시간이 합격의 밑거름이 되었습니다. |
| 박민수 | 한국예술종합학교 | 연기과 | 2025 | (이미지 URL) | 체계적인 커리큘럼 덕분에 자신감을 얻었습니다. |

**참고**: 이미지URL을 비워두면 기본 이미지가 표시됩니다.

## 상담 신청 폼

상담 신청 폼은 Google Apps Script를 통해 Google Sheets로 데이터가 전송됩니다.

현재 연동된 Web App URL:
```
https://script.google.com/macros/s/AKfycbx2qCjvpQY5mVqMKV6tYFsNP9ZNPop6vVl2VnfJ6ofC44ph-6z_4cLiiHkf_cDcrEyV/exec
```

## 네이버 지도 API

오시는 길 페이지에서 네이버 지도를 사용합니다.

- API Key: `s6d19uyrhq`
- 좌표: 위도 37.482966, 경도 126.981526

## 호스팅 방법

### 옵션 1: GitHub Pages (무료)

1. GitHub에 repository 생성
2. `website` 폴더 내용을 repository에 업로드
3. Settings > Pages에서 배포 설정

### 옵션 2: Netlify (무료)

1. netlify.com에서 계정 생성
2. `website` 폴더를 드래그 앤 드롭으로 업로드
3. 자동으로 배포됨

### 옵션 3: Vercel (무료)

1. vercel.com에서 계정 생성
2. GitHub 연동 후 자동 배포

## 커스터마이징

### 색상 변경

`css/style.css`의 `:root` 섹션에서 CSS 변수를 수정하세요:

```css
:root {
  --color-primary: #e74c3c;      /* 메인 강조색 */
  --color-primary-dark: #c0392b; /* 메인 강조색 (어두운 버전) */
  --color-text: #1a1a1a;         /* 기본 텍스트 색상 */
  /* ... */
}
```

### 로고 변경

각 HTML 파일의 `.logo` 부분을 수정하세요:

```html
<a href="index.html" class="logo">뜸<span>ACTORS</span></a>
```

이미지 로고로 변경하려면:

```html
<a href="index.html" class="logo">
  <img src="images/logo.png" alt="뜸 연기학원">
</a>
```

### 연락처 정보 변경

모든 페이지의 footer 섹션에서 수정하세요.

## 이미지 교체

현재 Unsplash의 임시 이미지를 사용 중입니다.
실제 학원 사진으로 교체하려면:

1. `images/` 폴더에 이미지 저장
2. HTML 파일에서 이미지 경로 수정

예시:
```html
<!-- 변경 전 -->
<img src="https://images.unsplash.com/..." alt="시설">

<!-- 변경 후 -->
<img src="../images/facility-1.jpg" alt="시설">
```

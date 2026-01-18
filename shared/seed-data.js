// ===========================================
// 뜸 연기학원 Firebase 시드 데이터 스크립트
// ===========================================
// 사용 방법:
// 1. 브라우저에서 Firebase가 초기화된 페이지를 엽니다.
// 2. 개발자 도구(F12) > 콘솔 탭을 엽니다.
// 3. 이 파일의 전체 내용을 복사하여 콘솔에 붙여넣고 실행합니다.
// ===========================================

(async function seedFirebaseData() {
    console.log('%c뜸 연기학원 시드 데이터 추가 시작', 'color: #667eea; font-size: 16px; font-weight: bold;');

    // Firebase SDK 동적 로드
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBkzXMrEwf4XKFPEJQgUWDhGcplTPWtPDI",
        authDomain: "ddeumactors.firebaseapp.com",
        projectId: "ddeumactors",
        storageBucket: "ddeumactors.firebasestorage.app",
        messagingSenderId: "1066282693101",
        appId: "1:1066282693101:web:91e366814c81d83bb5b7e4"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // ===========================================
    // 시드 데이터 정의
    // ===========================================

    // 1. Hero 섹션 설정
    const heroData = {
        videoUrl: "",
        title: "뜸 연기학원",
        subtitle: "실전 중심 연기 교육으로 무대와 카메라 앞에서 통하는 연기를 만듭니다."
    };

    // 2. 합격자 명단 (20명)
    const namesData = {
        list: [
            "김서연",
            "이준호",
            "박지민",
            "최유진",
            "정민서",
            "강하늘",
            "윤소희",
            "임재현",
            "한예슬",
            "송민재",
            "오승아",
            "배진영",
            "신예은",
            "류현진",
            "홍수빈",
            "전소민",
            "조현우",
            "권나라",
            "안재홍",
            "문가영"
        ]
    };

    // 3. 대학 목록 (15개 - 연기과가 있는 대학들)
    const universitiesData = {
        list: [
            "한국예술종합학교",
            "중앙대학교",
            "동국대학교",
            "한양대학교",
            "경희대학교",
            "성균관대학교",
            "단국대학교",
            "건국대학교",
            "숭실대학교",
            "국민대학교",
            "세종대학교",
            "명지대학교",
            "청주대학교",
            "용인대학교",
            "수원대학교"
        ]
    };

    // ===========================================
    // 데이터 추가 실행
    // ===========================================

    try {
        // Hero 설정 추가
        console.log('%c[1/3] settings/hero 문서 추가 중...', 'color: #60a5fa;');
        await setDoc(doc(db, 'settings', 'hero'), heroData);
        console.log('%c[1/3] settings/hero 문서 추가 완료!', 'color: #4ade80;');

        // Names 설정 추가
        console.log('%c[2/3] settings/names 문서 추가 중...', 'color: #60a5fa;');
        await setDoc(doc(db, 'settings', 'names'), namesData);
        console.log('%c[2/3] settings/names 문서 추가 완료!', 'color: #4ade80;');

        // Universities 설정 추가
        console.log('%c[3/3] settings/universities 문서 추가 중...', 'color: #60a5fa;');
        await setDoc(doc(db, 'settings', 'universities'), universitiesData);
        console.log('%c[3/3] settings/universities 문서 추가 완료!', 'color: #4ade80;');

        console.log('%c==========================================', 'color: #667eea;');
        console.log('%c모든 시드 데이터가 성공적으로 추가되었습니다!', 'color: #4ade80; font-size: 14px; font-weight: bold;');
        console.log('%c==========================================', 'color: #667eea;');
        console.log('');
        console.log('%c추가된 데이터 요약:', 'color: #fbbf24; font-weight: bold;');
        console.log('- settings/hero: 히어로 섹션 설정 (제목, 부제목, 비디오URL)');
        console.log('- settings/names: 합격자 명단 20명');
        console.log('- settings/universities: 대학 목록 15개');

        return { success: true, message: '시드 데이터 추가 완료' };

    } catch (error) {
        console.error('%c오류 발생:', 'color: #f87171; font-weight: bold;', error);
        return { success: false, error: error.message };
    }
})();

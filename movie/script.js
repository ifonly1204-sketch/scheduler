// 1. Firebase 설정 (록명 님의 프로젝트 키로 교체 필요)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "sender-id",
    appId: "app-id"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// 2. 이미지 및 데이터 불러오기 자율 함수
async function loadAppData() {
    const imgElement = document.getElementById('main-img');
    const loader = document.getElementById('loader');

    try {
        // [수정 포인트] Firestore에서 이미지 파일명이나 URL을 가져옴
        const doc = await db.collection('settings').doc('main_ui').get();
        
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('app-title').innerText = data.title || "걷다";
            document.getElementById('app-desc').innerText = data.description || "오늘을 비워내세요";

            // Storage에서 다운로드 URL 생성
            const storageRef = storage.ref('images/logo.png'); // 파일 경로 확인 필수
            const url = await storageRef.getDownloadURL();
            
            imgElement.src = url;
            imgElement.style.display = 'block';
            loader.style.display = 'none';
        } else {
            throw new Error("설정 데이터를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("Firebase 로드 실패:", error);
        // [자율 수정] 실패 시 로컬 기본 이미지로 대체
        imgElement.src = 'assets/img/default_logo.png';
        imgElement.style.display = 'block';
        loader.style.display = 'none';
        document.getElementById('app-desc').innerText = "오프라인 모드로 실행 중입니다.";
    }
}

function navigateToNext() {
    console.log("다음 단계로 이동...");
    // 록명 님, 여기서 다음 페이지 연결 코드를 작성하시면 됩니다.
}

window.onload = loadAppData;
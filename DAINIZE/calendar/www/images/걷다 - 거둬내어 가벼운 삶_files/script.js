const firebaseConfig = {
  apiKey: "AIzaSyDY_NqxFlarrQET1q6f3u96MXwglJndBp8",
  authDomain: "walk-and-take.firebaseapp.com",
  projectId: "walk-and-take",
  storageBucket: "walk-and-take.firebasestorage.app",
  messagingSenderId: "789071005637",
  appId: "1:789071005637:web:a4fdbbf9bcdf42d985adac",
  measurementId: "G-Z0RN79TDVK"
};

// Firebase 시작하기
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

console.log("유료의 진단: walk-and-take 서버 연결 완료!");

let categories = [
  { title: "오늘일정", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
  { title: "업무", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
  { title: "쇼핑", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>` },
  {
    title: "자기계발",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11l-5-5-5 5M17 18l-5-5-5 5"/></svg>`,
  },
  { title: "건강", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
  { title: "운동", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="19" r="3"/><line x1="9" y1="16" x2="15" y2="8"/></svg>` },
  { title: "교육", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
  { title: "금융", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` }
];

let tasks = [];
let selectedCategory = categories[0];

// DOM 요소
const categoriesContainer = document.querySelector(".categories");
const screenWrapper = document.querySelector(".wrapper");
const menuBtn = document.querySelector(".settings-btn");
const backBtn = document.querySelector(".back-btn");
const tasksContainer = document.querySelector(".tasks");
const numTasks = document.getElementById("num-tasks");
const categoryTitle = document.getElementById("category-title");
const categoryImg = document.getElementById("category-img");
const categorySelect = document.getElementById("category-select");
const addTaskWrapper = document.querySelector(".add-task");
const addTaskBtn = document.querySelector(".add-task-btn");
const taskInput = document.getElementById("task-input");
const blackBackdrop = document.querySelector(".black-backdrop");
const addBtn = document.querySelector(".add-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const totalTasks = document.getElementById("total-tasks");


const saveLocal = async () => {
  const user = auth.currentUser;
  localStorage.setItem("tasks", JSON.stringify(tasks)); // 이름 통일

  if (user) {
    try {
      // 경로를 더 명확하게 todoList 문서로 고정합니다.
      await db.collection("users").doc(user.uid).collection("tasks").doc("todoList").set({
        items: tasks,
        updatedAt: new Date().toISOString()
      });
      console.log("🌊 유료의 진단: 서버 백업 완료");
    } catch (err) {
      console.error("서버 저장 실패:", err);
    }
  }
  // 저장 후 그래프 즉시 갱신!
  updateGrowthDashboard();
};

const getLocal = async () => {
  const user = auth.currentUser;

  // 로컬에서 먼저 가져오기
  const tasksLocal = JSON.parse(localStorage.getItem("tasks"));
  if (tasksLocal) tasks = tasksLocal;

  // 서버 데이터가 있다면 덮어쓰기
  if (user) {
    try {
      const doc = await db.collection("users").doc(user.uid).collection("tasks").doc("todoList").get();
      if (doc.exists) {
        tasks = doc.data().items || [];
      }
    } catch (err) {
      console.error("서버 로드 실패:", err);
    }
  }

  // 그려주는 순서가 중요합니다!
  renderCategories();
  renderTasks();
  updateGrowthDashboard();
  setTimeout(() => {
    updateGrowthDashboard();
  }, 100);

  console.log("✅ 유료의 진단: 모든 데이터 로드 및 그래프 갱신 완료!");
};

const sidebarMenuBtn = document.querySelector('.settings-btn');
const sidebar = document.querySelector('#sidebar');
const overlay = document.querySelector('#sidebar-overlay');
const closeSidebarBtn = document.querySelector('#close-sidebar');

if (sidebarMenuBtn && sidebar) {

  sidebarMenuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
  });

  [closeSidebarBtn, overlay].forEach(el => {
    if (el) {
      el.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });
    }
  });
}

const loginLink = document.querySelector('.profile-link');
const loginScreen = document.querySelector('.login-screen');
const backBtnLogin = document.querySelector('.back-btn-login');

if (loginLink && loginScreen) {

  loginLink.addEventListener('click', () => {

    sidebar.classList.remove('active');
    overlay.classList.remove('active');


    loginScreen.classList.add('active');
    console.log("유료의 진단: 로그인 화면으로 이동합니다.");
  });


  const loginBackBtn = document.querySelector('.back-btn-login');
  if (loginBackBtn) {
    loginBackBtn.onclick = function (e) {
      e.preventDefault();


      const loginScreen = document.querySelector('.login-screen');
      if (loginScreen) loginScreen.classList.remove('active');

      if (!isLoggedIn) {
        const gate = document.getElementById('app-gatekeeper');
        if (gate) {
          gate.style.display = 'flex';
          console.log("유료의 진단: 로그인을 하지 않아 다시 차단벽을 세웁니다.");
        }
      }
    };
  }


  let isAppLocked = true;


  function toggleAppLock() {
    const lockLayer = document.querySelector('.lock-layer');
    if (!lockLayer) return;

    if (isAppLocked) {
      lockLayer.classList.remove('hidden');
    } else {
      lockLayer.classList.add('hidden');
      console.log("유료의 진단: 앱 잠금이 해제되었습니다.");
    }
  }


  function unlockApp() {
    isAppLocked = false;
    toggleAppLock();
  }


  const welcomeScreen = document.getElementById('welcome-screen');
  const welcomeUserName = document.getElementById('welcome-user-name');


  function proceedToMain(email) {
    const loggedOutView = document.getElementById('logged-out-view');
    const loggedInView = document.getElementById('logged-in-view');
    const userEmailDisplay = document.querySelector('.user-email-display');

    if (loggedOutView) loggedOutView.style.display = 'none';
    if (loggedInView) loggedInView.style.display = 'flex';
    if (userEmailDisplay) userEmailDisplay.textContent = `${email}님 환영합니다!`;

    renderCategories();
  }

  const signupOpenBtn = document.querySelector('.signup-link-btn');
  const signupPage = document.querySelector('.signup-screen');

  if (signupOpenBtn && signupPage) {
    signupOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signupPage.classList.add('active');
      console.log("유료의 진단: 회원가입 화면으로 안전하게 진입합니다.");
    });
  }

  const signupSubmitBtn = document.querySelector('.main-signup-btn');
  if (signupSubmitBtn) {
    signupSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const userEmail = document.querySelector('.signup-container input[type="email"]').value.trim();
      const userPass = document.querySelector('.signup-container input[type="password"]').value.trim();

      if (userEmail === "" || userPass === "") {
        alert("정보를 모두 입력해 주세요!");
        return;
      }


      const requiredChecks = document.querySelectorAll('.agree-required');
      const allChecked = Array.from(requiredChecks).every(input => input.checked);

      if (!allChecked) {
        alert("필수 약관에 모두 동의하셔야 가입이 가능합니다.");
        return;
      }


      localStorage.setItem('registeredEmail', userEmail);
      localStorage.setItem('registeredPw', userPass);

      alert("회원가입 완료! 이제 가입하신 정보로 로그인해 보세요.");

      if (signupPage) {
        signupPage.classList.remove('active');
      }
    });
  }


  const mainLoginBtn = document.querySelector('.main-login-btn');

  if (mainLoginBtn) {
    mainLoginBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('user-email');
      const pwInput = document.getElementById('user-pw');

      if (!emailInput || !pwInput) return;

      const email = emailInput.value.trim();
      const password = pwInput.value.trim();

      if (!email || !password) {
        alert("이메일과 비밀번호를 모두 입력해 주세요.");
        return;
      }

      try {

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log("유료의 진단: 서버 인증 성공! UID:", user.uid);

        isLoggedIn = true;


        const gate = document.getElementById('app-gatekeeper');
        if (gate) {
          gate.style.display = 'none'; // 혹은 gate.remove();
        }


        const loginScreen = document.querySelector('.login-screen');
        if (loginScreen) {
          loginScreen.classList.remove('active');
        }

        alert("로그인에 성공했습니다! 걷다 앱에 오신 것을 환영합니다.");

        handleLoginSuccess(user.email);

      } catch (error) {

        console.error("로그인 에러:", error.message);
        alert("이메일 또는 비밀번호가 일치하지 않거나 가입된 정보가 없습니다.");
      }
      function handleLoginSuccess(email) {

        const loginPage = document.querySelector('.login-screen'); // .
        const welcomePage = document.getElementById('welcome-screen');

        if (loginPage && welcomePage) {
          loginPage.classList.remove('active');
          welcomePage.classList.add('active');


          const userName = email.split('@')[0];
          const userDisplay = document.getElementById('welcome-user-name');
          if (userDisplay) userDisplay.textContent = `반가워요, ${userName}님!`;


          setTimeout(() => {
            welcomePage.classList.remove('active');
            proceedToMain(email);
          }, 2000);
        }
      }
    });
  }


// 앱 실행 시 가장 먼저 실행될 초기화 함수
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // 1. 저장된 모든 데이터 불러오기
    const savedAppData = localStorage.getItem('walk_app_data');
    
    if (savedAppData) {
        const appData = JSON.parse(savedAppData);
        
        // 2. 로그인 상태 복원
        if (appData.user) {
            restoreLoginState(appData.user);
        }
        
        // 3. 카테고리/태스크 기록 복원
        if (appData.categories) {
            renderCategories(appData.categories);
        }
        
        // 4. 억만이지갑 데이터 복원
        if (appData.wallet) {
            document.getElementById('target-amount-display').value = appData.wallet.target;
            document.getElementById('available-amount-display').innerText = appData.wallet.available;
            updateProgressBar(); 
        }
    }
}

// 데이터를 통합 저장하는 함수 (수정 발생 시마다 호출)
function syncAppData() {
    const appData = {
        user: getCurrentUserStatus(),      // 로그인 정보
        categories: getAllCategories(),     // 쇼핑, 업무 등 카테고리 리스트
        wallet: {                           // 억만이지갑 정보
            target: document.getElementById('target-amount-display').value,
            available: document.getElementById('available-amount-display').innerText
        },
        lastUpdated: new Date().getTime()
    };
    
    localStorage.setItem('walk_app_data', JSON.stringify(appData));
}
  document.querySelector('.main-signup-btn')?.addEventListener('click', (e) => {
    e.preventDefault();

    const signupEmailInput = document.getElementById('signup-email');
    const signupPwInput = document.getElementById('signup-pw');


    const requiredChecks = document.querySelectorAll('.agree-required');
    const allRequiredChecked = Array.from(requiredChecks).every(input => input.checked);

    const email = signupEmailInput ? signupEmailInput.value.trim() : "";
    const pw = signupPwInput ? signupPwInput.value.trim() : "";


    if (!email || !pw) {
      alert("이메일과 비밀번호를 모두 입력해 주세요!");
      return;
    }

    if (!allRequiredChecked) {
      alert("필수 약관에 모두 동의하셔야 가입이 가능합니다.");
      return;
    }

    localStorage.setItem('registeredEmail', email);
    localStorage.setItem('registeredPw', pw);
    localStorage.setItem('isLoggedIn', 'false');

    alert("회원가입 완료! 이제 가입하신 정보로 로그인해 보세요.");

    const signupScreen = document.querySelector('.signup-screen');
    if (signupScreen) {
      signupScreen.classList.remove('active');
    }

    if (signupEmailInput) signupEmailInput.value = "";
    if (signupPwInput) signupPwInput.value = "";

    console.log("유료의 진단: 가입 데이터가 성공적으로 로컬 스토리지에 안착했습니다.");
  });


  const policyScreen = document.querySelector('.policy-screen');


  const policyContent = {
    terms: `[서비스 이용약관]
제1조 (목적)
본 약관은 '록명'이 제공하는 앱 서비스(이하 '서비스')의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
... (생략)`,

    privacy: `[개인정보 처리방침]
1. 수집하는 개인정보 항목
- 필수항목: 이메일 주소, 비밀번호, 서비스 이용 기록
... (생략)`,

    marketing: `[광고성 정보 수신 동의]
1. 목적: 신규 기능 업데이트, 유료 버전 출시 알림 등
... (생략)`
  };

  function openPolicy(type) {
    const modal = document.getElementById('policy-modal');
    const title = document.getElementById('policy-title');
    const content = document.getElementById('policy-content');

    if (!modal || !title || !content) return;


    const titles = {
      terms: '서비스 이용약관',
      privacy: '개인정보 처리방침',
      marketing: '광고성 정보 수신 동의'
    };

    title.innerText = titles[type] || '약관';

    // 참조 변수 수정: policies -> policyContent
    content.innerText = policyContent[type] || '내용을 찾을 수 없습니다.';

    modal.classList.add('active');
  }


  document.querySelectorAll('.policy-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const type = e.target.dataset.type;
      openPolicy(type);
    });
  });



  document.querySelectorAll('.policy-trigger').forEach(trigger => {
    trigger.addEventListener('click', function () {
      const type = this.getAttribute('data-type'); // terms, privacy, marketing 중 하나
      const modal = document.querySelector('#policy-modal');
      const titleElement = document.querySelector('#policy-detail-title');
      const contentElement = document.querySelector('#policy-text-content');

      if (type === 'terms') titleElement.innerText = "서비스 이용약관";
      else if (type === 'privacy') titleElement.innerText = "개인정보 처리방침";
      else if (type === 'marketing') titleElement.innerText = "마케팅 수신 동의";

      contentElement.innerText = policyContent[type];

      modal.classList.add('active');
    });
  });


  const closeElements = document.querySelectorAll('.close-modal, .back-btn-policy, .modal-confirm-btn');
  const policyModal = document.getElementById('policy-modal');


  function closePolicyModal() {
    if (policyModal) {
      policyModal.classList.remove('active');
      console.log("유료의 진단: 약관 모달이 안전하게 닫혔습니다.");
    }
  }


  closeElements.forEach(el => {
    el.addEventListener('click', closePolicyModal);
  });


  window.addEventListener('click', (e) => {
    if (e.target === policyModal) {
      closePolicyModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && policyModal.classList.contains('active')) {
      closePolicyModal();
    }
  });




  const goToSignup = document.querySelector('.signup-link-btn');
  const signupScreen = document.querySelector('.signup-screen');


  if (goToSignup && signupScreen) {
    goToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      signupScreen.classList.add('active');
      console.log("유료의 진단: 회원가입 화면으로 이동합니다.");
    });
  }


  const backFromSignup = document.querySelector('.back-btn-signup');
  if (backFromSignup && signupScreen) {
    backFromSignup.addEventListener('click', () => {
      signupScreen.classList.remove('active');
    });
  }

  const realRegisterBtn = document.querySelector('.main-signup-btn');
  if (realRegisterBtn) {
    realRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();


      const emailInput = document.getElementById('signup-email');
      const passInput = document.getElementById('signup-pw');

      if (!emailInput || !passInput) return;

      const email = emailInput.value.trim();
      const pass = passInput.value.trim();

      if (!email || !pass) {
        alert("정보를 모두 입력해 주세요!");
        return;
      }


      localStorage.setItem('registeredEmail', email);
      localStorage.setItem('registeredPw', pass);
      localStorage.setItem('isLoggedIn', 'false');

      alert("가입 성공! 이제 가입하신 정보로 로그인해 보세요.");

      if (signupScreen) {
        signupScreen.classList.remove('active');
      }


      emailInput.value = "";
      passInput.value = "";
    });
  }



  const socialLogins = {
    google: document.querySelector('.social-btn.google'),
    kakao: document.querySelector('.social-btn.kakao')
  };


  const goToSignupBtn = document.querySelector('.signup-link-btn');
  const backBtnSignup = document.querySelector('.back-btn-signup');
  const mainSignupBtn = document.querySelector('.main-signup-btn');

  if (goToSignupBtn && signupScreen) {
    goToSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signupScreen.classList.add('active');
    });
  }


  if (backBtnSignup && signupScreen) {
    backBtnSignup.addEventListener('click', () => {
      signupScreen.classList.remove('active');
    });
  }


  // 오직 이 블록 하나만 script.js에 존재해야 합니다!
  if (mainSignupBtn) {
    mainSignupBtn.onclick = async (e) => {
      e.preventDefault();

      const email = document.getElementById('signup-email')?.value.trim();
      const password = document.getElementById('signup-pw')?.value.trim();

      if (!email || !password) {
        alert("이메일과 비밀번호를 모두 입력해 주세요!"); // 이제 여기서 딱 한 번만 뜹니다.
        return;
      }

      try {
        mainSignupBtn.disabled = true;
        mainSignupBtn.innerText = "처리 중...";

        // Firebase 가입 로직 (생략)
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        alert("회원가입 완료! 이제 로그인해 주세요.");
        // 화면 전환 로직...

      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          alert("이미 가입된 이메일입니다. 로그인해 주세요.");
        } else {
          alert("가입 실패: " + error.message);
        }
      } finally {
        mainSignupBtn.disabled = false;
        mainSignupBtn.innerText = "회원가입 완료";
      }
    };
  }
  // 소셜 로그인 처리 예시 (Google 기준)
  function handleSocialLogin(providerName) {
    const provider = new firebase.auth.GoogleAuthProvider(); // 구글 기준
    firebase.auth().signInWithPopup(provider).then((result) => {
      // 소셜 로그인 성공 시 핵심 포인트!
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginMethod', 'social'); // 소셜임을 기록

      handleLoginSuccess(result.user.email);
    }).catch((error) => {
      console.error("소셜 로그인 에러:", error);
    });
  }

  if (socialLogins.google) socialLogins.google.addEventListener('click', () => handleSocialLogin('Google'));
  if (socialLogins.kakao) socialLogins.kakao.addEventListener('click', () => handleSocialLogin('Kakao'));
  if (socialLogins.naver) socialLogins.naver.addEventListener('click', () => handleSocialLogin('Naver'));


  function handleBackToMain() {
    if (!isLoggedIn) {

      alert("로그인이 완료되어야 서비스를 이용하실 수 있습니다.");
      showGatekeeper();
    } else {

      closeLoginScreen();
    }
  }
  const policyLink = document.querySelector('.policy-link');

  if (goToSignup && signupScreen) {
    goToSignup.addEventListener('click', () => {
      signupScreen.classList.add('active');
    });
  }
  if (policyLink && policyScreen) {
    policyLink.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      policyScreen.classList.add('active');
    });
  }
  document.querySelectorAll('.back-btn-signup, .back-btn-policy').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.screen').classList.remove('active');
    });
  });


  const agreeAll = document.getElementById('agree-all');
  const individualChecks = document.querySelectorAll('.agreement-item input[type="checkbox"]:not(#agree-all)');

  if (agreeAll) {

    agreeAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      individualChecks.forEach(check => {
        check.checked = isChecked;
      });
      console.log(`전체 동의 상태: ${isChecked}`);
    });


    individualChecks.forEach(check => {
      check.addEventListener('change', () => {

        const allChecked = Array.from(individualChecks).every(c => c.checked);
        agreeAll.checked = allChecked;
      });
    });
  }


  function toggleSignupButton() {

    const requiredChecks = document.querySelectorAll('.agreement-item input[type="checkbox"].required');
    const allRequiredChecked = Array.from(requiredChecks).every(c => c.checked);

    if (mainSignupBtn) {
      mainSignupBtn.disabled = !allRequiredChecked;
      mainSignupBtn.style.opacity = allRequiredChecked ? "1" : "0.5";
      mainSignupBtn.style.cursor = allRequiredChecked ? "pointer" : "not-allowed";
    }
  }


  agreeAll.addEventListener('change', (e) => {

    toggleSignupButton();
  });

  individualChecks.forEach(check => {
    check.addEventListener('change', () => {

      toggleSignupButton();
    });
  });

  const loginScreen = document.querySelector('.login-screen');
  const backBtn = document.querySelector('.back-btn-login');

  if (backBtnLogin) {
    backBtnLogin.addEventListener('click', () => {
      loginScreen.classList.remove('active');
    });
  }
}


const loggedOutView = document.getElementById('logged-out-view');
const loggedInView = document.getElementById('logged-in-view');
const userEmailDisplay = document.querySelector('.user-email-display');


function handleLoginSuccess(email) {
  if (!loggedOutView || !loggedInView) return;


  loggedOutView.style.display = 'none';
  loggedInView.style.display = 'block';

  if (userEmailDisplay) {
    userEmailDisplay.textContent = `${email}님 환영합니다!`;
  }


  const loginScreen = document.querySelector('.login-screen');
  if (loginScreen) loginScreen.classList.remove('active');

  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userEmail', email);

  console.log("유료의 진단: 세션이 성공적으로 시작되었습니다.", email);


  if (typeof renderCategories === 'function') renderCategories();
}

document.querySelector('.social-btn.google')?.addEventListener('click', () => {
  handleLoginSuccess("google_user@gmail.com");
});

document.querySelector('.social-btn.kakao')?.addEventListener('click', () => {
  handleLoginSuccess("kakao_user@kakao.com");
});

document.querySelector('.login-submit-btn')?.addEventListener('click', () => {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  if (emailInput.value && passwordInput.value) {
    handleLoginSuccess(emailInput.value);
  } else {
    alert("이메일과 비밀번호를 모두 입력해 주세요.");
  }
});

document.querySelector('.main-signup-btn')?.addEventListener('click', async (e) => {
  e.preventDefault();

  const signupScreen = document.querySelector('.signup-screen');
  const loginScreen = document.querySelector('.login-screen');

  const email = document.getElementById('signup-email')?.value.trim();
  const password = document.getElementById('signup-pw')?.value.trim();

  if (!email || !password) {
    alert("이메일과 비밀번호를 모두 입력해 주세요!");
    return;
  }

  try {

    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;


    await db.collection("users").doc(user.uid).set({
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isPremium: false
    });

    alert("가입 완료! 이제 로그인해 보세요.");

    if (signupScreen && loginScreen) {
      signupScreen.classList.remove('active'); // 회원가입 창 끄기
      loginScreen.classList.add('active');
      console.log("유료의 진단: 페이지 이동 성공!");
    } else {
      console.error("유료의 진단: 화면 요소를 찾을 수 없어 이동에 실패했습니다.");
    }

  } catch (error) {
    console.error("가입 에러:", error.message);
    alert("가입 실패: " + error.message);
  }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');

  localStorage.removeItem('userProfile');

  location.reload();
});


window.addEventListener('DOMContentLoaded', () => {
  const savedStatus = localStorage.getItem('isLoggedIn');
  const savedEmail = localStorage.getItem('userEmail');

  if (savedStatus === 'true' && savedEmail) {
    handleLoginSuccess(savedEmail);
  }
});
// 1. 모달을 여는 함수가 전역(Global)에 있는지 확인
window.openFinanceModal = function() {
    const modal = document.getElementById('finance-modal');
    if (modal) {
        modal.style.display = 'flex'; // 'none'에서 'flex'로 변경하여 노출
        if (typeof updateUI === "function") updateUI(); 
    } else {
        console.error("ID가 'finance-modal'인 요소를 찾을 수 없습니다.");
    }
};

// 2. 모달을 닫는 함수
window.closeFinanceModal = function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
};

const renderCategories = () => {
  categoriesContainer.innerHTML = "";
  categories.forEach((category, index) => {
    const categoryTasks = tasks.filter(t => t.category === category.title);

    const div = document.createElement("div");
    div.classList.add("category");
    Object.assign(div.style, {
      position: "relative",
      backgroundColor: "#fff",
      borderRadius: "20px",
      marginBottom: "15px",
      padding: "1.5rem 1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      border: "1px solid transparent",
      backgroundImage: "linear-gradient(175deg, #fff, #fff), linear-gradient(175deg, #fff, #fff)", 
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box, border-box",
      boxShadow: "0px 0px 0px rgba(5, 38, 89, 0.8)" // 0px 수정됨
    });
    div.style.position = "relative";
    div.style.overflow = "hidden";
    div.style.borderRadius = "20px";
    div.style.marginBottom = "15px";

   
div.addEventListener("click", (e) => {
  console.log("클릭된 카테고리:", category.title);    
    
      if (category.title === "금융") {
        if (typeof openFinanceModal === "function") {
          openFinanceModal(); 
        } else {
          console.error("openFinanceModal 함수가 정의되지 않았습니다.");
        }
        return; 
      }

      
      selectedCategory = category;
      if (categorySelect) categorySelect.value = category.title;
      screenWrapper.classList.add("show-category");
      renderTasks();
    });

    div.innerHTML = `
      <div class="left" style="position: relative; z-index: 4; display: flex; align-items: center;">
        <div style="width: 30px; height: 30px; border-radius: 20px; color: #; box-sizing:border-box; padding: 1px !important; margin-right: 15px; box-shadow: 0 10px 10px #052659; display: flex; align-items: center; justify-content: center; background: #f0f4f8;">
          ${category.icon}
        </div>
        <div class="content">
          <h1 style="font-size: 1rem; font-weight: 800; color: #052659; margin: 0;">${category.title}</h1>
          <p style="color: #052659; font-weight: 600; font-size: 0.85rem; margin: 0; opacity: 0.7;">${categoryTasks.length} Tasks</p>
        </div>
      </div>
      <div class="right-icon" style="position: relative; z-index: 4; padding-right: 20px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#052659" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; opacity: 0.5;">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    `;

    categoriesContainer.appendChild(div);
  });
  updateTotals();
};

const renderTasks = () => {
  tasksContainer.innerHTML = "";

  const categoryTasks = tasks.filter(t => t.category === selectedCategory.title);

  categoryTitle.innerHTML = selectedCategory.title;
  categoryImg.innerHTML = selectedCategory.icon;
  categoryImg.style.color = "white";

  if (categoryTasks.length === 0) {
    tasksContainer.innerHTML = `<p class="no-tasks">이 카테고리에 일정이 없습니다.</p>`;
  } else {
    categoryTasks.forEach((task) => {
      const div = document.createElement("div");
      div.classList.add("task-wrapper");
      div.innerHTML = `
        <label class="task" for="task-${task.id}">
          <input type="checkbox" id="task-${task.id}" ${task.completed ? "checked" : ""}>
          <span class="check-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
          <p>${task.task}</p>
        </label>
        <div class="delete" onclick="deleteTask(${task.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </div>
      `;

      const checkbox = div.querySelector("input");
      checkbox.addEventListener("change", () => {
        const index = tasks.findIndex(t => t.id === task.id);
        tasks[index].completed = checkbox.checked;
        saveLocal();
        updateTotals();
        renderCategories();
      });
      tasksContainer.appendChild(div);
    });
  }
  updateTotals();
};

const updateTotals = () => {
  const categoryTasks = tasks.filter(t => t.category === selectedCategory.title);
  const numDisplay = document.getElementById("num-tasks");

  if (numTasks) numTasks.innerHTML = `${categoryTasks.length} Tasks`;


  const totalDisplay = document.getElementById("total-tasks");
  if (totalDisplay) {
    totalDisplay.innerHTML = tasks.length;
  }
};


const addTask = (e) => {
  e.preventDefault();
  if (taskInput.value === "") return alert("내용을 입력하세요!");
  renderCategories(); // 숫자를 새로 그려주고
  updateGrowthDashboard(true);
  setTimeout(() => {
    updateGrowthDashboard(true); // 추가 시 true, 삭제 시 false
  }, 50);

  const newTask = {
    id: Date.now(),
    task: taskInput.value,
    category: selectedCategory.title,
    completed: false
  };

  tasks.push(newTask);
  saveLocal();
  taskInput.value = "";
  addTaskWrapper.classList.remove("active");
  blackBackdrop.classList.remove("active");
  renderTasks();
  renderCategories();
};




window.deleteTask = (id) => {
  tasks = tasks.filter(t => t.id !== id);
  saveLocal();
  renderTasks();
  renderCategories();
  updateGrowthDashboard(false);
};


function updateClock() {
  try {
    const kst = new Date();
    const seconds = kst.getSeconds();


    if (seconds === 0 || !window.dateInitialized) {
      const week = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const dayEl = document.querySelector('.day-text');
      const dateEl = document.querySelector('.date-text');

      if (dayEl) dayEl.innerText = week[kst.getDay()];
      if (dateEl) dateEl.innerText = `${kst.getMonth() + 1}월 ${kst.getDate()}일`;
      window.dateInitialized = true;
    }


    const secHand = document.querySelector('.second-hand');
    const minHand = document.querySelector('.minute-hand');
    const hrHand = document.querySelector('.hour-hand');

    if (secHand) secHand.style.transform = `translateX(-50%) rotate(${(seconds / 60) * 360}deg)`;
    if (minHand) minHand.style.transform = `translateX(-50%) rotate(${(kst.getMinutes() / 60) * 360 + (seconds / 60) * 6}deg)`;
    if (hrHand) hrHand.style.transform = `translateX(-50%) rotate(${(kst.getHours() % 12 / 12) * 360 + (kst.getMinutes() / 60) * 30}deg)`;



  } catch (e) {
    console.error("시계 업데이트 중 오류 발생:", e);

  }
}

if (window.clockTimer) clearInterval(window.clockTimer);
window.clockTimer = setInterval(updateClock, 1000);
updateClock();

if (window.clockTimer) clearInterval(window.clockTimer);
window.clockTimer = setInterval(updateClock, 1000);
updateClock();
setInterval(updateClock, 1000);

updateClock(); addTaskBtn.addEventListener("click", () => {
  if (categorySelect) {
    categorySelect.value = selectedCategory.title;
  }
  addTaskWrapper.classList.add("active");
  blackBackdrop.classList.add("active");
});
blackBackdrop.addEventListener("click", () => {
  addTaskWrapper.classList.remove("active");
  blackBackdrop.classList.remove("active");
});
addBtn.addEventListener("click", addTask);
backBtn.addEventListener("click", () => screenWrapper.classList.remove("show-category"));

cancelBtn.addEventListener("click", () => {

  taskInput.value = "";

  addTaskWrapper.classList.remove("active");

  blackBackdrop.classList.remove("active");

  addTaskBtn.classList.remove("active");
});

const mobileTaskInput = document.querySelector('#task-input');
const mobileAddTaskWrapper = document.querySelector('.add-task');

console.log("변수 선언 확인:", mobileTaskInput);


if (mobileTaskInput && mobileAddTaskWrapper) {
  mobileTaskInput.addEventListener('focus', () => {

    document.body.classList.add('keyboard-open');
    mobileAddTaskWrapper.classList.add('keyboard-active');
    console.log("유료의 진단: 안전한 변수로 키보드 모드 실행!");
  });

  mobileTaskInput.addEventListener('blur', () => {
    // 원래 위치로 복구
    document.body.classList.remove('keyboard-open');
    mobileAddTaskWrapper.classList.remove('keyboard-active');
  });
}


if (typeof registerPaint !== 'undefined') {
  registerPaint('specklePattern', SpecklePattern);
}

const handleLogin = async () => {
  if (!email || !password) {
    alert("이메일과 비밀번호를 모두 입력해주세요.");
    return;
  }

  setLoading(true);

  try {
    const response = await loginApi(email, password);
    if (response.success) {

      navigation.replace('MainHome');
    } else {

      alert("이메일 또는 비밀번호가 일치하지 않습니다.");
    }
  } catch (error) {
    alert("네트워크 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};


let isLoggedIn = false;

function handleAuth() {
  const authBtn = document.getElementById('.auth-button');

  if (!isLoggedIn) {

    window.location.href = 'login.html';

    alert("로그인 페이지로 연결합니다.");
    isLoggedIn = true;
    authBtn.innerText = "로그아웃";
    authBtn.style.backgroundColor = "#ff4d4d";
  } else {

    if (confirm("로그아웃 하시겠습니까?")) {
      isLoggedIn = false;
      authBtn.innerText = "로그인";
      authBtn.style.backgroundColor = "#fff";
    }
  }
}
const policyDataStore = {
  terms: `[서비스 이용약관]\n\n제1조 (목적)\n본 약관은 '걷다' 서비스 이용과 관련하여...\n제5조 (데이터 보관)\n사용자의 할 일 목록은 안전하게 보관됩니다.`,
  privacy: `[개인정보 처리방침]\n\n1. 수집 항목: 이메일, 비밀번호\n2. 수집 목적: 회원 식별 및 서비스 제공\n3. 보유 기간: 회원 탈퇴 시 즉시 삭제`
};

function openPolicyModal(type) {

  const modal = document.getElementById('policy-detail-overlay') || document.getElementById('policy-modal');
  const title = document.getElementById('policy-detail-title') || document.getElementById('policy-title');
  const content = document.getElementById('policy-text-content') || document.getElementById('policy-content');

  if (modal && title && content) {
    title.innerText = type === 'terms' ? '서비스 이용약관' : '개인정보 처리방침';
    content.innerText = policyDataStore[type];
    modal.classList.add('active');
    console.log(`유료의 진단: ${title.innerText} 열람 중...`);
  } else {
    console.error("유료의 진단: 약관 HTML 요소를 찾을 수 없습니다. ID를 확인해 보세요!");
  }
}


document.addEventListener('click', (e) => {

  const trigger = e.target.closest('.policy-trigger, .policy-link, .terms-link');

  if (trigger) {
    e.preventDefault();

    let type = trigger.dataset.type;
    if (!type) {
      type = trigger.classList.contains('terms-link') ? 'terms' : 'privacy';
    }
    openPolicyModal(type);
  }
});


document.addEventListener('click', (e) => {
  const backBtn = e.target.closest('.back-btn-policy');
  if (backBtn) {
    const screen = backBtn.closest('.screen');
    if (screen) screen.classList.remove('active');
    const signupScreen = document.querySelector('.signup-screen');
    if (signupScreen) {
      signupScreen.classList.remove('active');
      console.log("유료의 진단: 약관 확인 완료! 로그인 화면으로 즉시 복귀합니다.");
    }
  }
});
function goToLogin() {

  const loginBtn = document.querySelector('.user-profile-btn');
  if (loginBtn) loginBtn.click();
}


function onLoginSuccess() {
  const gate = document.getElementById('app-gatekeeper');
  if (gate) gate.classList.add('hidden'); // 보호막 제거
  console.log("유료의 진단: 잠금이 해제되었습니다.");
}
function goToLogin() {
  const gate = document.getElementById('app-gatekeeper');
  const loginScreen = document.querySelector('.login-screen');

  if (gate && loginScreen) {

    gate.style.display = 'none';


    loginScreen.classList.add('active');

    console.log("유료의 진단: 로그인 페이지로 안내합니다.");
  } else {
    alert("로그인 화면을 찾을 수 없습니다. 클래스명을 확인해 주세요!");
  }
}


function finishLogin() {
  const loginScreen = document.querySelector('.login-screen');


  isLoggedIn = true;


  if (loginScreen) loginScreen.classList.remove('active');


  updateLoginButton();

  alert("환영합니다! 이제 '걷다'의 모든 기능을 사용하실 수 있습니다.");
}


window.addEventListener('load', () => {

  const loginScreen = document.querySelector('.login-screen');
  const signupScreen = document.querySelector('.signup-screen');
  const mainScreen = document.querySelector('.main-screen');



  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
      console.log("유료의 진단: 기존 코드에 로그인 유지 기능만 주입했습니다.");
    })
    .catch((error) => {
      console.error("유지 설정 에러:", error);
    });


  auth.onAuthStateChanged((user) => {
    const profileBtn = document.getElementById('user-profile-btn');
    if (user) {

      profileBtn.style.display = 'flex';

      if (user.photoURL) {
        profileBtn.innerHTML = `<img src="${user.photoURL}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%;">`;
      } else {

        profileBtn.innerHTML = '<div class="profile-img">👤</div>';
      }
    } else {

      profileBtn.style.display = 'none';

    }

    try {
      if (user) {

        console.log("유료의 진단: 로그인 상태 확인 - 메인으로 이동합니다.", user.email);

        if (loginScreen) loginScreen.classList.remove('active');
        if (signupScreen) signupScreen.classList.remove('active');
        if (mainScreen) mainScreen.classList.add('active');


        if (typeof renderCategories === 'function') {
          renderCategories();
        }
      } else {

        console.log("유료의 진단: 로그아웃 상태 - 로그인 창을 엽니다.");

        if (mainScreen) mainScreen.classList.remove('active');
        if (loginScreen) loginScreen.classList.add('active');
        if (signupScreen) signupScreen.classList.remove('active');
      }


    } catch (error) {
      console.error("유료의 진단: 화면 전환 중 에러 발생:", error);
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const gatekeeper = document.getElementById('app-gatekeeper');


  if (gatekeeper) gatekeeper.style.display = 'none';

  firebase.auth().onAuthStateChanged((user) => {

    if (user || localStorage.getItem('isLoggedIn') === 'true') {
      console.log("유료의 진단: 소셜/이메일 인증 통과!");
      if (gatekeeper) gatekeeper.style.display = 'none';
    } else {

      if (gatekeeper) gatekeeper.style.display = 'flex';
    }
  });
});




// 1. 기준점은 추가될 때만 갱신 (전역 변수)
let lastMaxCount = localStorage.getItem('lastMaxCount') ? parseInt(localStorage.getItem('lastMaxCount')) : 0;

function updateGrowthDashboard(isAdding = false) {
  // 2. [강력 보강] 8개 카테고리의 모든 임무를 데이터 배열에서 직접 추출
  // 록명님의 전체 임무 배열 이름이 'tasks'라고 가정합니다.
  if (!tasks || !Array.isArray(tasks)) return;

  // 현재 모든 카테고리에 들어있는 '살아있는' 임무의 총 개수
  const currentTotalSum = tasks.length;

  // 3. [기민한 기준점 설정]
  // 추가 버튼을 눌렀거나, 현재 총합이 기존 기준보다 크면 100% 기준 갱신
  if (isAdding || currentTotalSum > lastMaxCount) {
    lastMaxCount = currentTotalSum;
    localStorage.setItem('lastMaxCount', lastMaxCount);
  }

  // 4. [정교한 퍼센트 계산]
  let percent = 0;
  if (lastMaxCount > 0 && currentTotalSum > 0) {
    percent = (currentTotalSum / lastMaxCount) * 100;
    if (percent > 100) percent = 100;
  } else if (currentTotalSum === 0) {
    // 모든 카테고리 임무를 다 거둬내면 리셋
    percent = 0;
    lastMaxCount = 0;
    localStorage.removeItem('lastMaxCount');
  }
  // 해당 요소를 클래스나 ID로 찾아서 텍스트를 변경합니다.
  const weeklyTitle = document.querySelector('.weekly-card .card-title'); // 선택자는 록명님의 코드에 맞춰주세요.
  if (weeklyTitle) {
    weeklyTitle.innerText = 'DAILY';
  }
  // 5. [UI 즉시 반영]
  const weeklyFill = document.querySelector('.ripple-fill');
  const weeklyText = document.getElementById('weekly-percent-text');

  if (weeklyFill) {
    weeklyFill.style.height = `${percent}%`;
    // 유리판 아래에서 물이 차오르는 부드러운 효과
    weeklyFill.style.transition = "height 0.5s ease-in-out";
  }
  if (weeklyText) {
    weeklyText.innerText = `${Math.round(percent)}%`;
  }

  console.log(`🚀 [전수조사 완료] 현재 총합: ${currentTotalSum} / 기준: ${lastMaxCount} -> ${Math.round(percent)}%`);
}

// 전체 앱 상태 관리 객체
let appState = {
    plans: [
        { id: 1, name: '점심 식대', amount: 10000, spent: false },
        { id: 2, name: '커피/디저트', amount: 5000, spent: false },
        { id: 3, name: '저녁 장보기', amount: 30000, spent: false }
    ],
    gearsCollected: 0 // 모은 톱니바퀴 개수
};

function updateMainWallet() {
    // 1. 목표금액(Target): 전체 계획된 금액의 합산
    const targetAmount = appState.plans.reduce((sum, plan) => sum + plan.amount, 0);
    
    // 2. 가용금액(Available): 아직 소비하지 않은(spent: false) 계획들의 합산
    const availableAmount = appState.plans
        .filter(plan => !plan.spent)
        .reduce((sum, plan) => sum + plan.amount, 0);

    // 3. UI 업데이트 (콤마 처리 포함)
    document.getElementById('target-amount-display').innerText = targetAmount.toLocaleString();
    document.getElementById('available-amount-display').innerText = availableAmount.toLocaleString();

    // 4. 프로그레스 바 업데이트 (가용/목표 비율)
    const progressPercent = targetAmount > 0 ? (availableAmount / targetAmount) * 100 : 0;
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progressPercent}%`;

    // 5. 경고 색상 로직 (2/3 지점 미만일 때 레드)
    if (progressPercent < 66) {
        progressBar.classList.add('warning-zone');
        progressBar.classList.remove('safe-zone');
    } else {
        progressBar.classList.add('safe-zone');
        progressBar.classList.remove('warning-zone');
    }
}

let myPlans = JSON.parse(localStorage.getItem('myPlans')) || [];

function addNewPlan() {
    const name = document.getElementById('plan-name').value;
    const amount = parseInt(document.getElementById('plan-amount').value);

    if (name && amount) {
        myPlans.push({ id: Date.now(), name, amount, spent: false });
        document.getElementById('plan-name').value = '';
        document.getElementById('plan-amount').value = '';
        updateUI();
    }
}

function consumePlan(id) {
    // 계획을 삭제하는 것이 아니라 '소비됨' 상태로 변경하여 가용금액만 줄임
    myPlans = myPlans.map(p => p.id === id ? { ...p, spent: true } : p);
    updateUI();
}

function updateUI() {
    const listUI = document.getElementById('plan-list-ui');
    listUI.innerHTML = '';

    // 1. 목표: 전체 계획 합계 / 가용: 아직 안 쓴 계획 합계
    const target = myPlans.reduce((sum, p) => sum + p.amount, 0);
    const available = myPlans.filter(p => !p.spent).reduce((sum, p) => sum + p.amount, 0);

    // 2. 리스트 그리기
    myPlans.forEach(p => {
        const li = document.createElement('li');
        li.className = `plan-item ${p.spent ? 'spent' : ''}`;
        li.innerHTML = `
            <span>${p.name}</span>
            <span>${p.amount.toLocaleString()} ₩</span>
            ${!p.spent ? `<button onclick="consumePlan(${p.id})">소비</button>` : ''}
        `;
        listUI.appendChild(li);
    });

    // 3. 메인 지갑 숫자 업데이트
    document.getElementById('target-amount-display').innerText = target.toLocaleString();
    document.getElementById('available-amount-display').innerText = available.toLocaleString();

    // 4. ⭐ 실시간 바 업데이트
    const bar = document.getElementById('progress-bar');
    const ratio = target > 0 ? (available / target) * 100 : 0;
    bar.style.width = ratio + '%';

    // 5. 66% 미만 시 경고 색상
    if (ratio < 66) {
        bar.style.backgroundColor = '#ff4d4d'; // 경고 레드
    } else {
        bar.style.backgroundColor = '#4facfe'; // 안전 블루
    }

    localStorage.setItem('myPlans', JSON.stringify(myPlans));
}

// 1. 전역 함수로 강제 등록 (어디서든 호출 가능하게)
window.openFinanceModal = function() {
    const modal = document.getElementById('finance-modal');
    if (modal) {
        modal.style.display = 'flex';
        // 모달이 열릴 때 최신 데이터로 업데이트 함수 호출
        if (typeof updateUI === "function") updateUI(); 
    }
};

window.closeFinanceModal = function(e) {
    if (e.target.id === 'finance-modal') {
        document.getElementById('finance-modal').style.display = 'none';
    }
};

// 2. 메인 화면 금액 수정UI 제거 (JS로 제어)
const disableMainEditUI = () => {
    // ₩ 옆의 화살표 아이콘이나 버튼을 숨김
    const arrowIcon = document.querySelector('.wallet-card .fa-chevron-down'); // 아이콘 클래스명 확인 필요
    if (arrowIcon) arrowIcon.style.display = 'none';
    
    // 금액 표시 부분의 클릭 이벤트 제거 및 커서 변경
    const displayAmount = document.getElementById('target-amount-display');
    if (displayAmount) {
        displayAmount.style.pointerEvents = 'none'; // 클릭 방지
        displayAmount.style.cursor = 'default';
    }
};

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', disableMainEditUI);













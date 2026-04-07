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


let tasks = JSON.parse(localStorage.getItem('allCategoryTasks')) || [];

function saveTasks() {
  localStorage.setItem('allCategoryTasks', JSON.stringify(tasks));
  console.log("데이터가 금고에 저장되었습니다:", tasks.length, "건");
}

const INITIAL_CATEGORIES = [
  { title: "오늘일정", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
  { title: "업무", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
  { title: "쇼핑", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>` },
  { title: "자기계발", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11l-5-5-5 5M17 18l-5-5-5 5"/></svg>` },
  { title: "건강", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
  { title: "운동", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="19" r="3"/><line x1="9" y1="16" x2="15" y2="8"/></svg>` },
  { title: "교육", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
  { title: "금융", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` }
];

const savedCategories = localStorage.getItem('daynize_categories');

let categories = savedCategories ? JSON.parse(savedCategories) : INITIAL_CATEGORIES;

let selectedCategory = categories[0];

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



// 1. 인증 상태 감시자 (데이터 휘발 방지 방패)
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("🌊 유료의 진단: 사용자 인증 완료, 데이터를 안전하게 동기화합니다.");
    await getLocal(); 
  } else {
    const tasksLocal = JSON.parse(localStorage.getItem("daynize_tasks"));
    if (tasksLocal) {
        tasks = tasksLocal;
        renderTasks();
    }
  }
});

// 2. 데이터 불러오기 (Load)
const getLocal = async () => {
  const user = auth.currentUser;
  const tasksLocal = JSON.parse(localStorage.getItem("daynize_tasks"));
  if (tasksLocal) { tasks = tasksLocal; }

  if (user) {
    try {
      const doc = await db.collection("users").doc(user.uid).collection("tasks").doc("todoList").get();
      if (doc.exists) {
        const serverItems = doc.data().items || [];
        // 서버 데이터가 더 많을 때만 동기화하여 휘발 방지
        if (serverItems.length >= tasks.length) {
          tasks = serverItems;
          localStorage.setItem('daynize_tasks', JSON.stringify(tasks));
        }
      }
    } catch (err) {
      console.error("서버 로드 실패:", err);
    }
  }

  renderCategories();
  renderTasks(); 
  if (typeof updateGrowthDashboard === 'function') updateGrowthDashboard();
};

// 3. 데이터 저장하기 (Save - 버튼 클릭 시 실행)
const saveLocal = async () => {
  const taskInput = document.getElementById("task-input");
  
  // 새로운 할 일이 입력되었다면 tasks 배열에 추가
  if (taskInput && taskInput.value.trim() !== "") {
    const newTask = {
      id: Date.now(),
      task: taskInput.value.trim(),
      completed: false,
      category: (typeof selectedCategory !== 'undefined') ? selectedCategory.title : "전체",
      createdAt: new Date().toISOString()
    };
  }

  // 로컬 금고 저장
  localStorage.setItem('daynize_tasks', JSON.stringify(tasks));
  console.log("💎 유료의 확인: 로컬 금고(tasks) 저장 완료");

  // 서버 백업
  const user = auth.currentUser;
  if (user) {
    try {
      await db.collection("users").doc(user.uid).collection("tasks").doc("todoList").set({
        items: tasks,
        updatedAt: new Date().toISOString()
      });
      console.log("🌊 유료의 진단: 서버 백업 성공");
    } catch (err) {
      console.error("❌ 서버 저장 실패:", err);
    }
  }

  renderTasks();
  if (typeof updateGrowthDashboard === 'function') updateGrowthDashboard();
};const sidebarMenuBtn = document.querySelector('.settings-btn');
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
  function addLog(categoryTitle, content) {
    if (!content) return;

    // 1. 메모리에 추가
    tasks.push({
      category: categoryTitle,
      task: content,
      id: Date.now()
    });

    saveTasks();

    // 3. 화면 새로고침
    if (typeof renderSummaryList === 'function') renderSummaryList();
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
          gate.style.display = 'none';
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

  window.addEventListener('DOMContentLoaded', () => {
    const savedPlans = localStorage.getItem('myPlans');
    if (savedPlans) {
      myPlans = JSON.parse(savedPlans);
      updateUI();
    }

    const titleEl = document.querySelector('.wallet-title');
    if (titleEl) titleEl.innerText = "억만이 지갑";
  });
  function initializeApp() {

    const savedAppData = localStorage.getItem('walk_app_data');

    if (savedAppData) {
      const appData = JSON.parse(savedAppData);


      if (appData.user) {
        restoreLoginState(appData.user);
      }


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


  function syncAppData() {
    const appData = {
      user: getCurrentUserStatus(),
      categories: getAllCategories(),
      wallet: {
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
      const type = this.getAttribute('data-type'); 
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
window.openFinanceModal = function () {
  const modal = document.getElementById('finance-modal');
  if (modal) {
    modal.style.display = 'flex'; // 'none'에서 'flex'로 변경하여 노출
    if (typeof updateUI === "function") updateUI();
  } else {
    console.error("ID가 'finance-modal'인 요소를 찾을 수 없습니다.");
  }
};

// 2. 모달을 닫는 함수
window.closeFinanceModal = function (e) {
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
      backgroundColor: "#605514",
      borderRadius: "20px",
      marginBottom: "15px",
      padding: "1.5rem 1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",

      cursor: "pointer",
      border: "3px solid #fff",
      backgroundImage: "linear-gradient(175deg, #6ad5f6, #6ad5f6), linear-gradient(175deg, #fff, #fff)",
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box, border-box",
      boxShadow: "0 10px 30px rgba(5, 26, 58, 0.1)",
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


      function addGeneralTask(categoryTitle, text) {

        tasks.push({
          category: categoryTitle,
          task: text,
          timestamp: Date.now()
        });

        saveTasks();
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
        <div class="task-item">
          <label class="task" for="task-${task.id}">
            <input type="checkbox" id="task-${task.id}" ${task.completed ? "checked" : ""}>
            <span class="check-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </label>
          <p class="task-text">${task.task}</p>
        </div>
        <div class="delete" style="display: flex;"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>
      `;

      const checkbox = div.querySelector("input");
      checkbox.onchange = () => {
        task.completed = checkbox.checked; // 1. 데이터의 완료 상태 변경
        saveTasks();                       // 2. 로컬 스토리지에 즉시 저장
        updateAllGauges();                 // 3. ⭐ 게이지 실시간 업데이트!
      };
      const taskText = div.querySelector(".task-text");
      if (taskText) {
        taskText.style.cursor = "pointer";
        taskText.onclick = () => {
          openEditModal(task);
        };
      }


      const deleteBtn = div.querySelector(".delete");
      let timer;
      let isLongPress = false;


      checkbox.addEventListener("change", () => {
        const index = tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          tasks[index].completed = checkbox.checked;
          saveLocal();
          updateTotals();
        }
      });

      // 2. 롱프레스 (삭제 버튼 노출)
      div.addEventListener("touchstart", () => {
        isLongPress = false;
        timer = setTimeout(() => {
          isLongPress = true;
          deleteBtn.style.display = "flex";
        }, 600);
      }, { passive: true });

      div.addEventListener("touchend", () => clearTimeout(timer));

      // 3. 클릭 (기록했던 모달창 다시 띄우기)
      taskText.addEventListener("click", (e) => {
        if (!isLongPress) {
          openEditModal(task); // 수정 모달 함수 호출
        }
      });

      // 4. 삭제 버튼 클릭
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });

      tasksContainer.appendChild(div);
    });
  }
  updateTotals();
}; 

const updateTotals = () => {
  // [기존 로직] 카테고리별 숫자 계산 및 표시
  const categoryTasks = tasks.filter(t => t.category === selectedCategory.title);
  const numDisplay = document.getElementById("num-tasks");
  if (numDisplay) {
    numDisplay.innerHTML = `${categoryTasks.length} Tasks`;
  }

  const totalDisplay = document.getElementById("total-tasks");
  if (totalDisplay) {
    totalDisplay.innerHTML = tasks.length;
  }
  if (typeof updateAllGauges === 'function') {
    updateAllGauges();
  }
}; // 함수의 끝

const addTask = (e) => {
  e.preventDefault();
  if (taskInput.value === "") return alert("내용을 입력하세요!");
  renderCategories();
  updateGrowthDashboard(true);
  setTimeout(() => {
    updateGrowthDashboard(true);
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
  closeAllPopups();
};
function closeAllPopups() {
  // 1. ID 기반 숨김 (display: none)
  const popupIds = [
    'editTaskModal',
    'editTaskTitle',
    'monthlyDetailModal',
    'categorySummaryModal',
    'addTaskWrapper' // addTask 창도 목록에 추가하세요!
  ];

  popupIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 2. 클래스 기반 숨김 (가장 중요!)
  // active 클래스가 붙어서 나타나는 모든 요소를 초기화합니다.
  document.querySelectorAll('.active').forEach(el => {
    el.classList.remove('active');
  });

  // 3. 백드롭(검은 배경)이 있다면 여기서 같이 제거
  const blackBackdrop = document.querySelector('.black-backdrop'); // 클래스명 확인 필요
  if (blackBackdrop) blackBackdrop.classList.remove('active');
}
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

  // [기존 로직 유지] 게이트키퍼 초기 설정
  if (gatekeeper) gatekeeper.style.display = 'none';

  // 1. Firebase 인증 및 로그인 상태 감시
  firebase.auth().onAuthStateChanged((user) => {
    if (user || localStorage.getItem('isLoggedIn') === 'true') {
      console.log("유료의 진단: 소셜/이메일 인증 통과!");
      if (gatekeeper) gatekeeper.style.display = 'none';
    } else {
      if (gatekeeper) gatekeeper.style.display = 'flex';
    }
  });

  const closeButtons = document.querySelectorAll(".back-btn, .close-btn, .modal-close");

  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      closeAllPopups(); // 모든 팝업 레이어를 끄는 함수 호출
    });
  });

  // 3. 안드로이드 사용자 경험을 위한 ESC 키 지원 (테스트용)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllPopups();
  });
});


function closeAllPopups() {
  // 1. ID 기반 숨김 (display: none)
  const popupIds = [
    'editTaskModal',       
    'editTaskTitle',       
    'monthlyDetailModal',  
    'categorySummaryModal', 
    'addTaskWrapper'       
  ];

  popupIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
    }
  });

  
  document.querySelectorAll('.active').forEach(el => {
    el.classList.remove('active');
  });


  const backdrop = document.getElementById('blackBackdrop');
  if (backdrop) backdrop.classList.remove('active');

  console.log("유료가 모든 화면을 깨끗하게 청소했습니다.");
}
let lastMaxCount = localStorage.getItem('lastMaxCount') ? parseInt(localStorage.getItem('lastMaxCount')) : 0;

function updateGrowthDashboard(isAdding = false) {

  if (!tasks || !Array.isArray(tasks)) return;

  const currentTotalSum = tasks.length;


  if (isAdding || currentTotalSum > lastMaxCount) {
    lastMaxCount = currentTotalSum;
    localStorage.setItem('lastMaxCount', lastMaxCount);
  }


  let percent = 0;
  if (lastMaxCount > 0 && currentTotalSum > 0) {
    percent = (currentTotalSum / lastMaxCount) * 100;
    if (percent > 100) percent = 100;
  } else if (currentTotalSum === 0) {

    percent = 0;
    lastMaxCount = 0;
    localStorage.removeItem('lastMaxCount');
  }

  const dailyTitle = document.querySelector('.daily-card .card-title');
  if (dailyTitle) {
    dailyTitle.innerText = 'DAILY';
  }

  const dailyFill = document.querySelector('.ripple-fill');
  const dailyText = document.getElementById('daily-percent-text');

  if (dailyFill) {
    dailyFill.style.height = `${percent}%`;
  
    dailyFill.style.transition = "height 0.5s ease-in-out";
  }
  if (dailyText) {
    dailyText.innerText = `${Math.round(percent)}%`;
  }

  console.log(`🚀 [전수조사 완료] 현재 총합: ${currentTotalSum} / 기준: ${lastMaxCount} -> ${Math.round(percent)}%`);
}
// --- 가운데 MONTHLY(Gauge) 카드만 정밀 제어 ---
const challengeCats = ["자기계발", "건강", "운동", "교육"];
const challengeTasks = tasks.filter(t => challengeCats.includes(t.category));
const challengeDone = challengeTasks.filter(t => t.completed).length;

const challengePercent = challengeTasks.length > 0 
  ? Math.round((challengeDone / challengeTasks.length) * 100) 
  : 0;

const monthlyBox = Array.from(document.querySelectorAll('.card, .gauge-card, .monthly-card'))
                        .find(el => el.innerText.includes('MONTHLY'));

if (monthlyBox) {
  const waveFill = monthlyBox.querySelector('.ripple-fill') || monthlyBox.querySelector('.wave');
  const percentTxt = monthlyBox.querySelector('.percent-text') || document.getElementById('gauge-percent-text');

  if (waveFill) {
    
    waveFill.style.display = "block"; 
    waveFill.style.transition = "height 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67)"; // 부드러운 상승
    waveFill.style.height = `${challengePercent}%`; 
    
    console.log(`🌊 유료의 최종 확인: MONTHLY 파도 ${challengePercent}%까지 상승 중...`);
  }

  // 숫자 업데이트 (겹침 방지: 기존 100% 글자를 지우고 새 수치 주입)
  if (percentTxt) {
    percentTxt.innerText = `${challengePercent}%`;
    percentTxt.style.zIndex = "10"; // 파도에 가려지지 않게 앞으로
  }
}

let appState = {
  plans: [
    { id: 1, name: '점심 식대', amount: 10000, spent: false },
    { id: 2, name: '커피/디저트', amount: 5000, spent: false },
    { id: 3, name: '저녁 장보기', amount: 30000, spent: false }
  ],
  gearsCollected: 0 
};

function updateMainWallet() {

  const targetAmount = appState.plans.reduce((sum, plan) => sum + plan.amount, 0);


  const availableAmount = appState.plans
    .filter(plan => !plan.spent)
    .reduce((sum, plan) => sum + plan.amount, 0);


  document.getElementById('target-amount-display').innerText = targetAmount.toLocaleString();
  document.getElementById('available-amount-display').innerText = availableAmount.toLocaleString();

  const progressPercent = targetAmount > 0 ? (availableAmount / targetAmount) * 100 : 0;
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = `${progressPercent}%`;


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

  myPlans = myPlans.map(p => p.id === id ? { ...p, spent: true } : p);
  updateUI();
}

function updateUI() {
  const listUI = document.getElementById('plan-list-ui');
  listUI.innerHTML = '';


  const target = myPlans.reduce((sum, p) => sum + p.amount, 0);
  const available = myPlans.filter(p => !p.spent).reduce((sum, p) => sum + p.amount, 0);


  myPlans.forEach(p => {
    const li = document.createElement('li');
    li.className = `plan-item ${p.spent ? 'spent' : ''}`;


    const formattedAmount = p.amount.toLocaleString('ko-KR');


    li.innerHTML = `
            <div class="item-info">
                <div class="item-name">${p.name}</div>
                <div class="item-amount">₩ ${formattedAmount}</div>
            </div>
            <div class="item-actions">
                ${!p.spent ? `<button class="consume-btn" onclick="consumePlan(${p.id})">완료</button>` : ''}
                <button class="delete-plan-btn" onclick="window.deletePlan(${p.id})">✕</button>
            </div>
        `;
    listUI.appendChild(li);
  });

  document.getElementById('target-amount-display').innerText = target.toLocaleString();
  document.getElementById('available-amount-display').innerText = available.toLocaleString();


  const bar = document.getElementById('progress-bar');
  const ratio = target > 0 ? (available / target) * 100 : 0;
  bar.style.width = ratio + '%';

  if (ratio < 66) {
    bar.style.backgroundColor = '#ff4d4d'; // 경고 레드
  } else {
    bar.style.backgroundColor = '#4facfe'; // 안전 블루
  }

  localStorage.setItem('myPlans', JSON.stringify(myPlans));
}


window.openFinanceModal = function () {
  const modal = document.getElementById('finance-modal');
  if (modal) {
    modal.style.display = 'flex';
  
    if (typeof updateUI === "function") updateUI();
  }
};

window.closeFinanceModal = function (e) {
  if (e.target.id === 'finance-modal') {
    document.getElementById('finance-modal').style.display = 'none';
  }
};

function addItemToList(task, amount) {
  const li = document.createElement('li');
  li.className = 'plan-item';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'item-content';

  const taskName = document.createElement('span');
  taskName.className = 'item-name';
  taskName.innerText = task; 

  const amountLabel = document.createElement('span');
  amountLabel.className = 'item-amount';
  amountLabel.innerText = `₩ ${amount.toLocaleString('ko-KR')}`; 

  contentDiv.appendChild(taskName);
  contentDiv.appendChild(amountLabel);


  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-plan-btn';
  deleteBtn.innerHTML = '×'; 


  deleteBtn.addEventListener('click', () => {
    handleDeletePlan(li); 
  });

  li.appendChild(contentDiv);
  li.appendChild(deleteBtn);

  
  document.querySelector('.plan-list').appendChild(li); 
}

const disableMainEditUI = () => {

  const arrowIcon = document.querySelector('.wallet-card .fa-chevron-down'); 
  if (arrowIcon) arrowIcon.style.display = 'none';

  const displayAmount = document.getElementById('target-amount-display');
  if (displayAmount) {
    displayAmount.style.pointerEvents = 'none'; 
    displayAmount.style.cursor = 'default';
  }
};

window.deletePlan = function (id) {
  console.log("유료의 삭제 신호 포착! ID:", id); 

  if (!confirm("이 내역을 삭제하시겠습니까?")) return;

  myPlans = myPlans.filter(p => p.id !== id);

  if (typeof saveLocal === 'function') saveLocal();

  updateUI();

  if (typeof updateGrowthDashboard === 'function') {
    updateGrowthDashboard(false);
  }
};


function openEditModal(task) {
  if (!task) return;

  const input = document.getElementById("task-input");
  const wrapper = document.querySelector(".add-task"); 
  const title = document.querySelector(".heading"); 
  const btn = document.getElementById("add-btn"); 

  if (!input || !wrapper) {
    console.error("HTML 요소를 찾지 못했습니다. 클래스명을 확인하세요.");
    return;
  }

  editingTaskId = task.id;
  input.value = task.task; 

  if (title) title.innerText = "Edit Task";
  if (btn) btn.innerText = "Update";

  wrapper.classList.add("active"); 
}

function goToCategory(categoryTitle) {

  closeSummaryModal();

  const targetCategory = categories.find(c => c.title === categoryTitle);

  if (targetCategory) {
    selectedCategory = targetCategory;
    renderTasks();

    console.log(`${categoryTitle} 카테고리로 이동했습니다.`);
  }
}


function openSummaryModal() {

  const modal = document.getElementById("summary-modal");

  modal.classList.add("active");
}// 2. 모달 닫기 함수
function closeSummaryModal() {
  const modal = document.getElementById("summary-modal");
  if (modal) modal.classList.remove("active");
}


function renderSummaryList() {
  const container = document.querySelector(".summary-list-container");
  if (!container) return;
  container.innerHTML = "";

  const activeCategories = categories.filter(cat => {
    const count = tasks.filter(t => t.category === cat.title).length;
    return count > 0;
  });

  if (activeCategories.length === 0) {
    container.innerHTML = `<div class="placeholder-text">예정된 일정이 없습니다. ✨</div>`;
    return;
  }

  activeCategories.forEach(category => {
    const categoryTasks = tasks.filter(t => t.category === category.title);

    // 컨텐츠만 나열 (• 불렛 추가)
    const taskHtml = categoryTasks.map(t => `• ${t.task}`).join('<br>');

    const card = document.createElement("div");
    card.className = "summary-card-minimal";

    card.innerHTML = `
            <div class="minimal-content-area" style="width: 100%;">
                <div class="task-scroll-box">${taskHtml}</div>
            </div>
        `;

    // 클릭 시 이동
    card.onclick = () => {
      if (typeof warpToCategory === 'function') {
        warpToCategory(category.title);
      } else {
        console.log(category.title + "로 이동합니다.");
      }
      closeSummaryModal();
    };

    container.appendChild(card);
  });
}


function warpToCategory(title) {
  const target = categories.find(c => c.title === title);
  if (target) {
    selectedCategory = target;
    renderTasks();


    const summaryModal = document.getElementById("summary-modal");
    if (summaryModal) summaryModal.classList.remove("active");
  }
}

function toggleTask(id) {

  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );


  saveTasks();
  renderTasks();
  updateAllGauges();
}

function updateAllGauges() {
  const currentTasks = (typeof tasks !== 'undefined') ? tasks : [];


  const mTasks = currentTasks.filter(t => {
    if (!t.category) return false;
    const cat = String(t.category).trim();
    return ['자기계발', '건강', '운동'].includes(cat);
  });

  const mTotal = mTasks.length;
  const mPercent = mTotal > 0 ? 100 : 0;

  console.log("🚀 [연결테스트] MONTHLY 개수:", mTotal, "전송 퍼센트:", mPercent);

  const targets = ['#monthly-percent-text', '#weekly-percent-text'];
  targets.forEach(id => {
    const el = document.querySelector(id);
    if (el) el.innerText = mPercent + "%";
  });

  const fills = ['.monthly-fill', '.weekly-fill'];
  fills.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.height = mPercent + "%";
      el.classList.add('wave-active');
    }
  });
}

function renderGaugeUI(selector, textId, percent) {
 
  const fill = document.querySelector(selector);
  const text = document.getElementById(textId.replace('#', '')) || document.querySelector(textId);

  let safePercent = isNaN(percent) ? 0 : Math.round(percent);
  if (safePercent < 0) safePercent = 0;
  if (safePercent > 100) safePercent = 100;

  if (fill) {
    
    fill.classList.remove('wave-active');
    void fill.offsetWidth; 

   
    fill.style.height = safePercent + '%';

  
    if (safePercent > 0) {
      fill.classList.add('wave-active');
    }
   
    if (safePercent === 0) {
      fill.style.height = "0%";
    }

    console.log(`🌊 [게이지 업데이트] ${selector} -> ${safePercent}% 반영 완료`);
  }

  if (text) {
    text.innerText = safePercent + '%';
  }
}function renderMonthlySummary() {

  const container = document.querySelector(".monthly-summary-list-container");
  if (!container) return;
  container.innerHTML = "";

  const targetTitles = ['자기계발', '건강', '운동'];

  const activeCategories = categories.filter(cat => {
    const cleanTitle = cat.title.trim();
    if (!targetTitles.includes(cleanTitle)) return false;

    // 해당 카테고리에 할 일이 하나라도 있는지 확인
    const count = tasks.filter(t => t.category === cleanTitle).length;
    return count > 0;
  });

  // 3. 내용이 없을 때 처리
  if (activeCategories.length === 0) {
    container.innerHTML = `<div class="placeholder-text">설정된 목표가 없습니다. 🏃‍♂️</div>`;
    return;
  }

  // 4. 리스트 생성
  activeCategories.forEach(category => {
    const categoryTasks = tasks.filter(t => t.category === category.title);

    // 할 일 목록 (완료/미완료 아이콘 구분)
    const taskHtml = categoryTasks.map(t =>
      `<div class="task-line">
        <span class="bullet">${t.completed ? '✅' : '•'}</span>
        <span class="text ${t.completed ? 'done' : ''}">${t.task}</span>
      </div>`
    ).join('');

    const card = document.createElement("div");
    card.className = "summary-card-minimal monthly-theme"; 
    card.innerHTML = `
            <div class="minimal-content-area" style="width: 100%;">
                <div class="category-label">${category.title}</div>
                <div class="task-scroll-box">${taskHtml}</div>
            </div>
        `;

    card.onclick = () => {
      if (typeof warpToCategory === 'function') {
        warpToCategory(category.title);
      }
      closeMonthlyModal(); // 모달 닫기
    };

    container.appendChild(card);
  });
}

// 모달 열기 함수 (가운데 게이지 클릭 시 실행되게 연결하세요)
function openMonthlyModal() {
  const modal = document.getElementById('monthly-summary-modal');
  if (modal) {
    modal.classList.add('active'); // CSS에서 .active로 제어
    renderMonthlySummary();
  }
}

// [유료의 치밀한 필터 로직]
function openMonthlyDetailModal() {
  const modal = document.getElementById('monthlyDetailModal');
  const listContainer = document.getElementById('monthly-detail-list');

  // 1. 카테고리 목록 (공백 오타 방지를 위해 trim 적용 예정)
  const targetCategories = ['자기계발', '건강', '교육', '운동'];

  // 2. 필터링 로직 강화
  const filteredTasks = tasks.filter(task => {
    // category 속성이 없으면 type이나 다른 속성이라도 뒤져봅니다.
    const catName = (task.category || task.type || task.group || "").toString().trim();
    return targetCategories.includes(catName);
  });

  listContainer.innerHTML = '';

  if (filteredTasks.length === 0) {
    listContainer.innerHTML = '<div style="text-align:center; padding:30px; color:#555; font-size:1.1rem;">기록된 활동이 없습니다. ✨</div>';
  } else {
    filteredTasks.forEach(task => {
      // [유료의 핵심 수사 로직] 
      // 1순위: 확실한 텍스트 필드들 체크
      // 2순위: 객체를 순회하며 '내용'처럼 보이는 가장 긴 문자열을 자동으로 찾음
      let taskContent = task.text || task.planName || task.title || task.name || task.content;

      if (!taskContent) {
        // 만약 위 이름들이 다 아니면, 객체의 값 중 문자열이면서 가장 긴 것을 내용으로 간주
        const values = Object.values(task).filter(v => typeof v === 'string' && !targetCategories.includes(v));
        taskContent = values.sort((a, b) => b.length - a.length)[0] || "내용을 읽을 수 없음";
      }

      const item = document.createElement('div');
      item.className = 'modal-item';
      item.innerHTML = `
                <div style="padding: 15px 0; border-bottom: 1px solid rgba(0,0,0,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span class="badge" style="background: rgba(255,255,255,0.4); padding: 2px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; color: #333;">
                            ${task.category || task.type || '분류없음'}
                        </span>
                        <span>${task.completed ? '✅' : '⏳'}</span>
                    </div>
                    <div style="font-size: 1.15rem; color: #1a1a1a; font-weight: 500; line-height: 1.4;">
                        ${taskContent}
                    </div>
                </div>
            `;
      listContainer.appendChild(item);
    });
  }

  modal.style.display = 'flex';
}
// [유료의 확실한 탈출 로직]
function closeMonthlyModal(event) {
  const modal = document.getElementById('monthlyDetailModal');
  if (modal) {
    // 애니메이션 효과를 위해 opacity를 먼저 조절하거나 바로 숨깁니다.
    modal.style.display = 'none';
  }

  // 이벤트 전파 방지 (혹시 모를 중복 실행 방지)
  if (event) {
    event.preventDefault();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const handler = document.getElementById('dial-handler');
  const cylinder = document.getElementById('dial-cylinder');
  const emojis = document.querySelectorAll('.emoji-item');

  // 1. 다이얼 눈금 채우기
  for (let i = 0; i < 30; i++) {
    const mark = document.createElement('div');
    mark.className = 'dial-mark';
    cylinder.appendChild(mark);
  }

  // 2. 스크롤 위치에 따른 5단계 로직
  handler.addEventListener('scroll', () => {
    const maxScroll = handler.scrollWidth - handler.clientWidth;
    const currentScroll = handler.scrollLeft;
    const scrollRatio = currentScroll / maxScroll;

    // 5단계 계산 (0~0.2: Happy, 0.2~0.4: Smile ...)
    let level = Math.floor(scrollRatio * 5) + 1;
    if (level > 5) level = 5;

    updateEmoji(level);
  });

  function updateEmoji(level) {
    emojis.forEach(el => {
      if (parseInt(el.dataset.level) === level) {
        if (!el.classList.contains('active')) {

          el.classList.add('active');
          el.style.display = 'block';
        }
      } else {
        el.classList.remove('active');
        setTimeout(() => { if (!el.classList.contains('active')) el.style.display = 'none'; }, 400);
      }
    });
  }
});

function updateMarqueeDate() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayList = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dayOfWeek = dayList[now.getDay()];

    const newContent = `${dayOfWeek} ${month}월 ${date}일 &nbsp; 거둬내어 가벼운 삶 &nbsp; <b>걷다</b> &nbsp;&nbsp;&nbsp;&nbsp;`;

    const marqueeBox = document.querySelector('.marquee-content');

    if (marqueeBox) {
      
        marqueeBox.innerHTML = `
            <span>${newContent}</span>
            <span>${newContent}</span>
            <span aria-hidden="true">${newContent}</span>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateMarqueeDate();
    setInterval(updateMarqueeDate, 3600000); 
});
document.addEventListener('DOMContentLoaded', () => {
    const handler = document.getElementById('dial-handler');
    const cylinder = document.getElementById('dial-cylinder');

    if (handler && cylinder) {
        handler.addEventListener('scroll', () => {
            const scrollLeft = handler.scrollLeft;
            const maxScroll = handler.scrollWidth - handler.clientWidth;
            const ratio = scrollLeft / maxScroll;

            cylinder.style.transform = `translateX(${-scrollLeft * 0.6}px)`;

            let level = Math.floor(ratio * 5) + 1;
            if (level > 5) level = 5;
            if (level < 1) level = 1;

            updateEmoji(level); 
        });
    }
});




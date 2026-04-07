const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const todoTitle = document.querySelector(".todo-app h2");

// 현재 선택된 날짜를 추적하는 변수 (초기값은 오늘)
let selectedDateKey = ""; 

// --- [To-Do 로직] ---

function addTask() {
    if (inputBox.value === '') {
        alert('Please enter a task');
        return;
    }
    
    const li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);
    const span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
    
    inputBox.value = "";
    saveData();
}

listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        saveData();
    } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        saveData();
    }
}, false);

// 날짜별로 데이터를 따로 저장하도록 키값 변경
function saveData() {
    localStorage.setItem("todo_" + selectedDateKey, listContainer.innerHTML);
}

// 선택된 날짜의 데이터를 불러오는 함수
function showTask(dateKey) {
    selectedDateKey = dateKey;
    todoTitle.innerText = `Tasks: ${dateKey}`; // UI에 현재 날짜 표시
    const data = localStorage.getItem("todo_" + dateKey);
    listContainer.innerHTML = data ? data : "";
}

// --- [캘린더 로직] ---

const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0);
};

const getFebDays = (year) => isLeapYear(year) ? 29 : 28;

let calendar = document.querySelector('.calendar');
const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let month_picker = document.querySelector('#month-picker');
const dayTextFormate = document.querySelector('.day-text-formate');
const timeFormate = document.querySelector('.time-formate');
const dateFormate = document.querySelector('.date-formate');

const generateCalendar = (month, year) => {
    let calendar_days = document.querySelector('.calendar-days');
    calendar_days.innerHTML = '';
    let calendar_header_year = document.querySelector('#year');
    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let currentDate = new Date();
    month_picker.innerHTML = month_names[month];
    calendar_header_year.innerHTML = year;

    let first_day = new Date(year, month, 1);

    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = document.createElement('div');
        if (i >= first_day.getDay()) {
            let dateNum = i - first_day.getDay() + 1;
            day.innerHTML = dateNum;
            day.classList.add('calendar-day-hover');
            
            // 날짜 식별자 생성 (예: 2026-02-23)
            let dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
            
            // 날짜 클릭 이벤트 추가 (핵심 연결 고리)
            day.onclick = () => {
                // 이전에 선택된 날짜 스타일 제거
                document.querySelectorAll('.calendar-days div').forEach(d => d.classList.remove('selected-date'));
                day.classList.add('selected-date');
                showTask(dateKey); // 해당 날짜의 할 일 목록 로드
            };

            // 오늘 날짜 표시
            if (dateNum === currentDate.getDate() && year === currentDate.getFullYear() && month === currentDate.getMonth()) {
                day.classList.add('current-date');
                if(!selectedDateKey) day.click(); // 앱 처음 켰을 때 오늘 날짜 자동 선택
            }
        }
        calendar_days.appendChild(day);
    }
};

// 월 선택 로직
let month_list = calendar.querySelector('.month-list');
month_names.forEach((e, index) => {
    let month = document.createElement('div');
    month.innerHTML = `<div>${e}</div>`;
    month.onclick = () => {
        currentMonth.value = index;
        generateCalendar(currentMonth.value, currentYear.value);
        month_list.classList.replace('show', 'hide');
    };
    month_list.append(month);
});

month_picker.onclick = () => {
    month_list.classList.remove('hide');
    month_list.classList.add('show');
};

document.querySelector('#pre-year').onclick = () => {
    --currentYear.value;
    generateCalendar(currentMonth.value, currentYear.value);
};
document.querySelector('#next-year').onclick = () => {
    ++currentYear.value;
    generateCalendar(currentMonth.value, currentYear.value);
};

// 초기화 실행
let currentDate = new Date();
let currentMonth = { value: currentDate.getMonth() };
let currentYear = { value: currentDate.getFullYear() };

// 앱 실행 시 오늘 날짜로 초기화
const initApp = () => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    generateCalendar(currentMonth.value, currentYear.value);
    showTask(todayKey);
};

initApp();

// --- [시간 표시 로직] ---
setInterval(() => {
    const timer = new Date();
    const option = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formateTimer = new Intl.DateTimeFormat('en-us', option).format(timer);
    timeFormate.textContent = formateTimer;
}, 1000);

const showCurrentDateOption = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
dateFormate.textContent = new Intl.DateTimeFormat('en-US', showCurrentDateOption).format(new Date());
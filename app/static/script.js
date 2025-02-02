document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');

    const timerDisplay = document.getElementById('timer');
    const startTimerButton = document.getElementById('start-timer');
    const resetTimerButton = document.getElementById('reset-timer');

    let timer;
    let timeLeft = 25 * 60;

    // 通知の許可をリクエスト
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    // 通知を送信
    function sendNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/static/favicon.ico' // 必要ならアイコン画像を指定
            });
        }
    }

    // タスクの取得
    function loadTasks() {
        fetch('/tasks')
            .then(res => res.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.textContent = task[1]; // タスク名

                    // 削除ボタンを追加
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.style.marginLeft = '10px';
                    deleteButton.addEventListener('click', () => {
                        deleteTask(task[0]); // タスクIDを渡す
                    });

                    li.appendChild(deleteButton);
                    taskList.appendChild(li);
                });
            });
    }

    // タスクの削除
    function deleteTask(taskId) {
        fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
        }).then(() => {
            loadTasks(); // 再読み込みして更新
        });
    }

    // タスクの追加
    addTaskButton.addEventListener('click', () => {
        const taskName = newTaskInput.value.trim();
        if (taskName) {
            fetch('/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: taskName })
            }).then(() => {
                newTaskInput.value = '';
                loadTasks();
            });
        }
    });

    // タイマーの開始
    startTimerButton.addEventListener('click', () => {
        if (!timer) {
            timer = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    timer = null;
                    sendNotification('Pomodoro Timer', 'Time is up! Take a break.');
                    alert('Time is up! Take a break.'); // バックアップとしてアラート
                } else {
                    timeLeft--;
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }
            }, 1000);
        }
    });

    // タイマーのリセット
    resetTimerButton.addEventListener('click', () => {
        clearInterval(timer);
        timer = null;
        timeLeft = 25 * 60;
        timerDisplay.textContent = '25:00';
    });

    // 初期化時に通知許可をリクエスト
    requestNotificationPermission();
    loadTasks();
});


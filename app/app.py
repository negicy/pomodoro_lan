from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# DB初期化
def init_db():
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'pending'
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

# タスクの取得
@app.route('/tasks', methods=['GET'])
def get_tasks():
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute('SELECT id, name, status FROM tasks')
    tasks = c.fetchall()
    conn.close()
    return jsonify(tasks)

# タスクの追加
@app.route('/tasks', methods=['POST'])
def add_task():
    task_name = request.json.get('name')
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute('INSERT INTO tasks (name) VALUES (?)', (task_name,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Task added'}), 201

# タスクの削除
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Task deleted'})

# サーバー起動時にDB初期化
if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)

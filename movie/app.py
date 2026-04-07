from gtts import gTTS
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess  # 시스템 명령(블렌더 실행)을 담당하는 도구

app = Flask(__name__)
CORS(app)  # 모든 접속(웹 화면 등)을 허용

@app.route('/make-movie', methods=['POST'])
def make_movie():
    # 1. 앱(JS)에서 보낸 데이터 받기
    data = request.json
    character = data.get('selectedChar')
    script = data.get('script')
    script_text = data.get('script', '안녕하세요')
    
    # 1. 음성 파일 생성
    tts = gTTS(text=script_text, lang='ko')
    audio_path = os.path.join(os.path.expanduser("~"), "Desktop", "voice.mp3")
    tts.save(audio_path)
    print(f"로그: {character} 캐릭터로 '{script}' 영화 제작 시작!")

    # 2. 블렌더 실행 설정 (맥 경로 기준)
    blender_path = "/Applications/Blender.app/Contents/MacOS/Blender"
    script_path = "render_script.py"  # 블렌더 안에서 돌아갈 파이썬 파일 이름
    
    # 3. 블렌더 소환!
    # -b: 화면 없이 백그라운드 실행
    # -P: 특정 파이썬 스크립트 실행
    # --: 그 뒤로는 블렌더가 아닌 우리 스크립트에 전달할 데이터
    try:
        subprocess.run([
            blender_path, "-b", "-P", script_path, "--", character, script
        ], check=True)
        
        return jsonify({
            "status": "success", 
            "message": f"{character} 영화 렌더링이 완료되었습니다!"
        })
    except Exception as e:
        print(f"에러 발생: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True) # debug=True를 넣으면 코드 수정 시 자동 재시작됩니다.





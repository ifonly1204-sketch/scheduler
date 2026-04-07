import bpy
import sys
import os

# 1. 데이터 수신 (앱 -> 서버 -> 블렌더)
try:
    args = sys.argv[sys.argv.index("--") + 1:]
    char_type = args[0]
    script_text = args[1]
except (ValueError, IndexError):
    char_type = "Robot"
    script_text = "Hello Movie!"

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# 2. '사람' 캐릭터 소환 (간이 상반신 모델링)
# 머리(구체)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.4, location=(0, 0, 2.2))
# 몸통(원뿔을 뒤집은 형태)
bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.7, radius2=0, depth=1.5, location=(0, 0, 1.2))

# 3. 3D 대사 자막 추가
bpy.ops.object.text_add(location=(-2, -1, 3))
text_obj = bpy.context.object
text_obj.data.body = script_text
text_obj.rotation_euler[0] = 1.57

# 4. 카메라 및 조명 (회전 애니메이션 유지)
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 1))
pivot = bpy.context.object
bpy.ops.object.camera_add(location=(6, -6, 3))
cam = bpy.context.object
cam.parent = pivot
bpy.context.scene.camera = cam

# 애니메이션 설정
pivot.rotation_euler[2] = 0
pivot.keyframe_insert(data_path="rotation_euler", frame=1)
pivot.rotation_euler[2] = 1.0 # 살짝만 움직여도 입체감이 살아요
pivot.keyframe_insert(data_path="rotation_euler", frame=120)

# 머리(구체)를 선택해서 미세하게 움직이기 (말하는 느낌 추가)
head = bpy.data.objects.get("Sphere") # 구체 이름 확인 필요
if head:
    head.keyframe_insert(data_path="location", frame=1)
    head.location[2] += 0.05 # 살짝 위로
    head.keyframe_insert(data_path="location", frame=30)
    head.location[2] -= 0.05 # 원래대로
    head.keyframe_insert(data_path="location", frame=60)


# 5. 오디오 파일 불러오기 (핵심!)
audio_path = os.path.join(os.path.expanduser("~"), "Desktop", "voice.mp3")
if os.path.exists(audio_path):
    # 블렌더 비디오 에디터 섹션에 오디오 추가
    if not bpy.context.scene.sequence_editor:
        bpy.context.scene.sequence_editor_create()
    bpy.context.scene.sequence_editor.sequences.new_sound("Voice", audio_path, 3, 1)

# 6. 영상 출력 설정 (오디오 포함 필수!)
scene = bpy.context.scene
scene.render.ffmpeg.audio_codec = 'AAC' # 오디오 코덱 추가
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'

desktop_path = os.path.join(os.path.expanduser("~"), "Desktop", "movie_output.mp4")
scene.render.filepath = desktop_path

bpy.ops.render.render(animation=True)
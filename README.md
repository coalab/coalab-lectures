# coalab-lectures
# COALAB Lectures 🎥

**COALAB 평생교육원 강의 영상 사이트 (테스트 버전)**  
본 프로젝트는 GitHub Pages 기반으로 구축된 강의 영상 플레이어 예제입니다.  
YouTube 및 MP4 영상을 리스트 형태로 관리하고, 좌측 메뉴에서 선택 시 우측에서 재생됩니다.

---

## 📁 프로젝트 구조



<img width="520" height="148" alt="image" src="https://github.com/user-attachments/assets/607aba0a-cfa2-4105-b2c7-76b72fd3d4cb" />

---

## 🚀 사용 방법

1. **GitHub Pages 설정**
   - 메뉴 경로: `Settings → Pages`
   - **Branch:** `main`  
   - **Folder:** `/ (root)`  
   - 설정 후 `Save` 버튼 클릭
   - 약 1~3분 후 아래 주소에서 실행 확인:
     👉 [https://coalab.github.io/coalab-lectures/](https://coalab.github.io/coalab-lectures/)

     ```

2. **강의 영상 추가**
   - `index.html` 안의 `<ul id="playlist">` 영역에 다음 형식으로 항목을 추가합니다:
     ```html
     <li class="item"
         data-type="youtube"
         data-src="https://www.youtube.com/watch?v=VIDEO_ID"
         data-title="강의 제목">
       <span>강의 제목</span><span class="muted">YouTube</span>
     </li>
     ```

3. **변경 후 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "update playlist"
   git push

---



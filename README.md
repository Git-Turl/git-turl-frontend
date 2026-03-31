# 🪶 깃털(Git-Turl) Frontend

## 📌 프로젝트 소개
깃털은 깃허브를 분석하여 요약본, 면접 질문을 생성해주는 개발자 취업준비 웹 서비스입니다.
React + TypeScript + Vite 기반으로 개발됩니다.


## 👥 팀원 소개

<table>
  <tr>
    <td align="center" width="220">
      <img src="https://github.com/USERNAME.png" width="120"/><br/><br/>
      <b>박시우</b><br/>
      💻 Frontend<br/>
      <sub></sub><br/>
      <a href="https://github.com/USERNAME">@USERNAME</a>
    </td>
    <td align="center" width="220">
      <img src="https://github.com/USERNAME.png" width="120"/><br/><br/>
      <b>정규은</b><br/>
      💻 Frontend<br/>
      <sub>프로젝트 초기 설정</sub><br/>
      <a href="https://github.com/jeongkyueun">@jeongkyueun</a>
    </td>
    
  </tr>
</table>


## ⚙️ 기술 스택
- React
- TypeScript
- Vite
- ESLint & Prettier


## 📁 프로젝트 구조
```bash
src/
 ├─ components/   // 재사용 컴포넌트
 ├─ pages/        // 페이지 단위 컴포넌트
 ├─ hooks/        // 커스텀 훅
 ├─ api/          // API 요청
 ├─ utils/        // 유틸 함수
 ├─ types/        // 타입 정의
 ├─ assets/       // 정적 파일
 └─ styles/       // 스타일
```



## Coding Convention

### 📌 기본 원칙
- 가독성을 최우선으로 합니다.
- 일관된 코드 스타일을 유지합니다.
- 명확한 네이밍을 사용합니다.


### 🔤 네이밍 규칙

#### 파일명
- 컴포넌트: PascalCase → `UserCard.tsx`
- 훅: camelCase → `useAuth.ts`
- 유틸: camelCase → `formatDate.ts`


### 🎨 코드 스타일
- 들여쓰기: 2 spaces
- 세미콜론: 사용
- 문자열: 작은따옴표 (')

```ts
const userName = 'gitturl';
const getUserData = () => {};
```


### 📦 import 순서
```ts
// 1. 라이브러리
import React from 'react';

// 2. 외부 패키지
import axios from 'axios';

// 3. 내부 모듈
import Button from '@/components/Button';

// 4. 스타일
import './style.css';
```



### 🧠 TypeScript 규칙
- any 사용 지양

```ts
// ❌
const data: any;

// ✅
const data: User;
```



### 🔧 Git Convention
```bash
feat: 기능 추가
fix: 버그 수정
style: 코드 스타일 변경
refactor: 리팩토링
docs: 문서 수정
```


## 🚀 실행 방법

```bash
npm install
npm run dev
```



## 📌 기타
- ESLint + Prettier를 사용하여 코드 스타일을 통일합니다.

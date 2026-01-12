# Chalk 앱 Development Client + Maestro E2E 테스트 가이드

## 📋 개요

이 가이드는 **Windows 환경**에서 Expo Development Client와 Maestro를 활용한 효율적인 E2E 테스트 워크플로우를 설명합니다.

**핵심 원리:**
- 앱(APK)은 **최초 1회만 빌드** (EAS 클라우드)
- 이후 코드 수정 시 **Metro 서버만 재연결** (빌드 불필요!)
- Maestro는 **이미 설치된 앱을 실행**하여 테스트

---

## 🛠️ 사전 준비 (최초 1회)

### 1. EAS 로그인
```powershell
npx eas login
```

### 2. Development Client APK 빌드 (클라우드)
```powershell
npx eas build --platform android --profile development
```
- ⏱️ 약 10~15분 소요
- 빌드 완료 후 다운로드 링크 제공

### 3. APK 에뮬레이터에 설치
```powershell
# 방법 1: adb로 설치
adb install ./path/to/chalk-dev.apk

# 방법 2: 에뮬레이터 창에 APK 파일 드래그 & 드롭
```

---

## 🔄 반복 테스트 워크플로우

### Step 1: Metro 서버 시작
```powershell
npx expo start
```

### Step 2: 에뮬레이터에서 앱 실행
- 에뮬레이터에 설치된 Chalk 앱 아이콘 탭
- Metro 서버에 자동 연결됨

### Step 3: Maestro 테스트 실행
```powershell
# 환경 변수 설정 (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$maestroPath = "c:\Users\yejin\Downloads\cryo\chalk-app\maestro\bin"
$adbPath = "C:\Users\yejin\AppData\Local\Android\Sdk\platform-tools"
$env:Path += ";$maestroPath;$adbPath"

# 테스트 실행
maestro.bat test .maestro/happy_path.yaml
```

---

## 📁 파일 구조

```
.maestro/
├── config.yaml          # 전역 설정 (appId: com.chalk.tutor)
├── happy_path.yaml      # 통합 테스트 (온보딩→학생추가→녹음)
└── flows/
    ├── 01_onboarding.yaml
    ├── 02_add_student.yaml
    └── 03_ai_scribe.yaml
```

---

## ⚙️ 설정 파일

### eas.json (development 프로필)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### .maestro/config.yaml
```yaml
appId: com.chalk.tutor
name: Chalk E2E Tests
```

### .maestro/happy_path.yaml
```yaml
- launchApp:
    clearState: false  # 앱 데이터 유지 (재설치 안함)
```

---

## 🎯 장점

| 기존 방식 | Development Client 방식 |
|-----------|------------------------|
| 코드 수정 → APK 빌드 (15분) | 코드 수정 → Hot Reload (즉시) |
| 매번 500MB+ 다운로드 | 최초 1회만 다운로드 |
| 저장공간 낭비 | 저장공간 절약 |

---

## ❓ 문제 해결

### "앱이 Metro에 연결되지 않아요"
```powershell
# Metro 서버 재시작
npx expo start --clear
```

### "Maestro가 앱을 못 찾아요"
```powershell
# 패키지 확인
adb shell pm list packages | Select-String "chalk"
```

### "JAVA_HOME 오류"
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

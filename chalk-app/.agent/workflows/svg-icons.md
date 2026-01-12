---
description: UI 개발 시 이모지 대신 SVG 아이콘 사용
---

# SVG 아이콘 사용 규칙

UI를 개발할 때 이모지(😀, 🎯, 📊 등) 대신 항상 SVG 아이콘을 사용합니다.

## 사용 방법

1. `components/Icons.tsx`에서 필요한 아이콘 import
2. 이모지 대신 해당 아이콘 컴포넌트 사용

## 예시

**❌ 하지 말 것:**
```tsx
<Text>🎯</Text>
<Text>📊</Text>
```

**✅ 해야 할 것:**
```tsx
import { Target, ChartBar } from '../components/Icons';

<Target size={24} color="#3B82F6" />
<ChartBar size={24} color="#3B82F6" />
```

## 사용 가능한 아이콘 목록

### ESIP Icons
- `Target` - 타겟/목표
- `ChartBar` - 차트/통계
- `FileText` - 문서/리포트
- `Pen` - 펜 도구
- `Eraser` - 지우개
- `Highlighter` - 하이라이터
- `Trash` - 삭제
- `Flag` - 플래그/표시
- `ArrowLeft` - 왼쪽 화살표
- `ArrowRight` - 오른쪽 화살표

### 기존 Icons
- `Settings` - 설정
- `Users` - 사용자
- `Plus` - 추가
- `CheckCircle` - 완료
- `Clock` - 시계
- `Send` - 전송
- `BookOpen` - 책
- `Calendar` - 캘린더
- `Video` - 비디오
- `Mic` - 마이크

## 새 아이콘 추가 시

`components/Icons.tsx`에 새 함수를 추가합니다:

```tsx
export function NewIcon({ size = 24, color = '#3B82F6' }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="..." stroke={color} strokeWidth="1.5" />
        </Svg>
    );
}
```

# Enhanced Table Component

## Overview
مكون جدول محسن يدعم العرض بكامل ارتفاع الصفحة مع scroll داخلي وheader ثابت.

## Features
- ✅ **Full Height Display**: يأخذ كامل المساحة المتبقية في الصفحة
- ✅ **Sticky Header**: رأس الجدول يبقى ثابت أثناء التمرير
- ✅ **Internal Scrolling**: scroll داخلي مع إخفاء scrollbar
- ✅ **Responsive Design**: يتكيف مع أحجام الشاشات المختلفة
- ✅ **Search & Pagination**: بحث وترقيم الصفحات
- ✅ **Custom Height**: إمكانية تخصيص الارتفاع

## Usage

### Basic Usage
```jsx
import Table from "@/components/table/table";

<Table
  data={data}
  columns={columns}
  useFullHeight={true}
  hasSearch={true}
  searchValue={searchValue}
  onSearchChange={handleSearchChange}
/>
```

### Full Example
```jsx
import React, { useMemo, useReducer } from "react";
import Table from "@/components/table/table";
import BreadCrumb from "@/components/breadcrumb";

export default function MyTablePage() {
  const [state, dispatch] = useReducer(tableReducer, initialValues);

  const columns = useMemo(() => [
    { accessorKey: "name", header: "الاسم" },
    { accessorKey: "email", header: "البريد الإلكتروني" },
    { accessorKey: "phone", header: "الهاتف" },
  ], []);

  return (
    <div>
      <BreadCrumb
        title="عنوان الصفحة"
        sticky={true}
        stickyTop="70px"
      />
      <Table
        data={paginatedData}
        columns={columns}
        pageSize={state.pageSize}
        pageIndex={state.pageIndex}
        totalPages={totalPages}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onGotoPage={handleGotoPage}
        hasSearch={true}
        searchValue={state.searchValue}
        onSearchChange={handleSearchChange}
        useFullHeight={true}
      />
    </div>
  );
}
```

## Props

### New Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `useFullHeight` | boolean | false | يجعل الجدول يأخذ كامل ارتفاع الصفحة |
| `customHeight` | string | undefined | ارتفاع مخصص للجدول (مثل: "500px" أو "h-96") |

### Existing Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | array | [] | بيانات الجدول |
| `columns` | array | [] | تعريف الأعمدة |
| `hasSearch` | boolean | true | إظهار/إخفاء شريط البحث |
| `searchValue` | string | "" | قيمة البحث الحالية |
| `onSearchChange` | function | undefined | دالة تغيير البحث |
| `pageSize` | number | 10 | عدد الصفوف في الصفحة |
| `pageIndex` | number | 0 | رقم الصفحة الحالية |
| `totalPages` | number | 1 | إجمالي عدد الصفحات |
| `isLoading` | boolean | false | حالة التحميل |

## Height Calculation
يتم حساب الارتفاع تلقائياً بناءً على:
- Navbar: 70px
- BreadCrumb (sticky): 60px
- Main padding: 24px (lg) / 12px (sm)
- Card padding: 32px
- Margin: 16px

```css
/* Large screens */
h-[calc(100vh-70px-60px-48px-32px-16px)]

/* Small screens */
h-[calc(100vh-70px-60px-24px-32px-16px)]
```

## CSS Classes
- `.table-scroll-container`: حاوي الجدول مع scroll مخفي
- `.sticky-table-header`: رأس الجدول الثابت
- `.full-width-table`: جدول بعرض كامل
- `.hide-scrollbar`: إخفاء scrollbar

## Examples
- `/table-test`: صفحة اختبار الجدول المحسن
- `/branches`: مثال حقيقي في صفحة الفروع

## Notes
- تأكد من استخدام `useFullHeight={true}` للحصول على التأثير المطلوب
- يمكن تخصيص الارتفاع باستخدام `customHeight`
- الـ header يصبح sticky تلقائياً مع backdrop blur
- يتم إخفاء scrollbar تلقائياً مع الحفاظ على وظيفة التمرير

import React, { useState } from "react";
import CheckboxField from "@/components/shared/checkbox";
import GroupCheckbox from "@/components/shared/checkbox/GroupCheckbox";
import { useForm } from "react-hook-form";

const CheckboxDemo = () => {
  const { control } = useForm({
    defaultValues: {
      option1: false,
      option2: true,
      option3: false,
    },
  });

  const [groupChecked, setGroupChecked] = useState(false);
  const [groupIndeterminate, setGroupIndeterminate] = useState(true);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          عرض أشكال الـ Checkbox الجديدة
        </h1>

        {/* عرض GroupCheckbox */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Group Checkbox (للأقسام الرئيسية)
          </h2>

          <div className="space-y-4">
            <GroupCheckbox
              checked={false}
              indeterminate={false}
              onChange={() => {}}
              label="غير محدد"
            />

            <GroupCheckbox
              checked={true}
              indeterminate={false}
              onChange={() => {}}
              label="محدد بالكامل"
            />

            <GroupCheckbox
              checked={false}
              indeterminate={true}
              onChange={() => {}}
              label="محدد جزئياً (Indeterminate)"
            />
          </div>
        </div>

        {/* عرض CheckboxField */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Checkbox Field (للصلاحيات الفرعية)
          </h2>

          <div className="space-y-3">
            <CheckboxField control={control} name="option1" label="عرض البيانات" />

            <CheckboxField control={control} name="option2" label="إضافة بيانات جديدة" />

            <CheckboxField control={control} name="option3" label="تعديل البيانات" />
          </div>
        </div>

        {/* مثال تفاعلي */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">مثال تفاعلي</h2>

          <div className="space-y-4">
            <GroupCheckbox
              checked={groupChecked}
              indeterminate={groupIndeterminate}
              onChange={e => {
                setGroupChecked(e.target.checked);
                setGroupIndeterminate(false);
              }}
              label="تحديد الكل"
            />

            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 bg-white rounded-md p-0.5">
                  <div className="w-full h-full bg-blue-500 rounded-sm"></div>
                </div>
                <span className="text-sm">عرض</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-300 bg-white rounded-md"></div>
                <span className="text-sm">إضافة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 bg-white rounded-md p-0.5">
                  <div className="w-full h-full bg-blue-500 rounded-sm"></div>
                </div>
                <span className="text-sm">تعديل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-300 bg-white rounded-md"></div>
                <span className="text-sm">حذف</span>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">مميزات التصميم الجديد:</h3>
          <ul className="text-blue-700 space-y-2">
            <li>• مساحة بيضاء بين الحدود والخلفية الداخلية</li>
            <li>• مربع أزرق داخلي مع حدود خارجية</li>
            <li>• زوايا مدورة قليلاً لمظهر عصري</li>
            <li>• حالة وسطية للأقسام الرئيسية</li>
            <li>• انتقالات سلسة عند التفاعل</li>
            <li>• ألوان متناسقة مع التصميم العام</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckboxDemo;

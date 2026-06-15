import Input from '@/components/shared/input';
import { useForm } from 'react-hook-form';
import SearchIcon from '@assets/svgs/exercise-library/search-icon.svg';
import 'twin.macro';
import { useState } from 'react';
import tw from 'twin.macro';

const Categories = ({ changeOpenContactForm }) => {
  const { register } = useForm({ defaultValues: { search: '' } });
  const [selected, setSelected] = useState(0);
  const cat = [
    { id: 0, value: 'General questions' },
    { id: 1, value: 'Clinics & Staff' },
    { id: 2, value: 'Patients & Exercises' },
    { id: 3, value: 'Subscription & Billing' },
  ];
  return (
    <div tw="w-[25%] flex-shrink-0">
      <Input
        name="search"
        register={register}
        firstIcon={
          <div>
            <img src={SearchIcon} tw="opacity-50" alt="search" />
          </div>
        }
        placeholder="Search"
        containerSTyle={tw`bg-white px-[16px] h-[40px]`}
      />
      <div tw="border border-border_stroke bg-white rounded-[10px] mt-[16px]">
        <p tw="text-[1rem] font-semibold p-[16px] border-b border-border_stroke">Categories</p>
        <ul tw="flex flex-col gap-[16px] my-[16px] px-[16px]">
          {cat.map(item => (
            <span
              key={item.id}
              tw="w-fit hover:text-Primary_600 underline-offset-4 duration-500 ease-in-out cursor-pointer text-base font-semibold [line-height: 20px]"
              css={selected === item.id ? tw`text-Primary_600 underline` : tw``}
              onClick={() => setSelected(item.id)}
            >
              {item.value}
            </span>
          ))}
        </ul>
        <p
          tw="text-[1rem] font-semibold p-[16px] cursor-pointer border-t border-border_stroke"
          onClick={() => changeOpenContactForm(true)}
        >
          Contact support
        </p>
      </div>
    </div>
  );
};
export default Categories;

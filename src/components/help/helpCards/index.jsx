/* eslint-disable react/jsx-key */
import Collapse from '@/components/shared/collapse';
import { useState } from 'react';
import arrowUp from '@assets/svgs/patient/arrow-up.svg';
import tw from 'twin.macro';
import LoadingElement from '@/components/shared/loadingElement';

const HelpCards = () => {
  const [selected, setSelected] = useState(null);
  const content = [
    {
      id: 0,
      title: 'What is a Payment Gateway?',
      content: `<p>Lorem <strong>Ipsum</strong> is simply dummy <a href="#">text</a> of the printing and typesetting industry...</p>`,
    },
    {
      id: 1,
      title: 'What is a Payment Gateway?',
      content: `<p>Lorem <strong>Ipsum</strong> is simply dummy <a href="#">text</a> of the printing and typesetting industry...</p>`,
    },
    {
      id: 2,
      title: 'What is a Payment Gateway?',
      content: `<p>Lorem <strong>Ipsum</strong> is simply dummy <a href="#">text</a> of the printing and typesetting industry...</p>`,
    },
    {
      id: 3,
      title: 'What is a Payment Gateway?',
      content: `<p>Lorem <strong>Ipsum</strong> is simply dummy <a href="#">text</a> of the printing and typesetting industry...</p>`,
    },
    {
      id: 4,
      title: 'What is a Payment Gateway?',
      content: `<p>Lorem <strong>Ipsum</strong> is simply dummy <a href="#">text</a> of the printing and typesetting industry...</p>`,
    },
    {
      id: 5,
      title: 'What is a Payment Gateway?',
      content: `<p>Lorem <strong>Ipsum</strong> is simply dummy <a href="#">text</a> of the printing and typesetting industry...</p>`,
    },
    {
      id: 6,
      title: 'What is a Payment Gateway?',
      content: `<p>Lorem <strong>Ipsum</strong> is simply dummy <a href="#">text</a> of the printing and typesetting industry...</p>`,
    },
  ];
  const handelCollapseClickable = id => {
    if (selected === id) {
      setSelected(null);
    } else {
      setSelected(id);
    }
  };

  const PRIMARY_PADDING = 'p-[24px]';

  return (
    <ul tw="flex w-[70%] flex-col gap-[12px]">
      {content.map(item => {
        const isOpen = selected === item.id;
        return (
          <Collapse
            header={
              <div tw="flex w-full justify-between items-center">
                <p tw="text-text_primary text-base font-semibold  transition-colors duration-200">
                  {item.title}
                </p>
                <img src={arrowUp} alt="arrow" />
              </div>
            }
            body={
              <div
                tw="text-text_secondary text-sm font-medium flex gap-3 items-center "
                css={tw`${PRIMARY_PADDING}`}
              >
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </div>
            }
            containerStyle={[
              tw`border-border_stroke bg-white overflow-hidden relative cursor-pointer border rounded-[10px]`,
              !isOpen ? tw`max-h-[72px]` : tw`h-fit`,
            ]}
            headerCustomStyle={[
              tw`${PRIMARY_PADDING}`,
              isOpen ? tw`rounded-none border-b bg-[#F7FAEB] border-border_stroke` : tw`p-[24px]`,
            ]}
            arrowIconCustomStyle={[tw`[display: none]`]}
            open={isOpen}
            handelToggleCollapse={() => handelCollapseClickable(item.id)}
          />
        );
      })}
    </ul>
  );
};

export default HelpCards;

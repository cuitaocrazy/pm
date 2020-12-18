import Button, { ButtonProps } from 'antd/lib/button';
import React, { useState } from 'react';

type ButtonPropsWithOutOnClick = Pick<ButtonProps, Exclude<keyof ButtonProps, 'onClick'>>;
export type BtnProps = ButtonPropsWithOutOnClick & { effect: () => Promise<any> };

export default React.forwardRef<HTMLElement, BtnProps>((props, ref) => {
  const [loading, setLoading] = useState(false);
  const { effect, ...other } = props;

  const clickHandle = () => {
    setLoading(true);
    effect().finally(() => setLoading(false));
  };
  return <Button {...other} onClick={clickHandle} loading={loading} ref={ref} />;
});

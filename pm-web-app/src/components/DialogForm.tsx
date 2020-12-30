import type { FormInstance } from 'antd/es/form/Form';
import { useForm } from 'antd/es/form/Form';
import { Modal } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type FormDialogProps<T> = {
  children: (form: FormInstance<T>, data?: T) => React.ReactNode;
  submitHandle: (v: T) => Promise<void>;
  title?: string;
};

type FormDialogTmpProps<T> = FormDialogProps<T> & {
  setVisibleRef: React.RefObject<(b: boolean) => void>;
  data?: T;
};

function FormDialogTmp<T extends unknown>(props: FormDialogTmpProps<T>) {
  const [form] = useForm<T>();
  return (
    <Modal
      title={props.title}
      visible
      destroyOnClose
      onOk={async () =>
        form
          .validateFields()
          .then(props.submitHandle)
          .then(() => props.setVisibleRef.current!(false))
      }
      onCancel={() => props.setVisibleRef.current!(false)}
    >
      {props.children(form, props.data)}
    </Modal>
  );
}

export type FormDialogHandle<T> = {
  showDialog: (data?: T) => void;
};

const FormDialog = <T extends unknown>(
  props: FormDialogProps<T>,
  ref: React.ForwardedRef<FormDialogHandle<T>>,
) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);
  useImperativeHandle(ref, () => ({
    showDialog: (d?: T) => {
      setData(d);
      setVisible(true);
    },
  }));
  const setVisibleRef = useRef(setVisible);

  // 当上层组件刷新出发一些loading时，组件会unmount。
  // submitHandle是一个promise，因此在调用setVisible时可能已经unmount，这时会报出一些警告
  // 为了消除警告，当unmount时回调函数设置一个空函数。
  useEffect(() => {
    return () => {
      setVisibleRef.current = () => {
        // empty
      };
    };
  }, []);

  return visible ? <FormDialogTmp {...props} setVisibleRef={setVisibleRef} data={data} /> : null;
};

export default forwardRef(FormDialog) as <T extends unknown>(
  p: FormDialogProps<T> & { ref?: React.Ref<FormDialogHandle<T>> },
) => React.ReactElement;

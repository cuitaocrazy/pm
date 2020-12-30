import type { FormInstance } from 'antd/es/form/Form';
import { useForm } from 'antd/es/form/Form';
import { Modal } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

export type FormDialogProps<T> = {
  children: (form: FormInstance<T>, data?: T) => React.ReactNode;
  submitHandle: (v: T) => Promise<void>;
  title?: string;
};

type FormDialogTmpProps<T> = FormDialogProps<T> & { setVisible: (b: boolean) => void; data?: T };

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
          .then(() => props.setVisible(false))
      }
      onCancel={() => props.setVisible(false)}
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
  return visible ? <FormDialogTmp {...props} setVisible={setVisible} data={data} /> : null;
};

export default forwardRef(FormDialog) as <T extends unknown>(
  p: FormDialogProps<T> & { ref?: React.Ref<FormDialogHandle<T>> },
) => React.ReactElement;

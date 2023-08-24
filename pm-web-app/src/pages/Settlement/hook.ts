import { useEffect, useMemo, useCallback, useState, useReducer } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { payrollTranform } from './payroll-utils';

export enum Status {
  Waiting = 'waiting',
  Prepare = 'prepare',
  Running = 'running',
}

function getLocalWsUrl() {
  return `${
    (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
  }/settlement`;
}

type State = {
  messages: string[];
};

const initialState: State = {
  messages: [],
};

enum ActionMessage {
  Add = 'ADD',
  Init = 'INIT',
}

type Action = {
  type: ActionMessage;
  payload: string;
};

function messageReducer(state: State, action: Action): State {
  const { type, payload } = action;
  switch (type) {
    case ActionMessage.Add:
      return {
        ...state,
        messages: [payload, ...state.messages],
      };
    case ActionMessage.Init:
      return {
        ...state,
        messages: [],
      };
    default:
      return state;
  }
}

function createWs(
  url: string,
  log: (message: string) => void,
  setStatus: (status: Status) => void,
  askConfirm: (message: string) => Promise<boolean>,
) {
  const newSocket = io(url, { path: '/api/socket.io', withCredentials: true });
  log('客户端: 准备连接到服务...');
  setStatus(Status.Waiting);
  const timer = setTimeout(() => {
    newSocket.disconnect();
    log('客户端: 超时，断开连接');
    setStatus(Status.Waiting);
  }, 5000);

  newSocket.on('connect', () => {
    log('客户端: 已连接到服务');
    clearTimeout(timer);
    setStatus(Status.Prepare);
  });
  newSocket.on('disconnect', () => {
    log('客户端: 服务连接已断开');
    setStatus(Status.Waiting);
  });
  newSocket.on('ask', (msg: string, cb: (ret: boolean) => void) => {
    askConfirm(msg)
      .then((result) => cb(result))
      .catch(() => cb(false));
  });
  newSocket.on('log', (msg: any) => {
    log(`服务端: ${msg}`);
  });

  return newSocket;
}

export function useSettlement(askConfirm: (message: string) => Promise<boolean>) {
  const [socket, setSocket] = useState<Socket>();
  const [status, setStatus] = useState<Status>(Status.Waiting);

  const [state, dispatch] = useReducer(messageReducer, initialState);

  const url = useMemo(getLocalWsUrl, []);

  /**
   * 加载组件后开启socket
   */
  useEffect(() => {
    const newSocket = createWs(
      url,
      (payload) => dispatch({ type: ActionMessage.Add, payload }),
      setStatus,
      askConfirm,
    );
    setSocket(newSocket);
  }, [url, dispatch, askConfirm]);

  /**
   * 组件销毁时关闭socket
   */
  useEffect(
    () => () => {
      socket?.disconnect();
    },
    [socket],
  );

  const [raws, setRaws] = useState<(string | number)[][]>([]);

  const pushData = useCallback(
    (data: string) => {
      setStatus(Status.Running);
      try {
        const rows = payrollTranform(data);
        dispatch({
          type: ActionMessage.Add,
          payload: `客户端: 通过数据检查，共${rows.length}条数据，准备发送数据...`,
        });
        socket?.emit('data', rows, (msg: any) => {
          dispatch({
            type: ActionMessage.Add,
            payload: `服务端: ${msg}`,
          });
        });
        setRaws(rows);
      } catch (e) {
        dispatch({
          type: ActionMessage.Add,
          payload: `客户端: ${e?.toString()}`,
        });
      }
      setStatus(Status.Prepare);
    },
    [socket, dispatch],
  );

  const initMessage = useCallback(() => dispatch({ type: ActionMessage.Init, payload: '' }), [
    dispatch,
  ]);

  const addMessage = useCallback(
    (message: string) => dispatch({ type: ActionMessage.Add, payload: message }),
    [dispatch],
  );

  return {
    messages: state.messages,
    status,
    raws,
    pushData,
    initMessage,
    addMessage,
  };
}

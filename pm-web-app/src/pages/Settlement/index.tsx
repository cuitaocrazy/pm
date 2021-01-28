import React, { useEffect, useMemo, useReducer, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { payrollTranform } from './payroll-utils';

function getLocalWsUrl() {
  return `${
    (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
  }/settlement`;
}

function useWs(log: (msg: string) => void) {
  const [socket, setSocket] = useState<Socket>();
  const [wsState, setWsState] = useState(0);
  const url = useMemo(getLocalWsUrl, []);
  const createWs = () => {
    const newSocket = io(url, { path: '/api/socket.io', withCredentials: true });
    log('client: 准备连接到服务...');
    const timer = setTimeout(() => {
      newSocket.disconnect();
      log('client: 超时，断开连接');
      setWsState(2);
    }, 5000);

    setWsState(0);
    newSocket.on('connect', () => {
      log('client: 已连接到服务');
      clearTimeout(timer);
      setWsState(1);
    });
    newSocket.on('disconnect', () => {
      log('client: 服务连接已断开');
      setWsState(2);
    });
    newSocket.on('ask', (msg: string, cb: (ret: boolean) => void) => {
      // eslint-disable-next-line no-alert
      cb(window.confirm(msg));
    });
    setSocket(newSocket);
  };
  useEffect(createWs, [url, log]);
  useEffect(
    () => () => {
      socket?.disconnect();
    },
    [socket],
  );

  const open = () => {
    if (wsState === 2) {
      createWs();
    }
  };
  const close = () => {
    if (wsState === 1) {
      socket?.disconnect();
    }
  };
  return { socket, open, close, wsState };
}

function useSettlement(log: (msg: string) => void, socket?: Socket) {
  const [raws, setRaws] = useState<(string | number)[][]>([]);

  useEffect(() => {
    if (socket) {
      socket.on('log', (data: string) => log(`server: ${data}`));
    }
  }, [socket, log]);

  const pushData = (data: string) => {
    try {
      const rows = payrollTranform(data);
      log(`client: 通过数据检查，共${rows.length}条数据，准备发送数据...`);
      socket?.emit('data', rows, (msg: any) => log(`server: ${msg}`));
      setRaws(rows);
    } catch (e) {
      log(`client: ${e.toString()}`);
    }
  };

  return { pushData, raws };
}

export default () => {
  const [logs, dispatch] = useReducer((s: string[], l: string) => [...s, l], []);
  const ws = useWs(dispatch);
  const s = useSettlement(dispatch, ws.socket);

  function fileOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        s.pushData(evt.target!.result as string);
      };
      reader.readAsText(file);
    }
  }
  // eslint-disable-next-line no-nested-ternary
  const buttonText = ws.wsState === 1 ? 'close' : ws.wsState === 2 ? 'open' : 'connecting';
  return (
    <div>
      <button onClick={() => (ws.wsState === 1 ? ws.close() : ws.wsState === 2 && ws.open())}>
        {buttonText}
      </button>
      <input type="file" id="input" onChange={fileOnChange} />
      {logs.map((l, i) => (
        <pre key={i.toString()}>{l}</pre>
      ))}
      {/* <table>
        <tbody>
        {
          s.raws.map((row, i) => {
            return <tr key={i}>
              {row.map((col, j) => {
                return <td key={j}>{col}</td>
              })}
            </tr>
          })
        }
        </tbody>
      </table> */}
    </div>
  );
};

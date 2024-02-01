import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Card, Row, Col, Input, Slider, InputNumber } from 'antd';
import * as R from 'ramda';
import { useBaseState } from '@/pages/utils/hook';
import color from './colorDef';

const maxH = 10;

type ProjItemProps = {
  projId: string;
  projName?: string;
  involvedProj: boolean;
  endedProj: boolean;
  hours: number;
  content?: string | null | undefined;
  onHoursChange: (hours: number) => void;
  onContentOfWorkChange: (content: string) => void;
  visibleFilter: string;
};

const marks = ((vs) =>
  R.zipObj(
    vs,
    vs.map((v) => `${v}h`),
  ))(R.range(0, maxH + 1));

const getCardStyle = (involved: boolean, ended: boolean) => {
  if (ended) return { headStyle: { backgroundColor: color.ended } };
  if (involved) return { headStyle: { backgroundColor: color.involved } };
  return {};
};

export type ProjItemHandle = {
  gotoAnchor: (offset: number) => void;
  getOffset: () => number;
};
const ProjItem: React.ForwardRefRenderFunction<ProjItemHandle, ProjItemProps> = (props, ref) => {
  const { buildProjName } = useBaseState()
  const [contentValue, setContentValue] = useState(props.content || '')
  const divRef = useRef<HTMLDivElement>(null);
  const visible =
    buildProjName(props.projId, props.projName || props.projId)
      .toLowerCase()
      .indexOf(props.visibleFilter.toLowerCase()) !== -1;
  /* eslint-disable react/no-this-in-sfc */
  /* eslint-disable no-cond-assign */
  useImperativeHandle(ref, () => ({
    gotoAnchor(offset) {
      if (this.getOffset() !== 0) window.scrollTo(0, this.getOffset() - offset);
    },
    getOffset() {
      let offset = 0;
      let elem: HTMLElement | null | undefined = divRef.current;
      do {
        offset += elem?.offsetTop || 0;
      } while ((elem = elem?.offsetParent as HTMLElement));
      return offset;
    },
  }));

  useEffect(() => {
    setContentValue(props.content || '')
  }, [props.content]);

  useEffect(() => {
    const delay = 300; // 设置防抖延迟时间
    const debounceTimeout = setTimeout(() => {
      props.onContentOfWorkChange(contentValue)
    }, delay);
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [contentValue]);

  const onContentChange = (e: string) => {
    setContentValue(e)
  };

  return (
    <Card
      title={buildProjName(props.projId, props.projName || props.projId)}
      id={props.projId}
      hidden={!visible}
      size="small"
      style={{ marginBottom: 16, display: 'inline-block', width: '100%', marginRight: '10px' }}
      {...getCardStyle(props.involvedProj, props.endedProj)}
    >
      {/* 设置一个暗锚, 本身Card是可以支持ref的, 但是antd定义的Type没有这个属性, 避免一些dev的报错, 假如一手工锚点 */}
      <div ref={divRef} />
      <Row>
        <Col span={24}>
          <Row>
            <Col span={19}>
              <Slider
                marks={marks}
                min={0}
                max={maxH}
                style={{ whiteSpace: 'nowrap' }}
                onChange={props.onHoursChange}
                value={props.hours}
              />
            </Col>
            <Col span={1}></Col>
            <Col span={4}>
              <span></span>
              <InputNumber
                addonBefore="自定义"
                min={0}
                value={props.hours}
                onChange={e => props.onHoursChange(e || 0)}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 6 }}
            onChange={(e) => onContentChange(e.currentTarget.value)}
            value={contentValue || ''}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default forwardRef(ProjItem);

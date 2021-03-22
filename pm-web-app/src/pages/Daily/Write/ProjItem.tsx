import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Card, Row, Col, Input, Slider } from 'antd';
import * as R from 'ramda';
import { buildProjName } from '@/pages/utils';
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
    vs.map((v) => `${v} h`),
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

  return (
    <Card
      title={buildProjName(props.projId, props.projName || props.projId)}
      id={props.projId}
      hidden={!visible}
      size="small"
      style={{ marginBottom: 16 }}
      {...getCardStyle(props.involvedProj, props.endedProj)}
    >
      {/* 设置一个暗锚, 本身Card是可以支持ref的, 但是antd定义的Type没有这个属性, 避免一些dev的报错, 假如一手工锚点 */}
      <div ref={divRef} />
      <Row>
        <Col span={24}>
          <Slider
            marks={marks}
            min={0}
            max={maxH}
            style={{ whiteSpace: 'nowrap' }}
            onChange={props.onHoursChange}
            value={props.hours}
          />
        </Col>
        <Col span={24}>
          <Input.TextArea
            autoSize
            onChange={(e) => props.onContentOfWorkChange(e.currentTarget.value)}
            value={props.content || ''}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default forwardRef(ProjItem);

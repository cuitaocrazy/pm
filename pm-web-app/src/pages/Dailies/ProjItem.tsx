import { Card, Col, Collapse, Input, Row, Slider } from 'antd';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as R from 'ramda';
import { ProjectReportData } from './def';

const maxH = 10;

interface ProjItemProps {
  data: ProjectReportData;
  onHoursChange: (hours: number) => void;
  onContentOfWorkChange: (content: string) => void;
  visible: boolean;
}

const marks = ((vs) =>
  R.zipObj(
    vs,
    vs.map((v) => `${v} h`),
  ))(R.range(0, maxH + 1));

export type ProjItemHandle = {
  gotoAnchor: (offset: number) => void;
  getOffset: () => number;
};
const ProjItem: React.ForwardRefRenderFunction<ProjItemHandle, ProjItemProps> = (props, ref) => {
  const divRef = useRef<HTMLDivElement>(null);

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
    <Card title={props.data.name} id={props.data.id} hidden={!props.visible}>
      {/* 设置一个暗锚, 本身Card是可以支持ref的, 但是antd定义的Type没有这个属性, 避免一些dev的报错, 假如一手工锚点 */}
      <div ref={divRef} />
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Slider
            marks={marks}
            min={0}
            max={maxH}
            style={{ whiteSpace: 'nowrap' }}
            onChange={props.onHoursChange}
            value={props.data.hours}
          />
        </Col>
        <Col span={24}>
          <Collapse>
            <Collapse.Panel header="工作内容" key="1">
              <Input.TextArea
                autoSize
                onChange={(e) => props.onContentOfWorkChange(e.currentTarget.value)}
                value={props.data.contentOfWork}
              />
            </Collapse.Panel>
          </Collapse>
        </Col>
      </Row>
    </Card>
  );
};

export default forwardRef(ProjItem);

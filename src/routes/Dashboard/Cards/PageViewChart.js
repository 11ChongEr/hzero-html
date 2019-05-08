import React from 'react';
import { Icon, Tooltip } from 'hzero-ui';
import { ChartCard, MiniArea, Field } from 'components/Charts';
import moment from 'moment';
import numeral from 'numeral';
import { getDateFormat } from 'utils/utils';

// mock data
const visitData = [];
const beginDay = new Date().getTime();

const fakeY = [7, 5, 4, 2, 4, 7, 5, 6, 5, 9, 6, 3, 1, 5, 3, 6, 5];
for (let i = 0; i < fakeY.length; i += 1) {
  visitData.push({
    x: moment(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format(getDateFormat()),
    y: fakeY[i],
  });
}

export default class PageViewChart extends React.Component {
  render() {
    return (
      <ChartCard
        bordered={false}
        title="访问量"
        action={
          <Tooltip title="指标说明">
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        total={numeral(8846).format('0,0')}
        footer={<Field label="日访问量" value={numeral(1234).format('0,0')} />}
        contentHeight={46}
      >
        <MiniArea color="#975FE4" data={visitData} />
      </ChartCard>
    );
  }
}

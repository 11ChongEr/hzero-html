import React from 'react';
import { Icon, Tooltip } from 'hzero-ui';
import { ChartCard, yuan, Field } from 'components/Charts';
import Trend from 'components/Trend';
import numeral from 'numeral';
import styles from './TotalSaleChart.less';

const Yuan = ({ children }) => (
  <span
    dangerouslySetInnerHTML={{ __html: yuan(children) }}
  /> /* eslint-disable-line react/no-danger */
);

export default class TotalSaleChart extends React.Component {
  render() {
    return (
      <ChartCard
        bordered={false}
        title="总销售额"
        action={
          <Tooltip title="指标说明">
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        total={() => <Yuan>126560</Yuan>}
        footer={<Field label="日均销售额" value={`￥${numeral(12423).format('0,0')}`} />}
        contentHeight={46}
      >
        <Trend flag="up" style={{ marginRight: 16 }}>
          周同比<span className={styles.trendText}>12%</span>
        </Trend>
        <Trend flag="down">
          日环比<span className={styles.trendText}>11%</span>
        </Trend>
      </ChartCard>
    );
  }
}

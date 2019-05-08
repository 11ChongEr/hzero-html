import React from 'react';
import { Icon, Tooltip } from 'hzero-ui';
import { MiniProgress, ChartCard } from 'components/Charts';
import Trend from 'components/Trend';
import styles from './PromotionChart.less';

export default class PromotionChart extends React.Component {
  render() {
    return (
      <ChartCard
        bordered={false}
        title="运营活动效果"
        action={
          <Tooltip title="指标说明">
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        total="78%"
        footer={
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <Trend flag="up" style={{ marginRight: 16 }}>
              周同比<span className={styles.trendText}>12%</span>
            </Trend>
            <Trend flag="down">
              日环比<span className={styles.trendText}>11%</span>
            </Trend>
          </div>
        }
        contentHeight={46}
      >
        <MiniProgress percent={78} strokeWidth={8} target={80} color="#13C2C2" />
      </ChartCard>
    );
  }
}

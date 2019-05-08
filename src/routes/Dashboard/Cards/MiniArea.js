import React from 'react';
import { Chart, Axis, Tooltip, Geom } from 'bizcharts';
import autoHeight from '../../../components/Charts/autoHeight';
import styles from '../../../components/Charts/index.less';

@autoHeight()
export default class MiniArea extends React.Component {
  render() {
    const {
      height,
      data = [],
      forceFit = true,
      borderColor = '#29bece',
      scale = {},
      borderWidth = 2,
      xAxis,
      yAxis,
      animate = true,
      tooltip = [],
    } = this.props;

    const scaleProps = {
      x: {
        type: 'cat',
        range: [0, 1],
        ...scale.x,
      },
      y: {
        min: 0,
        ...scale.y,
      },
    };

    const chartHeight = height + 54;

    return (
      <div className={styles.miniChart} style={{ height }}>
        <div className={styles.chartContent}>
          {height > 0 && (
            <Chart
              animate={animate}
              scale={scaleProps}
              height={chartHeight}
              forceFit={forceFit}
              data={data}
              padding="auto"
            >
              <Axis
                key="axis-x"
                name="x"
                label={false}
                line={false}
                tickLine={false}
                grid={false}
                {...xAxis}
              />
              <Axis
                key="axis-y"
                name="y"
                label={false}
                line={false}
                tickLine={false}
                grid={false}
                {...yAxis}
              />
              <Tooltip showTitle={false} crosshairs={false} />
              <Geom
                type="line"
                position="x*y"
                shape="smooth"
                color={borderColor}
                size={borderWidth}
                tooltip={tooltip}
              />
            </Chart>
          )}
        </div>
      </div>
    );
  }
}

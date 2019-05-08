import React from 'react';
import { Row, Col, Card, Tabs, DatePicker } from 'hzero-ui';
import { Bar } from 'components/Charts';
import moment from 'moment';
import numeral from 'numeral';
import styles from './SalesChart.less';

const salesData = [];
for (let i = 0; i < 12; i += 1) {
  salesData.push({
    x: `${i + 1}月`,
    y: Math.floor(Math.random() * 1000) + 200,
  });
}

const rankingListData = [];
for (let i = 0; i < 7; i += 1) {
  rankingListData.push({
    title: `工专路 ${i} 号店`,
    total: 323234,
  });
}

function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

export default class SalesChart extends React.Component {
  state = {
    rangePickerValue: getTimeDistance('year'),
  };

  handleRangePickerChange = rangePickerValue => {
    this.setState({
      rangePickerValue,
    });
  };

  isActive(type) {
    const { rangePickerValue } = this.state;
    const value = getTimeDistance(type);
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return;
    }
    if (
      rangePickerValue[0].isSame(value[0], 'day') &&
      rangePickerValue[1].isSame(value[1], 'day')
    ) {
      return styles.currentDate;
    }
  }

  selectDate = type => {
    this.setState({
      rangePickerValue: getTimeDistance(type),
    });
  };

  render() {
    const { rangePickerValue } = this.state;
    const salesExtra = (
      <div className={styles.salesExtraWrap}>
        <div className={styles.salesExtra}>
          <a className={this.isActive('today')} onClick={() => this.selectDate('today')}>
            今日
          </a>
          <a className={this.isActive('week')} onClick={() => this.selectDate('week')}>
            本周
          </a>
          <a className={this.isActive('month')} onClick={() => this.selectDate('month')}>
            本月
          </a>
          <a className={this.isActive('year')} onClick={() => this.selectDate('year')}>
            全年
          </a>
        </div>
        <RangePicker
          value={rangePickerValue}
          onChange={this.handleRangePickerChange}
          style={{ width: 256 }}
        />
      </div>
    );

    return (
      <Card bordered={false} bodyStyle={{ padding: 0 }}>
        <div className={styles.salesCard}>
          <Tabs tabBarExtraContent={salesExtra} size="large" tabBarStyle={{ marginBottom: 24 }}>
            <TabPane tab="销售额" key="sales">
              <Row>
                <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                  <div className={styles.salesBar}>
                    <Bar height={295} title="销售额趋势" data={salesData} />
                  </div>
                </Col>
                <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                  <div className={styles.salesRank}>
                    <h4 className={styles.rankingTitle}>门店销售额排名</h4>
                    <ul className={styles.rankingList}>
                      {rankingListData.map((item, i) => (
                        <li key={item.title}>
                          <span className={i < 3 ? styles.active : ''}>{i + 1}</span>
                          <span>{item.title}</span>
                          <span>{numeral(item.total).format('0,0')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="访问量" key="views">
              <Row>
                <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                  <div className={styles.salesBar}>
                    <Bar type="line" height={292} title="访问量趋势" data={salesData} />
                  </div>
                </Col>
                <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                  <div className={styles.salesRank}>
                    <h4 className={styles.rankingTitle}>门店访问量排名</h4>
                    <ul className={styles.rankingList}>
                      {rankingListData.map((item, i) => (
                        <li key={item.title}>
                          <span className={i < 3 ? styles.active : ''}>{i + 1}</span>
                          <span>{item.title}</span>
                          <span>{numeral(item.total).format('0,0')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </div>
      </Card>
    );
  }
}

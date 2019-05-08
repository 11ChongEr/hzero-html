/**
 * TenantList - 可访问租户列表
 * @date: 2018-10-9
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Card, Icon, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './TenantList.less';

@connect(({ user, portalAssign }) => ({
  user,
  portalAssign,
}))
export default class TenantList extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchTenantList',
    }).then(res => {
      if (res && Array.isArray(res)) {
        dispatch({
          type: 'portalAssign/enableTenantIdList',
          payload: { tenantIdList: res.map(item => item.tenantId) },
        });
      }
    });
  }

  render() {
    const {
      portalAssign: { enableTenantIdData = [] },
    } = this.props;
    return (
      <Card bodyStyle={{ padding: 0, overflow: 'hidden' }} bordered={false} title="可访问租户列表">
        <div className={styles.tenantCard}>
          <Row type="flex" justify="space-around" className={styles['tenant-list-title']}>
            <Col span={16} className={styles['title-sty']}>
              <p>租户名称</p>
            </Col>
            <Col span={8} className={styles['title-sty']}>
              <p>最近访问日期</p>
            </Col>
          </Row>
          {enableTenantIdData &&
            enableTenantIdData.map((item, index) => (
              <Row
                key={`members-item-${item.assignId}`}
                align="middle"
                type="flex"
                justify="space-around"
              >
                <Col
                  span={16}
                  className={
                    index % 2 === 0
                      ? styles['tenant-list-content-evenRow']
                      : styles['tenant-list-content-oddRow']
                  }
                >
                  <Icon type="bank" style={{ marginRight: 3 }} />
                  <Link to={`${item.webUrl}.going-link.com`}>
                    {item.companyName ? `${item.groupName}-${item.companyName}` : item.groupName}
                  </Link>
                </Col>
                <Col
                  span={8}
                  className={
                    index % 2 === 0
                      ? styles['tenant-list-content-evenRow']
                      : styles['tenant-list-content-oddRow']
                  }
                >
                  {item.accessDatetime ? item.accessDatetime : ''}
                </Col>
              </Row>
            ))}
        </div>
      </Card>
    );
  }
}

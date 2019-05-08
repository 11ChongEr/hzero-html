import React from 'react';
import { Card, Row, Col, Avatar } from 'hzero-ui';
import { Link } from 'dva/router';
import styles from './Team.less';

const members = [
  {
    id: 'members-1',
    title: '科学搬砖组',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    link: '',
  },
  {
    id: 'members-2',
    title: '程序员日常',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/cnrhVkzwxjPwAaCfPbdc.png',
    link: '',
  },
  {
    id: 'members-3',
    title: '设计天团',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/gaOngJwsRYRaVAuXXcmB.png',
    link: '',
  },
  {
    id: 'members-4',
    title: '中二少女团',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/ubnKSIfAJTxIgXOKlciN.png',
    link: '',
  },
  {
    id: 'members-5',
    title: '骗你学计算机',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/WhxKECPNujWoWEFNdnJE.png',
    link: '',
  },
];

export default class Chart extends React.Component {
  render() {
    return (
      <Card bodyStyle={{ paddingTop: 12, paddingBottom: 12 }} bordered={false} title="团队">
        <div className={styles.members}>
          <Row gutter={48}>
            {members.map(item => (
              <Col span={12} key={`members-item-${item.id}`}>
                <Link to={item.link}>
                  <Avatar src={item.logo} size="small" />
                  <span className={styles.member}>{item.title}</span>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </Card>
    );
  }
}
